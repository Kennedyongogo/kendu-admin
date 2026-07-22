import { navy, primaryGreen } from "../Users/usersShared";

export const STATUS_META = {
  draft: { label: "Draft", bg: "rgba(30,40,88,0.08)", color: navy },
  pending: { label: "Pending approval", bg: "rgba(178,106,0,0.14)", color: "#b26a00" },
  approved: { label: "Approved", bg: "rgba(0,96,80,0.12)", color: primaryGreen },
  rejected: { label: "Rejected", bg: "rgba(185,28,28,0.1)", color: "#b91c1c" },
};

export function currentAcademicYear() {
  const now = new Date();
  const y = now.getFullYear();
  const month = now.getMonth();
  if (month >= 8) return `${y}/${y + 1}`;
  return `${y - 1}/${y}`;
}

export function formatSlotWhen(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPeriodRange(start, end) {
  if (!start && !end) return null;
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return start ? fmt(start) : fmt(end);
}

export function cohortLabel(row, semesterLabels = {}) {
  const sem =
    semesterLabels[row.semester] || `Semester ${row.semester}`;
  return `Year ${row.year_of_study} · ${sem}`;
}

export function slotDateParts(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString("en-KE", { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString("en-KE", { month: "short" }),
    time: d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function formatSlotTimeRange(startIso, endIso) {
  if (!startIso) return "—";
  const start = new Date(startIso);
  const startStr = start.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
  if (!endIso) return startStr;
  const endStr = new Date(endIso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
  return `${startStr} – ${endStr}`;
}

/** Download exam timetable PDF (staff / admin). */
export async function downloadExamTimetablePdf(periodId, title, token) {
  const res = await fetch(`/api/exam-timetables/${periodId}/pdf`, {
    headers: {
      Accept: "application/pdf",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let message = "Could not download PDF";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* binary or empty */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const safeSlug =
    String(title || "exam-timetable")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 72) || "exam-timetable";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `KASMS-Exam-Timetable-${safeSlug}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
