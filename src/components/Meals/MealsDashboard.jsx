import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, CircularProgress, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import {
  Refresh as RefreshIcon,
  People as PeopleIcon,
  QrCode2 as QrCodeIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { UserAvatar } from "../Users/usersUi";
import {
  fontBody,
  fontDisplay,
  inputSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import {
  EmptyNote,
  MEAL_CODES,
  MEAL_META,
  MealChip,
  MethodChip,
  Panel,
  formatDate,
  formatTime,
  mealsApi,
  todayLocal,
} from "./mealsShared";

function StatTile({ icon, label, value, hint }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "16px",
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(27,94,168,0.1)",
        display: "flex",
        gap: 1.5,
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(27,94,168,0.08)",
          color: primaryGreen,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: fontBody,
            fontSize: "0.68rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: textMuted,
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.45rem", color: textPrimary, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", color: textSecondary }}>{hint}</Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function MealTile({ meal, activeStudents, isCurrent }) {
  const meta = MEAL_META[meal.meal_code];
  const pct = activeStudents ? Math.round((meal.served_total / activeStudents) * 100) : 0;
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "16px",
        bgcolor: "var(--kd-surface)",
        border: `1px solid ${isCurrent ? meta.color : "rgba(27,94,168,0.1)"}`,
        boxShadow: isCurrent ? `0 0 0 3px ${meta.soft}` : "none",
        opacity: meal.is_active ? 1 : 0.55,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <MealChip code={meal.meal_code} />
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", fontWeight: 700, color: isCurrent ? meta.color : textMuted }}>
          {isCurrent ? "Serving now" : meal.is_active ? "" : "Turned off"}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 1.25 }}>
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "2rem", color: textPrimary, lineHeight: 1 }}>
          {meal.served_total}
        </Typography>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary }}>
          served · {pct}% of active students
        </Typography>
      </Stack>
      <Box sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: meta.soft, overflow: "hidden" }}>
        <Box sx={{ width: `${Math.min(100, pct)}%`, height: "100%", bgcolor: meta.color, transition: "width 0.4s ease" }} />
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.75rem", color: textSecondary }}>
          QR {meal.served_qr} · Manual {meal.served_manual}
        </Typography>
        <Tooltip title={meal.source === "override" ? `Changed for this day: ${meal.override_reason || ""}` : "Default time"}>
          <Typography
            sx={{
              fontFamily: fontBody,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: meal.source === "override" ? "#9a6700" : textSecondary,
            }}
          >
            {meal.start_time}–{meal.end_time}
            {meal.source === "override" ? " *" : ""}
          </Typography>
        </Tooltip>
      </Stack>
    </Box>
  );
}

function TrendChart({ trend }) {
  const max = Math.max(1, ...trend.map((t) => t.B + t.L + t.S));
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 150 }}>
        {trend.map((t) => {
          const total = t.B + t.L + t.S;
          return (
            <Tooltip
              key={t.date}
              title={`${formatDate(t.date)} — Breakfast ${t.B}, Lunch ${t.L}, Supper ${t.S}`}
            >
              <Stack sx={{ flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center" }}>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.7rem", fontWeight: 700, color: textSecondary, mb: 0.5 }}>
                  {total}
                </Typography>
                <Stack
                  sx={{
                    width: "100%",
                    maxWidth: 44,
                    height: `${(total / max) * 100}%`,
                    minHeight: total ? 6 : 2,
                    borderRadius: "8px 8px 3px 3px",
                    overflow: "hidden",
                    bgcolor: total ? "transparent" : "rgba(27,94,168,0.1)",
                  }}
                >
                  {["S", "L", "B"].map((code) =>
                    t[code] ? <Box key={code} sx={{ flex: t[code], bgcolor: MEAL_META[code].color }} /> : null
                  )}
                </Stack>
              </Stack>
            </Tooltip>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
        {trend.map((t) => (
          <Typography
            key={t.date}
            sx={{ flex: 1, textAlign: "center", fontFamily: fontBody, fontSize: "0.68rem", color: textMuted }}
          >
            {new Date(`${t.date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
          </Typography>
        ))}
      </Stack>
      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 1.25 }}>
        {MEAL_CODES.map((code) => (
          <Stack key={code} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: MEAL_META[code].color }} />
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textSecondary }}>
              {MEAL_META[code].name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default function MealsDashboard() {
  const [date, setDate] = useState(todayLocal());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await mealsApi(`/admin/dashboard?date=${encodeURIComponent(date)}`);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
        <TextField
          type="date"
          size="small"
          label="Day"
          value={date}
          onChange={(e) => setDate(e.target.value || todayLocal())}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ ...inputSx, width: 190 }}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          {data?.is_today ? (
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary }}>
              School time {data.server_time}
            </Typography>
          ) : null}
          <IconButton onClick={load} disabled={loading} aria-label="Refresh">
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: "14px" }}>
          {error}
        </Alert>
      ) : null}

      {data ? (
        <>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
            <StatTile icon={<PeopleIcon />} label="Active students" value={data.active_students} />
            <StatTile icon={<QrCodeIcon />} label="Active meal cards" value={data.active_cards} hint="Cards that scan today" />
            <StatTile
              icon={<ScheduleIcon />}
              label={data.is_today ? "Now" : "Day"}
              value={
                data.current_meal
                  ? MEAL_META[data.current_meal].name
                  : data.is_today
                    ? "No meal"
                    : formatDate(data.date)
              }
              hint={data.is_today ? (data.current_meal ? "Scanning is open" : "Outside meal times") : null}
            />
          </Box>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
            {data.meals.map((m) => (
              <MealTile
                key={m.meal_code}
                meal={m}
                activeStudents={data.active_students}
                isCurrent={data.current_meal === m.meal_code}
              />
            ))}
          </Box>

          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" } }}>
            <Panel title="Last 7 days" subtitle={`Meals served up to ${formatDate(data.date)}`}>
              <TrendChart trend={data.trend} />
            </Panel>
            <Panel title="Latest servings" subtitle={formatDate(data.date)}>
              {data.recent.length ? (
                <Stack spacing={1.1}>
                  {data.recent.map((r) => (
                    <Stack key={r.id} direction="row" spacing={1.25} alignItems="center">
                      <UserAvatar name={r.student?.full_name} role="student" src={r.student?.profile_image_url} size={34} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.84rem", color: textPrimary }}>
                          {r.student?.full_name || "Unknown student"}
                        </Typography>
                        <Typography noWrap sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                          {r.student?.admission_number || "—"} · {formatTime(r.served_at)}
                          {r.server ? ` · by ${r.server.full_name}` : ""}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <MealChip code={r.meal_code} />
                        <MethodChip method={r.method} />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <EmptyNote>No meals recorded for this day yet.</EmptyNote>
              )}
            </Panel>
          </Box>
        </>
      ) : null}
    </Stack>
  );
}
