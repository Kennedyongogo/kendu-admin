import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import { UsersHero } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  getPortalUser,
  pageShellSx,
} from "../Users/usersShared";
import DepartmentRegistrations from "./DepartmentRegistrations";

/**
 * Standalone registrations page for staff + admin.
 * Initial data load uses BrandPageLoader inside DepartmentRegistrations.
 */
export default function Registrations() {
  const actor = useMemo(() => getPortalUser(), []);
  const isAdmin = actor?.role === "admin";
  const isStaff = actor?.role === "staff";

  const [departments, setDepartments] = useState([]);

  const loadDepartments = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const token = getPortalToken();
      const res = await fetch("/api/departments?is_active=true&limit=100", {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setDepartments(Array.isArray(data.data) ? data.data : []);
      }
    } catch {
      setDepartments([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        icon={<HowToRegIcon />}
        title="Unit registrations"
        subtitle={
          isStaff
            ? "See students in your department programmes and whether they have enrolled in each unit."
            : "Browse programmes by department and track student unit enrollment status."
        }
      />

      <Box
        sx={{
          borderRadius: "20px",
          bgcolor: "var(--kd-surface)",
          border: "1px solid rgba(0,96,80,0.1)",
          boxShadow: "0 20px 48px -18px rgba(20,26,58,0.14)",
          overflow: "hidden",
          minHeight: 280,
        }}
      >
        <DepartmentRegistrations
          isAdmin={isAdmin}
          departments={departments}
          defaultDepartmentId={isStaff ? actor?.department_id || "" : ""}
        />
      </Box>
    </Box>
  );
}
