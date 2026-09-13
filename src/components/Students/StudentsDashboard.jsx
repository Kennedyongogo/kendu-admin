import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import {
  BedOutlined as BoarderIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  PeopleAlt as PeopleIcon,
  PersonOffOutlined as InactiveIcon,
  ToggleOn as ActiveIcon,
  WbSunnyOutlined as DayScholarIcon,
} from "@mui/icons-material";
import { BarChart } from "@mui/x-charts/BarChart";
import { motion } from "framer-motion";
import {
  accentGold,
  authJsonHeaders,
  fontBody,
  fontDisplay,
  getPortalToken,
  navy,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { fadeUp } from "../Users/usersUi";

const barChartBaseSx = {
  "& .MuiChartsGrid-line": { stroke: "rgba(27,94,168,0.08)" },
  "& .MuiChartsAxis-line": { stroke: "rgba(27,94,168,0.2)" },
  "& .MuiChartsAxis-tick": { stroke: "rgba(27,94,168,0.2)" },
  "& .MuiChartsAxis-tickLabel": { fontFamily: fontBody },
};

function StatTile({ label, value, hint, icon, accent, delay = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        p: 2.25,
        minHeight: 118,
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(27,94,168,0.1)",
        boxShadow: "0 16px 40px -18px rgba(20,26,58,0.14)",
        backgroundImage: `radial-gradient(ellipse 80% 70% at 100% 0%, ${accent}22 0%, transparent 55%)`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
        <Box>
          <Typography
            sx={{
              fontFamily: fontBody,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: textMuted,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: "2rem",
              lineHeight: 1,
              color: textPrimary,
            }}
          >
            {Number(value || 0).toLocaleString()}
          </Typography>
          {hint ? (
            <Typography sx={{ mt: 0.75, fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary }}>
              {hint}
            </Typography>
          ) : null}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            bgcolor: `${accent}18`,
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

function ChartPanel({ title, subtitle, children, delay = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      sx={{
        borderRadius: "22px",
        overflow: "hidden",
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(27,94,168,0.1)",
        boxShadow: "0 18px 48px -20px rgba(20,26,58,0.16)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={1}
        sx={{
          px: 2.5,
          py: 1.85,
          bgcolor: warmCream,
          borderBottom: "1px solid rgba(27,94,168,0.08)",
        }}
      >
        <Box>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.12rem" }}>
            {title}
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.76rem" }}>{subtitle}</Typography>
        </Box>
      </Stack>
      <Box sx={{ p: { xs: 1.5, sm: 2.25 } }}>{children}</Box>
    </Box>
  );
}

function EmptyState({ message }) {
  return (
    <Stack sx={{ height: 300 }} alignItems="center" justifyContent="center" spacing={1}>
      <PeopleIcon sx={{ fontSize: 42, color: "rgba(27,94,168,0.28)" }} />
      <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.85rem" }}>{message}</Typography>
    </Stack>
  );
}

function BreakdownRow({ label, count, total, color, icon }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "14px",
        bgcolor: warmCream,
        border: "1px solid rgba(27,94,168,0.08)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ color, display: "grid", placeItems: "center" }}>{icon}</Box>
          <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, fontSize: "0.88rem" }}>
            {label}
          </Typography>
        </Stack>
        <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textSecondary, fontSize: "0.82rem" }}>
          {count.toLocaleString()} · {pct}%
        </Typography>
      </Stack>
      <Box
        sx={{
          mt: 1.1,
          height: 8,
          borderRadius: 999,
          bgcolor: "rgba(27,94,168,0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: "width 0.45s ease",
          }}
        />
      </Box>
    </Box>
  );
}

export default function StudentsDashboard({ onOpenList }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    gender: [],
    boarding: [],
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getPortalToken();
      const res = await fetch("/api/users/students/dashboard", {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load dashboard");
      setStats({
        total: data.data?.total || 0,
        active: data.data?.active || 0,
        inactive: data.data?.inactive || 0,
        gender: Array.isArray(data.data?.gender) ? data.data.gender : [],
        boarding: Array.isArray(data.data?.boarding) ? data.data.boarding : [],
      });
    } catch (err) {
      setError(err.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const genderDataset = useMemo(
    () =>
      (stats.gender || [])
        .filter((row) => row.key !== "unspecified" || row.count > 0)
        .map((row) => ({ label: row.label, count: Number(row.count) || 0, key: row.key })),
    [stats.gender]
  );

  const boardingDataset = useMemo(
    () =>
      (stats.boarding || [])
        .filter((row) => row.key !== "unspecified" || row.count > 0)
        .map((row) => ({ label: row.label, count: Number(row.count) || 0, key: row.key })),
    [stats.boarding]
  );

  const maxGender = Math.max(1, ...genderDataset.map((r) => r.count));
  const maxBoarding = Math.max(1, ...boardingDataset.map((r) => r.count));
  const genderTotal = genderDataset.reduce((sum, row) => sum + row.count, 0);
  const boardingTotal = boardingDataset.reduce((sum, row) => sum + row.count, 0);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
        <CircularProgress size={34} sx={{ color: primaryGreen }} />
        <Typography sx={{ mt: 1.5, fontFamily: fontBody, color: textMuted, fontSize: "0.85rem" }}>
          Loading student insights…
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: "18px",
          border: "1px solid rgba(180,35,24,0.2)",
          bgcolor: "rgba(180,35,24,0.06)",
        }}
      >
        <Typography sx={{ fontFamily: fontBody, color: "#b42318", fontWeight: 600 }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box
        component={motion.div}
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        sx={{
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(27,94,168,0.12)",
          background: `linear-gradient(135deg, ${navy} 0%, ${primaryGreen} 58%, ${accentGold} 140%)`,
          boxShadow: "0 24px 56px -24px rgba(20,26,58,0.45)",
          color: "#fff",
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "flex-end" }}
          spacing={2}
        >
          <Box sx={{ maxWidth: 560 }}>
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.78,
              }}
            >
              Enrolment pulse
            </Typography>
            <Typography sx={{ mt: 0.75, fontFamily: fontDisplay, fontWeight: 700, fontSize: { xs: "1.7rem", md: "2rem" } }}>
              {stats.total.toLocaleString()} students on roll
            </Typography>
            <Typography sx={{ mt: 0.75, fontFamily: fontBody, fontSize: "0.92rem", opacity: 0.88, lineHeight: 1.5 }}>
              Live breakdown by gender and boarding status across the school.
            </Typography>
          </Box>
          <Box
            component="button"
            type="button"
            onClick={onOpenList}
            sx={{
              alignSelf: { xs: "stretch", md: "auto" },
              border: "1px solid rgba(255,255,255,0.35)",
              bgcolor: "rgba(255,255,255,0.12)",
              color: "#fff",
              borderRadius: "14px",
              px: 2.25,
              py: 1.2,
              fontFamily: fontBody,
              fontWeight: 700,
              fontSize: "0.86rem",
              cursor: "pointer",
              backdropFilter: "blur(6px)",
              transition: "background 0.2s ease",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            Browse students
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.75,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        <StatTile
          label="Total students"
          value={stats.total}
          hint="All enrolled accounts"
          icon={<PeopleIcon />}
          accent={primaryGreen}
          delay={0}
        />
        <StatTile
          label="Active"
          value={stats.active}
          hint="Can sign in"
          icon={<ActiveIcon />}
          accent="#2e7d32"
          delay={1}
        />
        <StatTile
          label="Inactive"
          value={stats.inactive}
          hint="Access paused"
          icon={<InactiveIcon />}
          accent="#b42318"
          delay={2}
        />
        <StatTile
          label="Boarders"
          value={boardingDataset.find((r) => r.key === "boarder")?.count || 0}
          hint="Living on campus"
          icon={<BoarderIcon />}
          accent={accentGold}
          delay={3}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "1fr",
        }}
      >
        <ChartPanel title="Gender distribution" subtitle="Male vs female enrolment" delay={1}>
          {genderTotal === 0 ? (
            <EmptyState message="No gender data yet. Add gender when creating students." />
          ) : (
            <Stack spacing={2}>
              <BarChart
                dataset={genderDataset}
                height={300}
                xAxis={[
                  {
                    dataKey: "label",
                    scaleType: "band",
                    tickLabelStyle: {
                      fontFamily: fontBody,
                      fontSize: 12,
                      fontWeight: 700,
                      fill: textSecondary,
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: "Students",
                    min: 0,
                    max: Math.ceil(maxGender * 1.2) || 1,
                    tickLabelStyle: { fontFamily: fontBody, fontSize: 11, fill: textMuted },
                    labelStyle: { fontFamily: fontBody, fontSize: 12, fill: textMuted },
                  },
                ]}
                series={[
                  {
                    dataKey: "count",
                    label: "Students",
                    color: primaryGreen,
                    valueFormatter: (v) => `${v}`,
                  },
                ]}
                borderRadius={10}
                grid={{ horizontal: true }}
                margin={{ top: 16, bottom: 40, left: 48, right: 12 }}
                slotProps={{ legend: { hidden: true } }}
                sx={barChartBaseSx}
              />
              <Stack direction="column" spacing={1.25}>
                <BreakdownRow
                  label="Male"
                  count={genderDataset.find((r) => r.key === "male")?.count || 0}
                  total={genderTotal}
                  color={primaryGreen}
                  icon={<MaleIcon fontSize="small" />}
                />
                <BreakdownRow
                  label="Female"
                  count={genderDataset.find((r) => r.key === "female")?.count || 0}
                  total={genderTotal}
                  color={accentGold}
                  icon={<FemaleIcon fontSize="small" />}
                />
              </Stack>
            </Stack>
          )}
        </ChartPanel>

        <ChartPanel title="Boarding status" subtitle="Boarder vs non-boarder" delay={2}>
          {boardingTotal === 0 ? (
            <EmptyState message="No boarding data yet." />
          ) : (
            <Stack spacing={2}>
              <BarChart
                dataset={boardingDataset}
                height={300}
                xAxis={[
                  {
                    dataKey: "label",
                    scaleType: "band",
                    tickLabelStyle: {
                      fontFamily: fontBody,
                      fontSize: 11,
                      fontWeight: 700,
                      fill: textSecondary,
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: "Students",
                    min: 0,
                    max: Math.ceil(maxBoarding * 1.2) || 1,
                    tickLabelStyle: { fontFamily: fontBody, fontSize: 11, fill: textMuted },
                    labelStyle: { fontFamily: fontBody, fontSize: 12, fill: textMuted },
                  },
                ]}
                series={[
                  {
                    dataKey: "count",
                    label: "Students",
                    color: navy,
                    valueFormatter: (v) => `${v}`,
                  },
                ]}
                borderRadius={10}
                grid={{ horizontal: true }}
                margin={{ top: 16, bottom: 48, left: 48, right: 12 }}
                slotProps={{ legend: { hidden: true } }}
                sx={barChartBaseSx}
              />
              <Stack direction="column" spacing={1.25}>
                <BreakdownRow
                  label="Boarder"
                  count={boardingDataset.find((r) => r.key === "boarder")?.count || 0}
                  total={boardingTotal}
                  color={navy}
                  icon={<BoarderIcon fontSize="small" />}
                />
                <BreakdownRow
                  label="Non-boarder"
                  count={boardingDataset.find((r) => r.key === "non_boarder")?.count || 0}
                  total={boardingTotal}
                  color={primaryGreen}
                  icon={<DayScholarIcon fontSize="small" />}
                />
              </Stack>
            </Stack>
          )}
        </ChartPanel>
      </Box>
    </Stack>
  );
}
