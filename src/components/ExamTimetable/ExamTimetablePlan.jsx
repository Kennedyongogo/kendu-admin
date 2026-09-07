import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton, PremiumDialog } from "../Users/usersUi";
import useProgrammeEnrolmentOptions from "../Users/useProgrammeEnrolmentOptions";
import { fetchProgrammesOptions } from "../Programmes/programmesShared";
import {
  authJsonHeaders,
  getPortalToken,
  getPortalUser,
  fontBody,
  fontDisplay,
  ghostBtnSx,
  inputSx,
  navy,
  pageShellSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import {
  STATUS_META,
  formatPeriodRange,
  downloadExamTimetablePdf,
} from "./examTimetableShared";
import ExamSlotTile from "./ExamSlotTile";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_OPTIONS = ["00", "15", "30", "45"];

const panelSx = {
  borderRadius: "18px",
  bgcolor: "var(--kd-surface)",
  border: "1px solid rgba(0,96,80,0.1)",
  boxShadow: "0 10px 36px -20px rgba(20,26,58,0.14)",
};

const localDateValue = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const to24h = (hour, minute, meridiem) => {
  let h = Number(hour) % 12;
  if (meridiem === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
};

const fromDate = (iso) => {
  if (!iso) {
    return {
      date: localDateValue(),
      hour: "9",
      minute: "00",
      meridiem: "AM",
    };
  }
  const d = new Date(iso);
  let h = d.getHours();
  const meridiem = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return {
    date: localDateValue(d),
    hour: String(h),
    minute: String(d.getMinutes()).padStart(2, "0"),
    meridiem,
  };
};

const emptySlotForm = () => {
  const start = fromDate();
  return {
    title: "",
    venue: "",
    start_date: start.date,
    start_hour: start.hour,
    start_minute: "00",
    start_meridiem: "AM",
    end_date: start.date,
    end_hour: "11",
    end_minute: "00",
    end_meridiem: "AM",
  };
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return localDateValue(d);
};

const periodToEditForm = (row) => ({
  title: row?.title || "",
  programme_id: row?.programme_id || "",
  year_of_study: String(row?.year_of_study || 1),
  semester: String(row?.semester || 1),
  academic_year: row?.academic_year || "",
  period_start: toDateInputValue(row?.period_start),
  period_end: toDateInputValue(row?.period_end),
  notes: row?.notes || "",
});

export default function ExamTimetablePlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getPortalToken();
  const user = getPortalUser();
  const isAdmin = user?.role === "admin";

  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slotDialog, setSlotDialog] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotForm, setSlotForm] = useState(emptySlotForm());
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [planDialog, setPlanDialog] = useState(false);
  const [planForm, setPlanForm] = useState(periodToEditForm());
  const [savingPlan, setSavingPlan] = useState(false);
  const [programmes, setProgrammes] = useState([]);

  const editable = period && ["draft", "rejected"].includes(period.status);
  const enrolment = useProgrammeEnrolmentOptions(planForm.programme_id);
  const slots = useMemo(
    () => (Array.isArray(period?.slots) ? period.slots : []),
    [period]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exam-timetables/${id}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load");
      setPeriod(data.data);
    } catch (err) {
      setError(err.message || "Failed to load exam timetable");
      setPeriod(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const openAddSlot = () => {
    setEditingSlotId(null);
    setSlotForm(emptySlotForm());
    setSlotDialog(true);
  };

  const openEditPlan = async () => {
    if (!period) return;
    setPlanForm(periodToEditForm(period));
    setPlanDialog(true);
    if (!programmes.length) {
      try {
        const list = await fetchProgrammesOptions(token);
        setProgrammes(Array.isArray(list) ? list : []);
      } catch {
        setProgrammes([]);
      }
    }
  };

  const closePlanDialog = () => {
    if (savingPlan) return;
    setPlanDialog(false);
  };

  const savePlan = async (e) => {
    e?.preventDefault?.();
    if (!planForm.title.trim() || !planForm.programme_id || !planForm.academic_year.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Title, programme, and academic year are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (
      planForm.period_start &&
      planForm.period_end &&
      planForm.period_end < planForm.period_start
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid dates",
        text: "Exam period end must be on or after the start date.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSavingPlan(true);
    try {
      const res = await fetch(`/api/exam-timetables/${id}`, {
        method: "PUT",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          title: planForm.title.trim(),
          programme_id: planForm.programme_id,
          year_of_study: Number(planForm.year_of_study) || 1,
          semester: Number(planForm.semester) || 1,
          academic_year: planForm.academic_year.trim(),
          period_start: planForm.period_start || null,
          period_end: planForm.period_end || null,
          notes: planForm.notes.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not update plan");
      setPeriod(data.data);
      setPlanDialog(false);
      await Swal.fire({
        icon: "success",
        title: "Plan updated",
        timer: 900,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not update plan",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSavingPlan(false);
    }
  };

  const openEditSlot = (slot) => {
    const start = fromDate(slot.starts_at);
    const end = fromDate(slot.ends_at);
    setEditingSlotId(slot.id);
    setSlotForm({
      title: slot.title || "",
      venue: slot.venue || "",
      start_date: start.date,
      start_hour: start.hour,
      start_minute: MINUTE_OPTIONS.includes(start.minute) ? start.minute : "00",
      start_meridiem: start.meridiem,
      end_date: end.date,
      end_hour: end.hour,
      end_minute: MINUTE_OPTIONS.includes(end.minute) ? end.minute : "00",
      end_meridiem: end.meridiem,
    });
    setSlotDialog(true);
  };

  const saveSlot = async (e) => {
    e?.preventDefault?.();
    if (!slotForm.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: slotForm.title.trim(),
        venue: slotForm.venue.trim() || null,
        start_date: slotForm.start_date,
        start_time: to24h(slotForm.start_hour, slotForm.start_minute, slotForm.start_meridiem),
        end_date: slotForm.end_date,
        end_time: to24h(slotForm.end_hour, slotForm.end_minute, slotForm.end_meridiem),
      };
      const url = editingSlotId
        ? `/api/exam-timetables/${id}/slots/${editingSlotId}`
        : `/api/exam-timetables/${id}/slots`;
      const res = await fetch(url, {
        method: editingSlotId ? "PUT" : "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      setSlotDialog(false);
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not save slot",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = async (slot) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete exam slot?",
      text: `"${slot.title}" will be removed from this plan.`,
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/exam-timetables/${id}/slots/${slot.id}`, {
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

  const runAction = async (action, { reason } = {}) => {
    setActing(true);
    try {
      const res = await fetch(`/api/exam-timetables/${id}/${action}`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify(reason ? { rejection_reason: reason } : {}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Action failed");
      await Swal.fire({
        icon: "success",
        title: data.message || "Done",
        timer: 1400,
        showConfirmButton: false,
      });
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Action failed",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setActing(false);
    }
  };

  const handleSubmit = async () => {
    if (!slots.length) {
      Swal.fire({
        icon: "warning",
        title: "Add exam slots first",
        text: "Submit only after the full exam grid for this cohort is ready.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    const result = await Swal.fire({
      icon: "question",
      title: "Submit for approval?",
      text: "Staff will not be able to edit slots until an admin approves or rejects.",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      confirmButtonText: "Submit",
    });
    if (result.isConfirmed) await runAction("submit");
  };

  const handleApprove = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "Approve this exam timetable?",
      text: "Students will be able to see it once the student portal is wired.",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      confirmButtonText: "Approve",
    });
    if (result.isConfirmed) await runAction("approve");
  };

  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      icon: "warning",
      title: "Reject exam timetable",
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "What should be corrected?",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      confirmButtonText: "Reject",
    });
    if (reason === undefined) return;
    await runAction("reject", { reason: reason || null });
  };

  const handleDownloadPdf = async () => {
    if (!period) return;
    setDownloading(true);
    try {
      await downloadExamTimetablePdf(period.id, period.title, token);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !period) {
    return <BrandPageLoader message="Loading exam plan…" />;
  }

  if (!period) {
    return (
      <Box sx={pageShellSx}>
        <Alert severity="error" sx={{ borderRadius: "14px" }}>
          {error || "Exam timetable not found"}
        </Alert>
        <Button sx={{ mt: 2, ...ghostBtnSx }} onClick={() => navigate("/exam-timetables")}>
          Back to list
        </Button>
      </Box>
    );
  }

  const status = STATUS_META[period.status] || STATUS_META.draft;
  const periodLabel = formatPeriodRange(period.period_start, period.period_end) || "Not set";
  const cohortSubtitle = `${period.programme_name || "Programme"} · Year ${period.year_of_study} · Semester ${period.semester} · ${period.academic_year}`;

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={period.title}
        subtitle={cohortSubtitle}
        icon={<FactCheckRoundedIcon sx={{ fontSize: 28, color: "#fff" }} />}
        leading={
          <Tooltip title="Back to exam timetables" arrow>
            <IconButton
              onClick={() => navigate("/exam-timetables")}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
          </Tooltip>
        }
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={status.label}
              sx={{
                fontWeight: 800,
                bgcolor: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            />
            <HeroActionButton
              variant="outlined"
              startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <DownloadRoundedIcon />}
              onClick={() => void handleDownloadPdf()}
              disabled={downloading}
            >
              {downloading ? "Preparing PDF…" : "Download PDF"}
            </HeroActionButton>
            {editable ? (
              <HeroActionButton
                variant="contained"
                startIcon={acting ? <CircularProgress size={14} color="inherit" /> : <SendRoundedIcon />}
                onClick={() => void handleSubmit()}
                disabled={acting}
              >
                Submit for approval
              </HeroActionButton>
            ) : null}
            {isAdmin && period.status === "pending" ? (
              <>
                <HeroActionButton
                  variant="contained"
                  startIcon={<CheckCircleRoundedIcon />}
                  onClick={() => void handleApprove()}
                  disabled={acting}
                >
                  Approve
                </HeroActionButton>
                <HeroActionButton
                  variant="outlined"
                  startIcon={<CancelRoundedIcon />}
                  onClick={() => void handleReject()}
                  disabled={acting}
                >
                  Reject
                </HeroActionButton>
              </>
            ) : null}
          </Stack>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <WorkflowBanner period={period} />

      <Box
        sx={{
          ...panelSx,
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.75, sm: 2 },
            background: `linear-gradient(135deg, ${primaryGreen} 0%, ${navy} 100%)`,
            color: "#fff",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                Plan overview
              </Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem", opacity: 0.88, mt: 0.25 }}>
                {cohortSubtitle}
              </Typography>
            </Box>
            {editable ? (
              <Tooltip title="Edit plan" arrow>
                <IconButton
                  onClick={() => void openEditPlan()}
                  aria-label="Edit plan"
                  size="small"
                  sx={{
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <StatCard icon={<EventNoteRoundedIcon />} label="Exam papers" value={String(slots.length)} />
          <StatCard icon={<DateRangeRoundedIcon />} label="Exam window" value={periodLabel} compact />
          <StatCard icon={<PersonOutlineRoundedIcon />} label="Created by" value={period.creator_name || "—"} />
          <StatCard
            icon={<PersonOutlineRoundedIcon />}
            label="Submitted by"
            value={period.submitter_name || "—"}
          />
        </Box>

        {period.notes ? (
          <Box
            sx={{
              mx: { xs: 2, sm: 2.5 },
              mb: { xs: 2, sm: 2.5 },
              p: 1.5,
              borderRadius: "12px",
              bgcolor: "rgba(0,96,80,0.05)",
              border: "1px solid rgba(0,96,80,0.1)",
            }}
          >
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: textMuted,
                mb: 0.5,
              }}
            >
              Notes
            </Typography>
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.88rem", lineHeight: 1.5 }}>
              {period.notes}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Box sx={{ ...panelSx, p: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(0,96,80,0.1)",
                color: primaryGreen,
              }}
            >
              <CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.05rem" }}>
                Exam schedule
              </Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary }}>
                {slots.length
                  ? `${slots.length} paper${slots.length === 1 ? "" : "s"} scheduled`
                  : "No papers added yet"}
              </Typography>
            </Box>
          </Stack>
          {editable ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddSlot}
              sx={{ ...primaryBtnSx, alignSelf: { xs: "stretch", sm: "center" }, textTransform: "none" }}
            >
              Add exam slot
            </Button>
          ) : null}
        </Stack>

        {slots.length === 0 ? (
          <Box
            sx={{
              py: { xs: 5, sm: 6 },
              px: 2,
              textAlign: "center",
              borderRadius: "16px",
              border: "2px dashed rgba(0,96,80,0.18)",
              bgcolor: "rgba(0,96,80,0.03)",
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 44, color: "rgba(0,96,80,0.35)", mb: 1.5 }} />
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
              No exam slots yet
            </Typography>
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, mb: 2, maxWidth: 360, mx: "auto" }}>
              Add every paper for this cohort so there are no overlaps before submitting.
            </Typography>
            {editable ? (
              <Button
                startIcon={<AddIcon />}
                onClick={openAddSlot}
                variant="contained"
                sx={{ ...primaryBtnSx, textTransform: "none" }}
              >
                Add first slot
              </Button>
            ) : null}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            {slots.map((slot) => (
              <ExamSlotTile
                key={slot.id}
                slot={slot}
                actions={
                  editable ? (
                    <>
                      <Tooltip title="Edit slot" arrow>
                        <IconButton
                          size="small"
                          onClick={() => openEditSlot(slot)}
                          sx={{
                            color: navy,
                            bgcolor: "rgba(30,40,88,0.08)",
                            "&:hover": { bgcolor: "rgba(30,40,88,0.14)" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete slot" arrow>
                        <IconButton
                          size="small"
                          onClick={() => void deleteSlot(slot)}
                          sx={{
                            color: "#b91c1c",
                            bgcolor: "rgba(185,28,28,0.08)",
                            "&:hover": { bgcolor: "rgba(185,28,28,0.16)" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : null
                }
              />
            ))}
          </Box>
        )}
      </Box>

      <PremiumDialog
        open={planDialog}
        onClose={closePlanDialog}
        title="Edit exam timetable"
        subtitle="Update the cohort window and plan details while this timetable is still a draft."
        icon={<EditIcon />}
        maxWidth="sm"
        footer={
          <>
            <Button onClick={closePlanDialog} disabled={savingPlan} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button
              onClick={savePlan}
              disabled={savingPlan}
              variant="contained"
              startIcon={savingPlan ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              sx={primaryBtnSx}
            >
              {savingPlan ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        <Stack spacing={2} component="form" onSubmit={savePlan}>
          <TextField
            select
            label="Programme"
            required
            fullWidth
            value={planForm.programme_id}
            onChange={(e) =>
              setPlanForm((f) => ({
                ...f,
                programme_id: e.target.value,
                year_of_study: "1",
                semester: "1",
              }))
            }
            sx={inputSx}
          >
            {programmes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
            {planForm.programme_id && !programmes.some((p) => p.id === planForm.programme_id) ? (
              <MenuItem value={planForm.programme_id}>
                {period?.programme_name || "Current programme"}
              </MenuItem>
            ) : null}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Year of study"
              fullWidth
              value={planForm.year_of_study}
              onChange={(e) => setPlanForm((f) => ({ ...f, year_of_study: e.target.value }))}
              sx={inputSx}
              disabled={!planForm.programme_id || enrolment.loading}
            >
              {(enrolment.years.length ? enrolment.years : [1, 2, 3]).map((y) => (
                <MenuItem key={y} value={String(y)}>
                  Year {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Semester"
              fullWidth
              value={planForm.semester}
              onChange={(e) => setPlanForm((f) => ({ ...f, semester: e.target.value }))}
              sx={inputSx}
              disabled={!planForm.programme_id || enrolment.loading}
            >
              {(enrolment.semesters.length ? enrolment.semesters : [1, 2]).map((s) => (
                <MenuItem key={s} value={String(s)}>
                  {enrolment.semester_labels?.[s] || `Semester ${s}`}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Academic year"
            required
            fullWidth
            value={planForm.academic_year}
            onChange={(e) => setPlanForm((f) => ({ ...f, academic_year: e.target.value }))}
            placeholder="2026/2027"
            sx={inputSx}
          />

          <TextField
            label="Title"
            required
            fullWidth
            value={planForm.title}
            onChange={(e) => setPlanForm((f) => ({ ...f, title: e.target.value }))}
            sx={inputSx}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Exam period start"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={planForm.period_start}
              onChange={(e) => setPlanForm((f) => ({ ...f, period_start: e.target.value }))}
              sx={inputSx}
            />
            <TextField
              label="Exam period end"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={planForm.period_end}
              onChange={(e) => setPlanForm((f) => ({ ...f, period_end: e.target.value }))}
              sx={inputSx}
            />
          </Stack>

          <TextField
            label="Notes (optional)"
            fullWidth
            multiline
            minRows={2}
            value={planForm.notes}
            onChange={(e) => setPlanForm((f) => ({ ...f, notes: e.target.value }))}
            sx={inputSx}
          />
        </Stack>
      </PremiumDialog>

      <PremiumDialog
        open={slotDialog}
        onClose={() => !saving && setSlotDialog(false)}
        title={editingSlotId ? "Edit exam slot" : "Add exam slot"}
        subtitle="Times must not overlap another exam or class/CAT for this cohort."
        icon={<FactCheckRoundedIcon />}
        maxWidth="sm"
        footer={
          <>
            <Button onClick={() => setSlotDialog(false)} disabled={saving} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button
              onClick={saveSlot}
              disabled={saving}
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
              sx={primaryBtnSx}
            >
              {saving ? "Saving…" : editingSlotId ? "Save changes" : "Add slot"}
            </Button>
          </>
        }
      >
        <Stack spacing={2} component="form" onSubmit={saveSlot}>
          <TextField
            label="Paper / exam title"
            required
            fullWidth
            value={slotForm.title}
            onChange={(e) => setSlotForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Anatomy written paper"
            sx={inputSx}
          />
          <TextField
            label="Venue (optional)"
            fullWidth
            value={slotForm.venue}
            onChange={(e) => setSlotForm((f) => ({ ...f, venue: e.target.value }))}
            sx={inputSx}
          />
          <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, fontSize: "0.85rem" }}>
            Starts
          </Typography>
          <TimeRow
            form={slotForm}
            setForm={setSlotForm}
            dateKey="start_date"
            hourKey="start_hour"
            minuteKey="start_minute"
            meridiemKey="start_meridiem"
          />
          <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, fontSize: "0.85rem" }}>
            Ends
          </Typography>
          <TimeRow
            form={slotForm}
            setForm={setSlotForm}
            dateKey="end_date"
            hourKey="end_hour"
            minuteKey="end_minute"
            meridiemKey="end_meridiem"
          />
        </Stack>
      </PremiumDialog>
    </Box>
  );
}

function WorkflowBanner({ period }) {
  if (period.rejection_reason) {
    return (
      <Alert severity="warning" sx={{ mb: 2, borderRadius: "14px" }}>
        <Typography sx={{ fontFamily: fontBody, fontWeight: 700, mb: 0.25 }}>Rejected — changes needed</Typography>
        {period.rejection_reason}
      </Alert>
    );
  }

  return null;
}

function StatCard({ icon, label, value, compact = false }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "14px",
        bgcolor: "rgba(0,96,80,0.04)",
        border: "1px solid rgba(0,96,80,0.08)",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.75 }}>
        <Box sx={{ color: primaryGreen, display: "flex", mt: 0.15 }}>{icon}</Box>
        <Typography
          sx={{
            fontFamily: fontBody,
            fontSize: "0.65rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: textMuted,
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontFamily: fontBody,
          fontWeight: 700,
          color: textPrimary,
          fontSize: compact ? "0.8rem" : "0.95rem",
          lineHeight: 1.35,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function TimeRow({ form, setForm, dateKey, hourKey, minuteKey, meridiemKey }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
      <TextField
        type="date"
        fullWidth
        value={form[dateKey]}
        onChange={(e) => setForm((f) => ({ ...f, [dateKey]: e.target.value }))}
        sx={inputSx}
      />
      <TextField
        select
        SelectProps={{ native: true }}
        value={form[hourKey]}
        onChange={(e) => setForm((f) => ({ ...f, [hourKey]: e.target.value }))}
        sx={{ ...inputSx, minWidth: 80 }}
      >
        {HOUR_OPTIONS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </TextField>
      <TextField
        select
        SelectProps={{ native: true }}
        value={form[minuteKey]}
        onChange={(e) => setForm((f) => ({ ...f, [minuteKey]: e.target.value }))}
        sx={{ ...inputSx, minWidth: 80 }}
      >
        {MINUTE_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </TextField>
      <TextField
        select
        SelectProps={{ native: true }}
        value={form[meridiemKey]}
        onChange={(e) => setForm((f) => ({ ...f, [meridiemKey]: e.target.value }))}
        sx={{ ...inputSx, minWidth: 90 }}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </TextField>
    </Stack>
  );
}
