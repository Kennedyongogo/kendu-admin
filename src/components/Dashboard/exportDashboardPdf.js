import { getPortalToken } from "../Users/usersShared";

/**
 * Download a server-rendered dashboard PDF.
 * Filters currently selected in the UI are sent as query params so the report matches the screen.
 */
export async function downloadDashboardReport({
  section = "full",
  title = "",
  programmeId = "",
  academicYear = "",
} = {}) {
  const token = getPortalToken();
  if (!token) throw new Error("Please sign in again.");

  const params = new URLSearchParams();
  params.set("section", section || "full");
  if (title) params.set("title", title);
  if (programmeId) params.set("programme_id", programmeId);
  if (academicYear) params.set("academic_year", academicYear);

  const res = await fetch(`/api/dashboard/report.pdf?${params.toString()}`, {
    headers: {
      Accept: "application/pdf",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let message = "Could not export PDF report";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* binary failure */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] || `kendu-dashboard-${section || "full"}.pdf`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return filename;
}

/** @deprecated use downloadDashboardReport — kept so old imports fail loudly if missed */
export async function exportElementToPdf() {
  throw new Error("Client PDF capture was replaced by API report export");
}
