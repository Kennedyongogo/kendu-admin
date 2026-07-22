import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton } from "../Users/usersUi";
import useProgrammeEnrolmentOptions from "../Users/useProgrammeEnrolmentOptions";
import { fetchProgrammesOptions } from "../Programmes/programmesShared";
import {
  authJsonHeaders,
  getPortalToken,
  getPortalUser,
  accentGold,
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
import {
  STATUS_META,
  cohortLabel,
  currentAcademicYear,
  formatPeriodRange,
  downloadExamTimetablePdf,
} from "./examTimetableShared";
import ExamSlotTile from "./ExamSlotTile";

const filterPanelSx = {
  mb: 3,
  p: { xs: 2, sm: 2.25 },
  borderRadius: "18px",
  bgcolor: "var(--kd-surface)",
  border: "1px solid rgba(0,96,80,0.1)",
  boxShadow: "0 10px 36px -20px rgba(20,26,58,0.14)",
};

const carouselArrowSx = {
  flexShrink: 0,
  width: { xs: 42, sm: 48 },
  height: { xs: 42, sm: 48 },
  borderRadius: "14px",
  color: "#fff",
  bgcolor: primaryGreen,
  boxShadow: "0 10px 28px -8px rgba(0,96,80,0.55)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  "&:hover": {
    bgcolor: primaryDark,
    transform: "scale(1.04)",
    boxShadow: "0 14px 32px -6px rgba(0,96,80,0.6)",
  },
  "&.Mui-disabled": {
    opacity: 0.35,
    bgcolor: "rgba(0,96,80,0.15)",
    color: "rgba(255,255,255,0.7)",
    boxShadow: "none",
    transform: "none",
  },
};

function ExamPlanCard({
  row,
  semesterLabels,
  onOpen,
  onDelete,
  onDownload,
  downloading,
  showProgramme = false,
  canDelete = false,
}) {
  const status = STATUS_META[row.status] || STATUS_META.draft;
  const slots = Array.isArray(row.slots) ? row.slots : [];
  const slotCount = row.slot_count ?? slots.length;
  const periodLabel = formatPeriodRange(row.period_start, row.period_end);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "22px",
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(0,96,80,0.12)",
        boxShadow: "0 20px 50px -24px rgba(20,26,58,0.28)",
        overflow: "hidden",
      }}
    >
      {/* Header band */}
      <Box
        sx={{
          position: "relative",
          px: { xs: 2.25, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          background: `linear-gradient(135deg, ${primaryGreen} 0%, ${navy} 100%)`,
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -20,
            width: 140,
            height: 140,
            borderRadius: "50%",
            bgcolor: "rgba(200,168,64,0.15)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: "20%",
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        />

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5} sx={{ position: "relative" }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
              <Box sx={{ width: 28, height: 2.5, borderRadius: 2, bgcolor: accentGold }} />
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {showProgramme && row.programme_name ? `${row.programme_name} · ` : ""}
                {cohortLabel(row, semesterLabels)}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.15rem", sm: "1.35rem" },
                color: "#fff",
                lineHeight: 1.2,
                mb: periodLabel ? 1 : 0,
              }}
            >
              {row.title}
            </Typography>
            {periodLabel ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <EventAvailableRoundedIcon sx={{ fontSize: 16, color: accentGold }} />
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                  {periodLabel}
                </Typography>
              </Stack>
            ) : null}
          </Box>
          <Chip
            label={status.label}
            sx={{
              flexShrink: 0,
              fontWeight: 800,
              fontSize: "0.68rem",
              height: 28,
              bgcolor: status.bg,
              color: status.color,
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(6px)",
            }}
          />
        </Stack>

        {row.rejection_reason ? (
          <Typography
            sx={{
              position: "relative",
              fontFamily: fontBody,
              fontSize: "0.75rem",
              color: "#fecaca",
              mt: 1.25,
              px: 1.25,
              py: 0.75,
              borderRadius: "10px",
              bgcolor: "rgba(185,28,28,0.25)",
            }}
          >
            Rejected: {row.rejection_reason}
          </Typography>
        ) : null}
      </Box>

      {/* Schedule body */}
      <Box sx={{ px: { xs: 2.25, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(145deg, ${primaryGreen}, ${primaryDark})`,
                color: "#fff",
                boxShadow: "0 6px 14px -6px rgba(0,96,80,0.5)",
              }}
            >
              <CalendarMonthRoundedIcon sx={{ fontSize: 19 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: textPrimary,
                  lineHeight: 1.2,
                }}
              >
                Exam schedule
              </Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.75rem", color: textMuted }}>
                {slotCount} paper{slotCount === 1 ? "" : "s"} scheduled
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {slotCount === 0 ? (
          <Box
            sx={{
              py: 4,
              px: 2,
              borderRadius: "16px",
              bgcolor: warmCream,
              border: "1px dashed rgba(0,96,80,0.22)",
              textAlign: "center",
            }}
          >
            <FactCheckRoundedIcon sx={{ fontSize: 36, color: "rgba(0,96,80,0.3)", mb: 1 }} />
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.88rem", color: textSecondary }}>
              No papers scheduled yet — open the plan to add exams.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(5, 1fr)" },
              gap: { xs: 1, sm: 1.25 },
            }}
          >
            {slots.map((slot) => (
              <ExamSlotTile key={slot.id} slot={slot} />
            ))}
          </Box>
        )}
      </Box>

      {/* Footer actions — single row, no wrap */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0.75, sm: 1 }}
        sx={{
          flexWrap: "nowrap",
          px: { xs: 2, sm: 2.25, md: 3 },
          py: 1.5,
          borderTop: "1px solid rgba(0,96,80,0.08)",
          bgcolor: "rgba(0,96,80,0.02)",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<DownloadRoundedIcon sx={{ fontSize: { xs: 17, sm: 18 } }} />}
          disabled={downloading}
          onClick={() => onDownload?.(row)}
          sx={{
            flexShrink: 0,
            minWidth: 0,
            whiteSpace: "nowrap",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: fontBody,
            fontSize: { xs: "0.72rem", sm: "0.82rem" },
            lineHeight: 1,
            borderRadius: "12px",
            py: { xs: 0.9, sm: 1.05 },
            px: { xs: 1.1, sm: 1.75 },
            borderColor: "rgba(0,96,80,0.35)",
            color: primaryGreen,
            "& .MuiButton-startIcon": { mr: { xs: 0.5, sm: 0.75 } },
            "&:hover": { borderColor: primaryGreen, bgcolor: "rgba(0,96,80,0.06)" },
          }}
        >
          {downloading ? (
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Preparing…
            </Box>
          ) : (
            <>
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Download PDF
              </Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                PDF
              </Box>
            </>
          )}
          {downloading ? (
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              …
            </Box>
          ) : null}
        </Button>
        <Button
          variant="contained"
          startIcon={<OpenInNewRoundedIcon sx={{ fontSize: { xs: 17, sm: 18 } }} />}
          onClick={() => onOpen(row)}
          sx={{
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: fontBody,
            fontSize: { xs: "0.72rem", sm: "0.84rem" },
            lineHeight: 1,
            borderRadius: "12px",
            py: { xs: 0.9, sm: 1.1 },
            px: { xs: 1.1, sm: 1.75 },
            bgcolor: primaryGreen,
            boxShadow: "0 8px 20px -8px rgba(0,96,80,0.5)",
            "& .MuiButton-startIcon": { mr: { xs: 0.5, sm: 0.75 } },
            "&:hover": { bgcolor: primaryDark, boxShadow: "0 10px 24px -6px rgba(0,96,80,0.55)" },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Open plan
          </Box>
          <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
            Open
          </Box>
        </Button>
        {canDelete ? (
          <Tooltip title="Delete plan" arrow>
            <IconButton
              onClick={() => onDelete(row)}
              sx={{
                flexShrink: 0,
                width: { xs: 38, sm: 44 },
                height: { xs: 38, sm: 44 },
                borderRadius: "12px",
                color: "#b91c1c",
                bgcolor: "rgba(185,28,28,0.08)",
                border: "1px solid rgba(185,28,28,0.15)",
                "&:hover": { bgcolor: "rgba(185,28,28,0.14)" },
              }}
            >
              <DeleteOutlineRoundedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
    </Box>
  );
}

export default function ExamTimetables() {
  const navigate = useNavigate();
  const token = getPortalToken();
  const user = getPortalUser();
  const isAdmin = user?.role === "admin";

  const canDeletePlan = useCallback(
    (row) => {
      if (row.status === "approved") return false;
      if (isAdmin) return true;
      const slotCount = row.slot_count ?? (Array.isArray(row.slots) ? row.slots.length : 0);
      return slotCount <= 1;
    },
    [isAdmin]
  );
  const scrollerRef = useRef(null);

  const [items, setItems] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState(currentAcademicYear());
  const [statusFilter, setStatusFilter] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  const enrolment = useProgrammeEnrolmentOptions(programmeFilter);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ include_slots: "true" });
      if (programmeFilter) params.set("programme_id", programmeFilter);
      if (academicYearFilter.trim()) params.set("academic_year", academicYearFilter.trim());
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/exam-timetables?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load");
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || "Failed to load exam timetables");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, programmeFilter, academicYearFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await fetchProgrammesOptions(token);
        if (!active) return;
        const rows = Array.isArray(list) ? list : [];
        setProgrammes(rows);
      } catch {
        if (active) setProgrammes([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (!programmeFilter) {
          const nameCmp = (a.programme_name || "").localeCompare(b.programme_name || "");
          if (nameCmp !== 0) return nameCmp;
        }
        if (a.year_of_study !== b.year_of_study) return a.year_of_study - b.year_of_study;
        return a.semester - b.semester;
      }),
    [items, programmeFilter]
  );

  const academicYearOptions = useMemo(() => {
    const set = new Set([currentAcademicYear(), academicYearFilter].filter(Boolean));
    items.forEach((row) => {
      if (row.academic_year) set.add(row.academic_year);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [items, academicYearFilter]);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      setActiveIndex(0);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    const index = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
    setActiveIndex(Math.min(Math.max(index, 0), sortedItems.length - 1));
  }, [sortedItems.length]);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [sortedItems, updateScrollState]);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
  }, [programmeFilter, academicYearFilter, statusFilter, sortedItems.length]);

  const scrollBy = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    if (row.status === "approved") {
      Swal.fire({
        icon: "info",
        title: "Cannot delete",
        text: "Approved exam timetables cannot be deleted.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!canDeletePlan(row)) {
      Swal.fire({
        icon: "info",
        title: "Cannot delete",
        text: "Staff can only delete plans with one or no exam slots. Contact an administrator.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete exam timetable?",
      text: `"${row.title}" and all its exam slots will be removed.`,
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/exam-timetables/${row.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const handleDownload = async (row) => {
    setDownloadingId(row.id);
    try {
      await downloadExamTimetablePdf(row.id, row.title, token);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const selectedProgramme = programmes.find((p) => p.id === programmeFilter);

  if (loading && items.length === 0 && programmes.length === 0) {
    return <BrandPageLoader message="Loading exam timetables…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Exam Timetables"
        subtitle="Scroll cohort plans — open to add papers or submit."
        icon={<FactCheckRoundedIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <HeroActionButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/exam-timetables/create")}
          >
            New exam timetable
          </HeroActionButton>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box sx={filterPanelSx}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          alignItems={{ lg: "center" }}
          justifyContent="space-between"
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
            <TextField
              select
              size="small"
              label="Programme"
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              sx={{ ...inputSx, minWidth: { xs: "100%", sm: 200 } }}
            >
              <MenuItem value="">All programmes</MenuItem>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Academic year"
              value={academicYearFilter}
              onChange={(e) => setAcademicYearFilter(e.target.value)}
              sx={{ ...inputSx, minWidth: { xs: "100%", sm: 140 } }}
            >
              {academicYearOptions.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ ...inputSx, minWidth: { xs: "100%", sm: 160 } }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {Object.entries(STATUS_META).map(([value, meta]) => (
                <MenuItem key={value} value={value}>
                  {meta.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Chip
            label={`${sortedItems.length} plan${sortedItems.length === 1 ? "" : "s"}`}
            sx={{
              alignSelf: { xs: "flex-start", lg: "center" },
              fontWeight: 800,
              fontFamily: fontBody,
              fontSize: "0.72rem",
              bgcolor: "rgba(0,96,80,0.08)",
              color: primaryGreen,
              borderRadius: "10px",
              height: 32,
            }}
          />
        </Stack>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted, mt: 1.25 }}>
          Viewing {selectedProgramme ? selectedProgramme.name : "all programmes"} · {academicYearFilter} ·
          signed in as {user?.role || "staff"}
        </Typography>
      </Box>

      {loading && items.length === 0 ? (
        <BrandPageLoader message="Loading plans…" />
      ) : sortedItems.length === 0 ? (
        <Box
          sx={{
            py: 8,
            px: 3,
            textAlign: "center",
            borderRadius: "22px",
            bgcolor: "var(--kd-surface)",
            border: "1px dashed rgba(0,96,80,0.2)",
            boxShadow: "0 12px 36px -20px rgba(20,26,58,0.12)",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "18px",
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(145deg, ${primaryGreen}, ${navy})`,
              color: "#fff",
              boxShadow: "0 12px 28px -10px rgba(0,96,80,0.5)",
            }}
          >
            <FactCheckRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.2rem", color: textPrimary, mb: 0.75 }}>
            No exam timetables yet
          </Typography>
          <Typography sx={{ color: textSecondary, mb: 2.5, maxWidth: 420, mx: "auto", lineHeight: 1.6 }}>
            Create a plan for a programme cohort (e.g. Year 2 · Semester 1 · {academicYearFilter}). Each plan
            appears here as a card you can browse with the arrows.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/exam-timetables/create")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "12px",
              px: 3,
              bgcolor: primaryGreen,
              boxShadow: "0 8px 20px -8px rgba(0,96,80,0.5)",
              "&:hover": { bgcolor: primaryDark },
            }}
          >
            Create first plan
          </Button>
        </Box>
      ) : (
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  color: textPrimary,
                  lineHeight: 1.2,
                }}
              >
                Cohort exam plans
              </Typography>
              {sortedItems.length > 1 ? (
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textMuted, mt: 0.35 }}>
                  {activeIndex + 1} of {sortedItems.length} · use arrows to browse semesters
                </Typography>
              ) : null}
            </Box>
            {sortedItems.length > 1 ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {sortedItems.map((row, idx) => (
                  <Box
                    key={row.id}
                    onClick={() => {
                      const el = scrollerRef.current;
                      if (!el) return;
                      el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
                    }}
                    sx={{
                      width: activeIndex === idx ? 22 : 8,
                      height: 8,
                      borderRadius: 999,
                      bgcolor: activeIndex === idx ? primaryGreen : "rgba(0,96,80,0.2)",
                      cursor: "pointer",
                      transition: "width 0.25s ease, background 0.25s ease",
                    }}
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>

          <Stack direction="row" alignItems="stretch" spacing={{ xs: 1, sm: 1.5 }}>
            <IconButton
              aria-label="Previous exam plan"
              disabled={!canScrollLeft}
              onClick={() => scrollBy(-1)}
              sx={{ ...carouselArrowSx, alignSelf: "center" }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
            </IconButton>

            <Box
              ref={scrollerRef}
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                gap: 0,
                overflowX: "auto",
                overflowY: "hidden",
                scrollSnapType: "x mandatory",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {sortedItems.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    flex: "0 0 100%",
                    width: "100%",
                    scrollSnapAlign: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <ExamPlanCard
                    row={row}
                    semesterLabels={enrolment.semester_labels || {}}
                    showProgramme={!programmeFilter}
                    downloading={downloadingId === row.id}
                    onDownload={handleDownload}
                    onOpen={(r) => navigate(`/exam-timetables/${r.id}`)}
                    onDelete={handleDelete}
                    canDelete={canDeletePlan(row)}
                  />
                </Box>
              ))}
            </Box>

            <IconButton
              aria-label="Next exam plan"
              disabled={!canScrollRight}
              onClick={() => scrollBy(1)}
              sx={{ ...carouselArrowSx, alignSelf: "center" }}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
            </IconButton>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
