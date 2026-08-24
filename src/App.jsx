import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Users, Briefcase, KanbanSquare, Phone, UserCheck,
  BarChart3, UsersRound, Search, Plus, X, Flame, Snowflake, Sun,
  Mail, MapPin, Building2, TrendingUp, TrendingDown, Clock, CheckCircle2,
  AlertTriangle, Calendar, Truck, DollarSign, Target, ChevronRight, Trash2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, CartesianGrid, Legend
} from "recharts";
import { supabase } from "./supabase";
/* ============================== BRAND TOKENS ============================== */
const C = {
  green: "#39d639",
  greenDark: "#22a022",
  greenTint: "#eafbea",
  charcoal: "#1c1c1c",
  charcoal2: "#272727",
  ink: "#0f172a",
  slate: "#64748b",
  line: "#e6e8eb",
  bg: "#f6f7f5",
  hot: "#ef4444",
  warm: "#f59e0b",
  cold: "#3b82f6",
  danger: "#ef4444",
};

const STAGES = [
  "New Lead", "Attempting Contact", "Contacted", "Discovery / Qualification",
  "Qualified Opportunity", "Meeting Scheduled", "Quote Requested", "Quote Sent",
  "Negotiation", "Trial Load / First Shipment", "Won – Active Customer", "Lost",
  "Nurturing / Future Opportunity",
];
const STAGE_COLORS = {
  "New Lead": "#94a3b8", "Attempting Contact": "#60a5fa", "Contacted": "#38bdf8",
  "Discovery / Qualification": "#818cf8", "Qualified Opportunity": "#a78bfa",
  "Meeting Scheduled": "#f472b6", "Quote Requested": "#fb923c", "Quote Sent": "#fbbf24",
  "Negotiation": "#eab308", "Trial Load / First Shipment": "#4ade80",
  "Won – Active Customer": "#39d639", "Lost": "#ef4444",
  "Nurturing / Future Opportunity": "#a1a1aa",
};
const STAGE_PROB = {
  "New Lead": 5, "Attempting Contact": 10, "Contacted": 15, "Discovery / Qualification": 25,
  "Qualified Opportunity": 35, "Meeting Scheduled": 45, "Quote Requested": 50, "Quote Sent": 60,
  "Negotiation": 75, "Trial Load / First Shipment": 90, "Won – Active Customer": 100,
  "Lost": 0, "Nurturing / Future Opportunity": 10,
};
const SERVICES = ["Dry Van", "Reefer", "Flatbed", "FTL", "LTL", "Cross-Border", "Warehousing",
  "Transloading", "Project Cargo", "Staffing", "Dispatch", "After-Hours", "AI Solutions"];
const SOURCES = ["Cold Call", "Cold Email", "LinkedIn", "Referral", "Website",
  "Logistics Conference", "Existing Customer", "DAT", "Truckstop", "Social Media"];
const PRIORITIES = ["Hot", "Warm", "Cold"];
const PRIORITY_COLOR = { Hot: C.hot, Warm: C.warm, Cold: C.cold };
const REPS = ["Felipe Velez", "Manuela Posada"];
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
const TODAY = new Date(2026, 7, 24); // Aug 24, 2026
const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rint(0, arr.length - 1)];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const fmt = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";
const dateOnly = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
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

/* ============================== APP ============================== */
export default function App() {
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [toast, setToast] = useState(null);

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
    setLeads(parsed.leads || []);
    setActivities(parsed.activities || []);
    setLoading(false);
    return;
  }
} catch (e) { /* no stored data yet */ }
      const seedLeads = genLeads();
      const seedActivities = genActivities(seedLeads);
      setLeads(seedLeads);
      setActivities(seedActivities);
      setLoading(false);
      try {
  await supabase.from("crm_storage").upsert({ key: "xpert-crm-data", value: JSON.stringify({ leads: seedLeads, activities: seedActivities }) });
} catch (e) { /* storage best-effort */ }
    })();
  }, []);

  const persist = useCallback(async (nextLeads, nextActivities) => {
  try {
    await supabase.from("crm_storage").upsert({ key: "xpert-crm-data", value: JSON.stringify({ leads: nextLeads, activities: nextActivities }) });
  } catch (e) { /* best-effort */ }
}, []);

  const updateLead = useCallback((id, patch) => {
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, ...patch } : l));
      persist(next, activities);
      return next;
    });
  }, [activities, persist]);

  const deleteLead = useCallback((id) => {
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== id);
      persist(next, activities);
      return next;
    });
    setSelectedLeadId(null);
  }, [activities, persist]);

  const addLead = useCallback((lead) => {
    setLeads((prev) => {
      const next = [lead, ...prev];
      persist(next, activities);
      return next;
    });
  }, [activities, persist]);

  const logActivity = useCallback((leadId, act, nextFollowupDate) => {
    setActivities((prevA) => {
      const nextA = [{ id: "A" + Date.now(), leadId, date: fmt(TODAY), ...act }, ...prevA];
      setLeads((prevL) => {
        const nextL = prevL.map((l) => l.id === leadId ? {
          ...l, lastActivityDate: fmt(TODAY),
          nextFollowupDate: nextFollowupDate || l.nextFollowupDate,
        } : l);
        persist(nextL, nextA);
        return nextL;
      });
      return nextA;
    });
  }, [persist]);

  const selectedLead = useMemo(() => leads.find((l) => l.id === selectedLeadId) || null, [leads, selectedLeadId]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center" style={{ background: C.bg, color: C.slate }}>Loading CRM…</div>;
  }

  const NAV = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "leads", label: "Leads", icon: Users },
    { key: "pipeline", label: "Pipeline", icon: KanbanSquare },
    { key: "activities", label: "Activities", icon: Phone },
    { key: "customers", label: "Customers", icon: UserCheck },
    { key: "reports", label: "Reports", icon: BarChart3 },
    { key: "team", label: "Sales Team", icon: UsersRound },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: C.bg, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');`}</style>

      {/* SIDEBAR */}
      <div className="flex flex-col shrink-0" style={{ width: 220, background: C.charcoal }}>
        <div className="px-5 py-5 flex items-center gap-2 border-b" style={{ borderColor: "#333" }}>
          <div style={{ width: 10, height: 22, background: C.green, borderRadius: 3 }} />
          <div className="text-white font-extrabold text-[15px] leading-tight">XPERT<br /><span style={{ color: C.green }}>FREIGHT</span></div>
        </div>
        <div className="flex-1 py-3 px-2 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = view === n.key;
            return (
              <button key={n.key} onClick={() => setView(n.key)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: active ? C.green : "transparent", color: active ? C.charcoal : "#c9cbd1" }}>
                <n.icon size={16} />{n.label}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-4 text-[11px] border-t" style={{ borderColor: "#333", color: "#8b8d94" }}>
          Freight Brokerage under LGI<br />Medellín · USA/NA market
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <div className="h-16 shrink-0 bg-white border-b flex items-center justify-between px-6 gap-4" style={{ borderColor: C.line }}>
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setView("leads"); }}
              placeholder="Search company, contact, phone, state…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: C.line, background: C.bg }} />
          </div>
          <button onClick={() => setShowNewLead(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold shrink-0"
            style={{ background: C.green, color: C.charcoal }}>
            <Plus size={16} /> New Lead
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === "dashboard" && <Dashboard leads={leads} activities={activities} setView={setView} setSelectedLeadId={setSelectedLeadId} />}
          {view === "leads" && <LeadsView leads={leads} search={search} setSearch={setSearch} setSelectedLeadId={setSelectedLeadId} />}
          {view === "pipeline" && <PipelineView leads={leads} updateLead={updateLead} setSelectedLeadId={setSelectedLeadId} />}
          {view === "activities" && <ActivitiesView leads={leads} activities={activities} logActivity={logActivity} setSelectedLeadId={setSelectedLeadId} />}
          {view === "customers" && <CustomersView leads={leads} setSelectedLeadId={setSelectedLeadId} />}
          {view === "reports" && <ReportsView leads={leads} />}
          {view === "team" && <TeamView leads={leads} activities={activities} setSelectedLeadId={setSelectedLeadId} />}
        </div>
      </div>

      {selectedLead && (
        <LeadDetail lead={selectedLead} activities={activities.filter(a => a.leadId === selectedLead.id)}
          onClose={() => setSelectedLeadId(null)} updateLead={updateLead} deleteLead={deleteLead} logActivity={logActivity} />
      )}
      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} onCreate={(l) => { addLead(l); setShowNewLead(false); }} />}
    </div>
  );
}

/* ============================== DASHBOARD ============================== */
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

/* ============================== LEADS ============================== */
function LeadsView({ leads, search, setSearch, setSelectedLeadId }) {
  const [rep, setRep] = useState("All");
  const [stage, setStage] = useState("All");
  const [source, setSource] = useState("All");
  const [priority, setPriority] = useState("All");

  const filtered = leads.filter(l => {
    const q = search.trim().toLowerCase();
    const matchesQ = !q || [l.companyName, l.contactFirst, l.contactLast, l.phone, l.email, l.state].join(" ").toLowerCase().includes(q);
    return matchesQ && (rep === "All" || l.assignedTo === rep) && (stage === "All" || l.stage === stage) &&
      (source === "All" || l.source === source) && (priority === "All" || l.priority === priority);
  });

  const Select = ({ value, onChange, options, label }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm border rounded-lg px-2.5 py-1.5" style={{ borderColor: C.line }}>
      <option value="All">{label}: All</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold" style={{ color: C.ink }}>Leads <span style={{ color: C.slate, fontWeight: 500 }}>({filtered.length})</span></h1>
        <div className="flex gap-2 flex-wrap">
          <Select value={rep} onChange={setRep} options={REPS} label="Rep" />
          <Select value={stage} onChange={setStage} options={STAGES} label="Stage" />
          <Select value={source} onChange={setSource} options={SOURCES} label="Source" />
          <Select value={priority} onChange={setPriority} options={PRIORITIES} label="Priority" />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.bg }} className="text-left">
              {["Company", "Contact", "State", "Source", "Priority", "Score", "Stage", "Rep", "Est. Rev/mo", "Next Follow-up"].map(h => (
                <th key={h} className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wide" style={{ color: C.slate }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const isOverdue = l.nextFollowupDate && dateOnly(l.nextFollowupDate) < dateOnly(TODAY);
              return (
                <tr key={l.id} onClick={() => setSelectedLeadId(l.id)} className="border-t cursor-pointer hover:bg-gray-50" style={{ borderColor: C.line }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: C.ink }}>{l.companyName}<div className="text-xs font-normal" style={{ color: C.slate }}>{l.industry}</div></td>
                  <td className="px-4 py-2.5" style={{ color: C.ink }}>{l.contactFirst} {l.contactLast}<div className="text-xs" style={{ color: C.slate }}>{l.jobTitle}</div></td>
                  <td className="px-4 py-2.5" style={{ color: C.ink }}>{l.state}</td>
                  <td className="px-4 py-2.5" style={{ color: C.slate }}>{l.source}</td>
                  <td className="px-4 py-2.5"><PriorityBadge p={l.priority} /></td>
                  <td className="px-4 py-2.5"><ScoreRing score={l.score} size={30} /></td>
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
function PipelineView({ leads, updateLead, setSelectedLeadId }) {
  const [dragId, setDragId] = useState(null);
  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className="text-xl font-bold" style={{ color: C.ink }}>Sales Pipeline</h1>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.filter(s => s !== "Lost" && s !== "Nurturing / Future Opportunity").concat(["Nurturing / Future Opportunity", "Lost"]).map(stage => {
          const items = leads.filter(l => l.stage === stage);
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
                    <div className="text-sm font-semibold" style={{ color: C.ink }}>{l.companyName}</div>
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
function ActivitiesView({ leads, activities, logActivity, setSelectedLeadId }) {
  const todayStr = fmt(TODAY);
  const open = leads.filter(l => l.stage !== "Won – Active Customer" && l.stage !== "Lost");
  const today = open.filter(l => l.nextFollowupDate === todayStr);
  const overdue = open.filter(l => l.nextFollowupDate && dateOnly(l.nextFollowupDate) < dateOnly(TODAY));
  const upcoming = open.filter(l => l.nextFollowupDate && dateOnly(l.nextFollowupDate) > dateOnly(TODAY)).sort((a, b) => new Date(a.nextFollowupDate) - new Date(b.nextFollowupDate));
  const [logging, setLogging] = useState(null);

  const Section = ({ title, items, tone }) => (
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold" style={{ color: C.ink }}>Activities & Follow-ups</h1>
      <div className="flex gap-4 flex-wrap">
        <Section title="Overdue" items={overdue} tone={C.danger} />
        <Section title="Today" items={today} tone={C.greenDark} />
        <Section title="Upcoming" items={upcoming.slice(0, 20)} tone={C.slate} />
      </div>
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.line }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Recent Activity Log</h3>
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {activities.slice(0, 25).map(a => {
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
function QuickLog({ lead, onDone, onCancel }) {
  const [type, setType] = useState("Phone Call");
  const [notes, setNotes] = useState("");
  const [next, setNext] = useState(fmt(addDays(TODAY, 3)));
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <select value={type} onChange={e => setType(e.target.value)} className="text-xs border rounded-md px-2 py-1" style={{ borderColor: C.line }}>
        {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
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

/* ============================== CUSTOMERS ============================== */
function CustomersView({ leads, setSelectedLeadId }) {
  const customers = leads.filter(l => l.stage === "Won – Active Customer");
  const healthColor = { Active: C.green, Growing: "#3b82f6", "At Risk": C.warm, Inactive: C.slate, "Lost Customer": C.danger };
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold" style={{ color: C.ink }}>Active Customers <span style={{ color: C.slate, fontWeight: 500 }}>({customers.length})</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {customers.map(c => {
          const months = Math.max(1, Math.round((TODAY - new Date(c.startDate)) / (1000 * 60 * 60 * 24 * 30)));
          const lifetime = c.estMonthlyRevenue * months;
          return (
            <div key={c.id} onClick={() => setSelectedLeadId(c.id)} className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition" style={{ borderColor: C.line }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold" style={{ color: C.ink }}>{c.companyName}</div>
                  <div className="text-xs" style={{ color: C.slate }}>{c.industry} · {c.city}, {c.state}</div>
                </div>
                <span className="text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: healthColor[c.customerHealth] + "1a", color: healthColor[c.customerHealth] }}>{c.customerHealth}</span>
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
  const thisMonth = open.filter(l => l.expectedCloseDate && new Date(l.expectedCloseDate).getMonth() === TODAY.getMonth());
  const nextMonth = open.filter(l => l.expectedCloseDate && new Date(l.expectedCloseDate).getMonth() === (TODAY.getMonth() + 1) % 12);
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
function LeadDetail({ lead, activities, onClose, updateLead, deleteLead, logActivity }) {
  const [type, setType] = useState("Phone Call");
  const [notes, setNotes] = useState("");
  const [next, setNext] = useState(lead.nextFollowupDate || fmt(addDays(TODAY, 3)));

  return (
    <Modal onClose={onClose} width={560}>
      <div className="px-5 py-4 border-b flex items-start justify-between sticky top-0 bg-white z-10" style={{ borderColor: C.line }}>
        <div>
          <div className="text-xs font-semibold" style={{ color: C.slate }}>{lead.id}</div>
          <h2 className="text-lg font-bold" style={{ color: C.ink }}>{lead.companyName}</h2>
          <div className="flex items-center gap-2 mt-1"><PriorityBadge p={lead.priority} /><StagePill stage={lead.stage} /></div>
        </div>
        <div className="flex items-center gap-2">
          <ScoreRing score={lead.score} />
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

        <Section title="Contact">
          <InfoRow icon={UserCheck} text={`${lead.contactFirst} ${lead.contactLast} — ${lead.jobTitle}`} />
          <InfoRow icon={Mail} text={lead.email} />
          <InfoRow icon={Phone} text={`${lead.phone} (office) · ${lead.mobile} (mobile)`} />
          <InfoRow icon={MapPin} text={`${lead.city}, ${lead.state} · ${lead.timeZone}`} />
        </Section>

        <Section title="Company">
          <InfoRow icon={Building2} text={`${lead.legalName} · ${lead.industry} · ${lead.companySize} employees`} />
          <InfoRow icon={Truck} text={`${lead.trucks} trucks · ${lead.website}`} />
        </Section>

        <Section title="Freight Profile">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Kv k="Lanes" v={lead.mainLanes} /><Kv k="Equipment" v={lead.equipmentType} />
            <Kv k="Avg Weekly Loads" v={lead.avgWeeklyLoads} /><Kv k="Avg Weight" v={lead.avgWeight} />
            <Kv k="Commodity" v={lead.commodity} /><Kv k="Current Provider" v={lead.currentProvider} />
            <Kv k="Hazmat" v={lead.hazmat ? "Yes" : "No"} /><Kv k="Temp Controlled" v={lead.tempControlled ? "Yes" : "No"} />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {lead.servicesInterest.map(s => <span key={s} className="text-[10px] rounded-full px-2 py-0.5" style={{ background: C.greenTint, color: C.greenDark }}>{s}</span>)}
          </div>
        </Section>

        <Section title="Commercial">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Kv k="Est. Monthly Rev." v={money(lead.estMonthlyRevenue)} /><Kv k="Est. Annual Rev." v={money(lead.estAnnualRevenue)} />
            <Kv k="Avg Rev / Load" v={money(lead.avgRevPerLoad)} /><Kv k="Probability" v={lead.probability + "%"} />
            <Kv k="Expected Close" v={lead.expectedCloseDate || "—"} /><Kv k="Created" v={lead.createdDate} />
          </div>
        </Section>

        <Section title="Log Activity">
          <div className="flex flex-col gap-2">
            <select value={type} onChange={e => setType(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }}>
              {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What happened?" rows={2}
              className="border rounded-lg px-2 py-1.5 text-sm resize-none" style={{ borderColor: C.line }} />
            <div className="flex items-center gap-2">
              <FieldLabel>Next Follow-up</FieldLabel>
              <input type="date" value={next} onChange={e => setNext(e.target.value)} className="border rounded-lg px-2 py-1 text-sm" style={{ borderColor: C.line }} />
            </div>
            <button onClick={() => { logActivity(lead.id, { type, notes: notes || "Logged activity.", salesperson: lead.assignedTo, outcome: "Connected", nextStep: "Follow up" }, next); setNotes(""); }}
              className="self-start px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ background: C.green, color: C.charcoal }}>Log Activity</button>
          </div>
          <div className="mt-3 flex flex-col gap-2 max-h-52 overflow-y-auto">
            {activities.map(a => (
              <div key={a.id} className="text-xs border-t pt-2" style={{ borderColor: C.line }}>
                <div className="flex justify-between"><span className="font-semibold" style={{ color: C.ink }}>{a.type}</span><span style={{ color: C.slate }}>{a.date}</span></div>
                <div style={{ color: C.slate }}>{a.notes}</div>
              </div>
            ))}
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
    jobTitle: "Operations Manager", email: "", phone: "", source: "Cold Call", priority: "Warm",
    assignedTo: "Felipe Velez", estMonthlyRevenue: 5000, services: [],
  });
  const toggleService = (s) => setF(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));
  const set = (k) => (e) => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (!f.companyName || !f.contactFirst) return;
    const score = Math.min(100, Math.round((f.priority === "Hot" ? 40 : f.priority === "Warm" ? 22 : 8) + rint(10, 30)));
    onCreate({
      id: "L" + Date.now(), companyName: f.companyName, legalName: f.companyName, industry: f.industry,
      companySize: "11-50", trucks: rint(3, 60), employees: rint(10, 150), website: "", city: f.city, state: f.state,
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
          <div><FieldLabel>City</FieldLabel><input value={f.city} onChange={set("city")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>State</FieldLabel><input value={f.state} onChange={set("state")} maxLength={2} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Contact First *</FieldLabel><input value={f.contactFirst} onChange={set("contactFirst")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Contact Last</FieldLabel><input value={f.contactLast} onChange={set("contactLast")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Job Title</FieldLabel><input value={f.jobTitle} onChange={set("jobTitle")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Email</FieldLabel><input value={f.email} onChange={set("email")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Phone</FieldLabel><input value={f.phone} onChange={set("phone")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
          <div><FieldLabel>Est. Monthly Revenue</FieldLabel><input type="number" value={f.estMonthlyRevenue} onChange={set("estMonthlyRevenue")} className="w-full border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: C.line }} /></div>
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
