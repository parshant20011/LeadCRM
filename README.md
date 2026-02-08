# Lead Management Dashboard (Phase 1)

Static frontend-only Lead Management Dashboard built with **Next.js 14 (App Router)** and **Tailwind CSS**. Mock data and in-memory state; no backend or authentication.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder structure

```
/app
  layout.tsx          # Root layout + AppProvider
  page.tsx            # Home with links
  globals.css
  context/
    AppContext.tsx    # Role + leads state, assign/status actions
  dashboard/page.tsx  # Stats cards
  upload/page.tsx     # Excel upload UI → load mock leads
  leads/page.tsx      # Table, filters, assign (single/bulk), status
  agent/page.tsx      # Agent view: assigned leads, earnings, due
  reports/page.tsx    # Agent-wise, status-wise, cost & dues
/components
  Header.tsx          # Nav + Role Switcher
  StatCard.tsx        # Dashboard stat card
  AssignModal.tsx     # Single lead assign
  ViewLeadModal.tsx   # Lead details
/data
  mockLeads.ts        # 30 sample leads, 3 agents, createMockLeads()
/types
  index.ts            # UserRole, LeadStatus, Lead, Agent, filters
```

## Features

- **Role switcher** (Super Admin / Admin / Agent) in header for demo.
- **Dashboard** (`/dashboard`): Total leads, assigned, pending, converted, total cost, total due.
- **Upload** (`/upload`): File input + "Upload" loads 30 predefined mock leads (no parsing).
- **Leads** (`/leads`): Table with name, phone, agent, status dropdown, lead cost; filters (Status, Agent); Assign (modal), View (modal); bulk assign (checkboxes + dropdown).
- **Status flow**: New → Contacted → Interested → Follow-up → Converted / Lost.
- **Cost & due**: Per-lead cost; agent totals and paid/due on Agent and Reports.
- **Agent** (`/agent`): When role is Agent, shows "my" leads (first agent in demo), status update, earnings/due.
- **Reports** (`/reports`): Agent-wise leads, status-wise leads, total cost & dues.

## Data flow

1. **AppContext** holds `leads` and `role`. All mutations (`updateLeadStatus`, `assignLead`, `bulkAssignLeads`, `loadUploadedLeads`) update React state.
2. **Dashboard / Reports** derive stats from `leads` (no separate store).
3. **Leads page** filters `leads` by status and agent; table and modals read/update via context.
4. **Agent page** filters `leads` by `assignedAgentId` (when role is Agent, uses first agent id for demo).

## Phase 2 backend integration

- Replace `AppContext` state with API calls: e.g. `GET /api/leads`, `PATCH /api/leads/:id` (status, assignment), `POST /api/leads/upload`.
- Keep the same types in `/types`; align API request/response shapes.
- Add real auth; use role from session/JWT and restrict routes (e.g. Agent only sees own leads).
- Upload: send file to backend; backend parses Excel and creates leads; frontend refetches list or uses server response.
