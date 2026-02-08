import type { Agent } from "@/types";

export const MOCK_AGENTS: Agent[] = [
  { id: "agent-1", name: "Priya Sharma", email: "priya@company.in" },
  { id: "agent-2", name: "Rahul Verma", email: "rahul@company.in" },
  { id: "agent-3", name: "Anita Reddy", email: "anita@company.in" },
];

/** Mock daily lead counts for last 7 days (for trend chart) */
export const MOCK_LEAD_TREND = [
  { date: "Mon", leads: 12, converted: 2 },
  { date: "Tue", leads: 18, converted: 4 },
  { date: "Wed", leads: 14, converted: 3 },
  { date: "Thu", leads: 22, converted: 5 },
  { date: "Fri", leads: 19, converted: 4 },
  { date: "Sat", leads: 8, converted: 1 },
  { date: "Sun", leads: 11, converted: 2 },
];
