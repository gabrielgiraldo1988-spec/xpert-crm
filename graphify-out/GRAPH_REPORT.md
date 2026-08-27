# Graph Report - xpert-crm  (2026-08-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 153 nodes · 209 edges · 19 communities (13 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a5f1c7a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- fmt
- devDependencies
- dependencies
- .oxlintrc.json
- package.json
- genLeads
- daily-digest.js
- inbound-quote.js
- buildQuoteText
- buildTriumphUrl
- CustomersView
- leadsToCSV
- supabase.js
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `fmt()` - 16 edges
2. `addDays()` - 8 edges
3. `LeadsView()` - 8 edges
4. `genLeads()` - 8 edges
5. `dateOnly()` - 7 edges
6. `money()` - 7 edges
7. `CRMApp()` - 6 edges
8. `genActivities()` - 6 edges
9. `rint()` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `genActivities()` --calls--> `addDays()`  [EXTRACTED]
  src/App.jsx → src/App.jsx  _Bridges community 1 → community 6_
- `LeadsView()` --calls--> `leadsToCSV()`  [EXTRACTED]
  src/App.jsx → src/App.jsx  _Bridges community 1 → community 12_
- `CustomersView()` --calls--> `money()`  [EXTRACTED]
  src/App.jsx → src/App.jsx  _Bridges community 1 → community 11_

## Import Cycles
- None detected.

## Communities (19 total, 6 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.05
Nodes (23): ACTIVITY_TYPES, AGENCIES, C, COMPANY_POOL, CSV_COLUMNS, EMAIL_TO_REP, EMAIL_TO_ROLE, EQUIPMENT_OPTIONS (+15 more)

### Community 1 - "fmt"
Cohesion: 0.15
Nodes (21): ActivitiesView(), addDays(), CalendarView(), computeSuggestedRate(), csvRowsToLeads(), Dashboard(), dateOnly(), downloadTextFile() (+13 more)

### Community 2 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, oxlint, devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/react (+9 more)

### Community 3 - "dependencies"
Cohesion: 0.15
Nodes (13): lucide-react, dependencies, lucide-react, react, react-dom, recharts, resend, @supabase/supabase-js (+5 more)

### Community 4 - ".oxlintrc.json"
Cohesion: 0.18
Nodes (9): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, react, warn (+1 more)

### Community 5 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 6 - "genLeads"
Cohesion: 0.36
Nodes (9): applyTheme(), buildStagePlan(), CRMApp(), genActivities(), genLeads(), normalizeQuote(), pick(), rint() (+1 more)

### Community 7 - "daily-digest.js"
Cohesion: 0.43
Nodes (6): buildHtml(), escapeHtml(), fmt(), handler(), REP_EMAILS, STAGE_PROB

### Community 8 - "inbound-quote.js"
Cohesion: 0.60
Nodes (4): EMAIL_TO_REP, extractQuoteDetails(), fmt(), handler()

## Knowledge Gaps
- **53 isolated node(s):** `ACTIVITY_TYPES`, `AGENCIES`, `C`, `COMPANY_POOL`, `CSV_COLUMNS` (+48 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `.oxlintrc.json` to `App.jsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `ACTIVITY_TYPES`, `AGENCIES`, `C` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._