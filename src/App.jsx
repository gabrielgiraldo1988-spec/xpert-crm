import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LayoutDashboard, Users, Briefcase, KanbanSquare, Phone, UserCheck,
  BarChart3, UsersRound, Search, Plus, X, Flame, Snowflake, Sun,
  Mail, MapPin, Building2, TrendingUp, TrendingDown, Clock, CheckCircle2,
  AlertTriangle, Calendar, Truck, DollarSign, Target, ChevronRight, Trash2, Moon, Link2, Globe, FileText, Copy
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, CartesianGrid, Legend
} from "recharts";
import { supabase } from "./supabase";

/* ============================== BRAND TOKENS ============================== */
const THEMES = {
  light: {
    green: "#39d639", greenDark: "#22a022", greenTint: "#eafbea",
    charcoal: "#1c1c1c", charcoal2: "#272727",
    ink: "#0f172a", slate: "#64748b", line: "#e6e8eb", bg: "#f6f7f5",
    card: "#ffffff", cardHover: "#f9fafb",
    hot: "#ef4444", warm: "#f59e0b", cold: "#3b82f6", danger: "#ef4444",
    sidebarBg: "#ffffff", sidebarText: "#0f172a", sidebarTextMuted: "#64748b",
    sidebarBorder: "#e6e8eb", sidebarActiveText: "#1c1c1c", sidebarHoverBg: "#f1f5f2",
  },
  dark: {
    green: "#39d639", greenDark: "#4ee84e", greenTint: "#16321a",
    charcoal: "#0e0f0e", charcoal2: "#1a1b1a",
    ink: "#e9edf1", slate: "#94a3b8", line: "#2b2f33", bg: "#121314",
    card: "#1c1e1f", cardHover: "#232527",
    hot: "#f87171", warm: "#fbbf24", cold: "#60a5fa", danger: "#f87171",
    sidebarBg: "#0e0f0e", sidebarText: "#ffffff", sidebarTextMuted: "#8b8d94",
    sidebarBorder: "#333333", sidebarActiveText: "#0e0f0e", sidebarHoverBg: "#1a1b1a",
  },
};
const C = { ...THEMES.light };
function applyTheme(name) {
  Object.assign(C, THEMES[name] || THEMES.light);
}

const STAGES = [
  "New Lead", "Attempting Contact", "Contacted", "Discovery / Qualification",
  "Qualified Opportunity", "Meeting Scheduled", "Quote Requested", "Quote Sent",
  "Negotiation", "Trial Load / First Shipment", "Credit App", "Won – Active Customer", "Lost",
  "Nurturing / Future Opportunity",
];
const STAGE_COLORS = {
  "New Lead": "#94a3b8", "Attempting Contact": "#60a5fa", "Contacted": "#38bdf8",
  "Discovery / Qualification": "#818cf8", "Qualified Opportunity": "#a78bfa",
  "Meeting Scheduled": "#f472b6", "Quote Requested": "#fb923c", "Quote Sent": "#fbbf24",
  "Negotiation": "#eab308", "Trial Load / First Shipment": "#4ade80", "Credit App": "#14b8a6",
  "Won – Active Customer": "#39d639", "Lost": "#ef4444",
  "Nurturing / Future Opportunity": "#a1a1aa",
};
const STAGE_PROB = {
  "New Lead": 5, "Attempting Contact": 10, "Contacted": 15, "Discovery / Qualification": 25,
  "Qualified Opportunity": 35, "Meeting Scheduled": 45, "Quote Requested": 50, "Quote Sent": 60,
  "Negotiation": 75, "Trial Load / First Shipment": 90, "Credit App": 95, "Won – Active Customer": 100,
  "Lost": 0, "Nurturing / Future Opportunity": 10,
};
const SERVICES = ["Dry Van", "Reefer", "Flatbed", "FTL", "LTL", "Cross-Border", "Warehousing",
  "Transloading", "Project Cargo", "Staffing", "Dispatch", "After-Hours", "AI Solutions"];
const SOURCES = ["Cold Call", "Cold Email", "LinkedIn", "Referral", "Website",
  "Logistics Conference", "Existing Customer", "DAT", "Truckstop", "Social Media"];
const PRIORITIES = ["Hot", "Warm", "Cold"];
const PRIORITY_COLOR = { Hot: C.hot, Warm: C.warm, Cold: C.cold };
const REPS = ["Felipe Velez", "Manuela Posada"];
const EMAIL_TO_REP = { "fvelez@lgiinc.com": "Felipe Velez", "mposada@lgiinc.com": "Manuela Posada" };
const QUICK_TEMPLATES = [
  "Sent quote, awaiting response.",
  "Left voicemail, will retry.",
  "Followed up on outstanding quote — no response yet.",
  "Client asked for more time to decide.",
  "Positive call — requested a formal quote.",
  "Reviewed lane volumes and equipment needs.",
];
const LOST_REASONS = ["Pricing", "No Response", "No Capacity", "Timing", "Competitor",
  "Customer Stayed with Current Provider", "Other"];
const ACTIVITY_TYPES = ["Phone Call", "Email", "LinkedIn Message", "Meeting",
  "Quote Follow-up", "Customer Visit", "Internal Task"];

const COMPANY_POOL = [
  { name: "ABC Logistics", industry: "Logistics Company", city: "Dallas", state: "TX" },
  { name: "Meridian Freight Solutions", industry: "Freight / 3PL", city: "Atlanta", state: "GA" },
  { name: "Blue Ridge Trucking Co.", industry: "Trucking Company", city: "Charlotte", state: "NC" },
  { name: "Coastal Produce Distributors", industry: "Food & Beverage", city: "Miami", state: "FL" },
  { name: "Summit Manufacturing Corp", industry: "Manufacturing", city: "Cleveland", state: "OH" },
  { name: "Lone Star Building Materials", industry: "Construction", city: "Houston", state: "TX" },
  { name: "Great Lakes Foods Inc.", industry: "Food & Beverage", city: "Chicago", state: "IL" },
  { name: "Pinnacle Import Group", industry: "Importer", city: "Long Beach", state: "CA" },
  { name: "Riverside Warehousing LLC", industry: "Warehousing", city: "Memphis", state: "TN" },
  { name: "Apex Construction Supply", industry: "Construction", city: "Phoenix", state: "AZ" },
  { name: "Heartland Grain Co.", industry: "Agriculture", city: "Kansas City", state: "MO" },
  { name: "Northgate Distribution Center", industry: "Warehousing", city: "Indianapolis", state: "IN" },
  { name: "Cascade Beverage Co.", industry: "Food & Beverage", city: "Portland", state: "OR" },
  { name: "Ironclad Steel Works", industry: "Manufacturing", city: "Pittsburgh", state: "PA" },
  { name: "Sunbelt Agriculture Partners", industry: "Agriculture", city: "Fresno", state: "CA" },
  { name: "Peak Performance Auto Parts", industry: "Automotive", city: "Detroit", state: "MI" },
  { name: "Liberty Furniture Co.", industry: "Furniture", city: "High Point", state: "NC" },
  { name: "Vantage Electronics Group", industry: "Electronics", city: "Austin", state: "TX" },
  { name: "Prairie Fresh Dairy", industry: "Food & Beverage", city: "Sioux Falls", state: "SD" },
  { name: "TransCon Carriers Inc.", industry: "Trucking Company", city: "Nashville", state: "TN" },
  { name: "Redwood Import & Export", industry: "Importer", city: "Oakland", state: "CA" },
  { name: "Frontier Industrial Supply", industry: "Manufacturing", city: "Denver", state: "CO" },
  { name: "Gulf Coast Chemical Co.", industry: "Manufacturing", city: "Baton Rouge", state: "LA" },
  { name: "Colonial Paper Products", industry: "Manufacturing", city: "Richmond", state: "VA" },
];
const FIRST_NAMES = ["James", "Maria", "Robert", "Linda", "Michael", "Patricia", "David", "Jennifer",
  "Carlos", "Ana", "John", "Laura", "Kevin", "Sandra", "Brian", "Michelle", "Steven", "Karen",
  "Eric", "Jessica", "Mark", "Emily", "Paul", "Rachel", "Daniel", "Nicole"];
const LAST_NAMES = ["Johnson", "Smith", "Williams", "Brown", "Garcia", "Martinez", "Davis",
  "Rodriguez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee",
  "Perez", "Thompson", "White", "Harris"];
const JOB_TITLES = ["Operations Manager", "Transportation Manager", "Logistics Director",
  "Procurement Manager", "Owner", "VP of Supply Chain", "Fleet Manager", "Warehouse Manager",
  "Supply Chain Analyst", "General Manager"];

/* ============================== HELPERS ============================== */
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })(); // real "today", computed fresh on every page load
const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rint(0, arr.length - 1)];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const fmt = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";
const dateOnly = (d) => {
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [year, month, day] = d.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = rint(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };

function buildStagePlan() {
  const counts = {
    "New Lead": 10, "Attempting Contact": 6, "Contacted": 6, "Discovery / Qualification": 4,
    "Qualified Opportunity": 4, "Meeting Scheduled": 3, "Quote Requested": 2, "Quote Sent": 2,
    "Negotiation": 2, "Trial Load / First Shipment": 2, "Won – Active Customer": 5, "Lost": 3,
    "Nurturing / Future Opportunity": 1,
  };
  let plan = [];
  Object.entries(counts).forEach(([stage, n]) => { for (let i = 0; i < n; i++) plan.push(stage); });
  return shuffle(plan);
}

function genLeads() {
  const stagePlan = buildStagePlan();
  return stagePlan.map((stage, i) => {
    const co = COMPANY_POOL[i % COMPANY_POOL.length];
    const rep = REPS[i % 2];
    const priority = stage === "Lost" ? pick(PRIORITIES) : pick(["Hot", "Hot", "Warm", "Warm", "Warm", "Cold"]);
    const trucks = rint(3, 220);
    const source = pick(SOURCES);
    const createdDate = addDays(TODAY, -rint(5, 95));
    const isOpen = stage !== "Won – Active Customer" && stage !== "Lost";
    const isWon = stage === "Won – Active Customer";
    const stageIdx = STAGES.indexOf(stage);
    const isOppOrLater = stageIdx >= STAGES.indexOf("Qualified Opportunity") && stage !== "Lost" && stage !== "Nurturing / Future Opportunity";

    let nextFollowup = null;
    if (isOpen) {
      const roll = rint(1, 10);
      const offset = roll <= 2 ? -rint(1, 5) : roll <= 4 ? 0 : rint(1, 14);
      nextFollowup = addDays(TODAY, offset);
    }
    const lastActivity = addDays(TODAY, -rint(0, 18));

    const baseRev = isOppOrLater || isWon
      ? rint(5000, 60000)
      : rint(1500, 14000);
    const avgRevPerLoad = rint(900, 3200);
    const avgWeeklyLoads = Math.max(1, Math.round(baseRev / avgRevPerLoad / 4));

    const score = Math.min(100, Math.round(
      (priority === "Hot" ? 40 : priority === "Warm" ? 22 : 8) +
      Math.min(25, trucks / 8) +
      (STAGE_PROB[stage] / 100) * 25 +
      rint(0, 10)
    ));

    let servicesInterest = shuffle(SERVICES).slice(0, rint(1, 4));

    const lead = {
      id: "L" + (i + 1),
      companyName: co.name,
      legalName: co.name + (Math.random() > 0.5 ? ", LLC" : " Inc."),
      industry: co.industry,
      companySize: pick(["1-10", "11-50", "51-200", "201-500", "500+"]),
      trucks, employees: rint(10, 900),
      website: "www." + co.name.toLowerCase().replace(/[^a-z]+/g, "") + ".com",
      companyLinkedin: "linkedin.com/company/" + co.name.toLowerCase().replace(/[^a-z]+/g, "-"),
      city: co.city, state: co.state, timeZone: pick(["ET", "CT", "MT", "PT"]),
      contactFirst: pick(FIRST_NAMES), contactLast: pick(LAST_NAMES),
      jobTitle: pick(JOB_TITLES), department: pick(["Operations", "Logistics", "Procurement", "Executive"]),
      email: "", phone: `(${rint(200, 989)}) ${rint(200, 989)}-${rint(1000, 9999)}`,
      mobile: `(${rint(200, 989)}) ${rint(200, 989)}-${rint(1000, 9999)}`,
      linkedin: "linkedin.com/in/contact",
      source, priority, score,
      stage, assignedTo: rep,
      servicesInterest,
      originStates: shuffle(["TX", "GA", "CA", "IL", "FL", "OH", "NC"]).slice(0, 2).join(", "),
      destinationStates: shuffle(["TX", "GA", "CA", "IL", "FL", "OH", "NC"]).slice(0, 2).join(", "),
      mainLanes: `${co.state} → ${pick(["TX", "GA", "CA", "IL", "FL", "OH"])}`,
      equipmentType: pick(["Dry Van", "Reefer", "Flatbed", "Multiple"]),
      avgWeeklyLoads, avgMonthlyLoads: avgWeeklyLoads * 4,
      avgWeight: rint(18, 45) + "k lbs", commodity: pick(["General Merchandise", "Perishables", "Building Materials", "Steel/Metals", "Packaged Foods", "Electronics", "Auto Parts"]),
      hazmat: Math.random() > 0.85, tempControlled: Math.random() > 0.75,
      appointmentRequired: Math.random() > 0.5,
      currentProvider: Math.random() > 0.4 ? pick(["In-house fleet", "Regional broker", "National 3PL", "Owner-operator network"]) : "None",
      estMonthlyRevenue: baseRev, estAnnualRevenue: baseRev * 12, avgRevPerLoad,
      probability: STAGE_PROB[stage], expectedCloseDate: isOpen ? fmt(addDays(TODAY, rint(10, 90))) : null,
      createdDate: fmt(createdDate), lastActivityDate: fmt(lastActivity),
      nextFollowupDate: nextFollowup ? fmt(nextFollowup) : null,
      lostReason: stage === "Lost" ? pick(LOST_REASONS) : null,
      callsCount: rint(1, 14), emailsCount: rint(1, 20), followupsCompleted: rint(0, 8),
      salesCycleDays: isWon ? rint(18, 65) : null,
      startDate: isWon ? fmt(addDays(createdDate, rint(10, 40))) : null,
      customerHealth: isWon ? pick(["Active", "Active", "Growing", "At Risk"]) : null,
      lastLoadDate: isWon ? fmt(addDays(TODAY, -rint(0, 10))) : null,
    };
    lead.email = `${lead.contactFirst}.${lead.contactLast}@${lead.website.replace("www.", "")}`.toLowerCase();
    return lead;
  });
}

function genActivities(leads) {
  const list = [];
  let id = 1;
  leads.forEach((lead) => {
    const n = rint(1, 4);
    for (let i = 0; i < n; i++) {
      const date = addDays(TODAY, -rint(1, 40));
      list.push({
        id: "A" + id++, leadId: lead.id, type: pick(ACTIVITY_TYPES), date: fmt(date),
        salesperson: lead.assignedTo, notes: pick([
          "Discussed current freight spend and pain points.",
          "Introduced Xpert Freight service offering.",
          "Sent capabilities overview and rate estimate.",
          "Left voicemail, will retry.",
          "Positive call, requested a formal quote.",
          "Reviewed lane volumes and equipment needs.",
          "Followed up on outstanding quote.",
        ]), outcome: pick(["Connected", "No Answer", "Interested", "Needs Follow-up", "Sent Info"]),
        nextStep: pick(["Send quote", "Schedule call", "Send follow-up email", "Await response", "Set up trial load"]),
      });
    }
  });
  return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* ============================== SMALL UI PARTS ============================== */
function Avatar({ name, size = 28 }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const color = name === "Felipe Velez" ? C.charcoal : C.greenDark;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", fontSize: size * 0.38, fontWeight: 700 }}
      className="flex items-center justify-center shrink-0">{initials}</div>
  );
}
function PriorityBadge({ p }) {
  const Icon = p === "Hot" ? Flame : p === "Warm" ? Sun : Snowflake;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: PRIORITY_COLOR[p] + "1a", color: PRIORITY_COLOR[p] }}>
      <Icon size={11} />{p}
    </span>
  );
}
function StagePill({ stage }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: STAGE_COLORS[stage] + "22", color: STAGE_COLORS[stage] === "#fbbf24" || STAGE_COLORS[stage] === "#eab308" ? "#92660a" : STAGE_COLORS[stage] }}>
      {stage}
    </span>
  );
}
function ScoreRing({ score, size = 40 }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  const color = score >= 70 ? C.green : score >= 40 ? C.warm : C.slate;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e6e8eb" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontSize: size * 0.28, color: C.ink }}>{score}</div>
    </div>
  );
}
function KpiCard({ label, value, icon: Icon, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border p-4 flex flex-col gap-2" style={{ borderColor: C.line }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: C.slate }}>{label}</span>
        <Icon size={16} style={{ color: accent || C.green }} />
      </div>
      <div className="text-2xl font-bold" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: C.slate }}>{sub}</div>}
    </div>
  );
}
function Modal({ onClose, children, width = 640 }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(15,23,42,0.45)" }} onClick={onClose}>
      <div className="h-full bg-white overflow-y-auto shadow-2xl" style={{ width: Math.min(width, window.innerWidth) }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
function FieldLabel({ children }) { return <div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: C.slate }}>{children}</div>; }

/* ============================== LOGIN ============================== */
function LoginScreen({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
    } else {
      onLoggedIn();
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center" style={{ background: C.charcoal }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      <form onSubmit={submit} className="bg-white rounded-xl p-8 w-full max-w-sm flex flex-col gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center gap-2 mb-2">
          <div style={{ width: 10, height: 22, background: C.green, borderRadius: 3 }} />
          <div className="font-extrabold text-[15px] leading-tight" style={{ color: C.charcoal }}>XPERT<br /><span style={{ color: C.greenDark }}>FREIGHT</span></div>
        </div>
        <div>
          <FieldLabel>Correo</FieldLabel>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: C.line }} placeholder="tu@lgiinc.com" />
        </div>
        <div>
          <FieldLabel>Contraseña</FieldLabel>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: C.line }} placeholder="••••••••" />
        </div>
        {error && <div className="text-xs font-medium" style={{ color: C.danger }}>{error}</div>}
        <button type="submit" disabled={busy}
          className="px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: C.green, color: C.charcoal, opacity: busy ? 0.6 : 1 }}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out, object = logged in

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="h-screen w-full flex items-center justify-center" style={{ background: C.bg, color: C.slate }}>Cargando…</div>;
  }
  if (!session) {
    return <LoginScreen onLoggedIn={() => {}} />;
  }
  return <CRMApp session={session} />;
}

function CRMApp({ session }) {
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const leadsRef = useRef(leads);
  const activitiesRef = useRef(activities);
  const tasksRef = useRef(tasks);
  const notesRef = useRef(notes);
  const quotesRef = useRef(quotes);
  const persistQueueRef = useRef(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => EMAIL_TO_REP[session?.user?.email] ? "myday" : "dashboard");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [toast, setToast] = useState(null);
  const [leadFilters, setLeadFilters] = useState({ rep: "All", stage: "All", source: "All", priority: "All" });
  const [pipelineRep, setPipelineRep] = useState("All");
  const [activityRep, setActivityRep] = useState("All");
  const [calendarRep, setCalendarRep] = useState("All");
  const myRep = EMAIL_TO_REP[session?.user?.email] || null;
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  useEffect(() => {
    if (myRep && !defaultsApplied) {
      setLeadFilters((prev) => ({ ...prev, rep: myRep }));
      setPipelineRep(myRep);
      setActivityRep(myRep);
      setCalendarRep(myRep);
      setDefaultsApplied(true);
    }
  }, [myRep, defaultsApplied]);
  const searchInputRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setView("leads");
        setTimeout(() => searchInputRef.current && searchInputRef.current.focus(), 0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("xpert-crm-theme") : null;
    return saved === "dark" || saved === "light" ? saved : "light";
  });
  applyTheme(theme);
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try { window.localStorage.setItem("xpert-crm-theme", next); } catch (e) { /* best-effort */ }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("crm_storage")
          .select("value")
          .eq("key", "xpert-crm-data")
          .maybeSingle();
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          const loadedLeads = parsed.leads || [];
          const loadedActivities = parsed.activities || [];
          const loadedTasks = parsed.tasks || [];
          const loadedNotes = parsed.notes || [];
          const loadedQuotes = parsed.quotes || [];
          leadsRef.current = loadedLeads;
          activitiesRef.current = loadedActivities;
          tasksRef.current = loadedTasks;
          notesRef.current = loadedNotes;
          quotesRef.current = loadedQuotes;
          setLeads(loadedLeads);
          setActivities(loadedActivities);
          setTasks(loadedTasks);
          setNotes(loadedNotes);
          setQuotes(loadedQuotes);
          setLoading(false);
          return;
        }
      } catch (e) { /* no stored data yet */ }
      const seedLeads = genLeads();
      const seedActivities = genActivities(seedLeads);
      leadsRef.current = seedLeads;
      activitiesRef.current = seedActivities;
      tasksRef.current = [];
      notesRef.current = [];
      quotesRef.current = [];
      setLeads(seedLeads);
      setActivities(seedActivities);
      setTasks([]);
      setNotes([]);
      setQuotes([]);
      setLoading(false);
      try {
        await supabase.from("crm_storage").upsert({ key: "xpert-crm-data", value: JSON.stringify({ leads: seedLeads, activities: seedActivities, tasks: [], notes: [], quotes: [] }) });
      } catch (e) { /* storage best-effort */ }
    })();
  }, []);

  const persist = useCallback(() => {
    const snapshot = {
      leads: leadsRef.current,
      activities: activitiesRef.current,
      tasks: tasksRef.current,
      notes: notesRef.current,
      quotes: quotesRef.current,
    };
    persistQueueRef.current = persistQueueRef.current
      .catch(() => {})
      .then(() => supabase.from("crm_storage").upsert({ key: "xpert-crm-data", value: JSON.stringify(snapshot) }))
      .catch(() => {});
    return persistQueueRef.current;
  }, []);

  const updateLead = useCallback((id, patch) => {
    const next = leadsRef.current.map((l) => (l.id === id ? { ...l, ...patch } : l));
    leadsRef.current = next;
    setLeads(next);
    persist();
  }, [persist]);

  const deleteLead = useCallback((id) => {
    const next = leadsRef.current.filter((l) => l.id !== id);
    leadsRef.current = next;
    setLeads(next);
    setSelectedLeadId(null);
    persist();
  }, [persist]);

  const addLead = useCallback((lead) => {
    const next = [lead, ...leadsRef.current];
    leadsRef.current = next;
    setLeads(next);
    persist();
  }, [persist]);

  const addLeadsBulk = useCallback((newLeads) => {
    const next = [...newLeads, ...leadsRef.current];
    leadsRef.current = next;
    setLeads(next);
    persist();
  }, [persist]);

  const logActivity = useCallback((leadId, act, dueDate) => {
    const lead = leadsRef.current.find((l) => l.id === leadId);
    const nextLeads = leadsRef.current.map((l) => l.id === leadId ? {
      ...l, lastActivityDate: fmt(TODAY),
      nextFollowupDate: dueDate || l.nextFollowupDate,
    } : l);
    const nextActivities = [{ id: "A" + Date.now(), leadId, date: fmt(TODAY), ...act }, ...activitiesRef.current];
    const nextTasks = dueDate ? [{
      id: "T" + Date.now(), leadId, companyName: lead ? lead.companyName : "",
      assignedTo: lead ? lead.assignedTo : "", type: act.type, notes: act.notes,
      dueDate, done: false, createdDate: fmt(TODAY),
    }, ...tasksRef.current] : tasksRef.current;
    leadsRef.current = nextLeads;
    activitiesRef.current = nextActivities;
    tasksRef.current = nextTasks;
    setLeads(nextLeads);
    setActivities(nextActivities);
    setTasks(nextTasks);
    persist();
  }, [persist]);

  const toggleTaskDone = useCallback((taskId) => {
    const next = tasksRef.current.map((t) => t.id === taskId ? { ...t, done: !t.done } : t);
    tasksRef.current = next;
    setTasks(next);
    persist();
  }, [persist]);

  const addNote = useCallback((leadId, text) => {
    const next = [{ id: "N" + Date.now(), leadId, text, author: myRep || session?.user?.email || "Unknown", date: fmt(TODAY) }, ...notesRef.current];
    notesRef.current = next;
    setNotes(next);
    persist();
  }, [persist, myRep, session]);

  const addQuote = useCallback((quote) => {
    const next = [quote, ...quotesRef.current];
    quotesRef.current = next;
    setQuotes(next);
    persist();
  }, [persist]);

  const updateQuote = useCallback((id, patch) => {
    const next = quotesRef.current.map((q) => q.id === id ? { ...q, ...patch } : q);
    quotesRef.current = next;
    setQuotes(next);
    persist();
  }, [persist]);

  const deleteQuote = useCallback((id) => {
    const next = quotesRef.current.filter((q) => q.id !== id);
    quotesRef.current = next;
    setQuotes(next);
    persist();
  }, [persist]);

  const selectedLead = useMemo(() => leads.find((l) => l.id === selectedLeadId) || null, [leads, selectedLeadId]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center" style={{ background: C.bg, color: C.slate }}>Loading CRM…</div>;
  }

  const todayStr = fmt(TODAY);
  const scopeLeads = myRep ? leads.filter(l => l.assignedTo === myRep) : leads;
  const scopeOpenTasks = myRep ? tasks.filter(t => t.assignedTo === myRep && !t.done) : tasks.filter(t => !t.done);
  const inProgressCount = scopeLeads.filter(l => l.stage !== "Won – Active Customer" && l.stage !== "Lost").length;
  const dueTodayCount = scopeOpenTasks.filter(t => t.dueDate === todayStr).length;
  const overdueCount = scopeOpenTasks.filter(t => t.dueDate < todayStr).length;
  const customersCount = scopeLeads.filter(l => l.stage === "Won – Active Customer").length;

  const NAV = [
    { key: "myday", label: "My Day", icon: Sun },
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "leads", label: "Leads", icon: Users },
    { key: "pipeline", label: "Pipeline", icon: KanbanSquare },
    { key: "quotes", label: "Quotes", icon: FileText },
    { key: "activities", label: "Activities", icon: Phone, badge: overdueCount + dueTodayCount },
    { key: "calendar", label: "Calendar", icon: Calendar, badge: overdueCount + dueTodayCount },
    { key: "customers", label: "Customers", icon: UserCheck, badge: customersCount },
    { key: "reports", label: "Reports", icon: BarChart3 },
    { key: "team", label: "Sales Team", icon: UsersRound },
  ];

  return (
    <div data-theme={theme} className="flex h-screen w-full overflow-hidden" style={{ background: C.bg, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        [data-theme="dark"] .bg-white { background-color: ${THEMES.dark.card} !important; }
        [data-theme="dark"] .hover\\:bg-gray-50:hover { background-color: ${THEMES.dark.cardHover} !important; }
        [data-theme="dark"] .hover\\:bg-gray-100:hover { background-color: ${THEMES.dark.cardHover} !important; }
        [data-theme="dark"] input, [data-theme="dark"] select, [data-theme="dark"] textarea {
          background-color: ${THEMES.dark.card}; color: ${THEMES.dark.ink};
        }
        [data-theme="dark"] ::placeholder { color: ${THEMES.dark.slate}; }
      `}</style>

      {/* SIDEBAR */}
      <div className="flex flex-col shrink-0 border-r" style={{ width: 220, background: C.sidebarBg, borderColor: C.sidebarBorder }}>
        <div className="px-5 py-5 flex items-center justify-between gap-2 border-b" style={{ borderColor: C.sidebarBorder }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 22, background: C.green, borderRadius: 3 }} />
            <div className="font-extrabold text-[15px] leading-tight" style={{ color: C.sidebarText }}>XPERT<br /><span style={{ color: C.green }}>FREIGHT</span></div>
          </div>
          <button onClick={toggleTheme} title={theme === "light" ? "Modo oscuro" : "Modo claro"}
            className="p-1.5 rounded-lg shrink-0" style={{ background: C.sidebarHoverBg, color: C.greenDark }}>
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
        <div className="flex-1 py-3 px-2 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = view === n.key;
            return (
              <button key={n.key} onClick={() => setView(n.key)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: active ? C.green : "transparent", color: active ? C.sidebarActiveText : C.sidebarTextMuted }}>
                <n.icon size={16} />
                <span className="flex-1 text-left">{n.label}</span>
                {n.badge > 0 && (
                  <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5"
                    style={{ background: active ? C.sidebarActiveText : C.hot, color: active ? C.green : "#fff" }}>
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-4 text-[11px] border-t flex flex-col gap-2" style={{ borderColor: C.sidebarBorder, color: C.sidebarTextMuted }}>
          <div>Freight Brokerage under LGI<br />Medellín · USA/NA market</div>
          <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: C.sidebarBorder }}>
            <span className="truncate" style={{ maxWidth: 130 }}>{session?.user?.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="font-semibold shrink-0" style={{ color: C.greenDark }}>Salir</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <div className="h-16 shrink-0 bg-white border-b flex items-center justify-between px-6 gap-4" style={{ borderColor: C.line }}>
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
            <input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setView("leads"); }}
              placeholder="Search company, contact, phone, state… (Ctrl+K)"
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: C.line, background: C.bg }} />
          </div>
          <button onClick={() => setShowNewLead(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold shrink-0"
            style={{ background: C.green, color: C.charcoal }}>
            <Plus size={16} /> New Lead
          </button>
        </div>

        <div className="px-6 py-2.5 flex items-center gap-6 shrink-0 flex-wrap bg-white border-b" style={{ borderColor: C.line }}>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold" style={{ color: C.ink }}>{inProgressCount}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.slate }}>In Progress</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold" style={{ color: dueTodayCount > 0 ? C.greenDark : C.ink }}>{dueTodayCount}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.slate }}>Due Today</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold" style={{ color: overdueCount > 0 ? C.danger : C.ink }}>{overdueCount}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.slate }}>Overdue</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold" style={{ color: C.ink }}>{customersCount}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.slate }}>Customers</span>
          </div>
          {myRep && <span className="text-[11px] ml-auto" style={{ color: C.slate }}>Showing: <strong style={{ color: C.ink }}>{myRep}</strong></span>}
        </div>

        <TaskBanner leads={leads} tasks={tasks} myRep={myRep} setView={setView} />

        <div className="flex-1 overflow-y-auto p-6">
          {view === "myday" && <MyDayView leads={leads} tasks={tasks} activities={activities} myRep={myRep} setSelectedLeadId={setSelectedLeadId} setView={setView} />}
          {view === "dashboard" && <Dashboard leads={leads} activities={activities} setView={setView} setSelectedLeadId={setSelectedLeadId} />}
          {view === "leads" && <LeadsView leads={leads} search={search} setSearch={setSearch} setSelectedLeadId={setSelectedLeadId} filters={leadFilters} setFilters={setLeadFilters} addLeadsBulk={addLeadsBulk} />}
          {view === "pipeline" && <PipelineView leads={leads} updateLead={updateLead} setSelectedLeadId={setSelectedLeadId} repFilter={pipelineRep} setRepFilter={setPipelineRep} />}
          {view === "quotes" && <QuotesView leads={leads} quotes={quotes} addQuote={addQuote} updateQuote={updateQuote} deleteQuote={deleteQuote} logActivity={logActivity} myRep={myRep} setSelectedLeadId={setSelectedLeadId} />}
          {view === "activities" && <ActivitiesView leads={leads} activities={activities} logActivity={logActivity} setSelectedLeadId={setSelectedLeadId} repFilter={activityRep} setRepFilter={setActivityRep} />}
          {view === "calendar" && <CalendarView tasks={tasks} toggleTaskDone={toggleTaskDone} setSelectedLeadId={setSelectedLeadId} repFilter={calendarRep} setRepFilter={setCalendarRep} />}
          {view === "customers" && <CustomersView leads={leads} setSelectedLeadId={setSelectedLeadId} />}
          {view === "reports" && <ReportsView leads={leads} />}
          {view === "team" && <TeamView leads={leads} activities={activities} setSelectedLeadId={setSelectedLeadId} />}
        </div>
      </div>

      {selectedLead && (
        <LeadDetail key={selectedLead.id} lead={selectedLead} activities={activities.filter(a => a.leadId === selectedLead.id)}
          tasks={tasks.filter(t => t.leadId === selectedLead.id)} toggleTaskDone={toggleTaskDone}
          notes={notes.filter(n => n.leadId === selectedLead.id)} addNote={addNote}
          onClose={() => setSelectedLeadId(null)} updateLead={updateLead} deleteLead={deleteLead} logActivity={logActivity} />
      )}
      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} onCreate={(l) => { addLead(l); setShowNewLead(false); }} />}
    </div>
  );
}

/* ============================== DASHBOARD ============================== */
/* ============================== TASK BANNER ============================== */
function TaskBanner({ leads, tasks, myRep, setView }) {
  const [dismissed, setDismissed] = useState(false);
  const todayStr = fmt(TODAY);
  const relevant = myRep ? tasks.filter(t => t.assignedTo === myRep) : tasks;
  const open = relevant.filter(t => !t.done);
  const overdueCount = open.filter(t => t.dueDate < todayStr).length;
  const todayCount = open.filter(t => t.dueDate === todayStr).length;

  if (dismissed || (overdueCount === 0 && todayCount === 0)) return null;

  return (
    <div className="px-6 py-2.5 flex items-center justify-between gap-3 shrink-0"
      style={{ background: overdueCount > 0 ? C.hot + "1a" : C.greenTint, borderBottom: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: overdueCount > 0 ? C.danger : C.greenDark }}>
        {overdueCount > 0 && <AlertTriangle size={15} />}
        {overdueCount > 0 && <span>{overdueCount} overdue task{overdueCount !== 1 ? "s" : ""}</span>}
        {overdueCount > 0 && todayCount > 0 && <span>·</span>}
        {todayCount > 0 && <span>{todayCount} due today</span>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setView("calendar")} className="text-xs font-semibold underline" style={{ color: overdueCount > 0 ? C.danger : C.greenDark }}>View Calendar</button>
        <button onClick={() => setDismissed(true)} className="p-1"><X size={14} style={{ color: C.slate }} /></button>
      </div>
    </div>
  );
}

/* ============================== MY DAY ============================== */
function MyDayView({ leads, tasks, activities, myRep, setSelectedLeadId, setView }) {
  const todayStr = fmt(TODAY);
  const scope = myRep ? leads.filter(l => l.assignedTo === myRep) : leads;
  const myTasks = myRep ? tasks.filter(t => t.assignedTo === myRep) : tasks;
  const openTasks = myTasks.filter(t => !t.done);
  const overdue = openTasks.filter(t => t.dueDate < todayStr).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const today = openTasks.filter(t => t.dueDate === todayStr);

  const openLeads = scope.filter(l => l.stage !== "Won – Active Customer" && l.stage !== "Lost");
  const hotUntouched = [...openLeads]
    .filter(l => l.priority === "Hot")
    .sort((a, b) => dateOnly(a.lastActivityDate) - dateOnly(b.lastActivityDate))
    .slice(0, 3);

  const firstName = myRep ? myRep.split(" ")[0] : "there";
  const greeting = TODAY.getHours() < 12 ? "Good morning" : TODAY.getHours() < 18 ? "Good afternoon" : "Good evening";

  const TaskRow = ({ t, tone }) => (
    <div key={t.id} onClick={() => setSelectedLeadId(t.leadId)} className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer hover:opacity-80" style={{ borderColor: C.line }}>
      <div>
        <div className="text-sm font-semibold" style={{ color: C.ink }}>{t.companyName}</div>
        <div className="text-xs" style={{ color: C.slate }}>{t.type} · {t.notes}</div>
      </div>
      <span className="text-xs font-semibold" style={{ color: tone }}>{t.dueDate}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>{greeting}, {firstName} 👋</h1>
        <p className="text-sm" style={{ color: C.slate }}>Here's what needs your attention today · {fmt(TODAY)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: C.danger }}>
            <AlertTriangle size={15} />Overdue ({overdue.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {overdue.map(t => <TaskRow key={t.id} t={t} tone={C.danger} />)}
            {overdue.length === 0 && <span className="text-xs" style={{ color: C.slate }}>Nothing overdue. Nice work.</span>}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: C.greenDark }}>
            <Calendar size={15} />Due Today ({today.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {today.map(t => <TaskRow key={t.id} t={t} tone={C.greenDark} />)}
            {today.length === 0 && <span className="text-xs" style={{ color: C.slate }}>No tasks due today.</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: C.ink }}>
          <Flame size={15} style={{ color: C.hot }} />Hot Leads Needing Attention
        </h3>
        <div className="flex flex-col gap-2">
          {hotUntouched.map(l => (
            <div key={l.id} onClick={() => setSelectedLeadId(l.id)} className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer hover:opacity-80" style={{ borderColor: C.line }}>
              <div>
                <div className="text-sm font-semibold" style={{ color: C.ink }}>{l.companyName}</div>
                <div className="text-xs" style={{ color: C.slate }}>{l.contactFirst} {l.contactLast} · {l.stage}</div>
              </div>
              <span className="text-xs" style={{ color: C.slate }}>Last activity: {l.lastActivityDate}</span>
            </div>
          ))}
          {hotUntouched.length === 0 && <span className="text-xs" style={{ color: C.slate }}>No hot leads pending right now.</span>}
        </div>
        <button onClick={() => setView("leads")} className="mt-3 text-xs font-semibold flex items-center gap-0.5" style={{ color: C.green }}>See all my leads <ChevronRight size={12} /></button>
      </div>
    </div>
  );
}

function Dashboard({ leads, activities, setView, setSelectedLeadId }) {
  const todayStr = fmt(TODAY);
  const openLeads = leads.filter(l => l.stage !== "Won – Active Customer" && l.stage !== "Lost");
  const opportunities = leads.filter(l => STAGES.indexOf(l.stage) >= STAGES.indexOf("Qualified Opportunity") && l.stage !== "Lost" && l.stage !== "Nurturing / Future Opportunity");
  const quotesSent = leads.filter(l => STAGES.indexOf(l.stage) >= STAGES.indexOf("Quote Sent") && l.stage !== "Lost");
  const won = leads.filter(l => l.stage === "Won – Active Customer");
  const lost = leads.filter(l => l.stage === "Lost");
  const pipelineValue = openLeads.reduce((s, l) => s + l.estMonthlyRevenue, 0);
  const expectedRevenue = openLeads.reduce((s, l) => s + l.estMonthlyRevenue * (l.probability / 100), 0);
  const revenueWon = won.reduce((s, l) => s + l.estMonthlyRevenue, 0);
  const conversion = leads.length ? ((won.length / leads.length) * 100).toFixed(1) : 0;
  const avgDeal = won.length ? Math.round(revenueWon / won.length) : 0;
  const avgCycle = won.length ? Math.round(won.reduce((s, l) => s + (l.salesCycleDays || 0), 0) / won.length) : 0;
  const followupsToday = openLeads.filter(l => l.nextFollowupDate === todayStr);
  const overdue = openLeads.filter(l => l.nextFollowupDate && dateOnly(l.nextFollowupDate) < dateOnly(TODAY));

  const repData = REPS.map(rep => {
    const rl = leads.filter(l => l.assignedTo === rep);
    const rw = rl.filter(l => l.stage === "Won – Active Customer");
    return {
      name: rep.split(" ")[0],
      Leads: rl.length,
      Contacted: rl.filter(l => STAGES.indexOf(l.stage) >= 1 && l.stage !== "Lost").length,
      Won: rw.length,
      Revenue: rw.reduce((s, l) => s + l.estMonthlyRevenue, 0),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>Sales Dashboard</h1>
        <p className="text-sm" style={{ color: C.slate }}>Live overview across Felipe Velez and Manuela Posada · {fmt(TODAY)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KpiCard label="Total Leads" value={leads.length} icon={Users} />
        <KpiCard label="Opportunities" value={opportunities.length} icon={Briefcase} />
        <KpiCard label="Quotes Sent" value={quotesSent.length} icon={Target} />
        <KpiCard label="Active Customers" value={won.length} icon={UserCheck} accent={C.green} />
        <KpiCard label="Won Deals" value={won.length} icon={TrendingUp} accent={C.green} />
        <KpiCard label="Lost Deals" value={lost.length} icon={TrendingDown} accent={C.danger} />
        <KpiCard label="Pipeline Value" value={money(pipelineValue) + "/mo"} icon={DollarSign} />
        <KpiCard label="Expected Revenue" value={money(expectedRevenue) + "/mo"} icon={DollarSign} accent={C.green} />
        <KpiCard label="Revenue Won" value={money(revenueWon) + "/mo"} icon={DollarSign} accent={C.green} />
        <KpiCard label="Conversion Rate" value={conversion + "%"} icon={Target} />
        <KpiCard label="Avg Deal Size" value={money(avgDeal) + "/mo"} icon={BarChart3} />
        <KpiCard label="Avg Sales Cycle" value={avgCycle + " days"} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Performance by Salesperson</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={repData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Leads" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Contacted" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Won" fill={C.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: C.line }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: C.ink }}><AlertTriangle size={15} style={{ color: C.danger }} />Overdue Follow-ups ({overdue.length})</h3>
            <button onClick={() => setView("activities")} className="text-xs font-medium flex items-center gap-0.5" style={{ color: C.green }}>View all <ChevronRight size={12} /></button>
          </div>
          <div className="flex flex-col gap-2 max-h-24 overflow-y-auto">
            {overdue.slice(0, 4).map(l => (
              <div key={l.id} onClick={() => setSelectedLeadId(l.id)} className="flex items-center justify-between text-sm cursor-pointer hover:opacity-70">
                <span className="font-medium" style={{ color: C.ink }}>{l.companyName}</span>
                <span className="text-xs" style={{ color: C.danger }}>{l.nextFollowupDate}</span>
              </div>
            ))}
            {overdue.length === 0 && <span className="text-xs" style={{ color: C.slate }}>Nothing overdue. Nice work.</span>}
          </div>
          <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: C.line }}>
            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: C.ink }}><Calendar size={15} style={{ color: C.green }} />Due Today ({followupsToday.length})</h3>
          </div>
          <div className="flex flex-col gap-2 max-h-24 overflow-y-auto">
            {followupsToday.slice(0, 4).map(l => (
              <div key={l.id} onClick={() => setSelectedLeadId(l.id)} className="flex items-center justify-between text-sm cursor-pointer hover:opacity-70">
                <span className="font-medium" style={{ color: C.ink }}>{l.companyName}</span>
                <span className="text-xs" style={{ color: C.slate }}>{l.assignedTo.split(" ")[0]}</span>
              </div>
            ))}
            {followupsToday.length === 0 && <span className="text-xs" style={{ color: C.slate }}>No follow-ups scheduled today.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== CSV IMPORT / EXPORT ============================== */
const CSV_COLUMNS = [
  "companyName", "contactFirst", "contactLast", "jobTitle", "email", "phone",
  "city", "state", "source", "priority", "assignedTo", "servicesInterest", "stage",
];

function csvEscape(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function leadsToCSV(leads) {
  const rows = leads.map((l) => CSV_COLUMNS.map((col) =>
    csvEscape(col === "servicesInterest" ? (l.servicesInterest || []).join(";") : l[col])
  ).join(","));
  return [CSV_COLUMNS.join(","), ...rows].join("\n");
}

function parseCSV(text) {
  const rows = [];
  let cur = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { cur.push(field); field = ""; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        cur.push(field); field = ""; rows.push(cur); cur = [];
      } else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.length > 1 || (r[0] !== undefined && r[0] !== ""));
}

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime || "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvRowsToLeads(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  const idx = (name) => headers.indexOf(name);
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (name) => { const i = idx(name); return i === -1 ? "" : (row[i] || "").trim(); };
    const companyName = get("companyName");
    const contactFirst = get("contactFirst");
    if (!companyName || !contactFirst) continue; // skip incomplete rows
    const priorityRaw = get("priority");
    const priority = PRIORITIES.includes(priorityRaw) ? priorityRaw : "Warm";
    const assignedToRaw = get("assignedTo");
    const assignedTo = REPS.includes(assignedToRaw) ? assignedToRaw : REPS[0];
    const sourceRaw = get("source");
    const source = SOURCES.includes(sourceRaw) ? sourceRaw : "Other";
    const stageRaw = get("stage");
    const stage = STAGES.includes(stageRaw) ? stageRaw : "New Lead";
    const servicesRaw = get("servicesInterest");
    const servicesInterest = servicesRaw ? servicesRaw.split(";").map((s) => s.trim()).filter(Boolean) : ["Dry Van"];
    const score = Math.min(100, Math.round((priority === "Hot" ? 40 : priority === "Warm" ? 22 : 8) + 20));

    out.push({
      id: "L" + Date.now() + "-" + r, companyName, legalName: companyName, industry: "",
      companySize: "11-50", trucks: 0, employees: 0, website: "", companyLinkedin: "", city: get("city"), state: get("state"),
      timeZone: "CT", contactFirst, contactLast: get("contactLast"), jobTitle: get("jobTitle") || "Operations Manager",
      department: "Operations", email: get("email"), phone: get("phone"), mobile: get("phone"), linkedin: "",
      source, priority, score, stage, assignedTo, servicesInterest,
      originStates: "", destinationStates: "", mainLanes: "", equipmentType: "Dry Van",
      avgWeeklyLoads: 0, avgMonthlyLoads: 0, avgWeight: "", commodity: "", hazmat: false, tempControlled: false,
      appointmentRequired: false, currentProvider: "Unknown", estMonthlyRevenue: 0, estAnnualRevenue: 0,
      avgRevPerLoad: 0, probability: STAGE_PROB[stage], expectedCloseDate: null,
      createdDate: fmt(TODAY), lastActivityDate: fmt(TODAY), nextFollowupDate: null, lostReason: null,
      callsCount: 0, emailsCount: 0, followupsCompleted: 0, salesCycleDays: null, startDate: null,
      customerHealth: null, lastLoadDate: null,
    });
  }
  return out;
}

function FilterSelect({ value, onChange, options, label }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm border rounded-lg px-2.5 py-1.5" style={{ borderColor: C.line }}>
      <option value="All">{label}: All</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ============================== LEADS ============================== */
function LeadsView({ leads, search, setSearch, setSelectedLeadId, filters, setFilters, addLeadsBulk }) {
  const { rep, stage, source, priority } = filters;
  const setField = (key) => (val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const fileInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState("");

  const filtered = leads.filter(l => {
    const q = search.trim().toLowerCase();
    const matchesQ = !q || [l.companyName, l.contactFirst, l.contactLast, l.phone, l.email, l.state].join(" ").toLowerCase().includes(q);
    return matchesQ && (rep === "All" || l.assignedTo === rep) && (stage === "All" || l.stage === stage) &&
      (source === "All" || l.source === source) && (priority === "All" || l.priority === priority);
  });

  const handleExport = () => {
    downloadTextFile(`xpert-leads-${fmt(TODAY)}.csv`, leadsToCSV(filtered));
  };
  const handleTemplate = () => {
    downloadTextFile("xpert-leads-template.csv", CSV_COLUMNS.join(",") + "\n");
  };
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(String(reader.result));
      const newLeads = csvRowsToLeads(rows);
      if (newLeads.length === 0) {
        setImportMsg("No se encontraron filas válidas (revisa que tengan al menos companyName y contactFirst).");
      } else {
        addLeadsBulk(newLeads);
        setImportMsg(`Se importaron ${newLeads.length} lead(s) correctamente.`);
      }
      setTimeout(() => setImportMsg(""), 5000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>Leads <span style={{ color: C.slate, fontWeight: 500 }}>({filtered.length})</span></h1>
        <div className="flex gap-2 flex-wrap items-center">
          <FilterSelect value={rep} onChange={setField("rep")} options={REPS} label="Rep" />
          <FilterSelect value={stage} onChange={setField("stage")} options={STAGES} label="Stage" />
          <FilterSelect value={source} onChange={setField("source")} options={SOURCES} label="Source" />
          <FilterSelect value={priority} onChange={setField("priority")} options={PRIORITIES} label="Priority" />
          <div className="w-px h-6" style={{ background: C.line }} />
          <button onClick={handleExport} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>Export CSV</button>
          <button onClick={handleTemplate} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>Template</button>
          <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border" style={{ borderColor: C.line, color: C.ink }}>Import CSV</button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
        </div>
      </div>
      {importMsg && <div className="text-xs font-medium rounded-lg px-3 py-2" style={{ background: C.greenTint, color: C.greenDark }}>{importMsg}</div>}

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.bg }} className="text-left">
              {["Company", "Contact", "State", "Source", "Priority", "Stage", "Rep", "Est. Rev/mo", "Next Follow-up"].map(h => (
                <th key={h} className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wide" style={{ color: C.slate }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const isOverdue = l.nextFollowupDate && dateOnly(l.nextFollowupDate) < dateOnly(TODAY);
              const isStale = l.stage !== "Won – Active Customer" && l.stage !== "Lost" &&
                l.lastActivityDate && (TODAY - dateOnly(l.lastActivityDate)) / 86400000 > 5;
              return (
                <tr key={l.id} onClick={() => setSelectedLeadId(l.id)} className="border-t cursor-pointer hover:bg-gray-50" style={{ borderColor: C.line }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: C.ink }}>
                    <div className="flex items-center gap-1.5">
                      {isStale && <AlertTriangle size={13} style={{ color: C.hot }} />}
                      {l.companyName}
                    </div>
                    <div className="text-xs font-normal" style={{ color: C.slate }}>{l.industry}</div>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: C.ink }}>{l.contactFirst} {l.contactLast}<div className="text-xs" style={{ color: C.slate }}>{l.jobTitle}</div></td>
                  <td className="px-4 py-2.5" style={{ color: C.ink }}>{l.state}</td>
                  <td className="px-4 py-2.5" style={{ color: C.slate }}>{l.source}</td>
                  <td className="px-4 py-2.5"><PriorityBadge p={l.priority} /></td>
                  <td className="px-4 py-2.5"><StagePill stage={l.stage} /></td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-1.5"><Avatar name={l.assignedTo} size={20} /><span className="text-xs" style={{ color: C.ink }}>{l.assignedTo.split(" ")[0]}</span></div></td>
                  <td className="px-4 py-2.5" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{money(l.estMonthlyRevenue)}</td>
                  <td className="px-4 py-2.5" style={{ color: isOverdue ? C.danger : C.slate, fontWeight: isOverdue ? 700 : 400 }}>{l.nextFollowupDate || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-sm" style={{ color: C.slate }}>No leads match those filters.</div>}
      </div>
    </div>
  );
}

/* ============================== PIPELINE (KANBAN) ============================== */
function PipelineView({ leads, updateLead, setSelectedLeadId, repFilter, setRepFilter }) {
  const [dragId, setDragId] = useState(null);
  const scoped = repFilter === "All" ? leads : leads.filter(l => l.assignedTo === repFilter);
  const isStale = (l) => l.stage !== "Won – Active Customer" && l.stage !== "Lost" &&
    l.lastActivityDate && (TODAY - dateOnly(l.lastActivityDate)) / 86400000 > 5;
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>Sales Pipeline</h1>
        <FilterSelect value={repFilter} onChange={setRepFilter} options={REPS} label="Rep" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.filter(s => s !== "Lost" && s !== "Nurturing / Future Opportunity").concat(["Nurturing / Future Opportunity", "Lost"]).map(stage => {
          const items = scoped.filter(l => l.stage === stage);
          const value = items.reduce((s, l) => s + l.estMonthlyRevenue, 0);
          return (
            <div key={stage} onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) updateLead(dragId, { stage, lastActivityDate: fmt(TODAY), probability: STAGE_PROB[stage] }); setDragId(null); }}
              className="rounded-xl shrink-0" style={{ width: 250, background: "#eef0ee", border: `1px solid ${C.line}` }}>
              <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ borderColor: C.line }}>
                <div>
                  <div className="text-xs font-bold" style={{ color: STAGE_COLORS[stage] === "#fbbf24" ? "#92660a" : STAGE_COLORS[stage] }}>{stage}</div>
                  <div className="text-[11px]" style={{ color: C.slate }}>{items.length} · {money(value)}/mo</div>
                </div>
              </div>
              <div className="p-2 flex flex-col gap-2 min-h-[60px] max-h-[65vh] overflow-y-auto">
                {items.map(l => (
                  <div key={l.id} draggable onDragStart={() => setDragId(l.id)} onClick={() => setSelectedLeadId(l.id)}
                    className="bg-white rounded-lg p-2.5 shadow-sm cursor-pointer border-l-4"
                    style={{ borderLeftColor: PRIORITY_COLOR[l.priority] }}>
                    <div className="flex items-center gap-1">
                      {isStale(l) && <AlertTriangle size={11} style={{ color: C.hot }} titleAccess="No activity in 5+ days" />}
                      <div className="text-sm font-semibold" style={{ color: C.ink }}>{l.companyName}</div>
                    </div>
                    <div className="text-xs" style={{ color: C.slate }}>{l.contactFirst} {l.contactLast}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{money(l.estMonthlyRevenue)}</span>
                      <Avatar name={l.assignedTo} size={20} />
                    </div>
                    {l.nextFollowupDate && (
                      <div className="mt-1.5 text-[10px] font-medium" style={{ color: dateOnly(l.nextFollowupDate) < dateOnly(TODAY) ? C.danger : C.slate }}>
                        Next: {l.nextFollowupDate}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== ACTIVITIES ============================== */
function ActivitySection({ title, items, tone, setSelectedLeadId, logging, setLogging, logActivity }) {
  return (
    <div className="bg-white rounded-xl border p-4 flex-1 min-w-[280px]" style={{ borderColor: C.line }}>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: tone }}>
        {title} <span className="text-xs font-normal" style={{ color: C.slate }}>({items.length})</span>
      </h3>
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
        {items.map(l => (
          <div key={l.id} className="border rounded-lg p-2.5" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedLeadId(l.id)}>
              <div>
                <div className="text-sm font-semibold" style={{ color: C.ink }}>{l.companyName}</div>
                <div className="text-xs" style={{ color: C.slate }}>{l.contactFirst} {l.contactLast} · {l.assignedTo.split(" ")[0]}</div>
              </div>
              <StagePill stage={l.stage} />
            </div>
            <div className="text-xs mt-1" style={{ color: tone }}>{l.nextFollowupDate}</div>
            {logging === l.id ? (
              <QuickLog lead={l} onDone={(act, next) => { logActivity(l.id, act, next); setLogging(null); }} onCancel={() => setLogging(null)} />
            ) : (
              <button onClick={() => setLogging(l.id)} className="mt-2 text-xs font-semibold px-2 py-1 rounded-md" style={{ background: C.greenTint, color: C.greenDark }}>Log & Reschedule</button>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="text-xs" style={{ color: C.slate }}>Nothing here.</div>}
      </div>
    </div>
  );
}

function ActivitiesView({ leads, activities, logActivity, setSelectedLeadId, repFilter, setRepFilter }) {
  const todayStr = fmt(TODAY);
  const byRep = repFilter === "All" ? leads : leads.filter(l => l.assignedTo === repFilter);
  const open = byRep.filter(l => l.stage !== "Won – Active Customer" && l.stage !== "Lost");
  const today = open.filter(l => l.nextFollowupDate === todayStr);
  const overdue = open.filter(l => l.nextFollowupDate && dateOnly(l.nextFollowupDate) < dateOnly(TODAY));
  const upcoming = open.filter(l => l.nextFollowupDate && dateOnly(l.nextFollowupDate) > dateOnly(TODAY)).sort((a, b) => new Date(a.nextFollowupDate) - new Date(b.nextFollowupDate));
  const [logging, setLogging] = useState(null);
  const filteredActivities = repFilter === "All" ? activities : activities.filter(a => a.salesperson === repFilter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>Activities & Follow-ups</h1>
        <FilterSelect value={repFilter} onChange={setRepFilter} options={REPS} label="Rep" />
      </div>
      <div className="flex gap-4 flex-wrap">
        <ActivitySection title="Overdue" items={overdue} tone={C.danger} setSelectedLeadId={setSelectedLeadId} logging={logging} setLogging={setLogging} logActivity={logActivity} />
        <ActivitySection title="Today" items={today} tone={C.greenDark} setSelectedLeadId={setSelectedLeadId} logging={logging} setLogging={setLogging} logActivity={logActivity} />
        <ActivitySection title="Upcoming" items={upcoming.slice(0, 20)} tone={C.slate} setSelectedLeadId={setSelectedLeadId} logging={logging} setLogging={setLogging} logActivity={logActivity} />
      </div>
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Recent Activity Log</h3>
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {filteredActivities.slice(0, 25).map(a => {
            const lead = leads.find(l => l.id === a.leadId);
            return (
              <div key={a.id} className="flex items-center justify-between text-sm border-b pb-1.5" style={{ borderColor: C.line }}>
                <div><span className="font-medium" style={{ color: C.ink }}>{lead ? lead.companyName : "—"}</span> <span style={{ color: C.slate }}>· {a.type} · {a.notes}</span></div>
                <span className="text-xs shrink-0 ml-2" style={{ color: C.slate }}>{a.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TemplatePicker({ onPick }) {
  return (
    <select defaultValue="" onChange={(e) => { if (e.target.value) { onPick(e.target.value); e.target.value = ""; } }}
      className="text-xs border rounded-md px-2 py-1" style={{ borderColor: C.line, color: C.slate }}>
      <option value="">Quick template…</option>
      {QUICK_TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

function QuickLog({ lead, onDone, onCancel }) {
  const [type, setType] = useState("Phone Call");
  const [notes, setNotes] = useState("");
  const [next, setNext] = useState(fmt(addDays(TODAY, 3)));
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <select value={type} onChange={e => setType(e.target.value)} className="text-xs border rounded-md px-2 py-1" style={{ borderColor: C.line }}>
        {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
      <TemplatePicker onPick={setNotes} />
      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes…" className="text-xs border rounded-md px-2 py-1" style={{ borderColor: C.line }} />
      <input type="date" value={next} onChange={e => setNext(e.target.value)} className="text-xs border rounded-md px-2 py-1" style={{ borderColor: C.line }} />
      <div className="flex gap-1.5">
        <button onClick={() => onDone({ type, notes: notes || "Logged activity.", salesperson: lead.assignedTo, outcome: "Connected", nextStep: "Follow up" }, next)}
          className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: C.green, color: C.charcoal }}>Save</button>
        <button onClick={onCancel} className="text-xs px-2 py-1 rounded-md" style={{ color: C.slate }}>Cancel</button>
      </div>
    </div>
  );
}

/* ============================== QUOTES ============================== */
const EQUIPMENT_OPTIONS = ["Dry Van", "Reefer", "Flatbed", "Multiple"];

function computeSuggestedRate(quotes, origin, destination, equipment) {
  const o = (origin || "").trim().toLowerCase();
  const d = (destination || "").trim().toLowerCase();
  const matches = quotes.filter((q) =>
    (q.origin || "").trim().toLowerCase() === o &&
    (q.destination || "").trim().toLowerCase() === d &&
    q.equipment === equipment &&
    q.rateMin != null && q.rateMax != null
  );
  if (matches.length === 0) return null;
  const avgMin = Math.round(matches.reduce((s, q) => s + q.rateMin, 0) / matches.length);
  const avgMax = Math.round(matches.reduce((s, q) => s + q.rateMax, 0) / matches.length);
  return { avgMin, avgMax, count: matches.length };
}

function buildQuoteText(q) {
  return `Hi ${q.contactName || "there"},

Thank you for reaching out to Xpert Freight. Here's our quote for your shipment:

Lane: ${q.origin} → ${q.destination}
Equipment: ${q.equipment}
${q.commodity ? `Commodity: ${q.commodity}\n` : ""}${q.weight ? `Weight: ${q.weight}\n` : ""}Pickup: ${q.pickupDate || "TBD"}

Rate: $${q.rateMin?.toLocaleString()} – $${q.rateMax?.toLocaleString()}

${q.notes ? q.notes + "\n\n" : ""}Let us know if you'd like to move forward or if you have any questions — happy to help.

Best regards,
${q.createdBy || "Xpert Freight"}
Xpert Freight`;
}

function QuotesView({ leads, quotes, addQuote, updateQuote, deleteQuote, logActivity, myRep, setSelectedLeadId }) {
  const [showNew, setShowNew] = useState(false);
  const [viewingQuote, setViewingQuote] = useState(null);
  const scoped = myRep ? quotes.filter((q) => q.createdBy === myRep) : quotes;
  const sorted = [...scoped].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  const statusColor = { Sent: C.slate, Won: C.green, Lost: C.danger };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>Quotes <span style={{ color: C.slate, fontWeight: 500 }}>({sorted.length})</span></h1>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold" style={{ background: C.green, color: C.charcoal }}>
          <Plus size={16} /> New Quote
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.bg }} className="text-left">
              {["Date", "Company", "Lane", "Equipment", "Rate", "Rep", "Status"].map(h => (
                <th key={h} className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wide" style={{ color: C.slate }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((q) => (
              <tr key={q.id} onClick={() => setViewingQuote(q)} className="border-t cursor-pointer hover:bg-gray-50" style={{ borderColor: C.line }}>
                <td className="px-4 py-2.5" style={{ color: C.slate }}>{q.createdDate}</td>
                <td className="px-4 py-2.5 font-medium" style={{ color: C.ink }}>{q.companyName}</td>
                <td className="px-4 py-2.5" style={{ color: C.ink }}>{q.origin} → {q.destination}</td>
                <td className="px-4 py-2.5" style={{ color: C.slate }}>{q.equipment}</td>
                <td className="px-4 py-2.5" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>${q.rateMin?.toLocaleString()}–${q.rateMax?.toLocaleString()}</td>
                <td className="px-4 py-2.5" style={{ color: C.slate }}>{q.createdBy}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: statusColor[q.status] + "1a", color: statusColor[q.status] }}>{q.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="p-8 text-center text-sm" style={{ color: C.slate }}>No quotes yet. Create your first one.</div>}
      </div>

      {showNew && (
        <NewQuoteModal leads={leads} quotes={quotes} myRep={myRep} onClose={() => setShowNew(false)}
          onCreate={(q) => { addQuote(q); setShowNew(false); setViewingQuote(q); }} logActivity={logActivity} />
      )}
      {viewingQuote && (
        <QuoteDetailModal quote={viewingQuote} onClose={() => setViewingQuote(null)} updateQuote={updateQuote} deleteQuote={deleteQuote} setSelectedLeadId={setSelectedLeadId} />
      )}
    </div>
  );
}

function QuoteDetailModal({ quote, onClose, updateQuote, deleteQuote, setSelectedLeadId }) {
  const [copied, setCopied] = useState(false);
  const text = buildQuoteText(quote);
  const mailtoHref = `mailto:${quote.contactEmail || ""}?subject=${encodeURIComponent("Quote — " + quote.origin + " to " + quote.destination)}&body=${encodeURIComponent(text)}`;

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <Modal onClose={onClose} width={560}>
      <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderColor: C.line }}>
        <h2 className="text-lg font-bold" style={{ color: C.ink }}>{quote.companyName}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Kv k="Lane" v={`${quote.origin} → ${quote.destination}`} /><Kv k="Equipment" v={quote.equipment} />
          <Kv k="Pickup" v={quote.pickupDate || "TBD"} /><Kv k="Rate" v={`$${quote.rateMin?.toLocaleString()}–$${quote.rateMax?.toLocaleString()}`} />
        </div>

        {quote.leadId && (
          <button onClick={() => { setSelectedLeadId(quote.leadId); onClose(); }} className="text-xs font-semibold text-left" style={{ color: C.greenDark }}>
            View linked lead →
          </button>
        )}

        <div>
          <FieldLabel>Status</FieldLabel>
          <div className="flex gap-2">
            {["Sent", "Won", "Lost"].map((s) => (
              <button key={s} onClick={() => updateQuote(quote.id, { status: s })}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ borderColor: quote.status === s ? C.green : C.line, background: quote.status === s ? C.greenTint : "transparent", color: quote.status === s ? C.greenDark : C.slate }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Quote Message</FieldLabel>
          <textarea readOnly value={text} rows={10} className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-none" style={{ borderColor: C.line, background: C.bg, color: C.ink }} />
        </div>

        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ borderColor: C.line, color: C.ink }}>
            <Copy size={14} />{copied ? "Copied!" : "Copy Text"}
          </button>
          <a href={mailtoHref} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ background: C.green, color: C.charcoal }}>
            <Mail size={14} />Open in Email
          </a>
        </div>

        <button onClick={() => {
          if (confirm("Delete this quote? This can't be undone.")) {
            deleteQuote(quote.id);
            onClose();
          }
        }} className="flex items-center gap-1.5 text-sm font-medium self-start" style={{ color: C.danger }}>
          <Trash2 size={14} /> Delete Quote
        </button>
      </div>
    </Modal>
  );
}

function NewQuoteModal({ leads, quotes, myRep, onClose, onCreate, logActivity }) {
  const [useExisting, setUseExisting] = useState(true);
  const [leadId, setLeadId] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [f, setF] = useState({
    companyName: "", contactName: "", contactEmail: "",
    origin: "", destination: "", equipment: "Dry Van", commodity: "", weight: "",
    pickupDate: fmt(addDays(TODAY, 1)), rateMin: "", rateMax: "", notes: "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const matchingLeads = leadSearch.trim()
    ? leads.filter((l) => l.companyName.toLowerCase().includes(leadSearch.trim().toLowerCase())).slice(0, 8)
    : leads.slice(0, 8);

  const selectedLead = leads.find((l) => l.id === leadId);

  const suggestion = f.origin && f.destination ? computeSuggestedRate(quotes, f.origin, f.destination, f.equipment) : null;

  const applyLead = (lead) => {
    setLeadId(lead.id);
    setLeadSearch(lead.companyName);
    setF((p) => ({ ...p, companyName: lead.companyName, contactName: `${lead.contactFirst} ${lead.contactLast}`, contactEmail: lead.email }));
  };

  const applySuggestion = () => {
    if (suggestion) setF((p) => ({ ...p, rateMin: String(suggestion.avgMin), rateMax: String(suggestion.avgMax) }));
  };

  const checkRateOnTriumph = () => {
    const normalizeLocation = (value) => value.trim().replace(/,/g, " ").replace(/\s+/g, " ");
    const equipment = { "Dry Van": "VAN", Reefer: "REEFER", Flatbed: "FLATBED", Multiple: "VAN" }[f.equipment] || "VAN";
    const params = new URLSearchParams({
      originCityState: normalizeLocation(f.origin),
      destinationCityState: normalizeLocation(f.destination),
      transportType: equipment,
    });
    if (f.pickupDate) params.set("pickupDate", f.pickupDate);
    window.open(`https://intelligence.triumph.io/rates?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const submit = () => {
    if (!f.companyName || !f.origin || !f.destination || !f.rateMin || !f.rateMax) return;
    const rateMin = Number(f.rateMin), rateMax = Number(f.rateMax);
    const quote = {
      id: "Q" + Date.now(), leadId: useExisting ? leadId || null : null,
      companyName: f.companyName, contactName: f.contactName, contactEmail: f.contactEmail,
      origin: f.origin, destination: f.destination, equipment: f.equipment,
      commodity: f.commodity, weight: f.weight, pickupDate: f.pickupDate,
      rateMin, rateMax, notes: f.notes, status: "Sent",
      createdBy: myRep || "Team", createdDate: fmt(TODAY),
    };
    onCreate(quote);
    if (quote.leadId) {
      logActivity(quote.leadId, {
        type: "Quote Follow-up",
        notes: `Quoted ${quote.origin} → ${quote.destination} (${quote.equipment}): $${rateMin.toLocaleString()}–$${rateMax.toLocaleString()}`,
        salesperson: quote.createdBy, outcome: "Sent Info", nextStep: "Follow up on quote",
      }, fmt(addDays(TODAY, 3)));
    }
  };

  return (
    <Modal onClose={onClose} width={560}>
      <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderColor: C.line }}>
        <h2 className="text-lg font-bold" style={{ color: C.ink }}>New Quote</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="flex gap-2">
          <button onClick={() => setUseExisting(true)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ borderColor: useExisting ? C.green : C.line, background: useExisting ? C.greenTint : "transparent", color: useExisting ? C.greenDark : C.slate }}>
            Existing Lead
          </button>
          <button onClick={() => { setUseExisting(false); setLeadId(""); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ borderColor: !useExisting ? C.green : C.line, background: !useExisting ? C.greenTint : "transparent", color: !useExisting ? C.greenDark : C.slate }}>
            Not in CRM Yet
          </button>
        </div>

        {useExisting ? (
          <div className="relative">
            <FieldLabel>Search Lead</FieldLabel>
            <input value={leadSearch} onChange={(e) => { setLeadSearch(e.target.value); setLeadId(""); }} placeholder="Type company name…"
              className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} />
            {leadSearch && !leadId && (
              <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto" style={{ borderColor: C.line }}>
                {matchingLeads.map((l) => (
                  <div key={l.id} onClick={() => applyLead(l)} className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50" style={{ color: C.ink }}>
                    {l.companyName} <span style={{ color: C.slate }}>· {l.contactFirst} {l.contactLast}</span>
                  </div>
                ))}
                {matchingLeads.length === 0 && <div className="px-3 py-2 text-sm" style={{ color: C.slate }}>No matches.</div>}
              </div>
            )}
            {selectedLead && <div className="text-xs mt-1" style={{ color: C.greenDark }}>✓ Linked to {selectedLead.companyName}</div>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div><FieldLabel>Company Name *</FieldLabel><input value={f.companyName} onChange={set("companyName")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
            <div><FieldLabel>Contact Name</FieldLabel><input value={f.contactName} onChange={set("contactName")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
            <div className="col-span-2"><FieldLabel>Contact Email</FieldLabel><input value={f.contactEmail} onChange={set("contactEmail")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div><FieldLabel>Origin *</FieldLabel><input value={f.origin} onChange={set("origin")} placeholder="Dallas, TX" className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Destination *</FieldLabel><input value={f.destination} onChange={set("destination")} placeholder="Atlanta, GA" className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Equipment</FieldLabel>
            <select value={f.equipment} onChange={set("equipment")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>
              {EQUIPMENT_OPTIONS.map((eq) => <option key={eq}>{eq}</option>)}
            </select>
          </div>
          <div><FieldLabel>Pickup Date</FieldLabel><input type="date" value={f.pickupDate} onChange={set("pickupDate")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Commodity (optional)</FieldLabel><input value={f.commodity} onChange={set("commodity")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Weight (optional)</FieldLabel><input value={f.weight} onChange={set("weight")} placeholder="e.g. 38,000 lbs" className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
        </div>

        {suggestion && (
          <div className="rounded-lg px-3 py-2 text-sm flex items-center justify-between" style={{ background: C.greenTint, color: C.greenDark }}>
            <span>Suggested rate (from {suggestion.count} past quote{suggestion.count !== 1 ? "s" : ""} on this lane): <strong>${suggestion.avgMin.toLocaleString()}–${suggestion.avgMax.toLocaleString()}</strong></span>
            <button onClick={applySuggestion} className="text-xs font-bold underline shrink-0 ml-2">Use this</button>
          </div>
        )}
        {f.origin && f.destination && !suggestion && (
          <div className="text-xs" style={{ color: C.slate }}>No hay historial todavía para esta ruta — ingresa la tarifa manualmente.</div>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={checkRateOnTriumph} disabled={!f.origin.trim() || !f.destination.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: C.line, color: C.ink, opacity: !f.origin.trim() || !f.destination.trim() ? 0.5 : 1 }}>
            Check Rate on Triumph
          </button>
          <button type="button" onClick={() => window.open("https://www.dat.com/iq", "_blank", "noopener,noreferrer")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: C.line, color: C.ink }}>
            Open DAT RateView
          </button>
          <button type="button" onClick={() => window.open("https://truckstop.com/product/rate-insights/", "_blank", "noopener,noreferrer")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: C.line, color: C.ink }}>
            Open Truckstop Rate Insights
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div><FieldLabel>Rate Min *</FieldLabel><input type="number" value={f.rateMin} onChange={set("rateMin")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Rate Max *</FieldLabel><input type="number" value={f.rateMax} onChange={set("rateMax")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
        </div>
        <div><FieldLabel>Notes (optional)</FieldLabel><textarea value={f.notes} onChange={set("notes")} rows={2} className="w-full border rounded-lg px-2 py-1.5 text-sm resize-none" style={{ borderColor: C.line }} /></div>

        <button onClick={submit} className="px-4 py-2 rounded-lg font-semibold text-sm self-start" style={{ background: C.green, color: C.charcoal }}>Generate Quote</button>
      </div>
    </Modal>
  );
}


function CalendarView({ tasks, toggleTaskDone, setSelectedLeadId, repFilter, setRepFilter }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const base = new Date(TODAY.getFullYear(), TODAY.getMonth() + monthOffset, 1);
  const year = base.getFullYear(), month = base.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = base.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const openTasks = tasks.filter(t => !t.done && (repFilter === "All" || t.assignedTo === repFilter));
  const tasksByDay = {};
  openTasks.forEach(t => {
    tasksByDay[t.dueDate] = tasksByDay[t.dueDate] || [];
    tasksByDay[t.dueDate].push(t);
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pad = (n) => String(n).padStart(2, "0");
  const dateKey = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;
  const todayKey = fmt(TODAY);

  const upcomingSorted = [...openTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>Calendar</h1>
        <FilterSelect value={repFilter} onChange={setRepFilter} options={REPS} label="Rep" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setMonthOffset(m => m - 1)} className="px-2 py-1 rounded-md text-sm font-semibold" style={{ background: C.bg, color: C.ink }}>‹</button>
            <span className="text-sm font-bold capitalize" style={{ color: C.ink }}>{monthLabel}</span>
            <button onClick={() => setMonthOffset(m => m + 1)} className="px-2 py-1 rounded-md text-sm font-semibold" style={{ background: C.bg, color: C.ink }}>›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold mb-1" style={{ color: C.slate }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const key = dateKey(d);
              const dayTasks = tasksByDay[key] || [];
              const isToday = key === todayKey;
              const isPast = key < todayKey;
              return (
                <div key={i} className="rounded-lg p-1.5 min-h-[74px] text-left"
                  style={{ background: isToday ? C.greenTint : C.bg, border: isToday ? `1.5px solid ${C.green}` : `1px solid ${C.line}` }}>
                  <div className="text-[11px] font-semibold mb-1" style={{ color: isPast && dayTasks.length ? C.danger : C.slate }}>{d}</div>
                  <div className="flex flex-col gap-0.5">
                    {dayTasks.slice(0, 3).map(t => (
                      <div key={t.id} onClick={() => setSelectedLeadId(t.leadId)}
                        className="text-[10px] rounded px-1 py-0.5 truncate cursor-pointer"
                        style={{ background: isPast ? C.danger + "22" : C.greenTint, color: isPast ? C.danger : C.greenDark }}
                        title={`${t.companyName}: ${t.notes}`}>
                        {t.companyName}
                      </div>
                    ))}
                    {dayTasks.length > 3 && <div className="text-[10px]" style={{ color: C.slate }}>+{dayTasks.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Pending Tasks ({openTasks.length})</h3>
          <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto">
            {upcomingSorted.map(t => {
              const isPast = t.dueDate < todayKey;
              return (
                <div key={t.id} className="border rounded-lg p-2.5" style={{ borderColor: C.line }}>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={false} onChange={() => toggleTaskDone(t.id)} className="mt-0.5" />
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedLeadId(t.leadId)}>
                      <div className="text-sm font-semibold" style={{ color: C.ink }}>{t.companyName}</div>
                      <div className="text-xs" style={{ color: C.slate }}>{t.type} · {t.assignedTo.split(" ")[0]}</div>
                      <div className="text-xs mt-1" style={{ color: C.ink }}>{t.notes}</div>
                      <div className="text-[11px] font-semibold mt-1" style={{ color: isPast ? C.danger : C.greenDark }}>{t.dueDate}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {openTasks.length === 0 && <div className="text-xs" style={{ color: C.slate }}>No pending tasks.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function computeHealthScore(c, maxRevenue) {
  const daysSinceLoad = c.lastLoadDate ? Math.max(0, (TODAY - new Date(c.lastLoadDate)) / 86400000) : 30;
  const recencyScore = Math.max(0, 100 - daysSinceLoad * 4);
  const revenueScore = maxRevenue > 0 ? (c.estMonthlyRevenue / maxRevenue) * 100 : 50;
  const declaredScore = { Active: 100, Growing: 90, "At Risk": 40, Inactive: 20, "Lost Customer": 0 }[c.customerHealth] ?? 50;
  return Math.round(recencyScore * 0.4 + revenueScore * 0.3 + declaredScore * 0.3);
}

function CustomersView({ leads, setSelectedLeadId }) {
  const customers = leads.filter(l => l.stage === "Won – Active Customer");
  const healthColor = { Active: C.green, Growing: "#3b82f6", "At Risk": C.warm, Inactive: C.slate, "Lost Customer": C.danger };
  const maxRevenue = Math.max(1, ...customers.map(c => c.estMonthlyRevenue));
  const scored = customers.map(c => ({ ...c, healthScore: computeHealthScore(c, maxRevenue) })).sort((a, b) => a.healthScore - b.healthScore);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold" style={{ color: C.ink }}>Active Customers <span style={{ color: C.slate, fontWeight: 500 }}>({customers.length})</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {scored.map(c => {
          const months = Math.max(1, Math.round((TODAY - new Date(c.startDate)) / (1000 * 60 * 60 * 24 * 30)));
          const lifetime = c.estMonthlyRevenue * months;
          return (
            <div key={c.id} onClick={() => setSelectedLeadId(c.id)} className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition" style={{ borderColor: C.line }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold" style={{ color: C.ink }}>{c.companyName}</div>
                  <div className="text-xs" style={{ color: C.slate }}>{c.industry} · {c.city}, {c.state}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: healthColor[c.customerHealth] + "1a", color: healthColor[c.customerHealth] }}>{c.customerHealth}</span>
                  <ScoreRing score={c.healthScore} size={34} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div><div className="text-[11px] uppercase" style={{ color: C.slate }}>Monthly Rev.</div><div className="font-semibold" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{money(c.estMonthlyRevenue)}</div></div>
                <div><div className="text-[11px] uppercase" style={{ color: C.slate }}>Lifetime Rev.</div><div className="font-semibold" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{money(lifetime)}</div></div>
                <div><div className="text-[11px] uppercase" style={{ color: C.slate }}>Account Owner</div><div className="font-medium" style={{ color: C.ink }}>{c.assignedTo}</div></div>
                <div><div className="text-[11px] uppercase" style={{ color: C.slate }}>Last Load</div><div className="font-medium" style={{ color: C.ink }}>{c.lastLoadDate}</div></div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {c.servicesInterest.map(s => <span key={s} className="text-[10px] rounded-full px-2 py-0.5" style={{ background: C.bg, color: C.slate }}>{s}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== REPORTS ============================== */
function ReportsView({ leads }) {
  const [rep, setRep] = useState("All");
  const filtered = rep === "All" ? leads : leads.filter(l => l.assignedTo === rep);

  const bySource = SOURCES.map(s => ({ name: s, value: filtered.filter(l => l.source === s).length })).filter(x => x.value > 0);
  const stageFunnel = STAGES.filter(s => s !== "Lost" && s !== "Nurturing / Future Opportunity").map(s => ({ name: s.split(" / ")[0], value: filtered.filter(l => l.stage === s).length }));
  const lostReasons = LOST_REASONS.map(r => ({ name: r, value: filtered.filter(l => l.stage === "Lost" && l.lostReason === r).length })).filter(x => x.value > 0);
  const PIE_COLORS = ["#39d639", "#60a5fa", "#f59e0b", "#a78bfa", "#f472b6", "#94a3b8", "#38bdf8", "#ef4444"];

  const open = filtered.filter(l => l.stage !== "Won – Active Customer" && l.stage !== "Lost");
  const thisMonth = open.filter(l => {
    if (!l.expectedCloseDate) return false;
    const closeDate = dateOnly(l.expectedCloseDate);
    return closeDate.getMonth() === TODAY.getMonth() && closeDate.getFullYear() === TODAY.getFullYear();
  });
  const nextMonthDate = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1);
  const nextMonth = open.filter(l => {
    if (!l.expectedCloseDate) return false;
    const closeDate = dateOnly(l.expectedCloseDate);
    return closeDate.getMonth() === nextMonthDate.getMonth() && closeDate.getFullYear() === nextMonthDate.getFullYear();
  });
  const nextQuarter = open.filter(l => l.expectedCloseDate && new Date(l.expectedCloseDate) > addDays(TODAY, 60) && new Date(l.expectedCloseDate) <= addDays(TODAY, 150));
  const forecastSum = (arr) => arr.reduce((s, l) => s + l.estMonthlyRevenue * (l.probability / 100), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>Reports</h1>
        <select value={rep} onChange={e => setRep(e.target.value)} className="text-sm border rounded-lg px-2.5 py-1.5" style={{ borderColor: C.line }}>
          <option value="All">Salesperson: All</option>
          {REPS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center" style={{ borderColor: C.line }}>
          <div className="text-xs uppercase font-semibold" style={{ color: C.slate }}>This Month</div>
          <div className="text-xl font-bold mt-1" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{money(forecastSum(thisMonth))}</div>
          <div className="text-xs" style={{ color: C.slate }}>{thisMonth.length} deals</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center" style={{ borderColor: C.line }}>
          <div className="text-xs uppercase font-semibold" style={{ color: C.slate }}>Next Month</div>
          <div className="text-xl font-bold mt-1" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{money(forecastSum(nextMonth))}</div>
          <div className="text-xs" style={{ color: C.slate }}>{nextMonth.length} deals</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center" style={{ borderColor: C.line }}>
          <div className="text-xs uppercase font-semibold" style={{ color: C.slate }}>Next Quarter</div>
          <div className="text-xl font-bold mt-1" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{money(forecastSum(nextQuarter))}</div>
          <div className="text-xs" style={{ color: C.slate }}>{nextQuarter.length} deals</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: C.ink }}>Pipeline Funnel by Stage</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stageFunnel} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill={C.green} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: C.ink }}>Leads by Source</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={bySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fontSize: 10 }}>
                {bySource.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {lostReasons.length > 0 && (
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: C.ink }}>Lost Deal Reasons</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lostReasons}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill={C.danger} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ============================== SALES TEAM ============================== */
function TeamView({ leads, activities, setSelectedLeadId }) {
  const stats = REPS.map(rep => {
    const rl = leads.filter(l => l.assignedTo === rep);
    const won = rl.filter(l => l.stage === "Won – Active Customer");
    const opp = rl.filter(l => STAGES.indexOf(l.stage) >= STAGES.indexOf("Qualified Opportunity") && l.stage !== "Lost" && l.stage !== "Nurturing / Future Opportunity");
    const revenue = won.reduce((s, l) => s + l.estMonthlyRevenue, 0);
    const calls = rl.reduce((s, l) => s + l.callsCount, 0);
    const emails = rl.reduce((s, l) => s + l.emailsCount, 0);
    const pipeline = rl.filter(l => l.stage !== "Won – Active Customer" && l.stage !== "Lost").reduce((s, l) => s + l.estMonthlyRevenue, 0);
    const openTasks = rl.filter(l => l.nextFollowupDate && l.stage !== "Won – Active Customer" && l.stage !== "Lost").length;
    return { rep, leads: rl, won, opp, revenue, calls, emails, pipeline, openTasks, conv: rl.length ? ((won.length / rl.length) * 100).toFixed(1) : 0 };
  });
  const compareData = stats.map(s => ({ name: s.rep.split(" ")[0], Leads: s.leads.length, Opportunities: s.opp.length, Won: s.won.length }));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold" style={{ color: C.ink }}>Sales Team</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map(s => (
          <div key={s.rep} className="bg-white rounded-xl border p-5" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={s.rep} size={44} />
              <div>
                <div className="font-bold text-lg" style={{ color: C.ink }}>{s.rep}</div>
                <div className="text-xs" style={{ color: C.slate }}>Sales Representative · Xpert Freight</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="rounded-lg p-2" style={{ background: C.bg }}><div className="text-lg font-bold" style={{ color: C.ink }}>{s.leads.length}</div><div className="text-[10px] uppercase" style={{ color: C.slate }}>Leads</div></div>
              <div className="rounded-lg p-2" style={{ background: C.bg }}><div className="text-lg font-bold" style={{ color: C.ink }}>{s.opp.length}</div><div className="text-[10px] uppercase" style={{ color: C.slate }}>Opportunities</div></div>
              <div className="rounded-lg p-2" style={{ background: C.greenTint }}><div className="text-lg font-bold" style={{ color: C.greenDark }}>{s.won.length}</div><div className="text-[10px] uppercase" style={{ color: C.slate }}>Won</div></div>
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <Row label="Active Pipeline" value={money(s.pipeline) + "/mo"} />
              <Row label="Revenue Won" value={money(s.revenue) + "/mo"} />
              <Row label="Conversion Rate" value={s.conv + "%"} />
              <Row label="Calls Logged" value={s.calls} />
              <Row label="Emails Sent" value={s.emails} />
              <Row label="Open Follow-ups" value={s.openTasks} />
            </div>
            <button onClick={() => {}} className="mt-4 text-xs font-semibold" style={{ color: C.green }}>My leads below ↓</button>
            <div className="mt-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
              {s.leads.slice(0, 6).map(l => (
                <div key={l.id} onClick={() => setSelectedLeadId(l.id)} className="flex items-center justify-between text-xs cursor-pointer hover:opacity-70 py-1 border-t" style={{ borderColor: C.line }}>
                  <span style={{ color: C.ink }}>{l.companyName}</span>
                  <StagePill stage={l.stage} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: C.ink }}>Head-to-Head Comparison</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={compareData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Leads" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Opportunities" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Won" fill={C.green} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span style={{ color: C.slate }}>{label}</span><span className="font-semibold" style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span></div>;
}

/* ============================== LEAD DETAIL DRAWER ============================== */
function LeadDetail({ lead, activities, tasks, toggleTaskDone, notes, addNote, onClose, updateLead, deleteLead, logActivity }) {
  const [type, setType] = useState("Phone Call");
  const [taskNotes, setTaskNotes] = useState("");
  const [next, setNext] = useState(lead.nextFollowupDate || fmt(addDays(TODAY, 3)));
  const [saved, setSaved] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const leadTasks = tasks.filter(t => !t.done).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    contactFirst: lead.contactFirst, contactLast: lead.contactLast, jobTitle: lead.jobTitle,
    email: lead.email, phone: lead.phone, mobile: lead.mobile,
    city: lead.city, state: lead.state,
    legalName: lead.legalName, industry: lead.industry, companySize: lead.companySize,
    website: lead.website, companyLinkedin: lead.companyLinkedin || "",
  });
  const setF = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const saveEdits = () => {
    updateLead(lead.id, { ...form });
    setEditing(false);
  };

  const inputStyle = "w-full border rounded-lg px-2 py-1 text-sm";

  return (
    <Modal onClose={onClose} width={560}>
      <div className="px-5 py-4 border-b flex items-start justify-between sticky top-0 bg-white z-10" style={{ borderColor: C.line }}>
        <div>
          <div className="text-xs font-semibold" style={{ color: C.slate }}>{lead.id}</div>
          <h2 className="text-lg font-bold" style={{ color: C.ink }}>{lead.companyName}</h2>
          <div className="flex items-center gap-2 mt-1"><PriorityBadge p={lead.priority} /><StagePill stage={lead.stage} /></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <div><FieldLabel>Stage</FieldLabel>
            <select value={lead.stage} onChange={e => updateLead(lead.id, { stage: e.target.value, probability: STAGE_PROB[e.target.value] })}
              className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><FieldLabel>Assigned To</FieldLabel>
            <select value={lead.assignedTo} onChange={e => updateLead(lead.id, { assignedTo: e.target.value })}
              className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>
              {REPS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {lead.stage === "Lost" && (
            <div className="col-span-2"><FieldLabel>Lost Reason</FieldLabel>
              <select value={lead.lostReason || ""} onChange={e => updateLead(lead.id, { lostReason: e.target.value })}
                className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>
                {LOST_REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between -mb-2">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.slate }}>Lead Profile</span>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="text-xs font-semibold" style={{ color: C.greenDark }}>Edit Profile</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveEdits} className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: C.green, color: C.charcoal }}>Save Changes</button>
              <button onClick={() => setEditing(false)} className="text-xs font-semibold" style={{ color: C.slate }}>Cancel</button>
            </div>
          )}
        </div>

        {!editing ? (
          <>
            <Section title="Contact">
              <InfoRow icon={UserCheck} text={`${lead.contactFirst} ${lead.contactLast} — ${lead.jobTitle}`} />
              <InfoRow icon={Mail} text={lead.email} />
              <InfoRow icon={Phone} text={`${lead.phone} (office) · ${lead.mobile} (mobile)`} />
              <InfoRow icon={MapPin} text={`${lead.city}, ${lead.state} · ${lead.timeZone}`} />
            </Section>

            <Section title="Company">
              <InfoRow icon={Building2} text={`${lead.legalName} · ${lead.industry} · ${lead.companySize} employees`} />
              <InfoRow icon={Globe} text={lead.website || "No website on file"} />
              <InfoRow icon={Link2} text={lead.companyLinkedin || "No LinkedIn on file"} />
            </Section>
          </>
        ) : (
          <>
            <Section title="Contact">
              <div className="grid grid-cols-2 gap-2">
                <div><FieldLabel>First Name</FieldLabel><input value={form.contactFirst} onChange={setF("contactFirst")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>Last Name</FieldLabel><input value={form.contactLast} onChange={setF("contactLast")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>Job Title</FieldLabel><input value={form.jobTitle} onChange={setF("jobTitle")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>Email</FieldLabel><input value={form.email} onChange={setF("email")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>Phone</FieldLabel><input value={form.phone} onChange={setF("phone")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>Mobile</FieldLabel><input value={form.mobile} onChange={setF("mobile")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>City</FieldLabel><input value={form.city} onChange={setF("city")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>State</FieldLabel><input value={form.state} onChange={setF("state")} className={inputStyle} style={{ borderColor: C.line }} /></div>
              </div>
            </Section>
            <Section title="Company">
              <div className="grid grid-cols-2 gap-2">
                <div><FieldLabel>Legal Name</FieldLabel><input value={form.legalName} onChange={setF("legalName")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>Industry</FieldLabel><input value={form.industry} onChange={setF("industry")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>Company Size</FieldLabel><input value={form.companySize} onChange={setF("companySize")} className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div><FieldLabel>Website</FieldLabel><input value={form.website} onChange={setF("website")} placeholder="www.company.com" className={inputStyle} style={{ borderColor: C.line }} /></div>
                <div className="col-span-2"><FieldLabel>LinkedIn Company Page</FieldLabel><input value={form.companyLinkedin} onChange={setF("companyLinkedin")} placeholder="linkedin.com/company/..." className={inputStyle} style={{ borderColor: C.line }} /></div>
              </div>
            </Section>
          </>
        )}

        <Section title="Tasks & Follow-up">
          {leadTasks.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-3">
              {leadTasks.map(t => (
                <div key={t.id} className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: C.greenTint }}>
                  <input type="checkbox" checked={false} onChange={() => toggleTaskDone(t.id)} className="mt-0.5" />
                  <div>
                    <div style={{ color: C.greenDark, fontWeight: 700 }}>{t.dueDate} · {t.type}</div>
                    <div style={{ color: C.ink }}>{t.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <select value={type} onChange={e => setType(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>
              {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <TemplatePicker onPick={setTaskNotes} />
            <textarea value={taskNotes} onChange={e => setTaskNotes(e.target.value)} placeholder="What needs to be done? (task comment)" rows={2}
              className="border rounded-lg px-2 py-1.5 text-sm resize-none" style={{ borderColor: C.line }} />
            <div className="flex items-center gap-2">
              <FieldLabel>Task Due Date</FieldLabel>
              <input type="date" value={next} onChange={e => setNext(e.target.value)} className="border rounded-lg px-2 py-1 text-sm" style={{ borderColor: C.line }} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => {
                logActivity(lead.id, { type, notes: taskNotes || "Logged activity.", salesperson: lead.assignedTo, outcome: "Connected", nextStep: "Follow up" }, next);
                setTaskNotes(""); setSaved(true); setTimeout(() => setSaved(false), 2500);
              }} className="self-start px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ background: C.green, color: C.charcoal }}>Save Task</button>
              {saved && <span className="text-xs font-semibold flex items-center gap-1" style={{ color: C.greenDark }}><CheckCircle2 size={14} />Saved</span>}
            </div>
          </div>
          <div className="mt-3 text-[11px] font-bold uppercase tracking-wide" style={{ color: C.slate }}>Activity History</div>
          <div className="mt-1 flex flex-col gap-2 max-h-52 overflow-y-auto">
            {activities.map(a => (
              <div key={a.id} className="text-xs border-t pt-2" style={{ borderColor: C.line }}>
                <div className="flex justify-between"><span className="font-semibold" style={{ color: C.ink }}>{a.type}</span><span style={{ color: C.slate }}>{a.date}</span></div>
                <div style={{ color: C.slate }}>{a.notes}</div>
              </div>
            ))}
            {activities.length === 0 && <div className="text-xs" style={{ color: C.slate }}>No activity logged yet.</div>}
          </div>
        </Section>

        <Section title="Notes">
          <div className="flex flex-col gap-2 mb-3">
            <textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)} placeholder="Add a quick note — no task or date needed…" rows={2}
              className="border rounded-lg px-2 py-1.5 text-sm resize-none" style={{ borderColor: C.line }} />
            <button onClick={() => { if (newNoteText.trim()) { addNote(lead.id, newNoteText.trim()); setNewNoteText(""); } }}
              className="self-start px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ background: C.charcoal, color: "#fff" }}>Add Note</button>
          </div>
          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
            {notes.map(n => (
              <div key={n.id} className="text-sm border-t pt-2" style={{ borderColor: C.line }}>
                <div style={{ color: C.ink }}>{n.text}</div>
                <div className="text-[11px] mt-0.5" style={{ color: C.slate }}>{n.author} · {n.date}</div>
              </div>
            ))}
            {notes.length === 0 && <div className="text-xs" style={{ color: C.slate }}>No notes yet.</div>}
          </div>
        </Section>

        <button onClick={() => { if (confirm("Delete this lead? This can't be undone.")) deleteLead(lead.id); }}
          className="flex items-center gap-1.5 text-sm font-medium self-start" style={{ color: C.danger }}>
          <Trash2 size={14} /> Delete Lead
        </button>
      </div>
    </Modal>
  );
}
function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.slate }}>{title}</h4>
      {children}
    </div>
  );
}
function InfoRow({ icon: Icon, text }) {
  return <div className="flex items-center gap-2 text-sm mb-1" style={{ color: C.ink }}><Icon size={13} style={{ color: C.slate }} />{text}</div>;
}
function Kv({ k, v }) {
  return <div><span style={{ color: C.slate }}>{k}: </span><span className="font-medium" style={{ color: C.ink }}>{v}</span></div>;
}

/* ============================== NEW LEAD MODAL ============================== */
function NewLeadModal({ onClose, onCreate }) {
  const [f, setF] = useState({
    companyName: "", industry: "Logistics Company", city: "", state: "", contactFirst: "", contactLast: "",
    jobTitle: "Operations Manager", email: "", phone: "", website: "", companyLinkedin: "",
    source: "Cold Call", priority: "Warm", assignedTo: "Felipe Velez", estMonthlyRevenue: 0, services: [],
  });
  const toggleService = (s) => setF(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));
  const set = (k) => (e) => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (!f.companyName || !f.contactFirst) return;
    const score = Math.min(100, Math.round((f.priority === "Hot" ? 40 : f.priority === "Warm" ? 22 : 8) + rint(10, 30)));
    onCreate({
      id: "L" + Date.now(), companyName: f.companyName, legalName: f.companyName, industry: f.industry,
      companySize: "11-50", trucks: rint(3, 60), employees: rint(10, 150), website: f.website, companyLinkedin: f.companyLinkedin, city: f.city, state: f.state,
      timeZone: "CT", contactFirst: f.contactFirst, contactLast: f.contactLast, jobTitle: f.jobTitle,
      department: "Operations", email: f.email, phone: f.phone, mobile: f.phone, linkedin: "",
      source: f.source, priority: f.priority, score, stage: "New Lead", assignedTo: f.assignedTo,
      servicesInterest: f.services.length ? f.services : ["Dry Van"], originStates: "", destinationStates: "",
      mainLanes: "", equipmentType: "Dry Van", avgWeeklyLoads: rint(2, 10), avgMonthlyLoads: rint(8, 40),
      avgWeight: "35k lbs", commodity: "General Merchandise", hazmat: false, tempControlled: false,
      appointmentRequired: false, currentProvider: "Unknown", estMonthlyRevenue: Number(f.estMonthlyRevenue),
      estAnnualRevenue: Number(f.estMonthlyRevenue) * 12, avgRevPerLoad: 1200, probability: STAGE_PROB["New Lead"],
      expectedCloseDate: fmt(addDays(TODAY, 45)), createdDate: fmt(TODAY), lastActivityDate: fmt(TODAY),
      nextFollowupDate: fmt(addDays(TODAY, 1)), lostReason: null, callsCount: 0, emailsCount: 0,
      followupsCompleted: 0, salesCycleDays: null, startDate: null, customerHealth: null, lastLoadDate: null,
    });
  };

  return (
    <Modal onClose={onClose} width={520}>
      <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderColor: C.line }}>
        <h2 className="text-lg font-bold" style={{ color: C.ink }}>New Lead</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div><FieldLabel>Company Name *</FieldLabel><input value={f.companyName} onChange={set("companyName")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Industry</FieldLabel><input value={f.industry} onChange={set("industry")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Website</FieldLabel><input value={f.website} onChange={set("website")} placeholder="www.company.com" className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>LinkedIn Company Page</FieldLabel><input value={f.companyLinkedin} onChange={set("companyLinkedin")} placeholder="linkedin.com/company/..." className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>City</FieldLabel><input value={f.city} onChange={set("city")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>State</FieldLabel><input value={f.state} onChange={set("state")} maxLength={2} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>First Name *</FieldLabel><input value={f.contactFirst} onChange={set("contactFirst")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Last Name</FieldLabel><input value={f.contactLast} onChange={set("contactLast")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Job Title</FieldLabel><input value={f.jobTitle} onChange={set("jobTitle")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Email</FieldLabel><input value={f.email} onChange={set("email")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Phone</FieldLabel><input value={f.phone} onChange={set("phone")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Source</FieldLabel>
            <select value={f.source} onChange={set("source")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          <div><FieldLabel>Priority</FieldLabel>
            <select value={f.priority} onChange={set("priority")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>{PRIORITIES.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          <div><FieldLabel>Assigned To</FieldLabel>
            <select value={f.assignedTo} onChange={set("assignedTo")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>{REPS.map(s => <option key={s}>{s}</option>)}</select>
          </div>
        </div>
        <div><FieldLabel>Services of Interest</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {SERVICES.map(s => (
              <button key={s} onClick={() => toggleService(s)} type="button"
                className="text-xs rounded-full px-2.5 py-1 border"
                style={{ borderColor: f.services.includes(s) ? C.green : C.line, background: f.services.includes(s) ? C.greenTint : "#fff", color: f.services.includes(s) ? C.greenDark : C.slate }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <button onClick={submit} className="mt-2 px-4 py-2 rounded-lg font-semibold text-sm self-start" style={{ background: C.green, color: C.charcoal }}>Create Lead</button>
      </div>
    </Modal>
  );
}
