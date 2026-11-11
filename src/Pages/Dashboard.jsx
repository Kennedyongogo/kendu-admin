import React from "react";
import { getPortalUser } from "../auth/portalAuth";
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import OfficeRoleDashboard from "../components/Dashboard/OfficeRoleDashboard";
import { ROLE_DASHBOARD } from "../components/Dashboard/roleDashboardConfig.jsx";

/**
 * Role-aware school dashboard.
 * Admin keeps the expanded school-wide view; every other office gets a
 * requirements-aligned dashboard with PDF export on cards/charts.
 */
export default function Dashboard() {
  const user = getPortalUser();
  const role = user?.role || "admin";

  if (role === "admin") {
    return <AdminDashboard />;
  }

  if (ROLE_DASHBOARD[role]) {
    return <OfficeRoleDashboard role={role} />;
  }

  // Fallback for any portal role without a dedicated layout
  return <OfficeRoleDashboard role="secretary" />;
}
