import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import BrandPageLoader from "../Util/BrandPageLoader";
import {
  accentGold,
  authJsonHeaders,
  fontBody,
  fontDisplay,
  navy,
  pageShellSx,
  primaryDark,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";

const CATEGORY_META = {
  class: {
    key: "class",
    label: "Classes",
    singular: "class",
    accent: primaryGreen,
    icon: SchoolRoundedIcon,
    empty: "No class sessions are scheduled for this day.",
  },
  cat: {
    key: "cat",
    label: "CATs",
    singular: "CAT",
    accent: "#b26a00",
    icon: QuizRoundedIcon,
    empty: "No continuous assessment tests are scheduled for this day.",
  },
  exam: {
    key: "exam",
    label: "Exams",
    singular: "exam",
    accent: navy,
    icon: FactCheckRoundedIcon,
    empty: "No examinations are scheduled for this day.",
  },
};

function parseDateKey(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day, date };
}

function overlapsDay(entry, dayStart, dayEnd) {
  const starts = new Date(entry.starts_at);
  const ends = new Date(entry.ends_at);
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) return false;
  return starts < dayEnd && ends > dayStart;
}

function formatClock(value) {
  return new Date(value)
    .toLocaleTimeString("en-KE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

function formatDuration(startsAt, endsAt) {
  const ms = Math.max(0, new Date(endsAt) - new Date(startsAt));
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

function EntryCard({ entry, meta, index, onEdit }) {
  const Icon = meta.icon;
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05 }}
      sx={{
        position: "relative",
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(0,96,80,0.1)",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 12px 32px -18px rgba(20,26,58,0.18)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 18px 40px -16px rgba(0,96,80,0.28)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${meta.accent}, ${accentGold})`,
        },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.75}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ p: { xs: 1.75, sm: 2.25 }, pl: { xs: 2.25, sm: 2.75 } }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: `linear-gradient(145deg, ${meta.accent} 0%, ${primaryDark} 150%)`,
              boxShadow: `0 10px 22px -10px ${meta.accent}99`,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.1rem", sm: "1.2rem" },
                color: textPrimary,
                lineHeight: 1.25,
              }}
            >
              {entry.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
              <Chip
                size="small"
                icon={<MenuBookRoundedIcon sx={{ fontSize: "0.9rem !important" }} />}
                label={entry.programme_name || "Programme"}
                sx={{
                  height: 26,
                  fontFamily: fontBody,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  bgcolor: "rgba(0,96,80,0.07)",
                  color: primaryGreen,
                  "& .MuiChip-icon": { color: primaryGreen },
                }}
              />
              <Chip
                size="small"
                label={`Year ${entry.year_of_study} · Sem ${entry.semester}`}
                sx={{
                  height: 26,
                  fontFamily: fontBody,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  bgcolor: warmCream,
                  color: textSecondary,
                }}
              />
            </Stack>
          </Box>
        </Stack>

        <Stack
          direction={{ xs: "row", sm: "column" }}
          spacing={0.6}
          alignItems={{ xs: "center", sm: "flex-end" }}
          sx={{ flexShrink: 0 }}
        >
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            sx={{
              px: 1.1,
              py: 0.55,
              borderRadius: "999px",
              bgcolor: `color-mix(in srgb, ${meta.accent} 12%, var(--kd-surface))`,
              color: meta.accent,
            }}
          >
            <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.82rem" }}>
              {formatClock(entry.starts_at)} – {formatClock(entry.ends_at)}
            </Typography>
          </Stack>
          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.74rem", fontWeight: 600 }}>
            {formatDuration(entry.starts_at, entry.ends_at)}
          </Typography>
          <Tooltip title={`Edit ${meta.singular}`}>
            <IconButton
              onClick={() => onEdit(entry)}
              size="small"
              sx={{
                width: 30,
                height: 30,
                color: meta.accent,
                bgcolor: `color-mix(in srgb, ${meta.accent} 10%, var(--kd-surface))`,
                border: `1px solid color-mix(in srgb, ${meta.accent} 22%, transparent)`,
                "&:hover": {
                  color: "#fff",
                  bgcolor: meta.accent,
                },
              }}
            >
              <EditRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function TimetableDayPage() {
  const navigate = useNavigate();
  const { dateKey } = useParams();
  const [searchParams] = useSearchParams();
  const parsed = useMemo(() => parseDateKey(dateKey), [dateKey]);
  const categoryKey = CATEGORY_META[searchParams.get("tab")] ? searchParams.get("tab") : "class";
  const meta = CATEGORY_META[categoryKey];
  const Icon = meta.icon;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dayLabel = parsed
    ? parsed.date.toLocaleDateString("en-KE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const goBack = () => {
    if (!parsed) {
      navigate("/timetable");
      return;
    }
    const params = new URLSearchParams({
      tab: categoryKey,
      year: String(parsed.year),
      month: String(parsed.month),
    });
    navigate(`/timetable?${params.toString()}`);
  };

  const editEntry = (entry) => {
    const returnTo = `/timetable/day/${dateKey}?tab=${categoryKey}`;
    navigate(`/timetable/${entry.id}/edit?tab=${categoryKey}`, {
      state: { returnTo },
    });
  };

  useEffect(() => {
    if (!parsed) {
      setLoading(false);
      setError("Invalid date selected.");
      return undefined;
    }

    let active = true;
    const token = localStorage.getItem("token");
    const dayStart = new Date(parsed.year, parsed.month, parsed.day);
    const dayEnd = new Date(parsed.year, parsed.month, parsed.day + 1);

    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          year: String(parsed.year),
          month: String(parsed.month),
          category: categoryKey,
        });
        const response = await fetch(`/api/timetable?${params}`, {
          headers: authJsonHeaders(token),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load timetable entries");
        }
        const dayEntries = (data.data || [])
          .filter((entry) => overlapsDay(entry, dayStart, dayEnd))
          .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
        if (active) setEntries(dayEntries);
      } catch (requestError) {
        if (active) {
          setEntries([]);
          setError(requestError.message || "Could not load timetable entries");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [parsed, categoryKey]);

  if (loading && !entries.length && !error) {
    return <BrandPageLoader message={`Loading ${meta.label.toLowerCase()}…`} />;
  }

  return (
    <Box sx={{ ...pageShellSx, pb: 4 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        sx={{
          borderRadius: "18px",
          px: { xs: 2, sm: 2.75 },
          py: { xs: 1.75, sm: 2.1 },
          mb: 2,
          background: `linear-gradient(135deg, ${meta.accent} 0%, ${navy} 100%)`,
          color: "#fff",
          boxShadow: `0 16px 36px -16px ${meta.accent}88`,
        }}
      >
        <Stack direction="row" spacing={1.75} alignItems="center">
          <Tooltip title={`Back to ${meta.label}`}>
            <IconButton
              onClick={goBack}
              sx={{
                color: "#fff",
                flexShrink: 0,
                ml: -0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.22)",
              flexShrink: 0,
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.45rem" },
                lineHeight: 1.2,
              }}
            >
              {dayLabel || "Day schedule"}
            </Typography>
            <Typography sx={{ fontFamily: fontBody, color: "rgba(255,255,255,0.78)", fontSize: "0.82rem", mt: 0.35 }}>
              {meta.label} scheduled for this day
            </Typography>
          </Box>
          <Chip
            icon={<Icon sx={{ fontSize: "1rem !important", color: `${navy} !important` }} />}
            label={meta.label}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              height: 34,
              fontFamily: fontBody,
              fontWeight: 800,
              bgcolor: accentGold,
              color: navy,
              "& .MuiChip-icon": { ml: 0.75 },
            }}
          />
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px", fontFamily: fontBody }}>
          {error}
        </Alert>
      ) : null}

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <EventAvailableRoundedIcon sx={{ color: meta.accent, fontSize: 22 }} />
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.15rem" }}>
            {entries.length} {entries.length === 1 ? meta.singular : meta.label.toLowerCase()}
          </Typography>
        </Stack>
        {loading ? <CircularProgress size={22} sx={{ color: meta.accent }} /> : null}
      </Stack>

      {!loading && !error && entries.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 6, sm: 8 },
            px: 3,
            borderRadius: "20px",
            bgcolor: "var(--kd-surface)",
            border: "1px dashed rgba(0,96,80,0.22)",
            boxShadow: "0 10px 28px -18px rgba(20,26,58,0.12)",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 1.75,
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
              color: meta.accent,
              bgcolor: `color-mix(in srgb, ${meta.accent} 12%, var(--kd-surface))`,
            }}
          >
            <Icon sx={{ fontSize: 30 }} />
          </Box>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.2rem" }}>
            Nothing scheduled
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.9rem", mt: 0.75, maxWidth: 360, mx: "auto" }}>
            {meta.empty}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {entries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              meta={meta}
              index={index}
              onEdit={editEntry}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
