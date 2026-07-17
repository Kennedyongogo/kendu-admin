import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Alert, Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import BrandPageLoader from "../components/Util/BrandPageLoader";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  authJsonHeaders,
  pageShellSx,
  primaryGreen,
  navy,
  textPrimary,
  textMuted,
  textSecondary,
  accentGold,
  warmCream,
  fontBody,
  fontDisplay,
} from "../components/Users/usersShared";
import { UsersHero } from "../components/Users/usersUi";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const STATUS_ORDER = [
  { key: "pending", label: "Pending", color: accentGold },
  { key: "under_review", label: "Under review", color: navy },
  { key: "accepted", label: "Accepted", color: primaryGreen },
  { key: "rejected", label: "Rejected", color: "#b91c1c" },
];

function truncateLabel(text, max = 22) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

const CARDS = [
  {
    key: "total_users",
    label: "Total users",
    icon: <PeopleIcon />,
    path: "/users",
    accent: primaryGreen,
    tint: "rgba(0,96,80,0.1)",
  },
  {
    key: "admin",
    label: "Admins",
    icon: <AdminPanelSettingsIcon />,
    path: "/users",
    accent: primaryGreen,
    tint: "rgba(0,96,80,0.1)",
  },
  {
    key: "staff",
    label: "Staff",
    icon: <BadgeIcon />,
    path: "/users",
    accent: navy,
    tint: "rgba(30,40,88,0.1)",
  },
  {
    key: "student",
    label: "Students",
    icon: <SchoolIcon />,
    path: "/users",
    accent: accentGold,
    tint: "rgba(200,168,64,0.18)",
  },
  {
    key: "programmes",
    label: "Programmes",
    icon: <MenuBookIcon />,
    path: "/programmes",
    accent: primaryGreen,
    tint: "rgba(0,96,80,0.1)",
  },
  {
    key: "admissions_total",
    label: "Admissions",
    icon: <AssignmentIndIcon />,
    path: "/admissions",
    accent: navy,
    tint: "rgba(30,40,88,0.1)",
  },
];

function StatCard({ icon, label, value, accent, tint, onClick, delay = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      sx={{
        width: "100%",
        minWidth: 0,
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: "20px",
        bgcolor: "#fff",
        border: "1px solid rgba(0,96,80,0.1)",
        boxShadow: "0 14px 36px -16px rgba(20,26,58,0.14)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              boxShadow: "0 20px 44px -14px rgba(20,26,58,0.2)",
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -28,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: tint,
        }}
      />
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          bgcolor: tint,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          position: "relative",
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily: fontBody,
          fontSize: "0.74rem",
          fontWeight: 700,
          color: textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          position: "relative",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: fontDisplay,
          fontWeight: 800,
          fontSize: { xs: "2rem", sm: "2.35rem" },
          color: textPrimary,
          lineHeight: 1.1,
          mt: 0.75,
          position: "relative",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_users: 0,
    admin: 0,
    staff: 0,
    student: 0,
    programmes: 0,
    admissions_total: 0,
    admissions_by_status: {
      pending: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
    },
    admissions_by_programme: [],
    students_by_programme: [],
  });

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const loadStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/stats", {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load dashboard stats.");
      }

      setStats({
        total_users: data.data?.total_users ?? 0,
        admin: data.data?.roles?.admin ?? 0,
        staff: data.data?.roles?.staff ?? 0,
        student: data.data?.roles?.student ?? 0,
        programmes: data.data?.programmes ?? 0,
        admissions_total: data.data?.admissions?.total ?? 0,
        admissions_by_status: {
          pending: data.data?.admissions?.by_status?.pending ?? 0,
          under_review: data.data?.admissions?.by_status?.under_review ?? 0,
          accepted: data.data?.admissions?.by_status?.accepted ?? 0,
          rejected: data.data?.admissions?.by_status?.rejected ?? 0,
        },
        admissions_by_programme: Array.isArray(data.data?.admissions?.by_programme)
          ? data.data.admissions.by_programme
          : [],
        students_by_programme: Array.isArray(data.data?.students?.by_programme)
          ? data.data.students.by_programme
          : [],
      });
    } catch (err) {
      setError(err.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const chartDataset = useMemo(
    () =>
      STATUS_ORDER.map((s) => ({
        status: s.label,
        count: Number(stats.admissions_by_status[s.key] || 0),
        color: s.color,
      })),
    [stats.admissions_by_status]
  );

  const programmeDataset = useMemo(
    () =>
      (stats.admissions_by_programme || []).map((row) => ({
        programme: truncateLabel(row.name || "Unknown", 22),
        count: Number(row.count) || 0,
      })),
    [stats.admissions_by_programme]
  );

  const studentsProgrammeDataset = useMemo(
    () =>
      (stats.students_by_programme || []).map((row) => ({
        programme: truncateLabel(row.name || "Unknown", 22),
        count: Number(row.count) || 0,
      })),
    [stats.students_by_programme]
  );

  const maxCount = Math.max(1, ...chartDataset.map((d) => d.count));
  const maxProgrammeCount = Math.max(1, ...programmeDataset.map((d) => d.count), 0);
  const maxStudentsProgrammeCount = Math.max(
    1,
    ...studentsProgrammeDataset.map((d) => d.count),
    0
  );

  if (loading) {
    return <BrandPageLoader message="Loading dashboard…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
        subtitle="Overview of users, programmes, and admissions at Kendu Adventist School of Medical Sciences"
        icon={<DashboardIcon sx={{ fontSize: 28, color: "#fff" }} />}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {CARDS.slice(0, 4).map((card, i) => (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={Number(stats[card.key] || 0).toLocaleString()}
              accent={card.accent}
              tint={card.tint}
              onClick={() => navigate(card.path)}
              delay={i}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {CARDS.slice(4).map((card, i) => (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={Number(stats[card.key] || 0).toLocaleString()}
              accent={card.accent}
              tint={card.tint}
              onClick={() => navigate(card.path)}
              delay={i + 4}
            />
          ))}
        </Box>
      </Box>

      {/* Edge-to-edge admissions status chart */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        sx={{
          mx: { xs: -1.5, sm: -2, md: -3 },
          width: { xs: "calc(100% + 24px)", sm: "calc(100% + 32px)", md: "calc(100% + 48px)" },
          bgcolor: "#fff",
          borderTop: "1px solid rgba(0,96,80,0.1)",
          borderBottom: "1px solid rgba(0,96,80,0.1)",
          background: `linear-gradient(180deg, ${warmCream} 0%, #fff 40%, rgba(0,96,80,0.03) 100%)`,
          px: { xs: 1.5, sm: 2.5, md: 3 },
          py: { xs: 2.5, sm: 3.25 },
        }}
      >
        <StackHeader
          eyebrow="Admissions pipeline"
          title="Applications by status"
          total={stats.admissions_total}
          onOpen={() => navigate("/admissions")}
        />

        <Box sx={{ width: "100%", height: { xs: 280, sm: 340 }, mt: 1 }}>
          <BarChart
            dataset={chartDataset}
            xAxis={[
              {
                dataKey: "status",
                scaleType: "band",
                tickLabelStyle: {
                  fontFamily: fontBody,
                  fontSize: 12,
                  fontWeight: 600,
                  fill: textSecondary,
                },
              },
            ]}
            yAxis={[
              {
                label: "Applications",
                min: 0,
                max: Math.ceil(maxCount * 1.15) || 1,
                tickLabelStyle: {
                  fontFamily: fontBody,
                  fontSize: 11,
                  fill: textMuted,
                },
                labelStyle: {
                  fontFamily: fontBody,
                  fontSize: 12,
                  fill: textMuted,
                },
              },
            ]}
            series={[
              {
                dataKey: "count",
                label: "Applications",
                color: primaryGreen,
                valueFormatter: (v) => `${v}`,
              },
            ]}
            borderRadius={10}
            grid={{ horizontal: true }}
            margin={{ top: 20, bottom: 40, left: 50, right: 16 }}
            slotProps={{
              legend: { hidden: true },
            }}
            sx={{
              width: "100%",
              height: "100%",
              "& .MuiChartsGrid-line": { stroke: "rgba(0,96,80,0.1)" },
              "& .MuiChartsAxis-line": { stroke: "rgba(0,96,80,0.2)" },
              "& .MuiChartsAxis-tick": { stroke: "rgba(0,96,80,0.2)" },
            }}
          />
        </Box>

        <Box
          sx={{
            mt: { xs: 3.5, sm: 4 },
            pt: { xs: 3, sm: 3.5 },
            borderTop: "1px solid rgba(0,96,80,0.12)",
          }}
        >
          <StackHeader
            eyebrow="Admissions pipeline"
            title="Applications by programme"
            total={stats.admissions_total}
            onOpen={() => navigate("/admissions")}
          />

          {programmeDataset.length === 0 ? (
            <Typography
              sx={{
                mt: 2,
                fontFamily: fontBody,
                color: textMuted,
                fontSize: "0.95rem",
              }}
            >
              No programme applications yet.
            </Typography>
          ) : (
            <Box sx={{ width: "100%", height: { xs: 300, sm: 360 }, mt: 1 }}>
              <BarChart
                dataset={programmeDataset}
                xAxis={[
                  {
                    dataKey: "programme",
                    scaleType: "band",
                    tickLabelStyle: {
                      fontFamily: fontBody,
                      fontSize: 11,
                      fontWeight: 600,
                      fill: textSecondary,
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: "Applications",
                    min: 0,
                    max: Math.ceil(maxProgrammeCount * 1.15) || 1,
                    tickLabelStyle: {
                      fontFamily: fontBody,
                      fontSize: 11,
                      fill: textMuted,
                    },
                    labelStyle: {
                      fontFamily: fontBody,
                      fontSize: 12,
                      fill: textMuted,
                    },
                  },
                ]}
                series={[
                  {
                    dataKey: "count",
                    label: "Applications",
                    color: navy,
                    valueFormatter: (v) => `${v}`,
                  },
                ]}
                borderRadius={10}
                grid={{ horizontal: true }}
                margin={{ top: 20, bottom: 56, left: 50, right: 16 }}
                slotProps={{
                  legend: { hidden: true },
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  "& .MuiChartsGrid-line": { stroke: "rgba(0,96,80,0.1)" },
                  "& .MuiChartsAxis-line": { stroke: "rgba(0,96,80,0.2)" },
                  "& .MuiChartsAxis-tick": { stroke: "rgba(0,96,80,0.2)" },
                }}
              />
            </Box>
          )}
        </Box>

        <Box
          sx={{
            mt: { xs: 3.5, sm: 4 },
            pt: { xs: 3, sm: 3.5 },
            borderTop: "1px solid rgba(0,96,80,0.12)",
          }}
        >
          <StackHeader
            eyebrow="Student enrolment"
            title="Students by programme"
            total={stats.student}
            onOpen={() => navigate("/users")}
          />

          {studentsProgrammeDataset.length === 0 ? (
            <Typography
              sx={{
                mt: 2,
                fontFamily: fontBody,
                color: textMuted,
                fontSize: "0.95rem",
              }}
            >
              No enrolled students with a programme yet.
            </Typography>
          ) : (
            <Box sx={{ width: "100%", height: { xs: 300, sm: 360 }, mt: 1 }}>
              <BarChart
                dataset={studentsProgrammeDataset}
                xAxis={[
                  {
                    dataKey: "programme",
                    scaleType: "band",
                    tickLabelStyle: {
                      fontFamily: fontBody,
                      fontSize: 11,
                      fontWeight: 600,
                      fill: textSecondary,
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: "Students",
                    min: 0,
                    max: Math.ceil(maxStudentsProgrammeCount * 1.15) || 1,
                    tickLabelStyle: {
                      fontFamily: fontBody,
                      fontSize: 11,
                      fill: textMuted,
                    },
                    labelStyle: {
                      fontFamily: fontBody,
                      fontSize: 12,
                      fill: textMuted,
                    },
                  },
                ]}
                series={[
                  {
                    dataKey: "count",
                    label: "Students",
                    color: accentGold,
                    valueFormatter: (v) => `${v}`,
                  },
                ]}
                borderRadius={10}
                grid={{ horizontal: true }}
                margin={{ top: 20, bottom: 56, left: 50, right: 16 }}
                slotProps={{
                  legend: { hidden: true },
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  "& .MuiChartsGrid-line": { stroke: "rgba(0,96,80,0.1)" },
                  "& .MuiChartsAxis-line": { stroke: "rgba(0,96,80,0.2)" },
                  "& .MuiChartsAxis-tick": { stroke: "rgba(0,96,80,0.2)" },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function StackHeader({ eyebrow, title, total, onOpen }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 1.5,
        mb: 1,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: fontBody,
            fontSize: "0.72rem",
            fontWeight: 700,
            color: textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {eyebrow}
        </Typography>
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 800,
            fontSize: { xs: "1.35rem", sm: "1.55rem" },
            color: textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        onClick={onOpen}
        sx={{
          cursor: "pointer",
          px: 1.75,
          py: 1,
          borderRadius: "12px",
          bgcolor: "rgba(0,96,80,0.08)",
          border: "1px solid rgba(0,96,80,0.12)",
          "&:hover": { bgcolor: "rgba(0,96,80,0.14)" },
        }}
      >
        <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: primaryGreen, fontSize: "0.85rem" }}>
          {Number(total || 0).toLocaleString()} total · View all
        </Typography>
      </Box>
    </Box>
  );
}
