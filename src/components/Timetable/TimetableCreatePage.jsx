import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import TitleRoundedIcon from "@mui/icons-material/TitleRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import BrandPageLoader from "../Util/BrandPageLoader";
import useProgrammeEnrolmentOptions from "../Users/useProgrammeEnrolmentOptions";
import {
  authJsonHeaders,
  getPortalToken,
  fontBody,
  fontDisplay,
  ghostBtnSx,
  inputSx,
  navy,
  pageShellSx,
  primaryBtnSx,
  primaryDark,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { fetchProgrammesOptions } from "../Programmes/programmesShared";

const CATEGORY_META = {
  class: {
    key: "class",
    label: "Classes",
    singular: "class",
    createTitle: "Create class",
    subtitle: "Schedule a class session for a programme cohort.",
    accent: primaryGreen,
    icon: SchoolRoundedIcon,
    namePlaceholder: "e.g. Anatomy lecture",
  },
  cat: {
    key: "cat",
    label: "CATs",
    singular: "CAT",
    createTitle: "Create CAT",
    subtitle: "Schedule a continuous assessment test for a programme cohort.",
    accent: "#b26a00",
    icon: QuizRoundedIcon,
    namePlaceholder: "e.g. Anatomy CAT 1",
  },
  exam: {
    key: "exam",
    label: "Exams",
    singular: "exam",
    createTitle: "Create exam",
    subtitle: "Schedule an examination for a programme cohort.",
    accent: navy,
    icon: FactCheckRoundedIcon,
    namePlaceholder: "e.g. End of semester exam",
  },
};

const localDateValue = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

/** 12-hour parts → 24-hour "HH:mm" for the API. */
const to24h = (hour, minute, meridiem) => {
  let h = Number(hour) % 12;
  if (meridiem === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
};

const dateTimeToFormParts = (value) => {
  const date = new Date(value);
  const hour24 = date.getHours();
  return {
    date: localDateValue(date),
    hour: String(hour24 % 12 || 12),
    minute: String(date.getMinutes()).padStart(2, "0"),
    meridiem: hour24 >= 12 ? "PM" : "AM",
  };
};

const cardSx = {
  bgcolor: "var(--kd-surface)",
  border: "1px solid rgba(0,96,80,0.1)",
  borderRadius: "20px",
  boxShadow: "0 12px 36px -16px rgba(20,26,58,0.12)",
  overflow: "hidden",
};

function SectionLabel({ icon, title, hint }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.75 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "11px",
          display: "grid",
          placeItems: "center",
          color: primaryGreen,
          bgcolor: "rgba(0,96,80,0.08)",
          flexShrink: 0,
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.05rem", lineHeight: 1.2 }}>
          {title}
        </Typography>
        {hint ? (
          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.74rem" }}>{hint}</Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

function TimePartsPicker({ hour, minute, meridiem, onHour, onMinute, onMeridiem, accent }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 1, alignItems: "center" }}>
      <FormControl fullWidth required sx={inputSx}>
        <InputLabel>Hour</InputLabel>
        <Select label="Hour" value={hour} onChange={onHour}>
          {HOUR_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth required sx={inputSx}>
        <InputLabel>Minutes</InputLabel>
        <Select label="Minutes" value={minute} onChange={onMinute}>
          {MINUTE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Stack
        direction="row"
        spacing={0}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(0,96,80,0.2)",
          flexShrink: 0,
        }}
      >
        {["AM", "PM"].map((option) => {
          const active = meridiem === option;
          return (
            <Button
              key={option}
              type="button"
              onClick={() => onMeridiem(option)}
              sx={{
                textTransform: "none",
                fontFamily: fontBody,
                fontWeight: 800,
                fontSize: "0.8rem",
                minWidth: 46,
                px: 1.25,
                py: 1.3,
                borderRadius: 0,
                color: active ? "#fff" : textSecondary,
                background: active
                  ? `linear-gradient(145deg, ${accent} 0%, ${primaryDark} 150%)`
                  : "var(--kd-surface)",
                "&:hover": {
                  background: active
                    ? `linear-gradient(145deg, ${accent} 0%, ${primaryDark} 150%)`
                    : "rgba(0,96,80,0.06)",
                },
              }}
            >
              {option}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}

export default function TimetableCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const categoryKey = CATEGORY_META[searchParams.get("tab")] ? searchParams.get("tab") : "class";
  const meta = CATEGORY_META[categoryKey];
  const Icon = meta.icon;

  const returnYear = searchParams.get("year");
  const returnMonth = searchParams.get("month");

  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => ({
    title: "",
    programme_id: "",
    year_of_study: "",
    semester: "",
    start_date: localDateValue(),
    start_hour: "9",
    start_minute: "00",
    start_meridiem: "AM",
    end_date: localDateValue(),
    end_hour: "11",
    end_minute: "00",
    end_meridiem: "AM",
  }));

  const enrolment = useProgrammeEnrolmentOptions(form.programme_id || null);
  const token = getPortalToken();

  const goBack = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo);
      return;
    }
    const params = new URLSearchParams({ tab: categoryKey });
    if (returnYear) params.set("year", returnYear);
    if (returnMonth != null && returnMonth !== "") params.set("month", returnMonth);
    navigate(`/timetable?${params.toString()}`);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [opts, entryResponse] = await Promise.all([
          fetchProgrammesOptions(token),
          isEdit
            ? fetch(`/api/timetable/${id}`, { headers: authJsonHeaders(token) })
            : Promise.resolve(null),
        ]);
        if (!active) return;
        setProgrammes(opts);
        if (entryResponse) {
          const data = await entryResponse.json().catch(() => ({}));
          if (!entryResponse.ok || !data.success) {
            throw new Error(data.message || "Could not load timetable entry");
          }
          const entry = data.data;
          const start = dateTimeToFormParts(entry.starts_at);
          const end = dateTimeToFormParts(entry.ends_at);
          setForm({
            title: entry.title || "",
            programme_id: entry.programme_id || "",
            year_of_study: String(entry.year_of_study || ""),
            semester: String(entry.semester || ""),
            start_date: start.date,
            start_hour: start.hour,
            start_minute: start.minute,
            start_meridiem: start.meridiem,
            end_date: end.date,
            end_hour: end.hour,
            end_minute: end.minute,
            end_meridiem: end.meridiem,
          });
        }
      } catch (requestError) {
        if (active) setError(requestError.message || "Could not load programmes");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token, isEdit, id]);

  // Keep year/semester valid when enrolment options arrive or programme changes.
  useEffect(() => {
    if (!form.programme_id || enrolment.loading) return;
    setForm((prev) => {
      const years = enrolment.years.length ? enrolment.years : [1];
      const semesters = enrolment.semesters.length ? enrolment.semesters : [1, 2];
      const yearOk = years.map(String).includes(String(prev.year_of_study));
      const semOk = semesters.map(String).includes(String(prev.semester));
      return {
        ...prev,
        year_of_study: yearOk ? prev.year_of_study : String(years[0]),
        semester: semOk ? prev.semester : String(semesters[0]),
      };
    });
  }, [form.programme_id, enrolment.loading, enrolment.years, enrolment.semesters]);

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      if (field === "programme_id") {
        return { ...prev, programme_id: value, year_of_study: "", semester: "" };
      }
      if (field === "start_date" && prev.end_date < value) {
        return { ...prev, start_date: value, end_date: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const startTime24 = to24h(form.start_hour, form.start_minute, form.start_meridiem);
  const endTime24 = to24h(form.end_hour, form.end_minute, form.end_meridiem);

  const durationHint = useMemo(() => {
    if (!form.start_date || !form.end_date) return "";
    const starts = new Date(`${form.start_date}T${startTime24}`);
    const ends = new Date(`${form.end_date}T${endTime24}`);
    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || ends <= starts) return "";
    const minutes = Math.round((ends - starts) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours && mins) return `${hours}h ${mins}m`;
    if (hours) return `${hours}h`;
    return `${mins}m`;
  }, [form.start_date, form.end_date, startTime24, endTime24]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      Swal.fire({ icon: "error", title: "Not signed in", text: "Please sign in again.", confirmButtonColor: primaryGreen });
      return;
    }
    if (!form.title.trim()) {
      Swal.fire({ icon: "warning", title: "Name required", text: `Enter a name for this ${meta.singular}.`, confirmButtonColor: primaryGreen });
      return;
    }
    if (!form.programme_id) {
      Swal.fire({ icon: "warning", title: "Programme required", text: "Select a programme.", confirmButtonColor: primaryGreen });
      return;
    }
    if (!form.year_of_study || !form.semester) {
      Swal.fire({ icon: "warning", title: "Cohort required", text: "Select the year of study and semester.", confirmButtonColor: primaryGreen });
      return;
    }
    const starts = new Date(`${form.start_date}T${startTime24}`);
    const ends = new Date(`${form.end_date}T${endTime24}`);
    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
      Swal.fire({ icon: "warning", title: "Invalid schedule", text: "Check the start and end date/time.", confirmButtonColor: primaryGreen });
      return;
    }
    if (ends <= starts) {
      Swal.fire({ icon: "warning", title: "Invalid schedule", text: "End must be after the start.", confirmButtonColor: primaryGreen });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(isEdit ? `/api/timetable/${id}` : "/api/timetable", {
        method: isEdit ? "PUT" : "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          title: form.title.trim(),
          programme_id: form.programme_id,
          year_of_study: Number(form.year_of_study),
          semester: Number(form.semester),
          category: categoryKey,
          start_date: form.start_date,
          start_time: startTime24,
          end_date: form.end_date,
          end_time: endTime24,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Could not create ${meta.singular}`);
      }
      await Swal.fire({
        icon: "success",
        title: isEdit
          ? `${meta.createTitle.replace("Create ", "").replace(/^./, (c) => c.toUpperCase())} updated`
          : `${meta.createTitle.replace("Create ", "").replace(/^./, (c) => c.toUpperCase())} created`,
        text: isEdit
          ? `"${form.title.trim()}" has been updated.`
          : `"${form.title.trim()}" has been added to the timetable.`,
        timer: 1700,
        showConfirmButton: false,
        confirmButtonColor: primaryGreen,
      });
      goBack();
    } catch (requestError) {
      Swal.fire({
        icon: "error",
        title: "Could not save",
        text: requestError.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <BrandPageLoader message="Loading programmes…" />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ ...pageShellSx, pb: 4 }}>
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
              type="button"
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
            <Icon sx={{ fontSize: 26 }} />
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
              {isEdit ? meta.createTitle.replace("Create", "Edit") : meta.createTitle}
            </Typography>
            <Typography sx={{ fontFamily: fontBody, color: "rgba(255,255,255,0.78)", fontSize: "0.82rem", mt: 0.35 }}>
              {isEdit
                ? `Update this ${meta.singular}'s cohort and schedule.`
                : meta.subtitle}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px", fontFamily: fontBody }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={2} component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
        <Box sx={{ ...cardSx, p: { xs: 2, sm: 2.5 } }}>
          <SectionLabel
            icon={<TitleRoundedIcon />}
            title="Details"
            hint={`Name and cohort for this ${meta.singular}`}
          />
          <Stack spacing={2}>
            <TextField
              label="Name"
              required
              fullWidth
              value={form.title}
              onChange={setField("title")}
              placeholder={meta.namePlaceholder}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleRoundedIcon sx={{ color: textMuted, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />

            <FormControl fullWidth required sx={inputSx}>
              <InputLabel>Programme</InputLabel>
              <Select
                label="Programme"
                value={form.programme_id}
                onChange={setField("programme_id")}
                startAdornment={
                  <InputAdornment position="start" sx={{ mr: 0.5 }}>
                    <MenuBookRoundedIcon sx={{ color: textMuted, fontSize: 20 }} />
                  </InputAdornment>
                }
              >
                {programmes.map((programme) => (
                  <MenuItem key={programme.id} value={programme.id}>
                    {programme.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl fullWidth required sx={inputSx} disabled={!form.programme_id || enrolment.loading}>
                <InputLabel>Year of study</InputLabel>
                <Select label="Year of study" value={form.year_of_study} onChange={setField("year_of_study")}>
                  {(enrolment.years.length ? enrolment.years : [1]).map((year) => (
                    <MenuItem key={year} value={String(year)}>
                      Year {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required sx={inputSx} disabled={!form.programme_id || enrolment.loading}>
                <InputLabel>Semester</InputLabel>
                <Select label="Semester" value={form.semester} onChange={setField("semester")}>
                  {(enrolment.semesters.length ? enrolment.semesters : [1, 2]).map((semester) => {
                    const period = enrolment.semester_labels?.[semester];
                    const showPeriod = period && !/^semester\s*\d+$/i.test(period.trim());
                    return (
                      <MenuItem key={semester} value={String(semester)}>
                        {showPeriod ? `Semester ${semester} · ${period}` : `Semester ${semester}`}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ ...cardSx, p: { xs: 2, sm: 2.5 } }}>
          <SectionLabel
            icon={<ScheduleRoundedIcon />}
            title="Schedule"
            hint={durationHint ? `Duration · ${durationHint}` : "Start and end must not overlap another entry for the same cohort"}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.75,
                borderRadius: "16px",
                bgcolor: warmCream,
                border: "1px solid rgba(0,96,80,0.1)",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <EventRoundedIcon sx={{ color: meta.accent, fontSize: 20 }} />
                <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary, fontSize: "0.88rem" }}>
                  Starts
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                <TextField
                  label="Start date"
                  type="date"
                  required
                  fullWidth
                  value={form.start_date}
                  onChange={setField("start_date")}
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
                <TimePartsPicker
                  hour={form.start_hour}
                  minute={form.start_minute}
                  meridiem={form.start_meridiem}
                  onHour={setField("start_hour")}
                  onMinute={setField("start_minute")}
                  onMeridiem={(value) => setForm((prev) => ({ ...prev, start_meridiem: value }))}
                  accent={meta.accent}
                />
              </Stack>
            </Box>

            <Box
              sx={{
                p: 1.75,
                borderRadius: "16px",
                bgcolor: warmCream,
                border: "1px solid rgba(0,96,80,0.1)",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <ScheduleRoundedIcon sx={{ color: meta.accent, fontSize: 20 }} />
                <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary, fontSize: "0.88rem" }}>
                  Ends
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                <TextField
                  label="End date"
                  type="date"
                  required
                  fullWidth
                  value={form.end_date}
                  onChange={setField("end_date")}
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
                <TimePartsPicker
                  hour={form.end_hour}
                  minute={form.end_minute}
                  meridiem={form.end_meridiem}
                  onHour={setField("end_hour")}
                  onMinute={setField("end_minute")}
                  onMeridiem={(value) => setForm((prev) => ({ ...prev, end_meridiem: value }))}
                  accent={meta.accent}
                />
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 2,
              px: 1.5,
              py: 1.1,
              borderRadius: "12px",
              bgcolor: `color-mix(in srgb, ${meta.accent} 8%, var(--kd-surface))`,
              border: `1px solid color-mix(in srgb, ${meta.accent} 22%, transparent)`,
            }}
          >
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.78rem", fontWeight: 600 }}>
              Overlap check is enforced for the same programme, year and semester across classes, CATs and exams.
            </Typography>
          </Box>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="flex-end" sx={{ pt: 0.5 }}>
          <Button type="button" variant="text" onClick={goBack} disabled={saving} sx={{ ...ghostBtnSx, py: 1.25 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <SaveRoundedIcon sx={{ fontSize: "1.1rem !important" }} />
              )
            }
            sx={{
              ...primaryBtnSx,
              py: 1.25,
              px: 2.5,
              color: "#fff",
              background: `linear-gradient(135deg, ${meta.accent} 0%, ${primaryDark} 140%)`,
              boxShadow: `0 10px 24px -10px ${meta.accent}99`,
              "&:hover": {
                background: `linear-gradient(135deg, ${primaryDark} 0%, ${meta.accent} 140%)`,
              },
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.7)",
                background: `linear-gradient(135deg, ${meta.accent}99 0%, ${primaryDark}99 140%)`,
              },
            }}
          >
            {saving
              ? "Saving…"
              : isEdit
                ? `Save ${meta.singular}`
                : meta.createTitle}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
