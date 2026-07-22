import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddIcon from "@mui/icons-material/Add";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import BrandPageLoader from "../Util/BrandPageLoader";
import useProgrammeEnrolmentOptions from "../Users/useProgrammeEnrolmentOptions";
import { fetchProgrammesOptions } from "../Programmes/programmesShared";
import {
  authJsonHeaders,
  getPortalToken,
  fontBody,
  fontDisplay,
  ghostBtnSx,
  inputSx,
  pageShellSx,
  primaryBtnSx,
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
  formatSlotWhen,
} from "./examTimetableShared";

const emptyForm = () => ({
  title: "",
  programme_id: "",
  year_of_study: "1",
  semester: "1",
  academic_year: currentAcademicYear(),
  period_start: "",
  period_end: "",
  notes: "",
});

export default function ExamTimetableCreate() {
  const navigate = useNavigate();
  const token = getPortalToken();

  const [programmes, setProgrammes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [existing, setExisting] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  const enrolment = useProgrammeEnrolmentOptions(form.programme_id);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await fetchProgrammesOptions(token);
        if (!active) return;
        const rows = Array.isArray(list) ? list : [];
        setProgrammes(rows);
        if (rows.length) {
          setForm((f) => (f.programme_id ? f : { ...f, programme_id: rows[0].id }));
        }
      } catch {
        if (active) setProgrammes([]);
      } finally {
        if (active) setBootLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const cohortReady =
    form.programme_id && form.year_of_study && form.semester && form.academic_year.trim();

  const checkExisting = useCallback(async () => {
    if (!cohortReady) {
      setExisting(null);
      return;
    }
    setCheckingExisting(true);
    try {
      const params = new URLSearchParams({
        programme_id: form.programme_id,
        year_of_study: String(form.year_of_study),
        semester: String(form.semester),
        academic_year: form.academic_year.trim(),
        include_slots: "true",
      });
      const res = await fetch(`/api/exam-timetables?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Lookup failed");
      const row = Array.isArray(data.data) ? data.data[0] : null;
      setExisting(row || null);
    } catch {
      setExisting(null);
    } finally {
      setCheckingExisting(false);
    }
  }, [cohortReady, form, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void checkExisting();
    }, 280);
    return () => clearTimeout(timer);
  }, [checkExisting]);

  const suggestedTitle = useMemo(() => {
    if (!form.programme_id) return "";
    const prog = programmes.find((p) => p.id === form.programme_id);
    const sem =
      enrolment.semester_labels?.[Number(form.semester)] || `Semester ${form.semester}`;
    if (!prog) return `Year ${form.year_of_study} ${sem} Examinations`;
    return `${prog.name} · Year ${form.year_of_study} · ${sem} · ${form.academic_year}`;
  }, [form, programmes, enrolment.semester_labels]);

  const handleCreate = async (e) => {
    e?.preventDefault?.();
    if (existing) {
      Swal.fire({
        icon: "info",
        title: "Plan already exists",
        text: "Open the existing exam timetable for this cohort instead of creating a duplicate.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    const title = form.title.trim() || suggestedTitle;
    if (!title || !form.programme_id || !form.academic_year.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Programme and academic year are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/exam-timetables", {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          title,
          programme_id: form.programme_id,
          year_of_study: Number(form.year_of_study),
          semester: Number(form.semester),
          academic_year: form.academic_year.trim(),
          period_start: form.period_start || null,
          period_end: form.period_end || null,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.data?.id) {
        setExisting({ id: data.data.id, ...form });
        Swal.fire({
          icon: "info",
          title: "Already exists",
          text: data.message,
          confirmButtonText: "Open existing",
          confirmButtonColor: primaryGreen,
        }).then((r) => {
          if (r.isConfirmed) navigate(`/exam-timetables/${data.data.id}`);
        });
        return;
      }
      if (!res.ok || !data.success) throw new Error(data.message || "Could not create");
      await Swal.fire({
        icon: "success",
        title: "Exam timetable created",
        timer: 1000,
        showConfirmButton: false,
      });
      navigate(`/exam-timetables/${data.data.id}`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create failed",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  if (bootLoading) {
    return <BrandPageLoader message="Preparing form…" />;
  }

  const existingStatus = existing ? STATUS_META[existing.status] || STATUS_META.draft : null;
  const existingSlots = Array.isArray(existing?.slots) ? existing.slots : [];

  return (
    <Box sx={pageShellSx}>
      <Box
        sx={{
          borderRadius: "22px",
          p: { xs: 2.25, sm: 3 },
          mb: 3,
          background: `linear-gradient(135deg, ${primaryGreen} 0%, #1e2858 100%)`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 48px -16px rgba(0, 96, 80, 0.4)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Button
            onClick={() => navigate("/exam-timetables")}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              ...ghostBtnSx,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.35)",
              flexShrink: 0,
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)", borderColor: "#fff" },
            }}
          >
            Back
          </Button>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.75 }}>
              <FactCheckRoundedIcon sx={{ fontSize: 26 }} />
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.35rem", sm: "1.55rem" },
                  lineHeight: 1.15,
                }}
              >
                New exam timetable
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.88rem", color: "rgba(255,255,255,0.88)" }}>
              Choose the programme cohort first — if a plan already exists, you will see it here before
              creating a duplicate.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2.5}
        alignItems={{ lg: "flex-start" }}
      >
        <Box
          component="form"
          onSubmit={handleCreate}
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 2.5 },
            borderRadius: "20px",
            bgcolor: "var(--kd-surface)",
            border: "1px solid rgba(0,96,80,0.12)",
            boxShadow: "0 12px 40px -24px rgba(20,26,58,0.18)",
          }}
        >
          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: "1.05rem",
              color: textPrimary,
              mb: 2,
            }}
          >
            1 · Select cohort
          </Typography>

          <Stack spacing={2.25}>
            <TextField
              select
              label="Programme"
              required
              fullWidth
              value={form.programme_id}
              onChange={(e) =>
                setForm((f) => ({
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
            </TextField>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Year of study"
                fullWidth
                value={form.year_of_study}
                onChange={(e) => setForm((f) => ({ ...f, year_of_study: e.target.value }))}
                sx={inputSx}
                disabled={!form.programme_id || enrolment.loading}
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
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                sx={inputSx}
                disabled={!form.programme_id || enrolment.loading}
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
              value={form.academic_year}
              onChange={(e) => setForm((f) => ({ ...f, academic_year: e.target.value }))}
              placeholder="2025/2026"
              sx={inputSx}
            />

            {checkingExisting ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} sx={{ color: primaryGreen }} />
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem", color: textMuted }}>
                  Checking for existing plan…
                </Typography>
              </Stack>
            ) : null}

            {existing ? (
              <Alert
                severity="warning"
                sx={{ borderRadius: "14px" }}
                action={
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<OpenInNewRoundedIcon />}
                    onClick={() => navigate(`/exam-timetables/${existing.id}`)}
                    sx={{ fontWeight: 700, textTransform: "none" }}
                  >
                    Open
                  </Button>
                }
              >
                An exam timetable already exists for this cohort. Open it to add papers or edit — you
                cannot create a duplicate.
              </Alert>
            ) : cohortReady && !checkingExisting ? (
              <Alert severity="success" sx={{ borderRadius: "14px" }}>
                No plan found for this cohort — you can create a new one below.
              </Alert>
            ) : null}

            {!existing ? (
              <>
                <Typography
                  sx={{
                    fontFamily: fontDisplay,
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: textPrimary,
                    pt: 1,
                  }}
                >
                  2 · Plan details
                </Typography>

                <TextField
                  label="Title"
                  fullWidth
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={suggestedTitle}
                  helperText={!form.title.trim() ? `Suggested: ${suggestedTitle}` : undefined}
                  sx={inputSx}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Exam period start"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.period_start}
                    onChange={(e) => setForm((f) => ({ ...f, period_start: e.target.value }))}
                    sx={inputSx}
                  />
                  <TextField
                    label="Exam period end"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.period_end}
                    onChange={(e) => setForm((f) => ({ ...f, period_end: e.target.value }))}
                    sx={inputSx}
                  />
                </Stack>

                <TextField
                  label="Notes (optional)"
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  sx={inputSx}
                />

                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
                  <Button onClick={() => navigate("/exam-timetables")} disabled={saving} sx={ghostBtnSx}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || checkingExisting}
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                    sx={primaryBtnSx}
                  >
                    {saving ? "Creating…" : "Create & add papers"}
                  </Button>
                </Stack>
              </>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", lg: 360 },
            flexShrink: 0,
            p: 2.25,
            borderRadius: "20px",
            bgcolor: warmCream,
            border: "1px solid rgba(0,96,80,0.1)",
          }}
        >
          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: "0.95rem",
              color: textPrimary,
              mb: 1.5,
            }}
          >
            {existing ? "Existing plan preview" : "Preview"}
          </Typography>

          {existing ? (
            <Stack spacing={1.5}>
              <Box>
                <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary }}>
                  {existing.title}
                </Typography>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary, mt: 0.35 }}>
                  {cohortLabel(existing, enrolment.semester_labels)}
                </Typography>
              </Box>
              {existingStatus ? (
                <Chip
                  size="small"
                  label={existingStatus.label}
                  sx={{
                    alignSelf: "flex-start",
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    bgcolor: existingStatus.bg,
                    color: existingStatus.color,
                  }}
                />
              ) : null}
              {formatPeriodRange(existing.period_start, existing.period_end) ? (
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted }}>
                  {formatPeriodRange(existing.period_start, existing.period_end)}
                </Typography>
              ) : null}
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: textMuted,
                }}
              >
                Schedule ({existingSlots.length} paper{existingSlots.length === 1 ? "" : "s"})
              </Typography>
              {existingSlots.length === 0 ? (
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem", color: textSecondary }}>
                  No exam papers added yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {existingSlots.slice(0, 6).map((slot) => (
                    <Box
                      key={slot.id}
                      sx={{
                        p: 1.1,
                        borderRadius: "12px",
                        bgcolor: "#fff",
                        border: "1px solid rgba(0,96,80,0.1)",
                      }}
                    >
                      <Typography sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.82rem" }}>
                        {slot.title}
                      </Typography>
                      <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                        {formatSlotWhen(slot.starts_at)}
                        {slot.venue ? ` · ${slot.venue}` : ""}
                      </Typography>
                    </Box>
                  ))}
                  {existingSlots.length > 6 ? (
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.75rem", color: textMuted }}>
                      +{existingSlots.length - 6} more
                    </Typography>
                  ) : null}
                </Stack>
              )}
              <Button
                fullWidth
                variant="contained"
                startIcon={<OpenInNewRoundedIcon />}
                onClick={() => navigate(`/exam-timetables/${existing.id}`)}
                sx={primaryBtnSx}
              >
                Open existing plan
              </Button>
            </Stack>
          ) : (
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.85rem", color: textSecondary, lineHeight: 1.6 }}>
              Pick a programme, year, semester and academic year. If a plan already exists for that
              cohort, it will appear here with its full schedule so you can open it instead of
              duplicating.
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
