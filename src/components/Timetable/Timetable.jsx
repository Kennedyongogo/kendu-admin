import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Button, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  accentGold,
  accentGoldMuted,
  fontBody,
  fontDisplay,
  inputSx,
  navy,
  pageShellSx,
  primaryDark,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { RoleTabs } from "../Users/usersUi";

const GAP_PX = 16;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SCHEDULE_TABS = [
  {
    key: "class",
    label: "Classes",
    createLabel: "Create class",
    accent: primaryGreen,
    icon: <SchoolRoundedIcon sx={{ fontSize: 16 }} />,
  },
  {
    key: "cat",
    label: "CATs",
    createLabel: "Create CAT",
    accent: "#b26a00",
    icon: <QuizRoundedIcon sx={{ fontSize: 16 }} />,
  },
  {
    key: "exam",
    label: "Exams",
    createLabel: "Exam timetables",
    accent: navy,
    icon: <FactCheckRoundedIcon sx={{ fontSize: 16 }} />,
  },
];

const cardSx = {
  bgcolor: "var(--kd-surface)",
  border: "1px solid rgba(0,96,80,0.1)",
  borderRadius: "20px",
  boxShadow: "0 12px 36px -16px rgba(20,26,58,0.12)",
  overflow: "hidden",
};

/** Weeks of a month as day numbers, null for cells outside the month (Monday-first). */
function buildMonthCells(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function NavArrowButton({ direction, onClick, disabled }) {
  return (
    <Tooltip title={direction === "prev" ? "Previous month" : "Next month"}>
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          size="small"
          sx={{
            width: 30,
            height: 30,
            borderRadius: "10px",
            color: "#fff",
            bgcolor: primaryGreen,
            boxShadow: "0 8px 20px -8px rgba(0,96,80,0.55)",
            "&:hover": { bgcolor: primaryDark },
            "&.Mui-disabled": { bgcolor: "rgba(0,96,80,0.18)", color: "rgba(255,255,255,0.75)" },
          }}
        >
          {direction === "prev" ? (
            <ChevronLeftRoundedIcon sx={{ fontSize: 19 }} />
          ) : (
            <ChevronRightRoundedIcon sx={{ fontSize: 19 }} />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}

const MonthGrid = React.memo(function MonthGrid({ year, monthIndex, today, onDayClick }) {
  const cells = useMemo(() => buildMonthCells(year, monthIndex), [year, monthIndex]);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: { xs: 0.55, sm: 0.75 },
        p: { xs: 0.45, sm: 0.65 },
        borderRadius: "14px",
        bgcolor: "rgba(0,96,80,0.035)",
        border: "1px solid rgba(0,96,80,0.06)",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: { xs: 0.55, sm: 0.75 }, flexShrink: 0 }}>
        {WEEKDAYS.map((day, index) => {
          const isWeekend = index >= 5;
          return (
            <Typography
              key={day}
              sx={{
                textAlign: "center",
                fontFamily: fontBody,
                fontWeight: 800,
                fontSize: { xs: "0.62rem", sm: "0.68rem" },
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                py: { xs: 0.4, sm: 0.55 },
                borderRadius: "9px",
                color: isWeekend ? "#8a6d1c" : "#fff",
                background: isWeekend
                  ? "linear-gradient(145deg, rgba(200,168,64,0.22) 0%, rgba(200,168,64,0.12) 100%)"
                  : `linear-gradient(145deg, var(--schedule-accent) 0%, ${primaryDark} 170%)`,
                boxShadow: isWeekend
                  ? "none"
                  : "0 4px 10px -6px color-mix(in srgb, var(--schedule-accent) 60%, transparent)",
              }}
            >
              {day}
            </Typography>
          );
        })}
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridAutoRows: "1fr",
          gap: { xs: 0.55, sm: 0.75 },
        }}
      >
        {cells.map((day, index) => {
          const isWeekend = index % 7 >= 5;
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <Box
              key={index}
              role={day ? "button" : undefined}
              tabIndex={day ? 0 : undefined}
              onClick={() => day && onDayClick?.(year, monthIndex, day)}
              onKeyDown={(event) => {
                if (!day) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onDayClick?.(year, monthIndex, day);
                }
              }}
              sx={{
                minHeight: 0,
                overflow: "hidden",
                borderRadius: "11px",
                p: { xs: 0.35, sm: 0.5 },
                display: "grid",
                placeItems: "center",
                border: day
                  ? isToday
                    ? "2px solid var(--schedule-accent)"
                    : isWeekend
                      ? "1px solid rgba(200,168,64,0.35)"
                      : "1px solid rgba(0,96,80,0.16)"
                  : "1px dashed rgba(0,96,80,0.08)",
                bgcolor: day
                  ? isToday
                    ? "color-mix(in srgb, var(--schedule-accent) 10%, var(--kd-surface))"
                    : isWeekend
                      ? "rgba(200,168,64,0.1)"
                      : "var(--kd-surface)"
                  : "transparent",
                boxShadow: day
                  ? isToday
                    ? "0 6px 16px -8px color-mix(in srgb, var(--schedule-accent) 55%, transparent)"
                    : "0 4px 12px -8px rgba(20,26,58,0.22)"
                  : "none",
                cursor: day ? "pointer" : "default",
                "&:hover": day
                  ? {
                      bgcolor: isToday
                        ? "color-mix(in srgb, var(--schedule-accent) 16%, var(--kd-surface))"
                        : "rgba(0,96,80,0.07)",
                      borderColor: "var(--schedule-accent)",
                    }
                  : undefined,
              }}
            >
              {day ? (
                <Box
                  sx={{
                    width: { xs: 24, sm: 28 },
                    height: { xs: 24, sm: 28 },
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    fontFamily: fontBody,
                    fontWeight: 800,
                    fontSize: { xs: "0.72rem", sm: "0.8rem" },
                    color: isToday ? "#fff" : isWeekend ? "#8a6d1c" : textPrimary,
                    background: isToday
                      ? `linear-gradient(145deg, var(--schedule-accent) 0%, ${primaryDark} 150%)`
                      : isWeekend
                        ? "rgba(200,168,64,0.18)"
                        : "rgba(0,96,80,0.08)",
                    boxShadow: isToday
                      ? "0 6px 14px -4px color-mix(in srgb, var(--schedule-accent) 55%, transparent)"
                      : "none",
                  }}
                >
                  {day}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

const filterFieldSx = {
  ...inputSx,
  minWidth: { xs: 108, sm: 118 },
  "& .MuiOutlinedInput-root": {
    ...inputSx["& .MuiOutlinedInput-root"],
    height: 30,
    borderRadius: "9px",
    fontSize: "0.76rem",
    bgcolor: "var(--kd-surface)",
  },
  "& .MuiInputLabel-root": {
    ...inputSx["& .MuiInputLabel-root"],
    fontSize: "0.72rem",
    transform: "translate(12px, 6px) scale(1)",
    "&.MuiInputLabel-shrink": {
      transform: "translate(12px, -7px) scale(0.82)",
    },
  },
  "& .MuiSelect-select": {
    py: 0.55,
    fontFamily: fontBody,
    fontWeight: 700,
    fontSize: "0.76rem",
  },
};

export default function Timetable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const scrollerRef = useRef(null);
  const syncingScroll = useRef(false);

  const initialTab = useMemo(() => {
    const key = searchParams.get("tab");
    const index = SCHEDULE_TABS.findIndex((item) => item.key === key);
    return index >= 0 ? index : 0;
  }, [searchParams]);

  const initialYear = useMemo(() => {
    const year = Number(searchParams.get("year"));
    return Number.isInteger(year) && year > 1970 ? year : today.getFullYear();
  }, [searchParams, today]);

  const initialMonth = useMemo(() => {
    const month = Number(searchParams.get("month"));
    return Number.isInteger(month) && month >= 0 && month <= 11 ? month : today.getMonth();
  }, [searchParams, today]);

  const [tab, setTab] = useState(initialTab);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);

  const activeTab = SCHEDULE_TABS[tab];
  const yearOptions = useMemo(() => {
    const current = today.getFullYear();
    return Array.from({ length: 8 }, (_, i) => current - 2 + i);
  }, [today]);

  const monthStep = (el) => {
    const child = el.firstElementChild;
    return (child ? child.offsetWidth : el.clientWidth) + GAP_PX;
  };

  const scrollToMonth = useCallback((monthIndex, behavior = "smooth") => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(11, monthIndex));
    syncingScroll.current = true;
    setVisibleMonth(clamped);
    el.scrollTo({ left: clamped * monthStep(el), behavior });
    window.setTimeout(() => {
      syncingScroll.current = false;
    }, behavior === "auto" ? 0 : 350);
  }, []);

  const goToToday = () => {
    setSelectedYear(today.getFullYear());
    scrollToMonth(today.getMonth());
  };

  const openDay = useCallback(
    (year, monthIndex, day) => {
      const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      navigate(`/timetable/day/${dateKey}?tab=${activeTab.key}`);
    },
    [navigate, activeTab.key]
  );

  // Align the scroller when the year changes or on first mount.
  useEffect(() => {
    scrollToMonth(visibleMonth, "auto");
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track which month is in view + keep alignment on resize.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (syncingScroll.current) return;
      const index = Math.max(0, Math.min(11, Math.round(el.scrollLeft / monthStep(el))));
      setVisibleMonth((current) => (current === index ? current : index));
    };
    const onResize = () => {
      const index = Math.max(0, Math.min(11, Math.round(el.scrollLeft / monthStep(el))));
      el.scrollTo({ left: index * monthStep(el), behavior: "auto" });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <Box
      sx={{
        ...pageShellSx,
        // Fill the viewport below the app bar exactly; the calendar flexes to fit.
        height: { xs: "calc(100vh - 112px)", sm: "calc(100vh - 108px)" },
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        py: { xs: 1.5, sm: 2 },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          borderRadius: "16px",
          px: { xs: 2, sm: 2.5 },
          py: 1.25,
          mb: 1.25,
          background: `linear-gradient(135deg, ${primaryGreen} 0%, ${navy} 100%)`,
          color: "#fff",
          boxShadow: "0 14px 32px -14px rgba(0, 96, 80, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.22)",
              flexShrink: 0,
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 22, color: "#fff" }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: { xs: "1.15rem", sm: "1.3rem" }, lineHeight: 1.2 }}>
              Timetable
            </Typography>
            <Typography noWrap sx={{ fontFamily: fontBody, color: "rgba(255,255,255,0.75)", fontSize: "0.76rem" }}>
              Plan and review class sessions and CATs. Exams use Exam Timetables.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon sx={{ fontSize: "1.05rem !important" }} />}
          onClick={() => {
            if (activeTab.key === "exam") {
              navigate("/exam-timetables");
              return;
            }
            const params = new URLSearchParams({
              tab: activeTab.key,
              year: String(selectedYear),
              month: String(visibleMonth),
            });
            navigate(`/timetable/create?${params.toString()}`);
          }}
          sx={{
            textTransform: "none",
            fontFamily: fontBody,
            fontWeight: 800,
            fontSize: { xs: "0.76rem", sm: "0.84rem" },
            borderRadius: "11px",
            px: { xs: 1.4, sm: 2 },
            py: 0.85,
            flexShrink: 0,
            whiteSpace: "nowrap",
            transition: "none",
            background: `linear-gradient(135deg, ${accentGold} 0%, ${accentGoldMuted} 100%)`,
            color: navy,
            boxShadow: "0 8px 22px -8px rgba(160,128,40,0.55)",
            "&:hover": {
              background: `linear-gradient(135deg, ${accentGoldMuted} 0%, ${accentGold} 100%)`,
            },
          }}
        >
          {activeTab.createLabel}
        </Button>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1}
        sx={{
          flexShrink: 0,
          mb: 1,
          "& .MuiChip-root": {
            height: 30,
            fontSize: "0.76rem",
            borderRadius: "9px",
            transition: "background-color 80ms ease, color 80ms ease !important",
          },
          "& > div:first-of-type": { mb: "0 !important", p: 0.4, borderRadius: "12px" },
        }}
      >
        <RoleTabs
          activeTab={tab}
          onChange={(_, value) => setTab(value)}
          tabs={SCHEDULE_TABS.map((item) => ({ label: item.label }))}
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ flexShrink: 0 }}>
          <TextField
            select
            size="small"
            label="Year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            sx={filterFieldSx}
          >
            {yearOptions.map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Month"
            value={visibleMonth}
            onChange={(event) => scrollToMonth(Number(event.target.value))}
            sx={{ ...filterFieldSx, minWidth: { xs: 130, sm: 145 } }}
          >
            {MONTH_NAMES.map((name, index) => (
              <MenuItem key={name} value={index}>{name}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Box
        sx={{
          ...cardSx,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          "--schedule-accent": activeTab.accent,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ px: 1.75, py: 0.6, borderBottom: "1px solid rgba(0,96,80,0.08)", bgcolor: warmCream, flexShrink: 0 }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: `linear-gradient(145deg, ${activeTab.accent} 0%, ${primaryDark} 150%)`,
                boxShadow: `0 6px 16px -6px ${activeTab.accent}88`,
                flexShrink: 0,
                "& svg": { fontSize: 14 },
              }}
            >
              {activeTab.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "0.98rem", lineHeight: 1.2 }}>
                {MONTH_NAMES[visibleMonth]} {selectedYear}
              </Typography>
              <Typography noWrap sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.68rem" }}>
                {activeTab.label} schedule · scroll sideways or use the arrows to move between months
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              startIcon={<TodayRoundedIcon sx={{ fontSize: "0.9rem !important" }} />}
              onClick={goToToday}
              sx={{
                textTransform: "none",
                fontFamily: fontBody,
                fontWeight: 700,
                fontSize: "0.72rem",
                color: primaryGreen,
                borderRadius: "9px",
                px: 1.1,
                py: 0.4,
                minWidth: 0,
                bgcolor: "rgba(0,96,80,0.07)",
                "&:hover": { bgcolor: "rgba(0,96,80,0.14)" },
              }}
            >
              Today
            </Button>
            <NavArrowButton direction="prev" disabled={visibleMonth <= 0} onClick={() => scrollToMonth(visibleMonth - 1)} />
            <NavArrowButton direction="next" disabled={visibleMonth >= 11} onClick={() => scrollToMonth(visibleMonth + 1)} />
          </Stack>
        </Stack>

        <Box
          ref={scrollerRef}
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            gap: `${GAP_PX}px`,
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: "12px",
            WebkitOverflowScrolling: "touch",
            px: 1.5,
            py: 1.25,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {MONTH_NAMES.map((name, monthIndex) => (
            <Box key={`${selectedYear}-${name}`} sx={{ flex: "0 0 100%", minWidth: "100%", height: "100%", scrollSnapAlign: "start" }}>
              <MonthGrid year={selectedYear} monthIndex={monthIndex} today={today} onDayClick={openDay} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
