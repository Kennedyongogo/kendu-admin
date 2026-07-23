import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
} from "../Users/usersShared";

const GRADES = ["A", "B", "C", "D", "E", "#"];

function currentAcademicYearHint() {
  const now = new Date();
  const y = now.getFullYear();
  const start = now.getMonth() >= 7 ? y : y - 1;
  return `${start}/${start + 1}`;
}

export default function StudentTranscriptEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId, transcriptId } = useParams();
  const isNew = !transcriptId || transcriptId === "new";

  const [bootLoading, setBootLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [context, setContext] = useState(null);
  const [registeredUnits, setRegisteredUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const pdfUrlRef = useRef(null);
  const previewTimerRef = useRef(null);

  const [form, setForm] = useState({
    programme_id: "",
    year_of_study: 1,
    semester: 1,
    academic_year: currentAcademicYearHint(),
    school_label: "",
    date_of_admission: "",
    date_of_graduation: "",
    recommendation: "",
    status: "draft",
    notes: "",
  });
  const [lines, setLines] = useState([]);

  const setPdfBlobUrl = useCallback((url) => {
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    pdfUrlRef.current = url;
    setPdfUrl(url);
  }, []);

  useEffect(
    () => () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    },
    []
  );

  const student = context?.student || location.state?.student || null;
  const programmeName =
    context?.programme?.name || location.state?.programmeName || null;

  const selectedRegistrationIds = useMemo(
    () => new Set(lines.map((l) => l.registration_id).filter(Boolean)),
    [lines]
  );

  const loadRegisteredUnits = useCallback(
    async (placement) => {
      setUnitsLoading(true);
      try {
        const params = new URLSearchParams();
        if (placement.year_of_study) params.set("year_of_study", String(placement.year_of_study));
        if (placement.semester) params.set("semester", String(placement.semester));
        if (placement.academic_year) params.set("academic_year", placement.academic_year);
        const qs = params.toString();
        const res = await fetch(
          `/api/transcripts/students/${encodeURIComponent(studentId)}/registered-units${
            qs ? `?${qs}` : ""
          }`,
          { headers: authJsonHeaders(getPortalToken()) }
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load registered units.");
        }
        let data = json.data || [];
        // If filter returns nothing, fall back to all registered units for this student
        if (data.length === 0 && (placement.year_of_study || placement.academic_year)) {
          const allRes = await fetch(
            `/api/transcripts/students/${encodeURIComponent(studentId)}/registered-units`,
            { headers: authJsonHeaders(getPortalToken()) }
          );
          const allJson = await allRes.json();
          if (allRes.ok && allJson.success) data = allJson.data || [];
        }
        setRegisteredUnits(data);
      } catch (err) {
        setError(err.message || "Failed to load units.");
      } finally {
        setUnitsLoading(false);
      }
    },
    [studentId]
  );

  const refreshPreview = useCallback(
    async (nextForm = form, nextLines = lines) => {
      if (!studentId) return;
      setPreviewLoading(true);
      try {
        const res = await fetch("/api/transcripts/preview", {
          method: "POST",
          headers: authJsonHeaders(getPortalToken()),
          body: JSON.stringify({
            student_id: studentId,
            programme_id: nextForm.programme_id || undefined,
            year_of_study: Number(nextForm.year_of_study),
            semester: Number(nextForm.semester),
            academic_year: nextForm.academic_year,
            school_label: nextForm.school_label,
            date_of_admission: nextForm.date_of_admission || null,
            date_of_graduation: nextForm.date_of_graduation || null,
            recommendation: nextForm.recommendation,
            status: nextForm.status,
            lines: nextLines,
          }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || "Preview failed.");
        }
        const blob = await res.blob();
        setPdfBlobUrl(URL.createObjectURL(blob));
      } catch (err) {
        setError(err.message || "Could not refresh PDF preview.");
      } finally {
        setPreviewLoading(false);
      }
    },
    [form, lines, setPdfBlobUrl, studentId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootLoading(true);
      setError("");
      try {
        const headers = authJsonHeaders(getPortalToken());
        const ctxRes = await fetch(
          `/api/transcripts/students/${encodeURIComponent(studentId)}/context`,
          { headers }
        );
        const ctxJson = await ctxRes.json();
        if (!ctxRes.ok || !ctxJson.success) {
          throw new Error(ctxJson.message || "Failed to load student.");
        }
        if (cancelled) return;
        setContext(ctxJson.data);

        let nextForm = {
          programme_id: ctxJson.data.defaults?.programme_id || ctxJson.data.student?.programme_id || "",
          year_of_study: ctxJson.data.defaults?.year_of_study || 1,
          semester: ctxJson.data.defaults?.semester || 1,
          academic_year: currentAcademicYearHint(),
          school_label: ctxJson.data.defaults?.school_label || "",
          date_of_admission: ctxJson.data.defaults?.date_of_admission || "",
          date_of_graduation: "",
          recommendation: "",
          status: "draft",
          notes: "",
        };
        let nextLines = [];

        if (!isNew) {
          const oneRes = await fetch(`/api/transcripts/${encodeURIComponent(transcriptId)}`, {
            headers,
          });
          const oneJson = await oneRes.json();
          if (!oneRes.ok || !oneJson.success) {
            throw new Error(oneJson.message || "Failed to load transcript.");
          }
          const t = oneJson.data;
          nextForm = {
            programme_id: t.programme_id,
            year_of_study: t.year_of_study,
            semester: t.semester,
            academic_year: t.academic_year,
            school_label: t.school_label || "",
            date_of_admission: t.date_of_admission || "",
            date_of_graduation: t.date_of_graduation || "",
            recommendation: t.recommendation || "",
            status: t.status || "draft",
            notes: t.notes || "",
          };
          nextLines = (t.lines || []).map((l, i) => ({
            unit_id: l.unit_id,
            registration_id: l.registration_id,
            unit_code: l.unit_code,
            course_title: l.course_title,
            hours: Number(l.hours) || 0,
            grade: l.grade,
            sort_order: l.sort_order ?? i,
          }));
        }

        setForm(nextForm);
        setLines(nextLines);
        await loadRegisteredUnits(nextForm);
        if (!cancelled) await refreshPreview(nextForm, nextLines);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to open editor.");
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, transcriptId, isNew]);

  const queuePreview = useCallback(
    (nextForm, nextLines) => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => {
        refreshPreview(nextForm, nextLines);
      }, 450);
    },
    [refreshPreview]
  );

  const patchForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const toggleUnit = (unit) => {
    setLines((prev) => {
      const exists = prev.some((l) => l.registration_id === unit.registration_id);
      let next;
      if (exists) {
        next = prev.filter((l) => l.registration_id !== unit.registration_id);
      } else {
        next = [
          ...prev,
          {
            unit_id: unit.unit_id,
            registration_id: unit.registration_id,
            unit_code: unit.unit_code,
            course_title: unit.course_title,
            hours: Number(unit.hours) || 0,
            grade: "C",
            sort_order: prev.length,
          },
        ];
      }
      queuePreview(form, next);
      return next;
    });
  };

  const updateLineGrade = (registrationId, grade) => {
    setLines((prev) => {
      const next = prev.map((l) =>
        l.registration_id === registrationId ? { ...l, grade } : l
      );
      queuePreview(form, next);
      return next;
    });
  };

  const removeLine = (registrationId) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.registration_id !== registrationId);
      queuePreview(form, next);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (!form.academic_year || !/^\d{4}\/\d{4}$/.test(form.academic_year)) {
        throw new Error('Academic year must look like "2025/2026".');
      }
      if (lines.length === 0) {
        throw new Error("Select at least one registered unit before saving.");
      }
      const body = {
        student_id: studentId,
        programme_id: form.programme_id,
        year_of_study: Number(form.year_of_study),
        semester: Number(form.semester),
        academic_year: form.academic_year,
        school_label: form.school_label,
        date_of_admission: form.date_of_admission || null,
        date_of_graduation: form.date_of_graduation || null,
        recommendation: form.recommendation,
        status: form.status,
        notes: form.notes,
        lines: lines.map((l, i) => ({ ...l, sort_order: i })),
      };
      const res = await fetch(
        isNew ? "/api/transcripts" : `/api/transcripts/${encodeURIComponent(transcriptId)}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: authJsonHeaders(getPortalToken()),
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Save failed.");
      }
      setSuccess(isNew ? "Transcript created." : "Transcript updated.");
      if (isNew) {
        navigate(`/cohort-transfer/students/${studentId}/transcripts/${json.data.id}`, {
          replace: true,
          state: location.state,
        });
      } else {
        await refreshPreview(form, lines);
      }
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (bootLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: primaryGreen }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 72px)",
        mx: { xs: -1.5, sm: -2, md: -3 },
        mt: { xs: -1, sm: -1.5 },
        mb: { xs: -1.5, sm: -2, md: -3 },
        display: "flex",
        flexDirection: "column",
        bgcolor: "#e8eeeb",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          bgcolor: "#fff",
          borderBottom: `1px solid ${alpha(navy, 0.08)}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() =>
            navigate(`/cohort-transfer/students/${studentId}/transcript`, {
              state: location.state,
            })
          }
          sx={{
            textTransform: "none",
            fontFamily: fontBody,
            fontWeight: 800,
            color: navy,
          }}
        >
          Transcripts
        </Button>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, lineHeight: 1.2 }}>
            {isNew ? "New transcript" : "Edit transcript"}
          </Typography>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary }} noWrap>
            {student?.full_name || "Student"}
            {programmeName ? ` · ${programmeName}` : ""}
          </Typography>
        </Box>
        <Tooltip title="Refresh PDF preview">
          <span>
            <IconButton
              onClick={() => refreshPreview()}
              disabled={previewLoading}
              sx={{ color: primaryGreen }}
            >
              <RefreshRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
          onClick={handleSave}
          disabled={saving}
          variant="contained"
          sx={{
            textTransform: "none",
            fontFamily: fontBody,
            fontWeight: 800,
            bgcolor: primaryGreen,
            borderRadius: "12px",
            px: 2,
            "&:hover": { bgcolor: primaryDark },
          }}
        >
          Save
        </Button>
      </Box>

      {(error || success) && (
        <Box sx={{ px: 2, pt: 1.5 }}>
          {error ? (
            <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: "12px" }}>
              {error}
            </Alert>
          ) : null}
          {success ? (
            <Alert severity="success" onClose={() => setSuccess("")} sx={{ borderRadius: "12px", mt: error ? 1 : 0 }}>
              {success}
            </Alert>
          ) : null}
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.05fr) minmax(320px, 0.95fr)" },
          gap: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Left: PDF preview */}
        <Box
          sx={{
            position: "relative",
            bgcolor: "#cfd8d4",
            borderRight: { lg: `1px solid ${alpha(navy, 0.1)}` },
            minHeight: { xs: 420, lg: "auto" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ px: 2, py: 1, bgcolor: alpha("#fff", 0.55), borderBottom: `1px solid ${alpha(navy, 0.08)}` }}
          >
            <Typography
              sx={{
                fontFamily: fontBody,
                fontWeight: 800,
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: textSecondary,
              }}
            >
              Transcript PDF preview
            </Typography>
            {previewLoading ? <CircularProgress size={14} sx={{ color: primaryGreen }} /> : null}
            <Chip
              size="small"
              label={form.status}
              sx={{
                ml: "auto",
                height: 22,
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "0.65rem",
                bgcolor: form.status === "issued" ? alpha(primaryGreen, 0.14) : alpha(accentGold, 0.2),
              }}
            />
          </Stack>
          <Box sx={{ flex: 1, p: { xs: 1, sm: 1.5 }, minHeight: 0 }}>
            {pdfUrl ? (
              <Box
                component="iframe"
                title="Transcript preview"
                src={pdfUrl}
                sx={{
                  width: "100%",
                  height: "100%",
                  minHeight: { xs: 480, lg: "calc(100dvh - 170px)" },
                  border: "none",
                  borderRadius: "8px",
                  bgcolor: "#fff",
                  boxShadow: `0 8px 28px ${alpha(navy, 0.18)}`,
                }}
              />
            ) : (
              <Box sx={{ display: "grid", placeItems: "center", height: "100%", minHeight: 360 }}>
                <Typography sx={{ color: textSecondary, fontFamily: fontBody }}>
                  Preview will appear here
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right: form + registered units */}
        <Box
          sx={{
            bgcolor: "#f7f9f8",
            overflow: "auto",
            maxHeight: { lg: "calc(100dvh - 120px)" },
            px: { xs: 2, sm: 2.5 },
            py: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: "1.05rem",
              color: textPrimary,
              mb: 1.5,
            }}
          >
            Placement & details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.25,
              mb: 2,
            }}
          >
            <TextField
              size="small"
              label="Academic year"
              value={form.academic_year}
              onChange={(e) => patchForm({ academic_year: e.target.value })}
              placeholder="2025/2026"
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Year of study</InputLabel>
              <Select
                label="Year of study"
                value={form.year_of_study}
                onChange={(e) => patchForm({ year_of_study: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <MenuItem key={y} value={y}>
                    Year {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                label="Semester"
                value={form.semester}
                onChange={(e) => patchForm({ semester: Number(e.target.value) })}
              >
                <MenuItem value={1}>Semester 1</MenuItem>
                <MenuItem value={2}>Semester 2</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => patchForm({ status: e.target.value })}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="issued">Issued</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="School / department"
              value={form.school_label}
              onChange={(e) => patchForm({ school_label: e.target.value })}
              fullWidth
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
            <TextField
              size="small"
              label="Date of admission"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.date_of_admission || ""}
              onChange={(e) => patchForm({ date_of_admission: e.target.value })}
              fullWidth
            />
            <TextField
              size="small"
              label="Date of graduation"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.date_of_graduation || ""}
              onChange={(e) => patchForm({ date_of_graduation: e.target.value })}
              fullWidth
            />
            <TextField
              size="small"
              label="Recommendation"
              value={form.recommendation}
              onChange={(e) => patchForm({ recommendation: e.target.value })}
              placeholder="TO PROCEED TO THE SECOND YEAR OF STUDY"
              fullWidth
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
          </Box>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary }}>
              Registered units
            </Typography>
            <Button
              size="small"
              onClick={() => loadRegisteredUnits(form)}
              sx={{ textTransform: "none", fontWeight: 700, color: primaryGreen }}
            >
              Reload for placement
            </Button>
          </Stack>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary, mb: 1.25 }}>
            Only units the student has registered can be added. Tick a unit to place it on the transcript,
            then set the grade.
          </Typography>

          {unitsLoading ? (
            <Box sx={{ py: 3, display: "grid", placeItems: "center" }}>
              <CircularProgress size={28} sx={{ color: primaryGreen }} />
            </Box>
          ) : registeredUnits.length === 0 ? (
            <Alert severity="warning" sx={{ borderRadius: "12px", mb: 2 }}>
              No registered units found for this student. They must register units for the semester before
              a transcript can be created.
            </Alert>
          ) : (
            <Stack spacing={0.85} sx={{ mb: 2 }}>
              {registeredUnits.map((unit) => {
                const checked = selectedRegistrationIds.has(unit.registration_id);
                const line = lines.find((l) => l.registration_id === unit.registration_id);
                return (
                  <Box
                    key={unit.registration_id}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 0.75,
                      p: 1.1,
                      borderRadius: "12px",
                      bgcolor: checked ? alpha(primaryGreen, 0.07) : "#fff",
                      border: `1px solid ${
                        checked ? alpha(primaryGreen, 0.35) : alpha(navy, 0.08)
                      }`,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={checked}
                      onChange={() => toggleUnit(unit)}
                      sx={{ mt: -0.35, color: alpha(navy, 0.3), "&.Mui-checked": { color: primaryGreen } }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          color: textPrimary,
                        }}
                      >
                        {unit.unit_code}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontSize: "0.78rem",
                          color: textSecondary,
                          lineHeight: 1.3,
                        }}
                      >
                        {unit.course_title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontSize: "0.7rem",
                          color: textSecondary,
                          mt: 0.35,
                        }}
                      >
                        {Number(unit.hours).toFixed(2)} hrs · Y{unit.year_of_study} S{unit.semester} ·{" "}
                        {unit.academic_year}
                      </Typography>
                      {checked ? (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.85 }}>
                          <FormControl size="small" sx={{ minWidth: 88 }}>
                            <InputLabel>Grade</InputLabel>
                            <Select
                              label="Grade"
                              value={line?.grade || "C"}
                              onChange={(e) => updateLineGrade(unit.registration_id, e.target.value)}
                            >
                              {GRADES.map((g) => (
                                <MenuItem key={g} value={g}>
                                  {g === "#" ? "# Audited" : g}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Tooltip title="Remove from transcript">
                            <IconButton size="small" onClick={() => removeLine(unit.registration_id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={() => refreshPreview()}
            disabled={previewLoading}
            sx={{
              textTransform: "none",
              fontFamily: fontBody,
              fontWeight: 800,
              borderColor: alpha(primaryGreen, 0.4),
              color: primaryGreen,
              borderRadius: "12px",
              mb: 1,
            }}
          >
            Update PDF preview
          </Button>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textSecondary, pb: 2 }}>
            Selected units: {lines.length}. Save stores this transcript; the student can have many (one
            per year / semester / academic year).
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
