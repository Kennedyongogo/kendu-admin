import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import BrandPageLoader from "../components/Util/BrandPageLoader";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  authJsonHeaders,
  pageShellSx,
  primaryGreen,
  primaryDark,
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

const cardSx = {
  bgcolor: "var(--kd-surface)",
  border: "1px solid rgba(0,96,80,0.1)",
  borderRadius: "20px",
  boxShadow: "0 12px 36px -16px rgba(20,26,58,0.12)",
  overflow: "hidden",
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
    hint: "Admins, staff and students",
    icon: <PeopleIcon />,
    path: "/users",
    accent: primaryGreen,
  },
  {
    key: "admin",
    label: "Admins",
    hint: "Administrator accounts",
    icon: <AdminPanelSettingsIcon />,
    path: "/users",
    accent: primaryGreen,
  },
  {
    key: "staff",
    label: "Staff",
    hint: "Teaching and support staff",
    icon: <BadgeIcon />,
    path: "/users",
    accent: navy,
  },
  {
    key: "student",
    label: "Students",
    hint: "Enrolled students",
    icon: <SchoolIcon />,
    path: "/users",
    accent: "#8a6d1c",
  },
  {
    key: "programmes",
    label: "Programmes",
    hint: "Academic programmes offered",
    icon: <MenuBookIcon />,
    path: "/programmes",
    accent: primaryGreen,
  },
  {
    key: "admissions_total",
    label: "Admissions",
    hint: "Applications received to date",
    icon: <AssignmentIndIcon />,
    path: "/admissions",
    accent: navy,
  },
];

function StatCard({ icon, label, value, hint, accent, onClick, index = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      sx={{
        ...cardSx,
        p: 2.25,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              boxShadow: "0 20px 44px -18px rgba(20,26,58,0.22)",
            }
          : undefined,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accent}, ${accentGold})`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: fontBody,
              color: textMuted,
              fontWeight: 700,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: fontDisplay,
              color: textPrimary,
              fontWeight: 700,
              fontSize: { xs: "1.55rem", xl: "1.85rem" },
              letterSpacing: "-0.02em",
              mt: 0.5,
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.74rem", mt: 0.35 }}>
            {hint}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: `linear-gradient(145deg, ${accent} 0%, ${primaryDark} 130%)`,
            boxShadow: `0 8px 20px -6px ${accent}66`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

function ViewAllButton({ label = "View all", onClick }) {
  return (
    <Button
      onClick={onClick}
      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "1rem !important" }} />}
      sx={{
        textTransform: "none",
        fontFamily: fontBody,
        fontWeight: 700,
        fontSize: "0.8rem",
        color: primaryGreen,
        borderRadius: "10px",
        px: 1.5,
        bgcolor: "rgba(0,96,80,0.07)",
        flexShrink: 0,
        "&:hover": { bgcolor: "rgba(0,96,80,0.14)" },
      }}
    >
      {label}
    </Button>
  );
}

function ChartCard({ title, subtitle, actions, children, index = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      sx={{ ...cardSx, p: 0 }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={1.5}
        sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid rgba(0,96,80,0.08)", bgcolor: warmCream }}
      >
        <Box>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.08rem" }}>
            {title}
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.74rem" }}>{subtitle}</Typography>
        </Box>
        {actions || null}
      </Stack>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

function EmptyChart({ message }) {
  return (
    <Stack sx={{ height: 300 }} alignItems="center" justifyContent="center" spacing={1}>
      <InsightsRoundedIcon sx={{ fontSize: 42, color: "rgba(0,96,80,0.25)" }} />
      <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.85rem" }}>{message}</Typography>
    </Stack>
  );
}

const barChartBaseSx = {
  "& .MuiChartsGrid-line": { stroke: "rgba(0,96,80,0.08)" },
  "& .MuiChartsAxis-line": { stroke: "rgba(0,96,80,0.2)" },
  "& .MuiChartsAxis-tick": { stroke: "rgba(0,96,80,0.2)" },
  "& .MuiChartsAxis-tickLabel": { fontFamily: fontBody },
};

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

  const statusPieData = useMemo(
    () =>
      STATUS_ORDER.map((s, index) => ({
        id: index,
        label: s.label,
        value: Number(stats.admissions_by_status[s.key] || 0),
        color: s.color,
      })).filter((row) => row.value > 0),
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(6, 1fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        {CARDS.map((card, i) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={Number(stats[card.key] || 0).toLocaleString()}
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
          gridTemplateColumns: { xs: "1fr", xl: "minmax(320px, 0.8fr) minmax(0, 1.5fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <ChartCard
          index={1}
          title="Applications by status"
          subtitle={`${Number(stats.admissions_total || 0).toLocaleString()} applications in the pipeline`}
          actions={<ViewAllButton onClick={() => navigate("/admissions")} />}
        >
          {statusPieData.length ? (
            <>
              <PieChart
                height={250}
                series={[{
                  data: statusPieData,
                  innerRadius: 60,
                  outerRadius: 92,
                  paddingAngle: 3,
                  cornerRadius: 5,
                  highlightScope: { faded: "global", highlighted: "item" },
                }]}
                margin={{ top: 15, bottom: 15, left: 15, right: 15 }}
                slotProps={{ legend: { hidden: true } }}
              />
              <Stack direction="row" flexWrap="wrap" justifyContent="center" sx={{ gap: 1, mt: 1 }}>
                {STATUS_ORDER.map((s) => (
                  <Stack key={s.key} direction="row" spacing={0.7} alignItems="center">
                    <Box sx={{ width: 9, height: 9, borderRadius: "3px", bgcolor: s.color }} />
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: textSecondary, fontWeight: 600 }}>
                      {s.label} · {Number(stats.admissions_by_status[s.key] || 0)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          ) : (
            <EmptyChart message="No admission applications yet." />
          )}
        </ChartCard>

        <ChartCard
          index={2}
          title="Applications by programme"
          subtitle="Where applicants want to study"
          actions={<ViewAllButton onClick={() => navigate("/admissions")} />}
        >
          {programmeDataset.length === 0 ? (
            <EmptyChart message="No programme applications yet." />
          ) : (
            <BarChart
              dataset={programmeDataset}
              height={300}
              xAxis={[{
                dataKey: "programme",
                scaleType: "band",
                tickLabelStyle: {
                  fontFamily: fontBody,
                  fontSize: 11,
                  fontWeight: 600,
                  fill: textSecondary,
                },
              }]}
              yAxis={[{
                label: "Applications",
                min: 0,
                max: Math.ceil(maxProgrammeCount * 1.15) || 1,
                tickLabelStyle: { fontFamily: fontBody, fontSize: 11, fill: textMuted },
                labelStyle: { fontFamily: fontBody, fontSize: 12, fill: textMuted },
              }]}
              series={[{
                dataKey: "count",
                label: "Applications",
                color: navy,
                valueFormatter: (v) => `${v}`,
              }]}
              borderRadius={8}
              grid={{ horizontal: true }}
              margin={{ top: 20, bottom: 50, left: 50, right: 16 }}
              slotProps={{ legend: { hidden: true } }}
              sx={barChartBaseSx}
            />
          )}
        </ChartCard>
      </Box>

      <ChartCard
        index={3}
        title="Students by programme"
        subtitle={`${Number(stats.student || 0).toLocaleString()} enrolled students`}
        actions={<ViewAllButton onClick={() => navigate("/users")} />}
      >
        {studentsProgrammeDataset.length === 0 ? (
          <EmptyChart message="No enrolled students with a programme yet." />
        ) : (
          <BarChart
            dataset={studentsProgrammeDataset}
            height={320}
            xAxis={[{
              dataKey: "programme",
              scaleType: "band",
              tickLabelStyle: {
                fontFamily: fontBody,
                fontSize: 11,
                fontWeight: 600,
                fill: textSecondary,
              },
            }]}
            yAxis={[{
              label: "Students",
              min: 0,
              max: Math.ceil(maxStudentsProgrammeCount * 1.15) || 1,
              tickLabelStyle: { fontFamily: fontBody, fontSize: 11, fill: textMuted },
              labelStyle: { fontFamily: fontBody, fontSize: 12, fill: textMuted },
            }]}
            series={[{
              dataKey: "count",
              label: "Students",
              color: primaryGreen,
              valueFormatter: (v) => `${v}`,
            }]}
            borderRadius={8}
            grid={{ horizontal: true }}
            margin={{ top: 20, bottom: 50, left: 50, right: 16 }}
            slotProps={{ legend: { hidden: true } }}
            sx={barChartBaseSx}
          />
        )}
      </ChartCard>
    </Box>
  );
}
