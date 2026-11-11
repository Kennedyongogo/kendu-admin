import {
  primaryGreen,
  primaryDark,
  navy,
  accentGold,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  fontBody,
  fontDisplay,
} from "../Users/usersShared";

export const dash = {
  primaryGreen,
  primaryDark,
  navy,
  accentGold,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  fontBody,
  fontDisplay,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const cardSx = {
  bgcolor: "var(--kd-surface)",
  border: "1px solid rgba(27,94,168,0.1)",
  borderRadius: "20px",
  boxShadow: "0 12px 36px -16px rgba(20,26,58,0.12)",
  overflow: "hidden",
};

export const barChartBaseSx = {
  "& .MuiChartsGrid-line": { stroke: "rgba(27,94,168,0.08)" },
  "& .MuiChartsAxis-line": { stroke: "rgba(27,94,168,0.2)" },
  "& .MuiChartsAxis-tick": { stroke: "rgba(27,94,168,0.2)" },
  "& .MuiChartsAxis-tickLabel": { fontFamily: fontBody },
};

export const STATUS_ORDER = [
  { key: "pending", label: "Pending", color: accentGold },
  { key: "under_review", label: "Under review", color: navy },
  { key: "accepted", label: "Accepted", color: primaryGreen },
  { key: "rejected", label: "Rejected", color: "#b91c1c" },
];

export function truncateLabel(text, max = 22) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export function formatRoleTitle(role) {
  if (!role) return "Dashboard";
  return String(role)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildFilterSummary({ programmeName, academicYear, departmentNames }) {
  const parts = [];
  if (programmeName) parts.push(`Programme: ${programmeName}`);
  if (academicYear) parts.push(`Academic year: ${academicYear}`);
  if (departmentNames?.length) parts.push(`Departments: ${departmentNames.join(", ")}`);
  return parts.length ? parts.join(" · ") : "Filters: All records";
}
