import {
  primaryGreen,
  primaryDark,
  navy,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
  authJsonHeaders,
  fontBody,
  fontDisplay,
} from "../Users/usersShared";

export {
  primaryGreen,
  primaryDark,
  navy,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
  authJsonHeaders,
  fontBody,
  fontDisplay,
};

export const PROGRAMME_TABS = [
  { label: "Programme", value: "programmes", path: "/programmes" },
  { label: "Programme fee", value: "fees", path: "/programmes/fees" },
  { label: "Programme hour", value: "hours", path: "/programmes/hours" },
  { label: "Programme module", value: "modules", path: "/programmes/modules" },
  { label: "Programme subject", value: "subjects", path: "/programmes/subjects" },
];

export const CATEGORY_OPTIONS = [
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "higher_diploma", label: "Higher diploma" },
];

export const MODE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
];

export function authHeaders(token, isMultipart = false) {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  if (!isMultipart) headers["Content-Type"] = "application/json";
  return headers;
}

export function programmeImageSrc(row) {
  if (!row) return "";
  if (row.image_url) return row.image_url;
  if (row.image) {
    if (/^https?:\/\//i.test(row.image)) return row.image;
    return `/uploads/programmes/${row.image}`;
  }
  return "";
}

export function formatCategory(value) {
  if (!value) return "—";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatMoney(amount, currency = "KES") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export async function fetchProgrammesOptions(token) {
  const res = await fetch("/api/programmes?is_active=true&limit=100", {
    headers: authHeaders(token),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Could not load programmes");
  return Array.isArray(json.data) ? json.data : [];
}

export const emptyProgrammeForm = () => ({
  name: "",
  description: "",
  duration: "",
  category: "",
  award: "",
  minimum_kcse_grade: "",
  mode: "",
  weeks_per_year: "",
  duration_years: "",
  semester_1_weeks: "",
  semester_1_period: "",
  semester_2_weeks: "",
  semester_2_period: "",
  break_mid_sem1: "",
  break_end_sem1: "",
  break_end_sem2: "",
  is_active: true,
  imageFile: null,
  imagePreview: "",
  removeImage: false,
});

export function programmeToForm(row) {
  return {
    ...emptyProgrammeForm(),
    name: row.name || "",
    description: row.description || "",
    duration: row.duration || "",
    category: row.category || "",
    award: row.award || "",
    minimum_kcse_grade: row.minimum_kcse_grade || "",
    mode: row.mode || "",
    weeks_per_year: row.weeks_per_year ?? "",
    duration_years: row.duration_years ?? "",
    semester_1_weeks: row.semester_1_weeks ?? "",
    semester_1_period: row.semester_1_period || "",
    semester_2_weeks: row.semester_2_weeks ?? "",
    semester_2_period: row.semester_2_period || "",
    break_mid_sem1: row.break_mid_sem1 || "",
    break_end_sem1: row.break_end_sem1 || "",
    break_end_sem2: row.break_end_sem2 || "",
    is_active: row.is_active !== false,
    imageFile: null,
    imagePreview: programmeImageSrc(row),
    removeImage: false,
  };
}

export const YEAR_OPTIONS = [
  { value: 1, label: "Year 1" },
  { value: 2, label: "Year 2" },
  { value: 3, label: "Year 3" },
];

export const SEMESTER_OPTIONS = [
  { value: 1, label: "Semester 1" },
  { value: 2, label: "Semester 2" },
];

export const CURRENCY_OPTIONS = ["KES", "USD", "EUR", "GBP"];

export function formatSemester(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `Semester ${value}`;
}

export function formatYear(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `Year ${value}`;
}

/** Config for the three global "programme resource" collections (fees, hours, modules). */
export const RESOURCE_CONFIG = {
  fees: {
    base: "/api/programme-resources/fees",
    listPath: "/programmes/fees",
    singular: "fee",
    plural: "fees",
  },
  hours: {
    base: "/api/programme-resources/hours",
    listPath: "/programmes/hours",
    singular: "hour distribution",
    plural: "hour distributions",
  },
  modules: {
    base: "/api/programme-resources/modules",
    listPath: "/programmes/modules",
    singular: "module",
    plural: "modules",
  },
  subjects: {
    base: "/api/programme-resources/subjects",
    listPath: "/programmes/subjects",
    singular: "subject requirement",
    plural: "subject requirements",
  },
};

export async function fetchResourceList(kind, token, params = {}) {
  const cfg = RESOURCE_CONFIG[kind];
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const search = new URLSearchParams(cleanParams).toString();
  const res = await fetch(`${cfg.base}${search ? `?${search}` : ""}`, {
    headers: authHeaders(token),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || `Could not load ${cfg.plural}`);
  return json;
}

export async function fetchResourceOne(kind, id, token) {
  const cfg = RESOURCE_CONFIG[kind];
  const res = await fetch(`${cfg.base}/${id}`, { headers: authHeaders(token) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || `Could not load ${cfg.singular}`);
  return json.data;
}

export async function saveResource(kind, id, token, payload) {
  const cfg = RESOURCE_CONFIG[kind];
  const url = id ? `${cfg.base}/${id}` : cfg.base;
  const method = id ? "PUT" : "POST";
  const res = await fetch(url, {
    method,
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || `Could not save ${cfg.singular}`);
  return json.data;
}

export async function deleteResource(kind, id, token) {
  const cfg = RESOURCE_CONFIG[kind];
  const res = await fetch(`${cfg.base}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || `Could not delete ${cfg.singular}`);
  return json;
}

export const emptyFeeForm = () => ({
  programme_id: "",
  year_of_study: 1,
  semester: 1,
  amount: "",
  currency: "KES",
  label: "",
  sort_order: "",
});

export function feeToForm(row) {
  return {
    programme_id: row.programme_id || row.programme?.id || "",
    year_of_study: row.year_of_study ?? 1,
    semester: row.semester ?? 1,
    amount: row.amount ?? "",
    currency: row.currency || "KES",
    label: row.label || "",
    sort_order: row.sort_order ?? "",
  };
}

export const emptyHourForm = () => ({
  programme_id: "",
  nature: "",
  specific_nature: "",
  year_1_hours: "",
  year_2_hours: "",
  year_3_hours: "",
  total_hours: "",
  sort_order: "",
});

export function hourToForm(row) {
  return {
    programme_id: row.programme_id || row.programme?.id || "",
    nature: row.nature || "",
    specific_nature: row.specific_nature || "",
    year_1_hours: row.year_1_hours ?? "",
    year_2_hours: row.year_2_hours ?? "",
    year_3_hours: row.year_3_hours ?? "",
    total_hours: row.total_hours ?? "",
    sort_order: row.sort_order ?? "",
  };
}

export const emptyModuleForm = () => ({
  programme_id: "",
  code: "",
  name: "",
  hours: "",
  credits: "",
  semester: "",
  year_of_study: 1,
  sort_order: "",
});

export function moduleToForm(row) {
  return {
    programme_id: row.programme_id || row.programme?.id || "",
    code: row.code || "",
    name: row.name || "",
    hours: row.hours ?? "",
    credits: row.credits ?? "",
    semester: row.semester || "",
    year_of_study: row.year_of_study ?? 1,
    sort_order: row.sort_order ?? "",
  };
}

export const emptySubjectForm = () => ({
  programme_id: "",
  subject: "",
  minimum_grade: "",
  is_required: true,
  sort_order: "",
});

export function subjectToForm(row) {
  return {
    programme_id: row.programme_id || row.programme?.id || "",
    subject: row.subject || "",
    minimum_grade: row.minimum_grade || "",
    is_required: row.is_required !== false,
    sort_order: row.sort_order ?? "",
  };
}
