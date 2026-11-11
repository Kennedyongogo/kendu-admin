import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BrandPageLoader from "../Util/BrandPageLoader";
import { ROLE_DASHBOARD } from "./roleDashboardConfig.jsx";
import { CHART_RENDERERS } from "./chartBlocks";
import {
  DashboardShell,
  ProgrammeFilter,
  StatCard,
} from "./DashboardWidgets";
import { useDashboardStats } from "./useDashboardStats";
import { downloadDashboardReport } from "./exportDashboardPdf";
import { formatRoleTitle } from "./dashboardTheme";

export default function OfficeRoleDashboard({ role }) {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [exportingAll, setExportingAll] = useState(false);
  const config = ROLE_DASHBOARD[role] || ROLE_DASHBOARD.secretary;
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
  const roleLabel = formatRoleTitle(role);

  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      await downloadDashboardReport({
        section: "full",
        title: `${config.title} report`,
        programmeId,
      });
    } catch (err) {
      window.alert(err.message || "Could not export PDF");
    } finally {
      setExportingAll(false);
    }
  };

  if (loading && !stats) {
    return <BrandPageLoader message="Loading your dashboard…" />;
  }

  return (
    <DashboardShell
      title={config.title}
      subtitle=""
      icon={<DashboardIcon sx={{ fontSize: 28, color: "#fff" }} />}
      role={role}
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
        {config.cards.map((card, i) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={Number(school[card.key] ?? 0).toLocaleString()}
            hint={card.hint}
            accent={card.accent}
            onClick={() => navigate(card.path)}
            index={i}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {config.charts.map((chartKey, i) => {
          const Chart = CHART_RENDERERS[chartKey];
          if (!Chart) return null;
          return (
            <Chart
              key={chartKey}
              stats={stats}
              navigate={navigate}
              filterLabel={filterLabel || undefined}
              filterSummary={filterSummary}
              roleLabel={roleLabel}
              index={i}
            />
          );
        })}
      </Box>
    </DashboardShell>
  );
}
