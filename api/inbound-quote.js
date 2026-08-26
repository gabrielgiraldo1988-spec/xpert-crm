// This function runs on Vercel's servers, triggered by a Resend webhook
// whenever an email arrives at your inbound receiving address.
// It never runs in the browser and is not part of the CRM's frontend bundle.
//
// Authentication note: instead of verifying Resend's cryptographic
// signature (which requires byte-exact raw request bodies — something
// Vercel's platform doesn't reliably preserve for plain serverless
// functions), this endpoint is protected with a secret token placed
// directly in the webhook URL itself. Only someone who knows that URL
// (i.e., you, via the Resend dashboard config) can trigger it.
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// Keep this in sync with EMAIL_TO_REP in src/App.jsx.
const EMAIL_TO_REP = {
  "fvelez@lgiinc.com": "Felipe Velez",
  "mposada@lgiinc.com": "Manuela Posada",
};

async function extractQuoteDetails(emailText, emailSubject) {
  const prompt = `You are extracting freight quote request details from a forwarded email. 
Read the email below and return ONLY a JSON object (no markdown, no explanation) with these fields:

{
  "companyName": string or null,
  "contactName": string or null,
  "contactEmail": string or null,
  "origin": string or null (city, state format, e.g. "Dallas, TX"),
  "destination": string or null (city, state format),
  "equipment": one of "Dry Van", "Reefer", "Flatbed", "Multiple", or null,
  "commodity": string or null,
  "weight": string or null,
  "pickupDate": string or null (YYYY-MM-DD format if you can determine it, else null)
}

If a field cannot be determined from the email, use null. Do not guess wildly — only fill in what is reasonably clear from the text.

Subject: ${emailSubject}

Email content:
${emailText}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data?.content?.[0]?.text || "{}";
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return {};
  }
}

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Simple token check — the token lives in the webhook URL's query string,
  // e.g. https://xpert-crm.vercel.app/api/inbound-quote?token=YOUR_SECRET
  const expectedToken = (process.env.INBOUND_WEBHOOK_TOKEN || "").trim();
  const providedToken = req.query?.token;
  if (!expectedToken || providedToken !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // With no signature verification needed, Vercel's normal JSON body
  // parsing is fine to use directly here.
  let event = req.body;
  if (typeof event === "string") {
    try {
      event = JSON.parse(event);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  if (!event || typeof event !== "object") {
    return res.status(400).json({ error: "Missing body" });
  }

  // Acknowledge non-inbound events quickly without processing.
  if (event.type !== "email.received") return res.status(200).json({ skipped: true });

  try {
    const emailData = event.data || {};
    const fromAddress = (emailData.from || "").toLowerCase().match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || "";
    const subject = emailData.subject || "(no subject)";

    // The webhook payload only contains metadata — fetch the actual
    // email body (text/html) separately using its email_id.
    const resend = new Resend(process.env.RESEND_API_KEY);
    let bodyText = "";
    try {
      const fullEmail = await resend.emails.receiving.get(emailData.email_id);
      bodyText = fullEmail?.data?.text || fullEmail?.data?.html || "";
    } catch (fetchErr) {
      console.error("Failed to fetch full email content:", fetchErr);
    }

    const extracted = await extractQuoteDetails(bodyText, subject);

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: stored } = await supabase
      .from("crm_storage")
      .select("value")
      .eq("key", "xpert-crm-data")
      .maybeSingle();

    const parsed = stored?.value ? JSON.parse(stored.value) : { leads: [], activities: [], tasks: [], notes: [], quotes: [] };
    const leads = parsed.leads || [];

    // Try to link to an existing lead by company name.
    let leadId = null;
    if (extracted.companyName) {
      const match = leads.find((l) =>
        l.companyName.toLowerCase().includes(extracted.companyName.toLowerCase()) ||
        extracted.companyName.toLowerCase().includes(l.companyName.toLowerCase())
      );
      if (match) leadId = match.id;
    }

    const createdBy = EMAIL_TO_REP[fromAddress] || null;

    const newQuote = {
      id: "Q" + Date.now(),
      leadId,
      companyName: extracted.companyName || "(Unknown company)",
      contactName: extracted.contactName || "",
      contactEmail: extracted.contactEmail || "",
      origin: extracted.origin || "",
      destination: extracted.destination || "",
      equipment: extracted.equipment || "Dry Van",
      commodity: extracted.commodity || "",
      weight: extracted.weight || "",
      pickupDate: extracted.pickupDate || null,
      rateMin: null,
      rateMax: null,
      notes: `Auto-created from forwarded email: "${subject}"`,
      status: "Pending Review",
      createdBy: createdBy || "Unassigned",
      createdDate: fmt(new Date()),
    };

    const nextQuotes = [newQuote, ...(parsed.quotes || [])];
    await supabase.from("crm_storage").upsert({
      key: "xpert-crm-data",
      value: JSON.stringify({ ...parsed, quotes: nextQuotes }),
    });

    return res.status(200).json({ created: true, quoteId: newQuote.id });
  } catch (e) {
    console.error(e);
    // Still return 200 so Resend doesn't retry indefinitely on our internal errors.
    return res.status(200).json({ error: String(e) });
  }
}
