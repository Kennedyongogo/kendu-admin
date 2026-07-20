import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TableChartIcon from "@mui/icons-material/TableChart";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Swal from "sweetalert2";
import { PremiumDialog } from "./usersUi";
import {
  fontBody,
  getPortalToken,
  ghostBtnSx,
  inputSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "./usersShared";
import useProgrammeEnrolmentOptions from "./useProgrammeEnrolmentOptions";

const STEPS = ["Upload Excel", "Match columns", "Confirm & import"];

const SYSTEM_FIELDS = [
  { key: "email", label: "Email", required: true },
  { key: "full_name", label: "Full name", required: true },
  { key: "admission_number", label: "Admission number", required: true },
  { key: "phone", label: "Phone", required: false },
  { key: "password", label: "Password", required: false },
  { key: "programme", label: "Programme", required: false },
  { key: "year_of_study", label: "Year of study", required: false },
  { key: "semester", label: "Semester", required: false },
];

function guessMapping(columns) {
  const map = {};
  for (const field of SYSTEM_FIELDS) {
    const hit = (columns || []).find(
      (c) => c.suggested === field.key || String(c.header).toLowerCase().replace(/\s+/g, "_") === field.key
    );
    if (hit) map[field.key] = hit.header;
  }
  return map;
}

export default function StudentImportDialog({ open, onClose, onImported }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mapping, setMapping] = useState({});
  const [programmes, setProgrammes] = useState([]);
  const [defaults, setDefaults] = useState({
    programme_id: "",
    year_of_study: "",
    semester: "",
  });
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const enrolment = useProgrammeEnrolmentOptions(defaults.programme_id);

  useEffect(() => {
    if (!defaults.programme_id || enrolment.loading) return;
    setDefaults((d) => {
      const yearOk = enrolment.years.some((y) => String(y) === String(d.year_of_study));
      const semOk = enrolment.semesters.some((s) => String(s) === String(d.semester));
      if (yearOk && semOk) return d;
      return {
        ...d,
        year_of_study: yearOk
          ? d.year_of_study
          : enrolment.years[0] != null
            ? String(enrolment.years[0])
            : "",
        semester: semOk
          ? d.semester
          : enrolment.semesters[0] != null
            ? String(enrolment.semesters[0])
            : "",
      };
    });
  }, [defaults.programme_id, enrolment.loading, enrolment.years, enrolment.semesters]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setFile(null);
    setPreview(null);
    setMapping({});
    setDefaults({ programme_id: "", year_of_study: "", semester: "" });
    setError("");
    setLoadingPreview(false);
    setImporting(false);

    (async () => {
      try {
        const token = getPortalToken();
        const res = await fetch("/api/programmes?is_active=true&limit=100", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProgrammes(Array.isArray(data.data) ? data.data : []);
        }
      } catch {
        setProgrammes([]);
      }
    })();
  }, [open]);

  const columns = preview?.columns || [];
  const defaultPassword = preview?.default_password || "123456";

  const mappingReady = useMemo(() => {
    return SYSTEM_FIELDS.filter((f) => f.required).every((f) => Boolean(mapping[f.key]));
  }, [mapping]);

  const handleFile = async (picked) => {
    if (!picked) return;
    setError("");
    setFile(picked);
    setLoadingPreview(true);
    try {
      const token = getPortalToken();
      const body = new FormData();
      body.append("file", picked);
      const res = await fetch("/api/users/import-preview", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not read Excel");
      setPreview(data.data);
      setMapping(guessMapping(data.data.columns || []));
      setStep(1);
    } catch (err) {
      setFile(null);
      setPreview(null);
      setError(err.message || "Could not read Excel");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleImport = async () => {
    if (!file || !mappingReady) return;
    if (!defaults.programme_id && !mapping.programme) {
      setError("Set a default programme or map a Programme column.");
      return;
    }
    if (!defaults.year_of_study && !mapping.year_of_study) {
      setError("Set a default year of study or map a Year column.");
      return;
    }
    if (!defaults.semester && !mapping.semester) {
      setError("Set a default semester or map a Semester column.");
      return;
    }

    setImporting(true);
    setError("");
    try {
      const token = getPortalToken();
      const body = new FormData();
      body.append("file", file);
      body.append("mapping", JSON.stringify(mapping));
      body.append(
        "defaults",
        JSON.stringify({
          programme_id: defaults.programme_id || null,
          year_of_study: defaults.year_of_study || null,
          semester: defaults.semester || null,
          password: defaultPassword,
        })
      );

      const res = await fetch("/api/users/import-mapped", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Import failed");

      const created = data.data?.createdCount || 0;
      const failed = data.data?.errorCount || 0;
      onClose();
      await Swal.fire({
        icon: created > 0 ? "success" : "warning",
        title: "Import finished",
        html: `<p style="margin:0 0 8px"><strong>${created}</strong> student(s) created.</p>
          ${failed ? `<p style="margin:0">${failed} row(s) failed.</p>` : ""}
          <p style="margin:8px 0 0;opacity:.75">Default password: <code>${defaultPassword}</code></p>`,
        confirmButtonColor: primaryGreen,
      });
      onImported?.(data.data);
    } catch (err) {
      setError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <PremiumDialog
      open={open}
      onClose={() => !importing && !loadingPreview && onClose()}
      title="Import students from Excel"
      subtitle="Upload any spreadsheet, match columns, then import"
      icon={<TableChartIcon />}
      maxWidth="md"
      footer={
        <>
          <Button onClick={onClose} disabled={importing || loadingPreview} sx={ghostBtnSx}>
            Cancel
          </Button>
          {step > 0 ? (
            <Button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={importing || loadingPreview}
              sx={ghostBtnSx}
            >
              Back
            </Button>
          ) : null}
          {step === 1 ? (
            <Button
              variant="contained"
              disabled={!mappingReady || loadingPreview}
              onClick={() => {
                setError("");
                setStep(2);
              }}
              sx={primaryBtnSx}
            >
              Continue
            </Button>
          ) : null}
          {step === 2 ? (
            <Button
              variant="contained"
              disabled={importing}
              startIcon={importing ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
              onClick={() => void handleImport()}
              sx={primaryBtnSx}
            >
              {importing ? "Importing…" : "Import students"}
            </Button>
          ) : null}
        </>
      }
    >
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 2.5 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  fontFamily: fontBody,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      {step === 0 ? (
        <Box
          sx={{
            border: "1px dashed rgba(0,96,80,0.35)",
            borderRadius: "16px",
            bgcolor: "rgba(0,96,80,0.04)",
            p: 3,
            textAlign: "center",
          }}
        >
          <UploadFileIcon sx={{ fontSize: 40, color: primaryGreen, mb: 1 }} />
          <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary, mb: 0.5 }}>
            Choose an Excel file
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: textMuted, mb: 2 }}>
            .xlsx or .xls — any columns are fine; you will map them next.
          </Typography>
          <Button
            component="label"
            variant="contained"
            disabled={loadingPreview}
            startIcon={loadingPreview ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
            sx={primaryBtnSx}
          >
            {loadingPreview ? "Reading…" : "Upload Excel"}
            <input
              hidden
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void handleFile(f);
              }}
            />
          </Button>
        </Box>
      ) : null}

      {step === 1 ? (
        <Stack spacing={2}>
          <Typography sx={{ fontSize: "0.85rem", color: textSecondary }}>
            File: <strong>{file?.name}</strong> · {preview?.row_count || 0} data row(s)
          </Typography>
          {SYSTEM_FIELDS.map((field) => (
            <FormControl key={field.key} fullWidth sx={inputSx}>
              <InputLabel>
                {field.label}
                {field.required ? " *" : ""}
              </InputLabel>
              <Select
                label={`${field.label}${field.required ? " *" : ""}`}
                value={mapping[field.key] || ""}
                onChange={(e) => setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))}
              >
                <MenuItem value="">
                  <em>{field.required ? "Select column" : "Not mapped"}</em>
                </MenuItem>
                {columns.map((col) => (
                  <MenuItem key={`${field.key}-${col.index}`} value={col.header}>
                    {col.header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      ) : null}

      {step === 2 ? (
        <Stack spacing={2}>
          <Alert severity="info" sx={{ borderRadius: "12px" }}>
            Password defaults to <strong>{defaultPassword}</strong> when the Password column is empty or unmapped.
          </Alert>

          <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary }}>
            Defaults for this import
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: textMuted, mt: -1 }}>
            Used when a row has no mapped value for programme / year / semester.
          </Typography>

          <FormControl fullWidth required sx={inputSx}>
            <InputLabel>Default programme</InputLabel>
            <Select
              label="Default programme"
              value={defaults.programme_id}
              onChange={(e) =>
                setDefaults((d) => ({
                  ...d,
                  programme_id: e.target.value,
                  year_of_study: "",
                  semester: "",
                }))
              }
            >
              <MenuItem value="">
                <em>Select programme</em>
              </MenuItem>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              fullWidth
              required
              label="Default year"
              value={defaults.year_of_study}
              disabled={!defaults.programme_id || enrolment.loading || enrolment.years.length === 0}
              helperText={
                !defaults.programme_id
                  ? "Select a programme first"
                  : enrolment.loading
                    ? "Loading years…"
                    : undefined
              }
              onChange={(e) => setDefaults((d) => ({ ...d, year_of_study: e.target.value }))}
              sx={inputSx}
            >
              {enrolment.years.map((y) => (
                <MenuItem key={y} value={String(y)}>
                  Year {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              required
              label="Default semester"
              value={defaults.semester}
              disabled={!defaults.programme_id || enrolment.loading || enrolment.semesters.length === 0}
              helperText={
                !defaults.programme_id
                  ? "Select a programme first"
                  : enrolment.loading
                    ? "Loading semesters…"
                    : undefined
              }
              onChange={(e) => setDefaults((d) => ({ ...d, semester: e.target.value }))}
              sx={inputSx}
            >
              {enrolment.semesters.map((s) => (
                <MenuItem key={s} value={String(s)}>
                  {enrolment.semester_labels?.[s] || `Semester ${s}`}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {preview?.sample?.length ? (
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: textMuted, mb: 1 }}>
                Sample rows (first {preview.sample.length})
              </Typography>
              <Box
                sx={{
                  maxHeight: 160,
                  overflow: "auto",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,96,80,0.12)",
                  p: 1.25,
                  bgcolor: "rgba(0,96,80,0.03)",
                  fontSize: "0.75rem",
                  fontFamily: "ui-monospace, monospace",
                  color: textSecondary,
                }}
              >
                {preview.sample.map((row, i) => (
                  <Box key={i} sx={{ mb: 0.75 }}>
                    {SYSTEM_FIELDS.filter((f) => mapping[f.key])
                      .map((f) => `${f.label}: ${row[mapping[f.key]] || "—"}`)
                      .join(" · ")}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}
        </Stack>
      ) : null}
    </PremiumDialog>
  );
}
