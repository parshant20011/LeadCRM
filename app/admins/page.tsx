"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/app/context/AppContext";
import { useToast } from "@/app/context/ToastContext";
import { PageHeader } from "@/components/PageHeader";

export default function AdminsPage() {
  const { admins, addAdmin } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const filteredAdmins = useMemo(() => {
    if (!searchFilter.trim()) return admins;
    const q = searchFilter.toLowerCase().trim();
    return admins.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    );
  }, [admins, searchFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tName = name.trim();
    const tEmail = email.trim();
    if (!tName || !tEmail) return;
    addAdmin(tName, tEmail);
    toast(`Admin "${tName}" added successfully`);
    setName("");
    setEmail("");
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Add and manage admins. Only Super Admin can access this page."
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Admin
          </button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <label className="sr-only">Search admins</label>
        <input
          type="search"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search by name or email..."
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <span className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{filteredAdmins.length}</span> admin{filteredAdmins.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/50">
        {admins.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-slate-900">No admins yet</p>
              <p className="mt-1 text-sm text-slate-500">Add an admin to grant them access to leads, agents, and reports.</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                Add Admin
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/80">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Name</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-5 py-12 text-center text-sm text-slate-500">
                      No admins match your search.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="transition-colors hover:bg-primary-50/30 border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{admin.name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{admin.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-hidden
          />
          <div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby="add-admin-title"
          >
            <h2 id="add-admin-title" className="text-lg font-semibold text-slate-900">
              Add Admin
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="admin-name" className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="admin-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. Jane Admin"
                />
              </div>
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. jane@company.in"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
