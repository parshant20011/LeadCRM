"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Lead, UserRole, LeadStatus, Agent, Admin, LeadOrder } from "@/types";
import { MOCK_AGENTS } from "@/data/mockLeads";

interface AppState {
  role: UserRole;
  leads: Lead[];
  agents: Agent[];
  admins: Admin[];
  leadOrders: LeadOrder[];
  defaultLeadCost: number;
  setRole: (role: UserRole) => void;
  setLeads: (leads: Lead[] | ((prev: Lead[]) => Lead[])) => void;
  setAgents: (agents: Agent[] | ((prev: Agent[]) => Agent[])) => void;
  setAdmins: (admins: Admin[] | ((prev: Admin[]) => Admin[])) => void;
  setDefaultLeadCost: (cost: number) => void;
  setSelectedAgentId: (id: string | null) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, convertedAmount?: number) => void;
  updateLeadConvertedAmount: (leadId: string, amount: number) => void;
  updateLeadCost: (leadId: string, cost: number) => void;
  assignLead: (leadId: string, agentId: string, leadCreatedAt?: string) => void;
  bulkAssignLeads: (leadIds: string[], agentId: string, createdAts?: (string | undefined)[]) => void;
  markAgentPaid: (agentId: string, option: { type: "amount"; amount: number } | { type: "full" }) => void;
  decrementLeadOrder: (agentId: string, date: string, by: number) => void;
  decrementLeadOrderById: (orderId: string, by: number) => void;
  addAgent: (name: string, email: string) => Agent;
  addAdmin: (name: string, email: string) => Admin;
  addLead: (data: { name: string; phone: string; source: string; leadCost: number; assignedAgentId?: string | null; address?: string; age?: string; gender?: string }) => Lead;
  addLeadOrder: (agentId: string, date: string, count: number) => LeadOrder;
  deleteAgent: (agentId: string) => void;
  deleteLead: (leadId: string) => void;
  updateLeadPhone: (leadId: string, phone: string) => void;
  currentAgentId: string | null;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [leadOrders, setLeadOrders] = useState<LeadOrder[]>([]);
  const [defaultLeadCost, setDefaultLeadCostState] = useState(12);
  const [selectedAgentId, setSelectedAgentIdState] = useState<string | null>(null);

  const currentAgentId =
    role === "agent"
      ? selectedAgentId ?? agents[0]?.id ?? null
      : null;

  const setSelectedAgentId = useCallback((id: string | null) => {
    setSelectedAgentIdState(id);
  }, []);

  const setDefaultLeadCost = useCallback((cost: number) => {
    setDefaultLeadCostState(Math.max(0, cost));
  }, []);

  const updateLeadStatus = useCallback((leadId: string, status: LeadStatus, convertedAmount?: number) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const next: Lead = { ...l, status };
        if (status === "Converted" && convertedAmount != null && !Number.isNaN(convertedAmount)) {
          next.convertedAmount = Math.max(0, convertedAmount);
        }
        if (status !== "Converted") next.convertedAmount = undefined;
        return next;
      })
    );
  }, []);

  const updateLeadConvertedAmount = useCallback((leadId: string, amount: number) => {
    const value = Math.max(0, amount);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, convertedAmount: value } : l))
    );
  }, []);

  const updateLeadCost = useCallback((leadId: string, cost: number) => {
    const value = Math.max(0, cost);
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const paid = l.paid ?? 0;
        const newDue = l.assignedAgentId ? value - paid : 0;
        return { ...l, leadCost: value, due: newDue };
      })
    );
  }, []);

  const decrementLeadOrder = useCallback((agentId: string, date: string, by: number) => {
    const norm = date.slice(0, 10);
    setLeadOrders((prev) => {
      let remaining = by;
      return prev.map((o) => {
        if (remaining <= 0 || o.agentId !== agentId || o.date !== norm) return o;
        const deduct = Math.min(remaining, o.count);
        remaining -= deduct;
        return { ...o, count: Math.max(0, o.count - deduct) };
      });
    });
  }, []);

  const decrementLeadOrderById = useCallback((orderId: string, by: number) => {
    setLeadOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, count: Math.max(0, o.count - by) } : o
      )
    );
  }, []);

  const assignLead = useCallback((leadId: string, agentId: string, leadCreatedAt?: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, assignedAgentId: agentId, due: l.leadCost, paid: 0 }
          : l
      )
    );
    if (leadCreatedAt) {
      const date = leadCreatedAt.slice(0, 10);
      setLeadOrders((prev) => {
        let remaining = 1;
        return prev.map((o) => {
          if (remaining <= 0 || o.agentId !== agentId || o.date !== date) return o;
          const deduct = Math.min(remaining, o.count);
          remaining -= deduct;
          return { ...o, count: Math.max(0, o.count - deduct) };
        });
      });
    }
  }, []);

  const bulkAssignLeads = useCallback((leadIds: string[], agentId: string, createdAts?: (string | undefined)[]) => {
    setLeads((prev) =>
      prev.map((l) =>
        leadIds.includes(l.id)
          ? { ...l, assignedAgentId: agentId, due: l.leadCost, paid: 0 }
          : l
      )
    );
    if (createdAts && createdAts.length === leadIds.length) {
      const dateCounts: Record<string, number> = {};
      createdAts.forEach((d) => {
        if (d) {
          const key = d.slice(0, 10);
          dateCounts[key] = (dateCounts[key] ?? 0) + 1;
        }
      });
      setLeadOrders((prev) => {
        const next = [...prev];
        Object.entries(dateCounts).forEach(([date, by]) => {
          let remaining = by;
          for (let i = 0; i < next.length && remaining > 0; i++) {
            if (next[i].agentId === agentId && next[i].date === date && next[i].count > 0) {
              const deduct = Math.min(remaining, next[i].count);
              next[i] = { ...next[i], count: next[i].count - deduct };
              remaining -= deduct;
            }
          }
        });
        return next;
      });
    }
  }, []);

  const markAgentPaid = useCallback((agentId: string, option: { type: "amount"; amount: number } | { type: "full" }) => {
    setLeads((prev) => {
      const agentLeads = prev.filter((l) => l.assignedAgentId === agentId);
      if (option.type === "full") {
        return prev.map((l) =>
          l.assignedAgentId === agentId
            ? { ...l, paid: l.leadCost, due: 0 }
            : l
        );
      }
      let remaining = Math.max(0, option.amount);
      const withDue = agentLeads
        .filter((l) => (l.due ?? 0) > 0)
        .map((l) => ({ lead: l, due: l.due ?? 0 }));
      const updates: Record<string, { paid: number; due: number }> = {};
      for (const { lead, due } of withDue) {
        if (remaining <= 0) break;
        const pay = Math.min(remaining, due);
        const newPaid = (lead.paid ?? 0) + pay;
        const newDue = lead.leadCost - newPaid;
        updates[lead.id] = { paid: newPaid, due: Math.max(0, newDue) };
        remaining -= pay;
      }
      return prev.map((l) =>
        updates[l.id] ? { ...l, paid: updates[l.id].paid, due: updates[l.id].due } : l
      );
    });
  }, []);

  const addAgent = useCallback((name: string, email: string): Agent => {
    const id = "agent-" + Math.random().toString(36).slice(2, 11);
    const agent: Agent = { id, name: name.trim(), email: email.trim() };
    setAgents((prev) => [...prev, agent]);
    return agent;
  }, []);

  const addAdmin = useCallback((name: string, email: string): Admin => {
    const id = "admin-" + Math.random().toString(36).slice(2, 11);
    const admin: Admin = { id, name: name.trim(), email: email.trim() };
    setAdmins((prev) => [...prev, admin]);
    return admin;
  }, []);

  const addLeadOrder = useCallback((agentId: string, date: string, count: number): LeadOrder => {
    const id = "order-" + Math.random().toString(36).slice(2, 11);
    const order: LeadOrder = { id, agentId, date: date.slice(0, 10), count: Math.max(0, count) };
    setLeadOrders((prev) => [...prev, order]);
    return order;
  }, []);

  const addLead = useCallback(
    (data: {
      name: string;
      phone: string;
      source: string;
      leadCost: number;
      assignedAgentId?: string | null;
      address?: string;
      age?: string;
      gender?: string;
    }): Lead => {
      const id = "lead-" + Math.random().toString(36).slice(2, 11);
      const cost = Math.max(0, data.leadCost);
      const assignedAgentId = data.assignedAgentId ?? null;
      const lead: Lead = {
        id,
        name: data.name.trim(),
        phone: data.phone.trim(),
        source: data.source.trim(),
        leadCost: cost,
        status: "New",
        assignedAgentId,
        paid: 0,
        due: assignedAgentId ? cost : 0,
        address: data.address?.trim(),
        age: data.age?.trim(),
        gender: data.gender?.trim(),
        createdAt: new Date().toISOString(),
      };
      setLeads((prev) => [...prev, lead]);
      return lead;
    },
    []
  );

  const deleteAgent = useCallback((agentId: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
    setLeads((prev) =>
      prev.map((l) => (l.assignedAgentId === agentId ? { ...l, assignedAgentId: null, due: 0, paid: 0 } : l))
    );
    setLeadOrders((prev) => prev.filter((o) => o.agentId !== agentId));
  }, []);

  const deleteLead = useCallback((leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  }, []);

  const updateLeadPhone = useCallback((leadId: string, phone: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, phone: phone.trim() } : l))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        leads,
        agents,
        admins,
        leadOrders,
        defaultLeadCost,
        setRole,
        setLeads,
        setAgents,
        setAdmins,
        setDefaultLeadCost,
        setSelectedAgentId,
        updateLeadStatus,
        updateLeadConvertedAmount,
        updateLeadCost,
        assignLead,
        bulkAssignLeads,
        markAgentPaid,
        decrementLeadOrder,
        decrementLeadOrderById,
        addAgent,
        addAdmin,
        addLeadOrder,
        addLead,
        deleteAgent,
        deleteLead,
        updateLeadPhone,
        currentAgentId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
