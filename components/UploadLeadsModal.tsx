"use client";

import { useState, useCallback, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import { useToast } from "@/app/context/ToastContext";
import {
  autoDetectMapping,
  mapRowsToLeads,
  type ParsedSheet,
  type ColumnMapping,
  type LeadFieldKey,
} from "@/lib/sheetUpload";

const SHEET_SCRIPT_URL =
  "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";

type SheetLib = {
  read: (data: ArrayBuffer, opts: { type: string; raw?: boolean }) => { SheetNames: string[]; Sheets: Record<string, unknown> };
  utils: { sheet_to_json: (ws: unknown, opts: { header: number; defval: string }) => unknown[][] };
};

function loadSheetScript(): Promise<SheetLib> {
  return new Promise((resolve, reject) => {
    const w = typeof window !== "undefined" ? (window as { XLSX?: SheetLib }) : null;
    if (w?.XLSX) {
      resolve(w.XLSX);
      return;
    }
    const script = document.createElement("script");
    script.src = SHEET_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve((window as { XLSX: SheetLib }).XLSX);
    script.onerror = () => reject(new Error("Failed to load sheet library."));
    document.head.appendChild(script);
  });
}

async function parseSheetFile(file: File, includeFirstRowAsData: boolean): Promise<ParsedSheet> {
  const XLSX = await loadSheetScript();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", raw: false });
  const firstSheet = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheet];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];
  if (!data.length) return { headers: [], rows: [], fileName: file.name };
  const stringRows = data.map((row) => (row as unknown[]).map((c) => String(c ?? "")));
  if (includeFirstRowAsData) {
    const firstRow = stringRows[0];
    const headers = firstRow.map((_, i) => `Column ${i + 1}`);
    return { headers, rows: stringRows, fileName: file.name };
  }
  const headers = (data[0] as unknown[]).map((h) => String(h ?? "").trim());
  const rows = stringRows.slice(1);
  return { headers, rows, fileName: file.name };
}

const FIELD_LABELS: Record<LeadFieldKey, string> = {
  name: "Name",
  phone: "Phone",
  address: "Address",
  age: "Age",
  gender: "Gender",
};

const DEFAULT_SOURCE = "Upload";

const STEPS = [
  { id: 1, label: "File & price" },
  { id: 2, label: "Column assignment" },
  { id: 3, label: "Preview & import" },
];

interface UploadLeadsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadLeadsModal({ open, onClose, onSuccess }: UploadLeadsModalProps) {
  const { defaultLeadCost, setDefaultLeadCost, addLead } = useApp();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [includeFirstRowAsData, setIncludeFirstRowAsData] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const setMappingField = useCallback((field: LeadFieldKey, value: number | null) => {
    setMapping((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  const parseFile = useCallback(async (file: File) => {
    setParseError(null);
    setIsParsing(true);
    try {
      const result = await parseSheetFile(file, includeFirstRowAsData);
      if (!result.headers.length) {
        setParseError("No headers found in the sheet.");
        setParsed(null);
        setMapping(null);
        return;
      }
      setParsed(result);
      setMapping(autoDetectMapping(result.headers));
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse file.");
      setParsed(null);
      setMapping(null);
    } finally {
      setIsParsing(false);
    }
  }, [includeFirstRowAsData]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      setParsed(null);
      setMapping(null);
      if (!file) return;
      setLastFile(file);
      await parseFile(file);
    },
    [parseFile]
  );

  useEffect(() => {
    if (lastFile) parseFile(lastFile);
  }, [includeFirstRowAsData, lastFile, parseFile]);

  const mappedRows = parsed && mapping ? mapRowsToLeads(parsed.rows, mapping) : [];
  const validRows = mappedRows.filter((r) => r.name.trim() && r.phone.trim());
  const canImport = validRows.length > 0;

  const resetAndClose = useCallback(() => {
    setStep(1);
    setIncludeFirstRowAsData(false);
    setLastFile(null);
    setParsed(null);
    setMapping(null);
    setParseError(null);
    onClose();
  }, [onClose]);

  const handleImport = useCallback(() => {
    if (!canImport || !mapping) return;
    setIsImporting(true);
    try {
      let added = 0;
      for (const row of validRows) {
        addLead({
          name: row.name.trim(),
          phone: row.phone.trim(),
          source: DEFAULT_SOURCE,
          leadCost: defaultLeadCost,
          address: row.address.trim() || undefined,
          age: row.age.trim() || undefined,
          gender: row.gender.trim() || undefined,
        });
        added++;
      }
      toast(`Imported ${added} lead(s) successfully.`);
      onSuccess?.();
      resetAndClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  }, [canImport, mapping, validRows, defaultLeadCost, addLead, toast, onSuccess, resetAndClose]);

  const canGoNext =
    step === 1 ? parsed != null && parsed.headers.length > 0 : true;
  const goNext = () => {
    if (step < 3 && (step !== 1 || canGoNext)) setStep((s) => s + 1);
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={resetAndClose}
        aria-hidden
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-xl"
        role="dialog"
        aria-labelledby="upload-leads-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="upload-leads-title" className="text-lg font-semibold text-slate-900">
            Upload leads
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-slate-200 px-6">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => s.id < step && setStep(s.id)}
              className={`flex-1 border-b-2 py-3 text-center text-sm font-medium transition ${
                step === s.id
                  ? "border-primary-600 text-primary-600"
                  : s.id < step
                    ? "border-primary-200 text-primary-600 hover:border-primary-400"
                    : "border-transparent text-slate-400"
              }`}
            >
              {s.id}. {s.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {/* Step 1: File + price */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Price per lead (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={defaultLeadCost}
                  onChange={(e) => setDefaultLeadCost(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeFirstRowAsData}
                    onChange={(e) => setIncludeFirstRowAsData(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">Include first row as data (first row is not headers)</span>
                </label>
                <label className="block text-sm font-medium text-slate-700">Upload file (Excel or CSV)</label>
                <p className="mt-0.5 text-xs text-slate-500">At least Name and Phone columns required.</p>
                <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-4 transition hover:bg-slate-50">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">
                    {isParsing ? "Parsing…" : parsed ? `${parsed.fileName} (${parsed.rows.length} rows)` : "Choose file"}
                  </span>
                </label>
                {parseError && (
                  <p className="mt-2 text-sm text-red-600" role="alert">{parseError}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Column assignment */}
          {step === 2 && parsed && mapping && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Map each sheet column to a lead field. Auto-detected where possible.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["name", "phone", "address", "age", "gender"] as LeadFieldKey[]).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-700">
                      {FIELD_LABELS[field]}
                      {(field === "name" || field === "phone") && <span className="ml-1 text-red-500">*</span>}
                    </label>
                    <select
                      value={mapping[field] != null ? String(mapping[field]) : ""}
                      onChange={(e) => setMappingField(field, e.target.value === "" ? null : parseInt(e.target.value, 10))}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">— Don&apos;t use</option>
                      {parsed.headers.map((h, i) => (
                        <option key={i} value={i}>{h || `(Column ${i + 1})`}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preview + import */}
          {step === 3 && parsed && mapping && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Rows with empty Name or Phone are skipped. Ready to import.</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 text-left font-medium text-slate-600">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600">Phone</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600">Address</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600">Age</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className={!row.name || !row.phone ? "bg-amber-50/50" : ""}>
                        <td className="px-3 py-2 text-slate-900">{row.name || "—"}</td>
                        <td className="px-3 py-2 tabular-nums text-slate-700">{row.phone || "—"}</td>
                        <td className="px-3 py-2 text-slate-600">{row.address || "—"}</td>
                        <td className="px-3 py-2 text-slate-600">{row.age || "—"}</td>
                        <td className="px-3 py-2 text-slate-600">{row.gender || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mappedRows.length > 5 && (
                <p className="text-xs text-slate-400">… and {mappedRows.length - 5} more row(s)</p>
              )}
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">{validRows.length}</span> of {mappedRows.length} rows will be imported.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between border-t border-slate-200 px-6 py-4">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={step === 1 && !canGoNext}
                className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleImport}
                disabled={!canImport || isImporting}
                className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isImporting ? "Importing…" : `Import ${validRows.length} lead(s)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
