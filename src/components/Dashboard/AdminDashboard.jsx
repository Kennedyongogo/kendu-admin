import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BrandPageLoader from "../Util/BrandPageLoader";
import { getPortalUser } from "../../auth/portalAuth";
import { ADMIN_EXTRA_CARDS } from "./roleDashboardConfig.jsx";
import {
  AdmissionsProgrammeChart,
  AdmissionsStatusChart,
  LibraryLoansChart,
  OfficeRolesChart,
  RegistrationsStatusChart,
  StudentsBoardingChart,
  StudentsGenderChart,
  StudentsProgrammeChart,
} from "./chartBlocks";
import {
  DashboardShell,
  ProgrammeFilter,
  StatCard,
} from "./DashboardWidgets";
import { useDashboardStats } from "./useDashboardStats";
import { downloadDashboardReport } from "./exportDashboardPdf";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getPortalUser();
  const reportRef = useRef(null);
  const [exportingAll, setExportingAll] = useState(false);
  const {
    loading,
    error,
    setError,
    stats,
    programmeId,
    setProgrammeId,
    filterMeta,
    filterSummary,
    filterLabel,
  } = useDashboardStats();

  const school = stats?.school || {};
  const cardValues = {
    ...school,
    total_users: school.total_users,
    admins: school.admins,
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      await downloadDashboardReport({
        section: "full",
        title: "Admin school dashboard report",
        programmeId,
      });
    } catch (err) {
      window.alert(err.message || "Could not export PDF");
    } finally {
      setExportingAll(false);
    }
  };

  if (loading && !stats) {
    return <BrandPageLoader message="Loading dashboard…" />;
  }

  const chartProps = {
    stats,
    navigate,
    filterLabel: filterLabel || undefined,
    filterSummary,
    roleLabel: "Admin",
  };

  return (
    <DashboardShell
      title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
      subtitle=""
      icon={<DashboardIcon sx={{ fontSize: 28, color: "#fff" }} />}
      role="admin"
      error={error}
      onClearError={() => setError(null)}
      filters={filterMeta}
      filterControls={
        <ProgrammeFilter
          value={programmeId}
          options={stats?.filter_options?.programmes || []}
          onChange={setProgrammeId}
        />
      }
      onExportAll={handleExportAll}
      exportingAll={exportingAll}
      reportRef={reportRef}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        {ADMIN_EXTRA_CARDS.map((card, i) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={Number(cardValues[card.key] ?? 0).toLocaleString()}
            hint={card.hint}
            accent={card.accent}
            onClick={() => navigate(card.path.split("?")[0])}
            index={i}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(320px, 0.85fr) minmax(0, 1.4fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <AdmissionsStatusChart {...chartProps} index={1} />
        <AdmissionsProgrammeChart {...chartProps} index={2} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <StudentsProgrammeChart {...chartProps} index={3} />
        <OfficeRolesChart {...chartProps} index={4} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <StudentsBoardingChart {...chartProps} index={5} />
        <StudentsGenderChart {...chartProps} index={6} />
        <RegistrationsStatusChart {...chartProps} index={7} />
      </Box>

      <Box sx={{ mt: 2 }}>
        <LibraryLoansChart {...chartProps} index={8} />
      </Box>
    </DashboardShell>
  );
}
