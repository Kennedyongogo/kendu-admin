export const ADMISSION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export const ADMISSION_STATUS_TABS = [
  { label: "All", value: null },
  ...ADMISSION_STATUSES.map((s) => ({ label: s.label, value: s.value })),
];

export function formatAdmissionStatus(status) {
  const hit = ADMISSION_STATUSES.find((s) => s.value === status);
  return hit?.label || status || "—";
}

export function admissionStatusChipSx(status) {
  switch (status) {
    case "accepted":
      return { bg: "rgba(21,128,61,0.12)", color: "#15803d" };
    case "rejected":
      return { bg: "rgba(185,28,28,0.1)", color: "#b91c1c" };
    case "under_review":
      return { bg: "rgba(30,40,88,0.1)", color: "#1e2858" };
    case "pending":
    default:
      return { bg: "rgba(200,168,64,0.2)", color: "#8a7020" };
  }
}

export function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Short status for the Setup Admissions button (shows open and close timing). */
export function admissionWindowLabel(window) {
  if (!window) return "Unknown";
  if (window.is_open) {
    return window.ends_at ? `Open · closes ${formatDateTime(window.ends_at)}` : "Open";
  }
  switch (window.reason) {
    case "not_started":
      return window.starts_at
        ? `Closed · opens ${formatDateTime(window.starts_at)}`
        : "Closed · scheduled";
    case "ended":
      return window.ends_at
        ? `Closed · ended ${formatDateTime(window.ends_at)}`
        : "Closed · ended";
    case "not_configured":
    case "invalid_range":
      return "Closed · needs dates";
    case "disabled":
    default:
      return "Closed";
  }
}

export function admissionWindowChipColor(window) {
  if (!window) return "default";
  if (window.is_open) return "success";
  if (window.reason === "not_started") return "warning";
  return "default";
}
