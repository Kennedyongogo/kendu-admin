import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccountTree as AccountTreeIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
  Send as SendIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton, PremiumDialog, fadeUp } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  getPortalUser,
  fontBody,
  fontDisplay,
  ghostBtnSx,
  inputSx,
  pageShellSx,
  primaryBtnSx,
  primaryDark,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import {
  formatCategory,
  getProgrammeYearOptions,
  getProgrammeSemesterOptions,
  defaultScheduleForProgramme,
} from "../Programmes/programmesShared";

const STATUS_META = {
  draft: { label: "Draft", color: textSecondary, bg: "rgba(30,40,88,0.06)" },
  pending: { label: "Pending", color: "#9a6700", bg: "rgba(200,168,64,0.18)" },
  approved: { label: "Approved", color: primaryDark, bg: "rgba(0,96,80,0.12)" },
  rejected: { label: "Rejected", color: "#9b1c1c", bg: "rgba(155,28,28,0.1)" },
};

function currentAcademicYear() {
  const now = new Date();
  const y = now.getFullYear();
  const month = now.getMonth();
  if (month >= 8) return `${y}/${y + 1}`;
  return `${y - 1}/${y}`;
}

const emptyForm = () => ({
  code: "",
  name: "",
  description: "",
  credits: 3,
  hours: 45,
  programme_id: "",
  department_id: "",
  year_of_study: 1,
  semester: 1,
  academic_year: currentAcademicYear(),
});

function rowToForm(row) {
  return {
    code: row.code || "",
    name: row.name || "",
    description: row.description || "",
    credits: row.credits ?? 0,
    hours: row.hours ?? 0,
    programme_id: row.programme_id || row.programme?.id || "",
    department_id: row.department_id || row.department?.id || "",
    year_of_study: row.year_of_study || 1,
    semester: row.semester || 1,
    academic_year: row.academic_year || currentAcademicYear(),
  };
}

function StatusChip({ status }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return (
    <Chip
      size="small"
      label={meta.label}
      sx={{
        fontWeight: 700,
        fontSize: "0.7rem",
        bgcolor: meta.bg,
        color: meta.color,
      }}
    />
  );
}

function readActor() {
  return getPortalUser();
}

function ProgrammeGallery({
  programmes,
  loading,
  selectedId,
  department,
  isStaff,
  fitViewport = false,
  onSelect,
  onAddUnit,
}) {
  const [activeId, setActiveId] = useState(selectedId || programmes[0]?.id || null);

  useEffect(() => {
    if (selectedId) setActiveId(selectedId);
    else if (programmes.length && !programmes.some((p) => p.id === activeId)) {
      setActiveId(programmes[0].id);
    }
  }, [selectedId, programmes, activeId]);

  const active = programmes.find((p) => p.id === activeId) || programmes[0] || null;
  const counts = active?.unit_counts || { total: 0, pending: 0, approved: 0, draft: 0 };

  const departmentName = department?.name || (isStaff ? "Your department" : "School programmes");
  const departmentCode = department?.code || null;

  if (loading && !programmes.length) {
    return (
      <Box sx={{ flex: 1, py: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress size={32} sx={{ color: primaryGreen }} />
      </Box>
    );
  }

  if (!programmes.length) {
    return (
      <Box sx={{ px: { xs: 2.5, md: 4 }, py: 4, textAlign: "center", flex: 1 }}>
        <MenuBookIcon sx={{ fontSize: 40, color: primaryGreen, opacity: 0.45, mb: 1 }} />
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.2rem", color: textPrimary }}>
          No programmes linked yet
        </Typography>
        <Typography sx={{ fontFamily: fontBody, color: textSecondary, mt: 0.75, maxWidth: 420, mx: "auto", fontSize: "0.88rem" }}>
          {isStaff
            ? "Ask an admin to link programmes to your department, then you can list units against them."
            : "Create programmes and link them to departments to start offering units."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        flex: fitViewport ? 1 : undefined,
        minHeight: 0,
        height: fitViewport ? "100%" : undefined,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: fitViewport ? 0 : { xs: 360, md: 420 },
          height: fitViewport ? "100%" : undefined,
          overflow: "hidden",
          bgcolor: primaryGreen,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.5, md: 2.5 }}
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            px: { xs: 2, sm: 2.5, md: 3.25 },
            py: { xs: 1.75, md: 2.25 },
            alignItems: { md: "stretch" },
            boxSizing: "border-box",
          }}
        >
          <Box
            component={motion.div}
            key={`feat-${active?.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            sx={{
              flex: 1.35,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
              <AccountTreeIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }} />
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {departmentName}
              </Typography>
              {departmentCode ? (
                <Chip
                  size="small"
                  label={departmentCode}
                  sx={{
                    height: 22,
                    fontWeight: 800,
                    fontSize: "0.65rem",
                    bgcolor: "rgba(255,255,255,0.16)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.28)",
                  }}
                />
              ) : null}
            </Stack>

            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: fitViewport
                  ? { xs: "1.45rem", sm: "1.75rem", md: "2.05rem" }
                  : { xs: "2rem", sm: "2.45rem", md: "2.85rem" },
                lineHeight: 1.1,
                color: "#fff",
                letterSpacing: "-0.02em",
                maxWidth: 560,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {active?.name}
            </Typography>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.1 }}>
              {active?.category ? (
                <Chip
                  size="small"
                  label={formatCategory(active.category)}
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    bgcolor: "rgba(255,255,255,0.14)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                />
              ) : null}
              {active?.duration_years ? (
                <Chip
                  size="small"
                  label={`${active.duration_years} yr${active.duration_years === 1 ? "" : "s"}`}
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    bgcolor: "rgba(255,255,255,0.14)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                />
              ) : null}
              {active?.mode ? (
                <Chip
                  size="small"
                  label={formatCategory(active.mode)}
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                />
              ) : null}
            </Stack>

            {!fitViewport ? (
              <Typography
                sx={{
                  mt: 1.5,
                  fontFamily: fontBody,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "0.9rem",
                  lineHeight: 1.55,
                  maxWidth: 520,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {active?.description?.trim() ||
                  active?.award ||
                  "List semester units for this programme, then submit them for admin approval."}
              </Typography>
            ) : active?.award || active?.description ? (
              <Typography
                sx={{
                  mt: 1,
                  fontFamily: fontBody,
                  color: "rgba(255,255,255,0.72)",
                  fontSize: "0.82rem",
                  lineHeight: 1.45,
                  maxWidth: 480,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {active?.award || active?.description}
              </Typography>
            ) : null}

            <Stack direction="row" spacing={2} sx={{ mt: fitViewport ? 1.5 : 2.25 }} flexWrap="wrap" useFlexGap>
              {[
                { label: "Listed", value: counts.total },
                { label: "Approved", value: counts.approved },
                { label: "Pending", value: counts.pending },
              ].map((stat) => (
                <Box key={stat.label}>
                  <Typography
                    sx={{
                      fontFamily: fontDisplay,
                      fontWeight: 700,
                      fontSize: fitViewport ? "1.35rem" : "1.65rem",
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: fontBody,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.55)",
                      mt: 0.35,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: fitViewport ? 1.75 : 2.75 }}>
              <Button
                variant="contained"
                size={fitViewport ? "small" : "medium"}
                endIcon={<ArrowForwardIcon />}
                onClick={() => onSelect(active)}
                sx={{
                  fontFamily: fontBody,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: "11px",
                  px: 2.25,
                  py: fitViewport ? 0.85 : 1.1,
                  bgcolor: "#fff",
                  color: primaryGreen,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.92)", color: primaryGreen },
                }}
              >
                View units
              </Button>
              <Button
                variant="outlined"
                size={fitViewport ? "small" : "medium"}
                startIcon={<AddIcon />}
                onClick={() => onAddUnit(active)}
                sx={{
                  fontFamily: fontBody,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "11px",
                  px: 2,
                  py: fitViewport ? 0.85 : 1.05,
                  borderColor: "rgba(255,255,255,0.45)",
                  color: "#fff",
                  "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Add unit
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: fitViewport ? 280 : 300 },
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              maxHeight: { xs: fitViewport ? 160 : 200, md: "100%" },
            }}
          >
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                mb: 0.85,
                flexShrink: 0,
              }}
            >
              {programmes.length} programme{programmes.length === 1 ? "" : "s"}
            </Typography>

            <Stack
              spacing={0.75}
              sx={{
                overflowY: "auto",
                flex: 1,
                minHeight: 0,
                pr: 0.5,
                "&::-webkit-scrollbar": { width: 5 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(255,255,255,0.25)",
                  borderRadius: 8,
                },
              }}
            >
              {programmes.map((prog, idx) => {
                const selected = prog.id === active?.id;
                return (
                  <Box
                    key={prog.id}
                    component={motion.button}
                    type="button"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveId(prog.id)}
                    onDoubleClick={() => onSelect(prog)}
                    sx={{
                      all: "unset",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 0.75,
                      borderRadius: "12px",
                      bgcolor: selected ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                      border: selected
                        ? "1.5px solid #fff"
                        : "1.5px solid rgba(255,255,255,0.14)",
                      transition: "background 0.2s ease, border-color 0.2s ease",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
                    }}
                  >
                    <Box
                      sx={{
                        width: fitViewport ? 42 : 52,
                        height: fitViewport ? 42 : 52,
                        borderRadius: "10px",
                        flexShrink: 0,
                        bgcolor: "rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <Typography sx={{ fontFamily: fontDisplay, color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          color: "#fff",
                          lineHeight: 1.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {prog.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontSize: "0.66rem",
                          color: "rgba(255,255,255,0.55)",
                          mt: 0.2,
                        }}
                      >
                        {formatCategory(prog.category)}
                        {prog.unit_counts?.total != null ? ` · ${prog.unit_counts.total} units` : ""}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: fontDisplay,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: selected ? "#fff" : "rgba(255,255,255,0.45)",
                        pr: 0.35,
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default function Units() {
  const actor = useMemo(() => readActor(), []);
  const isAdmin = actor?.role === "admin";
  const isStaff = actor?.role === "staff";

  const [tab, setTab] = useState("programmes");
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);
  const [programmesLoading, setProgrammesLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [programmes, setProgrammes] = useState([]);
  const [departmentMeta, setDepartmentMeta] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const statusFilter =
    tab === "draft"
      ? "draft"
      : tab === "pending"
        ? "pending"
        : tab === "approved"
          ? "approved"
          : tab === "rejected"
            ? "rejected"
            : "";
  // Draft / rejected: only the units this user created (staff or admin)
  const mineOnly = tab === "draft" || tab === "rejected" || (isStaff && tab === "pending");
  const showUnitsTable = tab !== "programmes";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter, selectedProgrammeId, tab]);

  useEffect(() => {
    hasLoadedRef.current = false;
  }, [tab]);

  const loadProgrammes = useCallback(async () => {
    setProgrammesLoading(true);
    try {
      const token = getPortalToken();
      const res = await fetch("/api/units/assignable-programmes", {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setProgrammes(Array.isArray(data.data) ? data.data : []);
        setDepartmentMeta(data.meta?.department || null);
      }
    } catch {
      /* ignore */
    } finally {
      setProgrammesLoading(false);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const token = getPortalToken();
      const res = await fetch("/api/departments?is_active=true&limit=100", {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setDepartments(Array.isArray(data.data) ? data.data : []);
    } catch {
      /* ignore */
    }
  }, [isAdmin]);

  const load = useCallback(async () => {
    if (tab === "programmes") {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (!hasLoadedRef.current) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const token = getPortalToken();
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (mineOnly) params.set("mine", "true");
      if (selectedProgrammeId) params.set("programme_id", selectedProgrammeId);

      const res = await fetch(`/api/units?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load units");

      setRows(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total || 0);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err.message);
      if (!hasLoadedRef.current) setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, rowsPerPage, debouncedSearch, statusFilter, selectedProgrammeId, tab, mineOnly]);

  useEffect(() => {
    loadProgrammes();
    loadDepartments();
  }, [loadProgrammes, loadDepartments]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedProgramme = programmes.find((p) => p.id === selectedProgrammeId) || null;

  const openCreate = (programme) => {
    setEditing(null);
    const base = emptyForm();
    const picked =
      programme ||
      (selectedProgrammeId ? programmes.find((p) => p.id === selectedProgrammeId) : null);
    if (picked?.id) {
      base.programme_id = picked.id;
      Object.assign(base, defaultScheduleForProgramme(picked));
    } else if (selectedProgrammeId) {
      base.programme_id = selectedProgrammeId;
    }
    setForm(base);
    setDialogOpen(true);
  };

  const handleProgrammeChange = (programmeId) => {
    const programme = programmes.find((p) => p.id === programmeId);
    const schedule = defaultScheduleForProgramme(programme);
    setForm((prev) => ({
      ...prev,
      programme_id: programmeId,
      year_of_study: schedule.year_of_study,
      semester: schedule.semester,
    }));
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(rowToForm(row));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const goToProgrammeUnits = (programme) => {
    setSelectedProgrammeId(programme.id);
    setTab("draft");
    setPage(0);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.programme_id || !form.academic_year.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Code, name, programme, and academic year are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (isAdmin && !editing && !form.department_id) {
      Swal.fire({
        icon: "warning",
        title: "Department required",
        text: "Select which department owns this unit.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const token = getPortalToken();
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        credits: Number(form.credits) || 0,
        hours: Number(form.hours) || 0,
        programme_id: form.programme_id,
        year_of_study: Number(form.year_of_study) || 1,
        semester: Number(form.semester) || 1,
        academic_year: form.academic_year.trim(),
      };
      if (isAdmin && form.department_id) payload.department_id = form.department_id;
      const url = editing ? `/api/units/${editing.id}` : "/api/units";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: authJsonHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm());
      await Promise.all([load(), loadProgrammes()]);
      Swal.fire({
        icon: "success",
        title: editing ? "Unit updated" : "Unit created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async (row) => {
    const result = await Swal.fire({
      title: "Submit for approval?",
      text: `"${row.code}" will be sent to admin for review.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Submit",
    });
    if (!result.isConfirmed) return;

    try {
      const token = getPortalToken();
      const res = await fetch(`/api/units/${row.id}/submit`, {
        method: "POST",
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Submit failed");
      await Promise.all([load(), loadProgrammes()]);
      Swal.fire({ icon: "success", title: "Submitted", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    }
  };

  const approveUnit = async (row) => {
    try {
      const token = getPortalToken();
      const res = await fetch(`/api/units/${row.id}/approve`, {
        method: "POST",
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Approve failed");
      await Promise.all([load(), loadProgrammes()]);
      Swal.fire({ icon: "success", title: "Approved", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    }
  };

  const rejectUnit = async (row) => {
    const { value: reason } = await Swal.fire({
      title: "Reject unit?",
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Why is this unit being rejected?",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Reject",
    });
    if (reason === undefined) return;

    try {
      const token = getPortalToken();
      const res = await fetch(`/api/units/${row.id}/reject`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({ rejection_reason: reason || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Reject failed");
      await Promise.all([load(), loadProgrammes()]);
      Swal.fire({ icon: "success", title: "Rejected", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    }
  };

  const deleteUnit = async (row) => {
    const result = await Swal.fire({
      title: "Delete unit?",
      text: `Remove "${row.code} – ${row.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const token = getPortalToken();
      const res = await fetch(`/api/units/${row.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      await Promise.all([load(), loadProgrammes()]);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Cannot delete", text: err.message, confirmButtonColor: primaryGreen });
    }
  };

  const formProgramme = useMemo(
    () => programmes.find((p) => p.id === form.programme_id) || null,
    [programmes, form.programme_id]
  );

  const yearOptions = useMemo(
    () => getProgrammeYearOptions(formProgramme, form.year_of_study),
    [formProgramme, form.year_of_study]
  );
  const semesterOptions = useMemo(() => getProgrammeSemesterOptions(formProgramme), [formProgramme]);

  const staffDepartment = departmentMeta || actor?.department || null;

  const departmentLabel = staffDepartment?.name
    || (isStaff ? "Your department" : "All programmes");

  const fitProgrammesViewport = isStaff && tab === "programmes";

  if (programmesLoading && !programmes.length && tab === "programmes") {
    return <BrandPageLoader message="Loading programmes…" />;
  }

  return (
    <Box
      sx={{
        ...pageShellSx,
        ...(fitProgrammesViewport
          ? {
              height: { md: "calc(100dvh - 120px)" },
              maxHeight: { md: "calc(100dvh - 120px)" },
              overflow: { md: "hidden" },
              display: "flex",
              flexDirection: "column",
              py: { xs: 1.25, sm: 1.5, md: 1.5 },
              boxSizing: "border-box",
            }
          : null),
      }}
    >
      {fitProgrammesViewport ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 1.25, flexShrink: 0 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.35rem", sm: "1.55rem" },
                color: textPrimary,
                lineHeight: 1.15,
              }}
            >
              My programmes
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {staffDepartment ? (
                <Chip
                  icon={<AccountTreeIcon sx={{ fontSize: "16px !important" }} />}
                  label={
                    staffDepartment.code
                      ? `${staffDepartment.name} (${staffDepartment.code})`
                      : staffDepartment.name
                  }
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    bgcolor: "rgba(0,96,80,0.1)",
                    color: primaryDark,
                    border: "1px solid rgba(0,96,80,0.18)",
                  }}
                />
              ) : (
                <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.8rem" }}>
                  No department assigned
                </Typography>
              )}
              <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.75rem" }}>
                · list units for approval
              </Typography>
            </Stack>
          </Box>
          <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={() => openCreate()}>
            Add unit
          </HeroActionButton>
        </Stack>
      ) : (
        <UsersHero
          title="Units"
          subtitle={
            isStaff
              ? "Browse programmes in your department, then list units for approval"
              : "Review department programmes and approve unit offerings"
          }
          icon={<SchoolIcon sx={{ fontSize: 28, color: "#fff" }} />}
          actions={
            <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={() => openCreate()}>
              Add unit
            </HeroActionButton>
          }
        />
      )}

      <Box
        component={motion.div}
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
        sx={{
          borderRadius: fitProgrammesViewport ? "18px" : "22px",
          overflow: "hidden",
          border: "1px solid rgba(0,96,80,0.12)",
          bgcolor: "var(--kd-surface)",
          boxShadow: "0 20px 48px -18px rgba(20,26,58,0.14)",
          flex: fitProgrammesViewport ? 1 : undefined,
          minHeight: fitProgrammesViewport ? 0 : undefined,
          display: fitProgrammesViewport ? "flex" : undefined,
          flexDirection: fitProgrammesViewport ? "column" : undefined,
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1}
          alignItems={{ lg: "center" }}
          justifyContent="space-between"
          sx={{
            px: { xs: 1.25, sm: 1.75 },
            pt: fitProgrammesViewport ? 0.5 : 1.25,
            flexShrink: 0,
            bgcolor: warmCream,
            borderBottom: "1px solid rgba(0,96,80,0.08)",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: fitProgrammesViewport ? 40 : 48,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                fontFamily: fontBody,
                minHeight: fitProgrammesViewport ? 40 : 48,
                fontSize: fitProgrammesViewport ? "0.84rem" : "0.9rem",
                py: fitProgrammesViewport ? 0.5 : undefined,
              },
              "& .Mui-selected": { color: primaryGreen },
              "& .MuiTabs-indicator": { bgcolor: primaryGreen, height: 3, borderRadius: 2 },
            }}
          >
            <Tab value="programmes" label={isStaff ? "My programmes" : "Programmes"} />
            <Tab value="draft" label="Draft" />
            <Tab value="pending" label="Pending approval" />
            <Tab value="approved" label="Approved" />
            <Tab value="rejected" label="Rejected" />
          </Tabs>

          {showUnitsTable ? (
            <TextField
              size="small"
              placeholder="Search units…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ...inputSx, minWidth: { sm: 220 }, mb: { xs: 1.5, lg: 1.25 }, mr: { lg: 0.5 } }}
            />
          ) : null}
        </Stack>

        {tab === "programmes" ? (
          <ProgrammeGallery
            programmes={programmes}
            loading={programmesLoading}
            selectedId={selectedProgrammeId}
            department={staffDepartment}
            isStaff={isStaff}
            fitViewport={fitProgrammesViewport}
            onSelect={goToProgrammeUnits}
            onAddUnit={openCreate}
          />
        ) : (
          <>
            {selectedProgramme ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.25,
                  bgcolor: "rgba(0,96,80,0.05)",
                  borderBottom: "1px solid rgba(0,96,80,0.08)",
                }}
              >
                <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, fontSize: "0.88rem" }}>
                  Showing units for{" "}
                  <Box component="span" sx={{ color: primaryGreen }}>
                    {selectedProgramme.name}
                  </Box>
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedProgrammeId("");
                    setPage(0);
                  }}
                  sx={{ textTransform: "none", fontWeight: 700, color: primaryGreen }}
                >
                  Clear filter
                </Button>
              </Stack>
            ) : null}

            {error ? (
              <Alert severity="error" sx={{ m: 2, borderRadius: "12px" }} onClose={() => setError("")}>
                {error}
              </Alert>
            ) : null}

            {refreshing ? (
              <LinearProgress
                sx={{
                  height: 3,
                  bgcolor: "rgba(0,96,80,0.08)",
                  "& .MuiLinearProgress-bar": { bgcolor: primaryGreen },
                }}
              />
            ) : null}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(0,96,80,0.04)" }}>
                    {["No", "Code", "Unit", "Programme", "Year / Sem", "Academic year", "Status", "Actions"].map(
                      (h) => (
                        <TableCell
                          key={h}
                          align={h === "Actions" ? "right" : "left"}
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            color: textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {h}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <CircularProgress size={28} sx={{ color: primaryGreen }} />
                      </TableCell>
                    </TableRow>
                  ) : rows.length ? (
                    rows.map((row, idx) => {
                      const isCreator = row.created_by === actor?.id || row.creator?.id === actor?.id;
                      const editable =
                        ["draft", "rejected"].includes(row.status) && isCreator;
                      const canSubmit = editable;
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: textMuted, width: 48 }}>
                            {page * rowsPerPage + idx + 1}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800, color: primaryDark }}>{row.code}</TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, color: textPrimary, fontSize: "0.88rem" }}>
                              {row.name}
                            </Typography>
                            <Typography sx={{ color: textSecondary, fontSize: "0.72rem" }}>
                              {row.department?.name || "—"}
                              {row.credits != null ? ` · ${row.credits} cr` : ""}
                              {row.creator?.full_name ? ` · by ${row.creator.full_name}` : ""}
                            </Typography>
                            {row.status === "rejected" && row.rejection_reason ? (
                              <Typography sx={{ color: "#9b1c1c", fontSize: "0.7rem", mt: 0.25 }}>
                                {row.rejection_reason}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ color: textSecondary, fontWeight: 600, maxWidth: 180 }}>
                            {row.programme?.name || "—"}
                          </TableCell>
                          <TableCell sx={{ color: textPrimary, fontWeight: 700, whiteSpace: "nowrap" }}>
                            Y{row.year_of_study} · Sem {row.semester}
                          </TableCell>
                          <TableCell sx={{ color: textSecondary, fontWeight: 600 }}>{row.academic_year}</TableCell>
                          <TableCell>
                            <StatusChip status={row.status} />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                              {editable ? (
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => openEdit(row)} sx={{ color: primaryGreen }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : null}
                              {canSubmit ? (
                                <Tooltip title="Submit for approval">
                                  <IconButton
                                    size="small"
                                    onClick={() => submitForApproval(row)}
                                    sx={{ color: "#9a6700" }}
                                  >
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : null}
                              {isAdmin && row.status === "pending" ? (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton
                                      size="small"
                                      onClick={() => approveUnit(row)}
                                      sx={{ color: primaryGreen }}
                                    >
                                      <CheckIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      onClick={() => rejectUnit(row)}
                                      sx={{ color: "#9b1c1c" }}
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : null}
                              {editable || (isAdmin && row.status !== "draft") ? (
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => deleteUnit(row)} sx={{ color: primaryDark }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : null}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography sx={{ color: textMuted }}>
                          {tab === "draft"
                            ? "No draft units yet. Create one from My programmes."
                            : tab === "pending"
                              ? isAdmin
                                ? "No units waiting for approval."
                                : "No units waiting for approval. Submit a draft to see it here."
                              : tab === "approved"
                                ? "No approved units yet."
                                : tab === "rejected"
                                  ? "No rejected units."
                                  : "No units yet."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Box>

      <PremiumDialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        title={editing ? "Edit unit" : "Add unit"}
        subtitle="Units become available for student registration only after admin approval."
        icon={<SchoolIcon />}
        footer={
          <Stack direction="row" justifyContent="flex-end" spacing={1.25}>
            <Button onClick={closeDialog} disabled={saving} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={primaryBtnSx}
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create unit"}
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Code"
              required
              fullWidth
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. NUR210"
              sx={inputSx}
            />
            <TextField
              label="Academic year"
              required
              fullWidth
              value={form.academic_year}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
              placeholder="2025/2026"
              sx={inputSx}
            />
          </Stack>
          <TextField
            label="Unit name"
            required
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Medical-Surgical Nursing"
            sx={inputSx}
          />
          <FormControl fullWidth size="small" sx={inputSx}>
            <InputLabel>Programme</InputLabel>
            <Select
              label="Programme"
              value={form.programme_id}
              onChange={(e) => handleProgrammeChange(e.target.value)}
            >
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formProgramme ? (
            <Alert severity="info" sx={{ borderRadius: "12px", py: 0.5 }}>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem" }}>
                {formProgramme.duration_years
                  ? `${formProgramme.duration_years}-year programme`
                  : "Programme duration not set"}
                {formProgramme.semester_1_period || formProgramme.semester_2_period
                  ? ` · ${[
                      formProgramme.semester_1_period
                        ? `Sem 1: ${formProgramme.semester_1_period}`
                        : null,
                      formProgramme.semester_2_period
                        ? `Sem 2: ${formProgramme.semester_2_period}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}`
                  : null}
              </Typography>
            </Alert>
          ) : null}
          {isAdmin && !editing ? (
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              >
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {!programmes.length ? (
            <Alert severity="warning" sx={{ borderRadius: "12px" }}>
              {isStaff
                ? "No programmes are linked to your department yet. Ask an admin to link programmes first."
                : "No active programmes found."}
            </Alert>
          ) : null}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth size="small" sx={inputSx} disabled={!form.programme_id}>
              <InputLabel>Year of study</InputLabel>
              <Select
                label="Year of study"
                value={form.year_of_study}
                onChange={(e) => setForm({ ...form, year_of_study: Number(e.target.value) })}
              >
                {yearOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={inputSx} disabled={!form.programme_id}>
              <InputLabel>Semester</InputLabel>
              <Select
                label="Semester"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
              >
                {semesterOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Credits"
              type="number"
              fullWidth
              value={form.credits}
              onChange={(e) => setForm({ ...form, credits: e.target.value })}
              sx={inputSx}
            />
            <TextField
              label="Hours"
              type="number"
              fullWidth
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              sx={inputSx}
            />
          </Stack>
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={inputSx}
          />
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
