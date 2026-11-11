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
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TableChartIcon from "@mui/icons-material/TableChart";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import Swal from "sweetalert2";
import { PremiumDialog } from "../Users/usersUi";
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
} from "../Users/usersShared";

const STEPS = ["Upload Excel", "Match columns", "Confirm & import"];

const SYSTEM_FIELDS = [
  { key: "title", label: "Title", required: true },
  { key: "url", label: "URL", required: true },
  { key: "resource_type", label: "Resource type", required: false },
  { key: "programme", label: "Programme", required: false },
  { key: "description", label: "Description", required: false },
];

const RESOURCE_TYPES = [
  { value: "link", label: "Link" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Video" },
  { value: "other", label: "Other" },
];

function guessMapping(columns) {
  const map = {};
  for (const field of SYSTEM_FIELDS) {
    const hit = (columns || []).find(
      (c) =>
        c.suggested === field.key ||
        String(c.header).toLowerCase().replace(/\s+/g, "_") === field.key
    );
    if (hit) map[field.key] = hit.header;
  }
  return map;
}

export default function ElearningImportDialog({ open, onClose, onImported }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mapping, setMapping] = useState({});
  const [programmes, setProgrammes] = useState([]);
  const [defaults, setDefaults] = useState({
    programme_id: "",
    resource_type: "link",
  });
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setFile(null);
    setPreview(null);
    setMapping({});
    setDefaults({ programme_id: "", resource_type: "link" });
    setError("");
    setLoadingPreview(false);
    setDownloadingTemplate(false);
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

  const mappingReady = useMemo(() => {
    return SYSTEM_FIELDS.filter((f) => f.required).every((f) => Boolean(mapping[f.key]));
  }, [mapping]);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setError("");
    try {
      const token = getPortalToken();
      const res = await fetch("/api/library/elearning/import-template", {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Could not download template");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "elearning-import-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Could not download template");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFile = async (picked) => {
    if (!picked) return;
    setError("");
    setFile(picked);
    setLoadingPreview(true);
    try {
      const token = getPortalToken();
      const body = new FormData();
      body.append("file", picked);
      const res = await fetch("/api/library/elearning/import-preview", {
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
          resource_type: defaults.resource_type || "link",
        })
      );

      const res = await fetch("/api/library/elearning/import-mapped", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Import failed");

      const created = data.data?.createdCount || 0;
      const failed = data.data?.errorCount || 0;
      const firstErrors = (data.data?.errors || []).slice(0, 3);
      onClose();
      await Swal.fire({
        icon: created > 0 ? "success" : "warning",
        title: "Import finished",
        html: `<p style="margin:0 0 8px"><strong>${created}</strong> e-learning resource(s) added.</p>
          ${failed ? `<p style="margin:0">${failed} row(s) failed.</p>` : ""}
          ${
            firstErrors.length
              ? `<p style="margin:8px 0 0;opacity:.8;font-size:13px">${firstErrors
                  .map((e) => `Row ${e.row}: ${e.message}`)
                  .join("<br/>")}</p>`
              : ""
          }`,
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
      title="Import e-learning from Excel"
      subtitle="Three steps: upload → match columns → confirm import"
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
              startIcon={
                importing ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />
              }
              onClick={() => void handleImport()}
              sx={primaryBtnSx}
            >
              {importing ? "Importing…" : "Import resources"}
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
        <Stack spacing={2}>
          <Alert severity="info" sx={{ borderRadius: "12px" }}>
            <strong>How it works</strong>
            <Box component="ol" sx={{ m: "8px 0 0", pl: 2.25, fontSize: "0.86rem" }}>
              <li>Optional: download the system template and fill in your resources.</li>
              <li>Upload any Excel file (.xlsx / .xls).</li>
              <li>Match each Excel column to the e-learning fields.</li>
              <li>Set defaults, review a sample, then import.</li>
            </Box>
          </Alert>

          <Box
            sx={{
              border: "1px solid rgba(27,94,168,0.14)",
              borderRadius: "16px",
              bgcolor: "rgba(27,94,168,0.03)",
              p: 2.25,
            }}
          >
            <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary, mb: 0.5 }}>
              Prefer a ready-made sheet?
            </Typography>
            <Typography sx={{ fontSize: "0.84rem", color: textMuted, mb: 1.5 }}>
              Download the template with Title, URL, Resource type, Programme, and Description. Programme
              and type use dropdowns.
            </Typography>
            <Button
              variant="outlined"
              disabled={downloadingTemplate}
              startIcon={
                downloadingTemplate ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              onClick={() => void handleDownloadTemplate()}
              sx={{
                ...ghostBtnSx,
                border: "1px solid rgba(27,94,168,0.28)",
                color: primaryGreen,
              }}
            >
              {downloadingTemplate ? "Downloading…" : "Download Excel template"}
            </Button>
          </Box>

          <Box
            sx={{
              border: "1px dashed rgba(27,94,168,0.35)",
              borderRadius: "16px",
              bgcolor: "rgba(27,94,168,0.04)",
              p: 3,
              textAlign: "center",
            }}
          >
            <UploadFileIcon sx={{ fontSize: 40, color: primaryGreen, mb: 1 }} />
            <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary, mb: 0.5 }}>
              Step 1 — Upload Excel
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: textMuted, mb: 2 }}>
              Use the template or your own spreadsheet. Column names can differ; you will map them next.
            </Typography>
            <Button
              component="label"
              variant="contained"
              disabled={loadingPreview}
              startIcon={
                loadingPreview ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />
              }
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
        </Stack>
      ) : null}

      {step === 1 ? (
        <Stack spacing={2}>
          <Alert severity="info" sx={{ borderRadius: "12px" }}>
            <strong>Step 2 — Match columns.</strong> Title and URL are required.
          </Alert>
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
                onChange={(e) =>
                  setMapping((m) => ({
                    ...m,
                    [field.key]: e.target.value,
                  }))
                }
              >
                <MenuItem value="">
                  <em>Not mapped</em>
                </MenuItem>
                {columns.map((col) => (
                  <MenuItem key={`${field.key}-${col.header}`} value={col.header}>
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
          <Alert severity="success" sx={{ borderRadius: "12px" }}>
            <strong>Step 3 — Confirm.</strong> Set defaults for blank cells, review the sample, then import.
          </Alert>

          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Default programme</InputLabel>
            <Select
              label="Default programme"
              value={defaults.programme_id}
              onChange={(e) => setDefaults((d) => ({ ...d, programme_id: e.target.value }))}
            >
              <MenuItem value="">
                <em>{mapping.programme ? "Use Excel programme column" : "No default programme"}</em>
              </MenuItem>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Default resource type</InputLabel>
            <Select
              label="Default resource type"
              value={defaults.resource_type}
              onChange={(e) => setDefaults((d) => ({ ...d, resource_type: e.target.value }))}
            >
              {RESOURCE_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              border: "1px solid rgba(27,94,168,0.12)",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            <Box sx={{ px: 1.75, py: 1.25, bgcolor: "rgba(27,94,168,0.04)" }}>
              <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.84rem" }}>
                Sample rows
              </Typography>
            </Box>
            <Box sx={{ p: 1.75 }}>
              {(preview?.sample || []).length ? (
                <Stack spacing={1}>
                  {preview.sample.map((row, idx) => (
                    <Typography
                      key={idx}
                      sx={{ fontSize: "0.82rem", color: textSecondary, lineHeight: 1.45 }}
                    >
                      <strong style={{ color: textPrimary }}>
                        {mapping.title ? row[mapping.title] || "—" : "—"}
                      </strong>
                      {mapping.resource_type && row[mapping.resource_type]
                        ? ` · ${row[mapping.resource_type]}`
                        : ""}
                      {mapping.url && row[mapping.url] ? ` · ${row[mapping.url]}` : ""}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ fontSize: "0.84rem", color: textMuted }}>No sample rows.</Typography>
              )}
            </Box>
          </Box>
        </Stack>
      ) : null}
    </PremiumDialog>
  );
}
