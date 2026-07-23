import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import LayersIcon from "@mui/icons-material/Layers";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ViewListIcon from "@mui/icons-material/ViewList";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CohortTransferRegisterPanel from "./CohortTransferRegisterPanel";
import {
  authJsonHeaders,
  getPortalToken,
  primaryGreen,
  primaryDark,
  navy,
  accentGold,
  textPrimary,
  textSecondary,
  fontDisplay,
  fontBody,
  profileImageSrc,
} from "../Users/usersShared";
import { useNavigate } from "react-router-dom";

const DRAG_BODY_CLASS = "cohort-transfer-dragging";

const dropZoneActiveSx = {
  border: `2px solid ${accentGold} !important`,
  bgcolor: `${alpha(accentGold, 0.1)} !important`,
  boxShadow: `inset 0 0 0 1px ${alpha(accentGold, 0.35)}, 0 12px 32px ${alpha(primaryGreen, 0.12)}`,
  transform: "translateY(-2px)",
};

function getGallerySlideSpan(container) {
  if (!container) return null;
  const slide = container.querySelector("[data-year-slide]");
  if (!slide) return null;
  const gap = parseFloat(getComputedStyle(container).columnGap || getComputedStyle(container).gap) || 0;
  return slide.offsetWidth + gap;
}

function cloneSemesters(semesters) {
  return (semesters || []).map((sem) => ({
    ...sem,
    students: [...(sem.students || [])],
  }));
}

function StudentCardVisual({ student }) {
  const name = student.full_name || student.admission_number || "?";
  const photo = profileImageSrc(student);
  return (
    <>
      <DragIndicatorIcon
        sx={{
          fontSize: 15,
          color: alpha(navy, 0.28),
          flexShrink: 0,
          mt: 0.15,
        }}
      />
      <Avatar
        src={photo || undefined}
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          bgcolor: alpha(primaryGreen, 0.14),
          color: primaryGreen,
          fontWeight: 800,
          fontSize: "0.78rem",
          fontFamily: fontDisplay,
          border: `1.5px solid ${alpha(primaryGreen, 0.18)}`,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: textPrimary,
            lineHeight: 1.25,
            fontSize: "0.8rem",
            fontFamily: fontBody,
          }}
          noWrap
        >
          {name}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 600,
            color: textSecondary,
            fontFamily: fontBody,
            letterSpacing: "0.02em",
          }}
          noWrap
        >
          {student.admission_number || "No admission no."}
        </Typography>
      </Box>
    </>
  );
}

function studentCardSx({ ghost = false, dragging = false, selected = false } = {}) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 0.85,
    py: 0.95,
    px: 1,
    borderRadius: "14px",
    border: ghost
      ? `2px solid ${accentGold}`
      : selected
        ? `1.5px solid ${primaryGreen}`
        : `1px solid ${alpha(navy, 0.08)}`,
    bgcolor: selected ? alpha(primaryGreen, 0.07) : "#fff",
    boxShadow: ghost
      ? `0 28px 56px ${alpha(navy, 0.28)}, 0 0 0 1px ${alpha(accentGold, 0.4)}`
      : selected
        ? `0 8px 22px ${alpha(primaryGreen, 0.16)}`
        : `0 2px 10px ${alpha(navy, 0.05)}`,
    opacity: dragging ? 0.28 : ghost ? 0.98 : 1,
    transform: ghost ? "rotate(-2deg) scale(1.03)" : undefined,
    transition: ghost ? "none" : "border-color 0.2s, box-shadow 0.2s, transform 0.2s, background 0.2s",
    ...(dragging
      ? {
          borderStyle: "dashed",
          borderColor: alpha(primaryGreen, 0.3),
          bgcolor: alpha(primaryGreen, 0.04),
          boxShadow: "none",
        }
      : {}),
    "& *": { pointerEvents: "none", userSelect: "none" },
  };
}

function DragStudentGhost({ student, width, x, y, count, ghostRef, offsetRef }) {
  return createPortal(
    <Box
      ref={(el) => {
        ghostRef.current = el;
        if (el && x != null && y != null) {
          const { offsetX, offsetY } = offsetRef.current;
          el.style.transform = `translate3d(${x - offsetX}px, ${y - offsetY}px, 0)`;
        }
      }}
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1400,
        width: Math.max(width, 180),
        pointerEvents: "none",
        willChange: "transform",
        ...studentCardSx({ ghost: true }),
      }}
    >
      {count > 1 ? (
        <Chip
          size="small"
          label={`${count}`}
          sx={{
            position: "absolute",
            top: -12,
            right: -10,
            fontWeight: 900,
            bgcolor: accentGold,
            color: navy,
            height: 26,
            minWidth: 26,
            fontSize: "0.75rem",
            zIndex: 1,
            boxShadow: `0 6px 16px ${alpha(accentGold, 0.45)}`,
          }}
        />
      ) : null}
      <StudentCardVisual student={student} />
    </Box>,
    document.body
  );
}

function DraggableStudentCard({
  student,
  disabled,
  pickupDisabled,
  year,
  semester,
  isSelected,
  onToggleSelect,
  onPointerDragStart,
  onViewStudent,
}) {
  const handlePointerDown = (e) => {
    if (disabled || pickupDisabled || e.button !== 0) return;
    if (e.target.closest("[data-select-checkbox]") || e.target.closest("[data-view-student]")) return;
    e.preventDefault();
    onPointerDragStart(e, {
      studentId: student.id,
      student,
      fromYear: year,
      fromSemester: semester,
    });
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.35 }}
      data-student-id={student.id}
      component={motion.div}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Checkbox
        data-select-checkbox
        size="small"
        checked={isSelected}
        disabled={disabled || pickupDisabled}
        onChange={() => onToggleSelect(student, year, semester)}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        sx={{
          p: 0.4,
          pointerEvents: "auto",
          color: alpha(navy, 0.28),
          "&.Mui-checked": { color: primaryGreen },
        }}
      />
      <Box
        data-student-drag-card
        onPointerDown={handlePointerDown}
        sx={{
          flex: 1,
          minWidth: 0,
          ...studentCardSx({ selected: isSelected }),
          cursor: disabled || pickupDisabled ? "default" : "grab",
          touchAction: "none",
          userSelect: "none",
          opacity: pickupDisabled ? 0.72 : 1,
          "&[data-drag-active='1']": studentCardSx({ dragging: true }),
          "&:hover":
            disabled || pickupDisabled
              ? {}
              : {
                  borderColor: alpha(primaryGreen, 0.4),
                  boxShadow: `0 10px 28px ${alpha(primaryGreen, 0.14)}`,
                  transform: "translateY(-2px)",
                },
          "&:active": { cursor: disabled || pickupDisabled ? "default" : "grabbing" },
        }}
      >
        <StudentCardVisual student={student} />
      </Box>
      <Tooltip title="View transcripts" arrow placement="top">
        <span>
          <IconButton
            data-view-student
            size="small"
            aria-label="View transcripts"
            disabled={disabled}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onViewStudent?.(student, year, semester);
            }}
            sx={{
              pointerEvents: "auto",
              width: 32,
              height: 32,
              flexShrink: 0,
              color: primaryGreen,
              bgcolor: alpha(primaryGreen, 0.08),
              border: `1px solid ${alpha(primaryGreen, 0.16)}`,
              "&:hover": {
                bgcolor: alpha(primaryGreen, 0.16),
                borderColor: alpha(primaryGreen, 0.35),
              },
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

function SemesterColumn({
  semester,
  year,
  programmeId,
  transferBusy,
  pickupDisabled,
  selectedCount,
  onBulkMoveHere,
  selectedStudentIds,
  onToggleSelect,
  onPointerDragStart,
  onViewStudent,
}) {
  const count = semester.student_count ?? semester.students?.length ?? 0;
  const canBulkMove = selectedCount > 0 && !transferBusy;
  const isSem1 = Number(semester.semester) === 1;

  return (
    <Box
      data-term-drop-zone
      data-year={year}
      data-semester={semester.semester}
      data-programme-id={programmeId}
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: alpha("#fff", 0.72),
        border: `1px solid ${alpha(navy, 0.08)}`,
        boxShadow: `0 10px 36px ${alpha(navy, 0.06)}`,
        backdropFilter: "blur(8px)",
        transition: "border-color 0.15s, background-color 0.15s, transform 0.15s, box-shadow 0.15s",
        "&[data-drop-active='1']": {
          ...dropZoneActiveSx,
          borderRadius: "20px",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          px: 1.5,
          py: 1.35,
          background: isSem1
            ? `linear-gradient(135deg, ${primaryGreen} 0%, ${primaryDark} 100%)`
            : `linear-gradient(135deg, ${navy} 0%, #2a3568 100%)`,
          color: "#fff",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -18,
            top: -22,
            width: 70,
            height: 70,
            borderRadius: "50%",
            bgcolor: "rgba(200,168,64,0.18)",
            pointerEvents: "none",
          }}
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: "relative" }}>
          <Box>
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Term
            </Typography>
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.2 }}>
              {semester.name}
            </Typography>
          </Box>
          <Box
            sx={{
              minWidth: 36,
              height: 36,
              px: 1,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1rem", color: accentGold }}>
              {count}
            </Typography>
          </Box>
        </Stack>
        {canBulkMove ? (
          <Button
            size="small"
            fullWidth
            startIcon={<NorthEastIcon sx={{ fontSize: 14 }} />}
            onClick={() => onBulkMoveHere(programmeId, year, semester.semester)}
            sx={{
              mt: 1.1,
              py: 0.55,
              fontSize: "0.72rem",
              fontWeight: 800,
              borderRadius: "10px",
              bgcolor: accentGold,
              color: navy,
              textTransform: "none",
              fontFamily: fontBody,
              pointerEvents: "auto",
              "&:hover": { bgcolor: "#d4b44a" },
            }}
          >
            Move {selectedCount} here
          </Button>
        ) : null}
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 140,
          px: 1,
          py: 1,
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, ${alpha(primaryGreen, 0.05)} 0%, transparent 60%),
            ${alpha("#f7faf8", 0.9)}
          `,
        }}
      >
        {(semester.students || []).length === 0 ? (
          <Box
            sx={{
              py: 3.5,
              px: 1.5,
              textAlign: "center",
              borderRadius: "14px",
              border: `1.5px dashed ${alpha(primaryGreen, 0.22)}`,
              bgcolor: alpha(primaryGreen, 0.03),
              minHeight: 110,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 28, color: alpha(primaryGreen, 0.4), mb: 0.75 }} />
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.78rem",
                fontWeight: 700,
                color: primaryDark,
              }}
            >
              Drop here
            </Typography>
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.68rem", color: textSecondary, mt: 0.25 }}>
              Drag a student into this term
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.85}>
            {(semester.students || []).map((student) => (
              <DraggableStudentCard
                key={student.id}
                student={student}
                disabled={transferBusy}
                pickupDisabled={pickupDisabled}
                year={year}
                semester={semester.semester}
                isSelected={selectedStudentIds.has(student.id)}
                onToggleSelect={onToggleSelect}
                onPointerDragStart={onPointerDragStart}
                onViewStudent={onViewStudent}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default function CohortTransferPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const pointerDragRef = useRef(null);
  const activeCardRef = useRef(null);
  const dragPointerIdRef = useRef(null);
  const dragGhostElRef = useRef(null);
  const dragGhostOffsetRef = useRef({ offsetX: 0, offsetY: 0 });
  const activeDropZoneRef = useRef(null);
  const bulkDragCardsRef = useRef([]);
  const semesterCacheRef = useRef({});

  const [dragGhost, setDragGhost] = useState(null);
  const [loadingProgrammes, setLoadingProgrammes] = useState(true);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [error, setError] = useState("");
  const [programmes, setProgrammes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [years, setYears] = useState([]);
  const [programmeMeta, setProgrammeMeta] = useState(null);
  const [yearIndex, setYearIndex] = useState(0);
  const [semesters, setSemesters] = useState([]);
  const [semestersForYear, setSemestersForYear] = useState(null);
  const [transferBusy, setTransferBusy] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [selectedStudents, setSelectedStudents] = useState(() => new Map());
  const [viewMode, setViewMode] = useState("transfer");
  const [registerRefreshKey, setRegisterRefreshKey] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cacheTick, setCacheTick] = useState(0);

  const selectedProgramme = programmes[activeTab] || null;
  const currentYear = years[yearIndex] || null;
  const selectedStudentIds = useMemo(() => new Set(selectedStudents.keys()), [selectedStudents]);
  const selectedCount = selectedStudents.size;

  const handleViewStudent = useCallback(
    (student, year, semester) => {
      const payload = {
        ...student,
        year_of_study: student.year_of_study ?? year,
        semester: student.semester ?? semester,
      };
      navigate(`/cohort-transfer/students/${student.id}/transcript`, {
        state: {
          student: payload,
          programmeName: programmeMeta?.name || selectedProgramme?.name || null,
        },
      });
    },
    [navigate, programmeMeta?.name, selectedProgramme?.name]
  );

  const showSnack = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const clearSelection = useCallback(() => setSelectedStudents(new Map()), []);

  const toggleStudentSelection = useCallback((student, year, semester) => {
    setSelectedStudents((prev) => {
      const next = new Map(prev);
      if (next.has(student.id)) next.delete(student.id);
      else next.set(student.id, { student, fromYear: year, fromSemester: semester });
      return next;
    });
  }, []);

  useEffect(() => {
    clearSelection();
    setViewMode("transfer");
  }, [activeTab, yearIndex, clearSelection]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    clearSelection();
  }, [searchQuery, clearSelection]);

  const cacheKey = useCallback((year, search = "") => {
    const q = String(search || "").trim().toLowerCase();
    return q ? `${year}::q::${q}` : String(year);
  }, []);

  const fetchSemesters = useCallback(
    async (programmeId, year, search = "") => {
      const token = getPortalToken();
      const params = new URLSearchParams();
      const q = String(search || "").trim();
      if (q) params.set("search", q);
      const query = params.toString();
      const res = await fetch(
        `/api/cohort-transfer/programmes/${encodeURIComponent(programmeId)}/years/${encodeURIComponent(
          year
        )}/semesters${query ? `?${query}` : ""}`,
        { headers: authJsonHeaders(token) }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load semesters.");
      return Array.isArray(data.data?.semesters) ? data.data.semesters : [];
    },
    []
  );

  const getCachedSemesters = useCallback(
    (year) => {
      void cacheTick;
      return semesterCacheRef.current[cacheKey(year, "")] || [];
    },
    [cacheKey, cacheTick]
  );

  const applyLocalMove = useCallback(
    ({ student, fromYear, fromSemester, toYear, toSemester }) => {
      const patchYear = (year, mutate) => {
        Object.keys(semesterCacheRef.current).forEach((key) => {
          if (key === String(year) || key.startsWith(`${year}::q::`)) {
            const current = semesterCacheRef.current[key];
            if (current) semesterCacheRef.current[key] = mutate(cloneSemesters(current));
          }
        });
      };

      patchYear(fromYear, (rows) =>
        rows.map((sem) => {
          if (Number(sem.semester) !== Number(fromSemester)) return sem;
          const students = (sem.students || []).filter((s) => s.id !== student.id);
          return { ...sem, students, student_count: students.length };
        })
      );

      patchYear(toYear, (rows) =>
        rows.map((sem) => {
          if (Number(sem.semester) !== Number(toSemester)) return sem;
          if ((sem.students || []).some((s) => s.id === student.id)) return sem;
          const students = [...(sem.students || []), student];
          return { ...sem, students, student_count: students.length };
        })
      );

      setCacheTick((t) => t + 1);
      if (semestersForYear === fromYear || semestersForYear === toYear) {
        const key = cacheKey(semestersForYear, searchQuery);
        const cached = semesterCacheRef.current[key] || semesterCacheRef.current[String(semestersForYear)];
        if (cached) setSemesters(cloneSemesters(cached));
      }

      if (fromYear !== toYear) {
        setYears((prev) =>
          prev.map((y) => {
            if (y.year_of_study === fromYear)
              return { ...y, student_count: Math.max(0, (y.student_count ?? 0) - 1) };
            if (y.year_of_study === toYear)
              return { ...y, student_count: (y.student_count ?? 0) + 1 };
            return y;
          })
        );
      }
    },
    [cacheKey, searchQuery, semestersForYear]
  );

  const clearPointerDragUi = useCallback(() => {
    document.body.classList.remove(DRAG_BODY_CLASS);
    document.querySelectorAll("[data-drop-active]").forEach((el) => el.removeAttribute("data-drop-active"));
    bulkDragCardsRef.current.forEach((card) => {
      card.removeAttribute("data-drag-active");
      card.style.pointerEvents = "";
    });
    bulkDragCardsRef.current = [];
    if (activeCardRef.current) {
      activeCardRef.current.removeAttribute("data-drag-active");
      activeCardRef.current.style.pointerEvents = "";
      if (activeCardRef.current.releasePointerCapture && dragPointerIdRef.current != null) {
        try {
          activeCardRef.current.releasePointerCapture(dragPointerIdRef.current);
        } catch {
          /* ignore */
        }
      }
      dragPointerIdRef.current = null;
      activeCardRef.current = null;
    }
    document.body.style.cursor = "";
    pointerDragRef.current = null;
    setDragGhost(null);
    dragGhostElRef.current = null;
  }, []);

  const moveDragGhost = useCallback((clientX, clientY) => {
    const { offsetX, offsetY } = dragGhostOffsetRef.current;
    if (dragGhostElRef.current) {
      dragGhostElRef.current.style.transform = `translate3d(${clientX - offsetX}px, ${clientY - offsetY}px, 0)`;
    }
  }, []);

  const commitTransfer = useCallback(
    async ({ studentId, targetProgrammeId, targetYear, targetSemester, source }) => {
      if (!source) return;
      if (
        Number(source.fromYear) === Number(targetYear) &&
        Number(source.fromSemester) === Number(targetSemester)
      ) {
        return;
      }

      const token = getPortalToken();
      setTransferBusy(true);

      const snapshot = {
        fromYear: source.fromYear,
        fromSemester: source.fromSemester,
        toYear: targetYear,
        toSemester: targetSemester,
        student: source.student,
        fromCache: cloneSemesters(semesterCacheRef.current[String(source.fromYear)]),
        toCache:
          Number(source.fromYear) === Number(targetYear)
            ? null
            : cloneSemesters(semesterCacheRef.current[String(targetYear)]),
        yearsSnapshot: years.map((y) => ({ ...y })),
      };

      applyLocalMove({
        student: source.student,
        fromYear: source.fromYear,
        fromSemester: source.fromSemester,
        toYear: targetYear,
        toSemester: targetSemester,
      });
      setSelectedStudents((prev) => {
        const next = new Map(prev);
        next.delete(studentId);
        return next;
      });

      try {
        const res = await fetch(`/api/cohort-transfer/students/${encodeURIComponent(studentId)}/move`, {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({
            programme_id: targetProgrammeId,
            year_of_study: targetYear,
            semester: targetSemester,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.message || "Could not move student.");
        showSnack(data.message || "Student moved.");
        setRegisterRefreshKey((k) => k + 1);
      } catch (e) {
        if (snapshot.fromCache) semesterCacheRef.current[String(snapshot.fromYear)] = snapshot.fromCache;
        if (snapshot.toCache) semesterCacheRef.current[String(snapshot.toYear)] = snapshot.toCache;
        setYears(snapshot.yearsSnapshot);
        setCacheTick((t) => t + 1);
        if (semestersForYear) {
          const cached =
            semesterCacheRef.current[cacheKey(semestersForYear, searchQuery)] ||
            semesterCacheRef.current[String(semestersForYear)];
          if (cached) setSemesters(cloneSemesters(cached));
        }
        showSnack(e.message || "Could not move student.", "error");
      } finally {
        setTransferBusy(false);
      }
    },
    [applyLocalMove, cacheKey, searchQuery, semestersForYear, showSnack, years]
  );

  const commitBulkTransfer = useCallback(
    async (targetProgrammeId, targetYear, targetSemester) => {
      const items = [...selectedStudents.values()].filter(
        (item) =>
          !(
            Number(item.fromYear) === Number(targetYear) &&
            Number(item.fromSemester) === Number(targetSemester)
          )
      );
      if (!items.length) {
        showSnack("Selected students are already in that semester.", "info");
        clearSelection();
        return;
      }

      const token = getPortalToken();
      setTransferBusy(true);

      const yearsSnap = years.map((y) => ({ ...y }));
      const cacheSnap = {};
      const affected = new Set(items.flatMap((i) => [i.fromYear, targetYear]));
      affected.forEach((y) => {
        if (semesterCacheRef.current[String(y)]) {
          cacheSnap[y] = cloneSemesters(semesterCacheRef.current[String(y)]);
        }
      });

      items.forEach((item) => {
        applyLocalMove({
          student: item.student,
          fromYear: item.fromYear,
          fromSemester: item.fromSemester,
          toYear: targetYear,
          toSemester: targetSemester,
        });
      });
      clearSelection();

      try {
        const res = await fetch("/api/cohort-transfer/students/move-bulk", {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({
            student_ids: items.map((i) => i.student.id),
            programme_id: targetProgrammeId,
            year_of_study: targetYear,
            semester: targetSemester,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.message || "Could not move students.");
        showSnack(data.message || `Moved ${items.length} student(s).`);
        setRegisterRefreshKey((k) => k + 1);
      } catch (e) {
        Object.entries(cacheSnap).forEach(([y, snap]) => {
          semesterCacheRef.current[String(y)] = snap;
        });
        setYears(yearsSnap);
        setCacheTick((t) => t + 1);
        if (semestersForYear) {
          const cached =
            semesterCacheRef.current[cacheKey(semestersForYear, searchQuery)] ||
            semesterCacheRef.current[String(semestersForYear)];
          if (cached) setSemesters(cloneSemesters(cached));
        }
        showSnack(e.message || "Could not move students.", "error");
      } finally {
        setTransferBusy(false);
      }
    },
    [applyLocalMove, cacheKey, clearSelection, searchQuery, selectedStudents, semestersForYear, showSnack, years]
  );

  const onBulkMoveHere = useCallback(
    (programmeId, year, semester) => {
      if (!programmeId || !year || !semester || transferBusy || !selectedCount) return;
      void commitBulkTransfer(programmeId, year, semester);
    },
    [commitBulkTransfer, selectedCount, transferBusy]
  );

  const maybeAutoScrollGallery = useCallback((clientX) => {
    const container = scrollRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const margin = 88;
    const speed = 22;
    if (clientX < rect.left + margin) {
      container.scrollLeft = Math.max(0, container.scrollLeft - speed);
    } else if (clientX > rect.right - margin) {
      container.scrollLeft = Math.min(
        container.scrollWidth - container.clientWidth,
        container.scrollLeft + speed
      );
    }
  }, []);

  const onPointerDragStart = useCallback(
    (e, payload) => {
      if (transferBusy || pointerDragRef.current || !selectedProgramme) return;

      const bulkDrag = selectedStudentIds.has(payload.studentId) && selectedCount > 1;
      const dragCount = bulkDrag ? selectedCount : 1;
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      dragGhostOffsetRef.current = {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };

      bulkDragCardsRef.current = [];
      if (bulkDrag) {
        selectedStudentIds.forEach((id) => {
          const wrapper = document.querySelector(`[data-student-id="${CSS.escape(String(id))}"]`);
          const dragCard = wrapper?.querySelector("[data-student-drag-card]");
          if (dragCard) {
            dragCard.setAttribute("data-drag-active", "1");
            dragCard.style.pointerEvents = "none";
            bulkDragCardsRef.current.push(dragCard);
          }
        });
      } else {
        activeCardRef.current = card;
        card.setAttribute("data-drag-active", "1");
        card.style.pointerEvents = "none";
        if (card.setPointerCapture) card.setPointerCapture(e.pointerId);
        dragPointerIdRef.current = e.pointerId;
      }

      document.body.classList.add(DRAG_BODY_CLASS);
      document.body.style.cursor = "grabbing";
      pointerDragRef.current = { ...payload, bulk: bulkDrag, programmeId: selectedProgramme.id };
      setDragGhost({
        student: payload.student,
        width: rect.width,
        x: e.clientX,
        y: e.clientY,
        count: dragCount,
      });

      const findDropZoneAt = (clientX, clientY) => {
        const stack =
          typeof document.elementsFromPoint === "function"
            ? document.elementsFromPoint(clientX, clientY)
            : [document.elementFromPoint(clientX, clientY)].filter(Boolean);
        for (const el of stack) {
          const zone = el?.closest?.("[data-term-drop-zone]");
          if (zone) return zone;
        }
        return null;
      };

      const highlightAt = (clientX, clientY) => {
        document.querySelectorAll("[data-drop-active]").forEach((el) => el.removeAttribute("data-drop-active"));
        const zone = findDropZoneAt(clientX, clientY);
        activeDropZoneRef.current = zone;
        zone?.setAttribute("data-drop-active", "1");
      };

      const onMove = (ev) => {
        if (ev.cancelable) ev.preventDefault();
        moveDragGhost(ev.clientX, ev.clientY);
        maybeAutoScrollGallery(ev.clientX);
        highlightAt(ev.clientX, ev.clientY);
      };

      const onUp = (ev) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);

        const zoneFromPoint = findDropZoneAt(ev.clientX, ev.clientY);
        const zoneFromHighlight =
          document.querySelector("[data-term-drop-zone][data-drop-active='1']") || activeDropZoneRef.current;
        const zone = zoneFromPoint || zoneFromHighlight;
        const source = pointerDragRef.current;
        clearPointerDragUi();
        activeDropZoneRef.current = null;
        if (!zone || !source) return;

        const targetYear = Number(zone.getAttribute("data-year"));
        const targetSemester = Number(zone.getAttribute("data-semester"));
        const targetProgrammeId = zone.getAttribute("data-programme-id") || source.programmeId;
        if (!Number.isFinite(targetYear) || targetYear < 1 || (targetSemester !== 1 && targetSemester !== 2) || !targetProgrammeId) {
          return;
        }

        if (source.bulk) {
          void commitBulkTransfer(targetProgrammeId, targetYear, targetSemester);
          return;
        }

        void commitTransfer({
          studentId: source.studentId,
          targetProgrammeId,
          targetYear,
          targetSemester,
          source: { ...source },
        });
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [
      clearPointerDragUi,
      commitBulkTransfer,
      commitTransfer,
      maybeAutoScrollGallery,
      moveDragGhost,
      selectedCount,
      selectedProgramme,
      selectedStudentIds,
      transferBusy,
    ]
  );

  useEffect(() => () => clearPointerDragUi(), [clearPointerDragUi]);

  const loadProgrammes = useCallback(async () => {
    const token = getPortalToken();
    if (!token) return;
    setLoadingProgrammes(true);
    setError("");
    try {
      const res = await fetch("/api/cohort-transfer/programmes", { headers: authJsonHeaders(token) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load programmes.");
      const rows = Array.isArray(data.data) ? data.data : [];
      setProgrammes(rows);
      setActiveTab((prev) => (rows.length && prev >= rows.length ? 0 : prev));
    } catch (e) {
      setError(e.message || "Could not load programmes.");
      setProgrammes([]);
    } finally {
      setLoadingProgrammes(false);
    }
  }, []);

  const loadYears = useCallback(async (programmeId) => {
    const token = getPortalToken();
    if (!token || !programmeId) {
      setYears([]);
      setProgrammeMeta(null);
      return;
    }
    setLoadingYears(true);
    setError("");
    try {
      const res = await fetch(
        `/api/cohort-transfer/programmes/${encodeURIComponent(programmeId)}/years`,
        { headers: authJsonHeaders(token) }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load years.");
      setProgrammeMeta(data.data?.programme || null);
      setYears(Array.isArray(data.data?.years) ? data.data.years : []);
      setYearIndex(0);
      semesterCacheRef.current = {};
      setSemesters([]);
      setSemestersForYear(null);
    } catch (e) {
      setError(e.message || "Could not load years.");
      setYears([]);
      setProgrammeMeta(null);
    } finally {
      setLoadingYears(false);
    }
  }, []);

  const loadSemesters = useCallback(
    async (programmeId, year, search = "") => {
      if (!programmeId || !year) {
        setSemesters([]);
        setSemestersForYear(null);
        return;
      }
      const key = cacheKey(year, search);
      if (semesterCacheRef.current[key]) {
        setSemesters(cloneSemesters(semesterCacheRef.current[key]));
        setSemestersForYear(year);
        setLoadingSemesters(false);
        return;
      }
      setLoadingSemesters(true);
      try {
        const rows = await fetchSemesters(programmeId, year, search);
        semesterCacheRef.current[key] = cloneSemesters(rows);
        if (!search) semesterCacheRef.current[String(year)] = cloneSemesters(rows);
        setSemesters(cloneSemesters(rows));
        setSemestersForYear(year);
        setCacheTick((t) => t + 1);
      } catch (e) {
        setError(e.message || "Could not load semesters.");
        setSemesters([]);
        setSemestersForYear(year);
      } finally {
        setLoadingSemesters(false);
      }
    },
    [cacheKey, fetchSemesters]
  );

  useEffect(() => {
    void loadProgrammes();
  }, [loadProgrammes]);

  useEffect(() => {
    if (selectedProgramme?.id) {
      void loadYears(selectedProgramme.id);
      setSearchInput("");
      setSearchQuery("");
    } else {
      setYears([]);
      setProgrammeMeta(null);
      setYearIndex(0);
    }
  }, [selectedProgramme?.id, loadYears]);

  useEffect(() => {
    if (selectedProgramme?.id && currentYear?.year_of_study) {
      void loadSemesters(selectedProgramme.id, currentYear.year_of_study, searchQuery);
    } else {
      setSemesters([]);
      setSemestersForYear(null);
    }
  }, [selectedProgramme?.id, currentYear?.year_of_study, searchQuery, loadSemesters]);

  useEffect(() => {
    if (!selectedProgramme?.id || !years.length) return undefined;
    let cancelled = false;
    const prefetch = async () => {
      for (const yearItem of years) {
        if (cancelled) return;
        if (semesterCacheRef.current[String(yearItem.year_of_study)]) continue;
        try {
          const rows = await fetchSemesters(selectedProgramme.id, yearItem.year_of_study, "");
          if (!cancelled) {
            semesterCacheRef.current[String(yearItem.year_of_study)] = cloneSemesters(rows);
            setCacheTick((t) => t + 1);
          }
        } catch {
          /* skip */
        }
      }
    };
    void prefetch();
    return () => {
      cancelled = true;
    };
  }, [fetchSemesters, selectedProgramme?.id, years]);

  const selectYearIndex = useCallback(
    (index) => {
      const next = years[index];
      if (next?.year_of_study && selectedProgramme?.id) {
        const key = cacheKey(next.year_of_study, searchQuery);
        const cached = semesterCacheRef.current[key] || semesterCacheRef.current[String(next.year_of_study)];
        if (cached) {
          setSemesters(cloneSemesters(cached));
          setSemestersForYear(next.year_of_study);
        } else {
          void loadSemesters(selectedProgramme.id, next.year_of_study, searchQuery);
        }
      }
      setYearIndex(index);
    },
    [cacheKey, loadSemesters, searchQuery, selectedProgramme?.id, years]
  );

  const scrollToIndex = useCallback(
    (index) => {
      const container = scrollRef.current;
      if (!container) return;
      const span = getGallerySlideSpan(container) || container.clientWidth;
      container.scrollTo({ left: index * span, behavior: "smooth" });
      selectYearIndex(index);
    },
    [selectYearIndex]
  );

  useEffect(() => {
    if (years.length && scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setYearIndex(0);
    }
  }, [years]);

  const onGalleryScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || !years.length) return;
    const span = getGallerySlideSpan(container) || container.clientWidth;
    const index = Math.round(container.scrollLeft / span);
    const clamped = Math.min(Math.max(0, index), years.length - 1);
    setYearIndex((prev) => {
      if (prev === clamped) return prev;
      selectYearIndex(clamped);
      return clamped;
    });
  }, [selectYearIndex, years]);

  const onRefresh = () => {
    semesterCacheRef.current = {};
    void loadProgrammes();
    if (selectedProgramme?.id) void loadYears(selectedProgramme.id);
  };

  const isTransferSession = Boolean(dragGhost || selectedCount > 0);
  const totalStudents = programmes.reduce((sum, p) => sum + (Number(p.student_count) || 0), 0);

  const navArrowSx = (dragging) => ({
    position: "absolute",
    top: "42%",
    transform: "translateY(-50%)",
    zIndex: 3,
    width: 48,
    height: 48,
    bgcolor: "rgba(255,255,255,0.92)",
    border: `1px solid ${alpha(navy, 0.1)}`,
    color: primaryGreen,
    boxShadow: `0 12px 32px ${alpha(navy, 0.14)}`,
    backdropFilter: "blur(10px)",
    transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
    pointerEvents: dragging ? "none" : "auto",
    opacity: dragging ? 0.35 : 1,
    "&:hover": {
      bgcolor: "#fff",
      transform: "translateY(-50%) scale(1.06)",
      boxShadow: `0 16px 40px ${alpha(primaryGreen, 0.2)}`,
    },
    "&.Mui-disabled": { opacity: 0.28 },
  });

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 72px)",
        mx: { xs: -1.5, sm: -2, md: -3 },
        mt: { xs: -1, sm: -1.5 },
        mb: { xs: -1.5, sm: -2, md: -3 },
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: `
          radial-gradient(ellipse 70% 45% at 100% -10%, ${alpha(accentGold, 0.16)} 0%, transparent 55%),
          radial-gradient(ellipse 55% 40% at 0% 100%, ${alpha(primaryGreen, 0.1)} 0%, transparent 50%),
          linear-gradient(180deg, #f3f7f5 0%, #eef3f1 48%, #f7f4ef 100%)
        `,
      }}
    >
      {/* Hero */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 1.75, sm: 2 },
          pb: { xs: 2, sm: 2.25 },
          background: `linear-gradient(125deg, ${navy} 0%, ${primaryDark} 45%, ${primaryGreen} 100%)`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -90,
            right: -30,
            width: 240,
            height: 240,
            borderRadius: "50%",
            bgcolor: "rgba(200,168,64,0.18)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            left: "28%",
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                flexShrink: 0,
              }}
            >
              <TransferWithinAStationIcon sx={{ color: accentGold, fontSize: 26 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Academic progression
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.4rem", sm: "1.65rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                Cohort transfer
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.78)",
                  mt: 0.35,
                  display: { xs: "none", sm: "block" },
                  maxWidth: 520,
                }}
              >
                Drag students between semesters and years — placements update instantly with a full movement register.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1.25,
                px: 1.5,
                py: 0.85,
                borderRadius: "14px",
                bgcolor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                  Programmes
                </Typography>
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.1rem", color: accentGold, lineHeight: 1 }}>
                  {programmes.length}
                </Typography>
              </Box>
              <Box sx={{ width: 1, height: 28, bgcolor: "rgba(255,255,255,0.2)" }} />
              <Box>
                <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                  Students
                </Typography>
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.1rem", color: "#fff", lineHeight: 1 }}>
                  {totalStudents}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onRefresh}
              aria-label="Refresh"
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)", transform: "rotate(45deg)" },
                transition: "transform 0.35s, background 0.2s",
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {error ? (
        <Alert
          severity="error"
          sx={{ mx: { xs: 2, sm: 3, md: 4 }, mt: 1.5, borderRadius: "14px" }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      ) : null}

      {loadingProgrammes ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 1.5 }}>
          <CircularProgress sx={{ color: primaryGreen }} />
          <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.85rem" }}>
            Loading programmes…
          </Typography>
        </Box>
      ) : programmes.length === 0 ? (
        <Alert severity="info" sx={{ m: { xs: 2, sm: 3 }, borderRadius: "14px" }}>
          No programmes yet. Add a programme first, then students will appear here for transfer.
        </Alert>
      ) : (
        <>
          {/* Programme pills */}
          <Box
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              pt: 2,
              pb: 1.25,
              flexShrink: 0,
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Stack direction="row" spacing={1} sx={{ minWidth: "max-content" }}>
              {programmes.map((p, idx) => {
                const active = idx === activeTab;
                return (
                  <Box
                    key={p.id}
                    component={motion.button}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab(idx);
                      setYearIndex(0);
                    }}
                    sx={{
                      appearance: "none",
                      border: active ? `1.5px solid ${primaryGreen}` : `1px solid ${alpha(navy, 0.1)}`,
                      cursor: "pointer",
                      px: 1.75,
                      py: 1.05,
                      borderRadius: "999px",
                      bgcolor: active ? primaryGreen : "rgba(255,255,255,0.78)",
                      color: active ? "#fff" : textPrimary,
                      boxShadow: active
                        ? `0 10px 28px ${alpha(primaryGreen, 0.28)}`
                        : `0 2px 10px ${alpha(navy, 0.04)}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                      fontFamily: fontBody,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                      {p.name}
                    </Typography>
                    <Box
                      sx={{
                        px: 0.75,
                        py: 0.15,
                        borderRadius: "999px",
                        bgcolor: active ? "rgba(255,255,255,0.18)" : alpha(primaryGreen, 0.1),
                        color: active ? accentGold : primaryGreen,
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        fontFamily: fontDisplay,
                        minWidth: 22,
                        textAlign: "center",
                      }}
                    >
                      {p.student_count ?? 0}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Stage */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              mx: { xs: 1.5, sm: 2.5, md: 3.5 },
              mb: { xs: 1.5, sm: 2 },
              borderRadius: "24px",
              bgcolor: "rgba(255,255,255,0.55)",
              border: `1px solid ${alpha(navy, 0.08)}`,
              boxShadow: `0 20px 60px ${alpha(navy, 0.08)}`,
              overflow: "hidden",
              backdropFilter: "blur(12px)",
            }}
          >
            <Box
              sx={{
                px: { xs: 2, md: 2.75 },
                py: 1.5,
                borderBottom: `1px solid ${alpha(navy, 0.06)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                flexShrink: 0,
                background: `linear-gradient(90deg, ${alpha(primaryGreen, 0.04)} 0%, transparent 60%)`,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: textSecondary,
                  }}
                >
                  Active programme
                </Typography>
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.15rem", color: textPrimary, lineHeight: 1.2 }}>
                  {programmeMeta?.name || selectedProgramme?.name || "Programme"}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={
                  loadingYears
                    ? "Loading…"
                    : years.length
                      ? `Year ${yearIndex + 1} of ${years.length}`
                      : "No years"
                }
                sx={{
                  fontWeight: 800,
                  fontFamily: fontBody,
                  bgcolor: alpha(accentGold, 0.18),
                  color: navy,
                  border: `1px solid ${alpha(accentGold, 0.35)}`,
                }}
              />
            </Box>

            <Box sx={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
              {years.length > 0 ? (
                <>
                  <IconButton
                    onClick={() => scrollToIndex(Math.max(0, yearIndex - 1))}
                    disabled={loadingYears || yearIndex <= 0}
                    sx={{ ...navArrowSx(Boolean(dragGhost)), left: { xs: 6, md: 14 } }}
                    aria-label="Previous year"
                  >
                    <KeyboardArrowLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => scrollToIndex(Math.min(years.length - 1, yearIndex + 1))}
                    disabled={loadingYears || yearIndex >= years.length - 1}
                    sx={{ ...navArrowSx(Boolean(dragGhost)), right: { xs: 6, md: 14 } }}
                    aria-label="Next year"
                  >
                    <KeyboardArrowRightIcon />
                  </IconButton>
                </>
              ) : null}

              {loadingYears ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", py: 8 }}>
                  <CircularProgress sx={{ color: primaryGreen }} />
                </Box>
              ) : !years.length ? (
                <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "22px",
                      display: "grid",
                      placeItems: "center",
                      mx: "auto",
                      mb: 1.5,
                      bgcolor: alpha(primaryGreen, 0.08),
                      color: primaryGreen,
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.25rem", color: textPrimary }}>
                    No years configured
                  </Typography>
                  <Typography sx={{ fontFamily: fontBody, color: textSecondary, mt: 0.5 }}>
                    Set duration years on the programme, then return here.
                  </Typography>
                </Box>
              ) : (
                <Box
                  ref={scrollRef}
                  onScroll={onGalleryScroll}
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    gap: 2.5,
                    overflowX: "auto",
                    overflowY: "auto",
                    scrollSnapType: dragGhost ? "none" : "x mandatory",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    px: { xs: 1, md: 1.5 },
                  }}
                >
                  {years.map((yearItem, idx) => {
                    const isActive = idx === yearIndex;
                    const cached = getCachedSemesters(yearItem.year_of_study);
                    const slideSemesters =
                      isActive && semestersForYear === yearItem.year_of_study ? semesters : cached;
                    const slideLoading = isActive ? loadingSemesters : !cached.length;

                    return (
                      <Box
                        key={yearItem.id}
                        data-year-slide
                        sx={{
                          flex: "0 0 88%",
                          scrollSnapAlign: "center",
                          scrollSnapStop: "always",
                          px: { xs: 1, md: 1.5 },
                          py: { xs: 2, md: 2.5 },
                          boxSizing: "border-box",
                          opacity: isActive ? 1 : isTransferSession ? 0.94 : 0.48,
                          transform: isActive ? "none" : "scale(0.96)",
                          transition: "opacity 0.28s ease, transform 0.28s ease",
                          filter: isActive ? "none" : "saturate(0.85)",
                        }}
                      >
                        <Box
                          component={motion.div}
                          layout
                          sx={{
                            width: "100%",
                            borderRadius: "26px",
                            overflow: "hidden",
                            bgcolor: "#fff",
                            border: isTransferSession && !isActive
                              ? `2px solid ${alpha(accentGold, 0.55)}`
                              : `1px solid ${alpha(navy, 0.08)}`,
                            boxShadow: isActive
                              ? `0 28px 64px -16px ${alpha(primaryGreen, 0.28)}, 0 8px 24px ${alpha(navy, 0.06)}`
                              : `0 12px 36px ${alpha(navy, 0.08)}`,
                          }}
                        >
                          {/* Year banner */}
                          <Box
                            sx={{
                              position: "relative",
                              px: { xs: 2.25, md: 3 },
                              py: { xs: 2, md: 2.4 },
                              background: `linear-gradient(135deg, ${primaryGreen} 0%, ${navy} 100%)`,
                              color: "#fff",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                right: -20,
                                top: -40,
                                width: 160,
                                height: 160,
                                borderRadius: "50%",
                                bgcolor: "rgba(200,168,64,0.2)",
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                left: "40%",
                                bottom: -50,
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                bgcolor: "rgba(255,255,255,0.06)",
                              }}
                            />
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                              sx={{ position: "relative", zIndex: 1 }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: fontDisplay,
                                  fontWeight: 700,
                                  fontSize: { xs: "3.4rem", md: "4.2rem" },
                                  lineHeight: 0.9,
                                  color: accentGold,
                                  letterSpacing: "-0.04em",
                                  textShadow: `0 8px 28px ${alpha("#000", 0.25)}`,
                                }}
                              >
                                {yearItem.year_of_study}
                              </Typography>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontFamily: fontBody,
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    letterSpacing: "0.12em",
                                    textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.7)",
                                  }}
                                >
                                  Year of study
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: fontDisplay,
                                    fontWeight: 700,
                                    fontSize: { xs: "1.25rem", md: "1.45rem" },
                                    lineHeight: 1.15,
                                  }}
                                >
                                  {yearItem.name}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: fontBody,
                                    fontSize: "0.78rem",
                                    color: "rgba(255,255,255,0.75)",
                                    mt: 0.35,
                                  }}
                                  noWrap
                                >
                                  {programmeMeta?.name || selectedProgramme?.name}
                                </Typography>
                              </Box>
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ mt: 2, position: "relative", zIndex: 1 }}>
                              {[
                                { icon: PeopleIcon, label: "Students", value: yearItem.student_count ?? 0 },
                                { icon: LayersIcon, label: "Semesters", value: 2 },
                              ].map((stat) => (
                                <Box
                                  key={stat.label}
                                  sx={{
                                    flex: 1,
                                    px: 1.35,
                                    py: 1,
                                    borderRadius: "14px",
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.16)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <stat.icon sx={{ fontSize: 18, color: accentGold }} />
                                  <Box>
                                    <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                                      {stat.label}
                                    </Typography>
                                    <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.05rem", lineHeight: 1 }}>
                                      {stat.value}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </Box>

                          <Box sx={{ p: { xs: 1.75, md: 2.25 } }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              flexWrap="wrap"
                              gap={1.25}
                              sx={{ mb: 1.75 }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: fontBody,
                                  fontWeight: 800,
                                  fontSize: "0.68rem",
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: primaryDark,
                                }}
                              >
                                {isActive
                                  ? viewMode === "register"
                                    ? "Movement register"
                                    : "Semester boards"
                                  : "Drop target"}
                              </Typography>

                              {isActive ? (
                                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ flex: 1, justifyContent: "flex-end" }}>
                                  <Box
                                    sx={{
                                      display: "inline-flex",
                                      p: 0.35,
                                      borderRadius: "12px",
                                      bgcolor: alpha(primaryGreen, 0.08),
                                      border: `1px solid ${alpha(primaryGreen, 0.14)}`,
                                    }}
                                  >
                                    {[
                                      { id: "transfer", label: "Transfer", icon: SwapHorizIcon },
                                      { id: "register", label: "Register", icon: ViewListIcon },
                                    ].map((mode) => {
                                      const on = viewMode === mode.id;
                                      return (
                                        <Button
                                          key={mode.id}
                                          size="small"
                                          startIcon={<mode.icon sx={{ fontSize: 16 }} />}
                                          onClick={() => setViewMode(mode.id)}
                                          sx={{
                                            textTransform: "none",
                                            fontFamily: fontBody,
                                            fontWeight: 800,
                                            fontSize: "0.75rem",
                                            borderRadius: "9px",
                                            px: 1.35,
                                            py: 0.55,
                                            minWidth: 0,
                                            color: on ? "#fff" : primaryDark,
                                            bgcolor: on ? primaryGreen : "transparent",
                                            boxShadow: on ? `0 6px 16px ${alpha(primaryGreen, 0.3)}` : "none",
                                            "&:hover": {
                                              bgcolor: on ? primaryDark : alpha(primaryGreen, 0.1),
                                            },
                                          }}
                                        >
                                          {mode.label}
                                        </Button>
                                      );
                                    })}
                                  </Box>
                                  <TextField
                                    size="small"
                                    placeholder="Search students…"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    sx={{
                                      minWidth: { xs: "100%", sm: 200 },
                                      maxWidth: 260,
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        bgcolor: alpha(primaryGreen, 0.03),
                                        fontFamily: fontBody,
                                        fontSize: "0.82rem",
                                        "& fieldset": { borderColor: alpha(primaryGreen, 0.15) },
                                        "&:hover fieldset": { borderColor: alpha(primaryGreen, 0.35) },
                                        "&.Mui-focused fieldset": { borderColor: primaryGreen },
                                      },
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <SearchIcon sx={{ fontSize: 18, color: alpha(primaryGreen, 0.55) }} />
                                        </InputAdornment>
                                      ),
                                      endAdornment: searchInput ? (
                                        <InputAdornment position="end">
                                          <IconButton size="small" onClick={() => setSearchInput("")}>
                                            <ClearIcon fontSize="small" />
                                          </IconButton>
                                        </InputAdornment>
                                      ) : null,
                                    }}
                                  />
                                </Stack>
                              ) : (
                                <Chip
                                  size="small"
                                  label="Release on a semester"
                                  sx={{
                                    fontWeight: 700,
                                    bgcolor: alpha(accentGold, 0.15),
                                    color: navy,
                                    border: `1px solid ${alpha(accentGold, 0.35)}`,
                                  }}
                                />
                              )}
                            </Stack>

                            {isActive && viewMode === "register" ? (
                              <CohortTransferRegisterPanel
                                programmeId={selectedProgramme.id}
                                yearOfStudy={yearItem.year_of_study}
                                searchQuery={searchQuery}
                                refreshKey={registerRefreshKey}
                                registerVisible
                              />
                            ) : slideLoading ? (
                              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                                <CircularProgress size={28} sx={{ color: primaryGreen }} />
                              </Box>
                            ) : (
                              <Box>
                                <AnimatePresence>
                                  {selectedCount > 0 && isActive ? (
                                    <Box
                                      component={motion.div}
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -6 }}
                                      sx={{
                                        mb: 1.5,
                                        px: 1.5,
                                        py: 1.1,
                                        borderRadius: "14px",
                                        background: `linear-gradient(90deg, ${alpha(accentGold, 0.2)} 0%, ${alpha(primaryGreen, 0.1)} 100%)`,
                                        border: `1px solid ${alpha(accentGold, 0.4)}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.84rem", color: navy }}>
                                        {selectedCount} selected — drag together or use Move here
                                      </Typography>
                                      <Button
                                        size="small"
                                        onClick={clearSelection}
                                        sx={{ fontWeight: 800, color: primaryDark, textTransform: "none" }}
                                      >
                                        Clear
                                      </Button>
                                    </Box>
                                  ) : null}
                                </AnimatePresence>
                                <Box sx={{ display: "flex", width: "100%", gap: 1.25, alignItems: "stretch" }}>
                                  {slideSemesters.map((sem) => (
                                    <SemesterColumn
                                      key={sem.id}
                                      semester={sem}
                                      year={yearItem.year_of_study}
                                      programmeId={selectedProgramme.id}
                                      transferBusy={transferBusy}
                                      pickupDisabled={!isActive}
                                      selectedCount={selectedCount}
                                      onBulkMoveHere={onBulkMoveHere}
                                      selectedStudentIds={selectedStudentIds}
                                      onToggleSelect={toggleStudentSelection}
                                      onPointerDragStart={onPointerDragStart}
                                      onViewStudent={handleViewStudent}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", fontWeight: 700, borderRadius: "12px", fontFamily: fontBody }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {dragGhost ? (
        <DragStudentGhost
          student={dragGhost.student}
          width={dragGhost.width}
          x={dragGhost.x}
          y={dragGhost.y}
          count={dragGhost.count || 1}
          ghostRef={dragGhostElRef}
          offsetRef={dragGhostOffsetRef}
        />
      ) : null}
    </Box>
  );
}
