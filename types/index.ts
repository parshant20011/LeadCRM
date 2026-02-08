export type UserRole = "super_admin" | "admin" | "agent";

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up",
  "Converted",
  "Lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Agent {
  id: string;
  name: string;
  email: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  leadCost: number;
  status: LeadStatus;
  assignedAgentId: string | null;
  paid?: number;
  due?: number;
  address?: string;
  age?: string;
  gender?: string;
  /** ISO date string; set when lead is created for date-range filtering */
  createdAt?: string;
  /** Amount received when lead is converted (sale/revenue) */
  convertedAmount?: number;
}

export interface LeadFilters {
  status: LeadStatus | "";
  agentId: string;
}

/** Lead order: agent requests N leads for a given date */
export interface LeadOrder {
  id: string;
  agentId: string;
  date: string; // YYYY-MM-DD
  count: number;
}
