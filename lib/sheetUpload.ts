/**
 * Sheet upload types and helpers. Actual file parsing is done in the upload page via CDN script.
 */
export interface ParsedSheet {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export type LeadFieldKey = "name" | "phone" | "address" | "age" | "gender";

export interface ColumnMapping {
  name: number | null;
  phone: number | null;
  address: number | null;
  age: number | null;
  gender: number | null;
}

/** Normalize header for matching: lowercase, trim, collapse spaces */
function norm(h: string): string {
  return (h ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Auto-detect which column index maps to which lead field */
export function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    name: null,
    phone: null,
    address: null,
    age: null,
    gender: null,
  };

  const namePatterns = ["name", "full name", "customer name", "lead name", "contact name", "client name"];
  const phonePatterns = ["phone", "mobile", "contact", "number", "phone number", "mobile number", "telephone", "contact no"];
  const addressPatterns = ["address", "location", "city", "street", "address line"];
  const agePatterns = ["age", "dob", "date of birth", "years"];
  const genderPatterns = ["gender", "sex", "male/female"];

  headers.forEach((header, index) => {
    const n = norm(header);
    if (!n) return;
    if (namePatterns.some((p) => n.includes(p) || n === p) && mapping.name === null) mapping.name = index;
    else if (phonePatterns.some((p) => n.includes(p) || n === p) && mapping.phone === null) mapping.phone = index;
    else if (addressPatterns.some((p) => n.includes(p) || n === p) && mapping.address === null) mapping.address = index;
    else if (agePatterns.some((p) => n.includes(p) || n === p) && mapping.age === null) mapping.age = index;
    else if (genderPatterns.some((p) => n.includes(p) || n === p) && mapping.gender === null) mapping.gender = index;
  });

  return mapping;
}

/** Get cell value as string from row by column index */
function cell(row: string[], colIndex: number | null): string {
  if (colIndex == null || colIndex < 0) return "";
  const v = row[colIndex];
  if (v == null) return "";
  return String(v).trim();
}

export interface MappedLeadRow {
  name: string;
  phone: string;
  address: string;
  age: string;
  gender: string;
}

/**
 * Map sheet rows to lead-like objects using the given column mapping (name, phone, address, age, gender).
 */
export function mapRowsToLeads(
  rows: string[][],
  mapping: ColumnMapping
): MappedLeadRow[] {
  return rows.map((row) => ({
    name: cell(row, mapping.name),
    phone: cell(row, mapping.phone),
    address: cell(row, mapping.address),
    age: cell(row, mapping.age),
    gender: cell(row, mapping.gender),
  }));
}
