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
