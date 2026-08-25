// This file runs on Vercel's servers on a schedule (see vercel.json),
// NOT in the browser. It never ships to the CRM's frontend bundle.
import { createClient } from "@supabase/supabase-js";

const STAGE_PROB = {
  "New Lead": 5, "Attempting Contact": 10, "Contacted": 15, "Discovery / Qualification": 25,
  "Qualified Opportunity": 35, "Meeting Scheduled": 45, "Quote Requested": 50, "Quote Sent": 60,
  "Negotiation": 75, "Trial Load / First Shipment": 90, "Won – Active Customer": 100,
  "Lost": 0, "Nurturing / Future Opportunity": 10,
};

const REP_EMAILS = {
  "Felipe Velez": "fvelez@lgiinc.com",
  "Manuela Posada": "mposada@lgiinc.com",
};

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

function buildHtml(repName, { overdue, dueToday, hotLeads, staleCount }) {
  const row = (t) => `<div style="padding:8px 12px;border-bottom:1px solid #e6e8eb;">
      <div style="font-weight:600;color:#0f172a;">${t.companyName}</div>
      <div style="font-size:12px;color:#64748b;">${t.type} · ${t.notes || ""}</div>
    </div>`;
  const leadRow = (l) => `<div style="padding:8px 12px;border-bottom:1px solid #e6e8eb;">
      <div style="font-weight:600;color:#0f172a;">${l.companyName}</div>
      <div style="font-size:12px;color:#64748b;">${l.contactFirst} ${l.contactLast} · last activity ${l.lastActivityDate}</div>
    </div>`;

  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
    <div style="background:#1c1c1c;padding:16px 20px;border-radius:10px 10px 0 0;">
      <span style="color:#39d639;font-weight:800;font-size:16px;">XPERT FREIGHT</span>
    </div>
    <div style="border:1px solid #e6e8eb;border-top:none;border-radius:0 0 10px 10px;padding:20px;">
      <h2 style="color:#0f172a;margin:0 0 4px;">Good morning, ${repName.split(" ")[0]}</h2>
      <p style="color:#64748b;font-size:13px;margin:0 0 16px;">Here's what needs your attention today.</p>

      <div style="margin-bottom:16px;">
        <div style="font-weight:700;color:#ef4444;font-size:13px;margin-bottom:6px;">🔴 ${overdue.length} overdue task${overdue.length !== 1 ? "s" : ""}</div>
        ${overdue.length ? overdue.map(row).join("") : `<div style="font-size:13px;color:#64748b;">Nothing overdue.</div>`}
      </div>

      <div style="margin-bottom:16px;">
        <div style="font-weight:700;color:#22a022;font-size:13px;margin-bottom:6px;">🟢 ${dueToday.length} task${dueToday.length !== 1 ? "s" : ""} due today</div>
        ${dueToday.length ? dueToday.map(row).join("") : `<div style="font-size:13px;color:#64748b;">Nothing due today.</div>`}
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-weight:700;color:#f59e0b;font-size:13px;margin-bottom:6px;">🔥 Hot leads needing attention</div>
        ${hotLeads.length ? hotLeads.map(leadRow).join("") : `<div style="font-size:13px;color:#64748b;">None right now.</div>`}
      </div>

      ${staleCount > 0 ? `<div style="font-size:13px;color:#ef4444;margin-top:8px;">⚠️ ${staleCount} lead${staleCount !== 1 ? "s" : ""} with no activity in 7+ days.</div>` : ""}

      <a href="https://xpert-crm.vercel.app" style="display:inline-block;margin-top:20px;background:#39d639;color:#1c1c1c;font-weight:700;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:13px;">Open CRM</a>
    </div>
  </div>`;
}

export default async function handler(req, res) {
  // Only Vercel's own cron scheduler (or someone with the secret) can trigger this.
  const auth = req.headers["authorization"];
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from("crm_storage")
      .select("value")
      .eq("key", "xpert-crm-data")
      .maybeSingle();

    if (error || !data) return res.status(200).json({ sent: 0, note: "No CRM data found yet." });

    const parsed = JSON.parse(data.value);
    const leads = parsed.leads || [];
    const tasks = parsed.tasks || [];
    const today = fmt(new Date());

    let sent = 0;
    for (const repName of Object.keys(REP_EMAILS)) {
      const myTasks = tasks.filter((t) => t.assignedTo === repName && !t.done);
      const overdue = myTasks.filter((t) => t.dueDate < today);
      const dueToday = myTasks.filter((t) => t.dueDate === today);
      const myLeads = leads.filter((l) => l.assignedTo === repName && l.stage !== "Won – Active Customer" && l.stage !== "Lost");
      const hotLeads = [...myLeads]
        .filter((l) => l.priority === "Hot")
        .sort((a, b) => new Date(a.lastActivityDate) - new Date(b.lastActivityDate))
        .slice(0, 3);
      const staleCount = myLeads.filter((l) => l.lastActivityDate && (new Date() - new Date(l.lastActivityDate)) / 86400000 > 7).length;

      // Skip sending an empty digest with nothing to report.
      if (overdue.length === 0 && dueToday.length === 0 && hotLeads.length === 0) continue;

      const html = buildHtml(repName, { overdue, dueToday, hotLeads, staleCount });
      const testOverride = process.env.DIGEST_TEST_OVERRIDE_EMAIL;
      const toAddress = testOverride || REP_EMAILS[repName];

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.DIGEST_FROM_EMAIL || "Xpert Freight <onboarding@resend.dev>",
          to: toAddress,
          subject: testOverride
            ? `[TEST for ${repName}] Your day at Xpert Freight — ${today}`
            : `Your day at Xpert Freight — ${today}`,
          html,
        }),
      });
      sent++;
    }

    return res.status(200).json({ sent });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
