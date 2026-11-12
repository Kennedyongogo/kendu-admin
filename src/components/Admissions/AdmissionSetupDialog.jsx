import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SaveIcon from "@mui/icons-material/Save";
import Swal from "sweetalert2";
import { PremiumDialog } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  fontBody,
  ghostBtnSx,
  inputSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
} from "../Users/usersShared";
import {
  admissionWindowLabel,
  formatDateTime,
  fromLocalInput,
  toLocalInput,
} from "./admissionsShared";

const emptyForm = () => ({
  is_enabled: false,
  starts_at: "",
  ends_at: "",
});

export default function AdmissionSetupDialog({ open, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getPortalToken();
        const res = await fetch("/api/admissions/window", {
          headers: authJsonHeaders(token),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Could not load admissions window");
        }
        if (!active) return;
        const row = data.data || {};
        setPreview(row);
        setForm({
          is_enabled: Boolean(row.is_enabled),
          starts_at: toLocalInput(row.starts_at),
          ends_at: toLocalInput(row.ends_at),
        });
      } catch (err) {
        if (active) setError(err.message || "Could not load settings");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const setField = (key) => (event) => {
    const value = key === "is_enabled" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (form.is_enabled && (!form.starts_at || !form.ends_at)) {
      Swal.fire({
        icon: "warning",
        title: "Dates required",
        text: "Set both start and end dates when enabling applications.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (form.starts_at && form.ends_at) {
      const start = new Date(form.starts_at);
      const end = new Date(form.ends_at);
      if (start.getTime() > end.getTime()) {
        Swal.fire({
          icon: "warning",
          title: "Invalid range",
          text: "Start date must be before end date.",
          confirmButtonColor: primaryGreen,
        });
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const token = getPortalToken();
      const res = await fetch("/api/admissions/window", {
        method: "PUT",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          is_enabled: form.is_enabled,
          starts_at: fromLocalInput(form.starts_at),
          ends_at: fromLocalInput(form.ends_at),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not save admissions window");
      }
      setPreview(data.data);
      onSaved?.(data.data);
      onClose?.();
      await Swal.fire({
        icon: "success",
        title: data.data?.is_open ? "Applications open" : "Window saved",
        text:
          data.data?.closed_message ||
          (data.data?.is_open
            ? "The public Apply button is enabled for the configured dates."
            : "The public Apply button will follow this schedule."),
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      setError(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PremiumDialog
      open={open}
      onClose={() => {
        if (!saving) onClose?.();
      }}
      title="Setup Admissions"
      subtitle="Set when the public Apply for admission button opens and closes."
      icon={<EventAvailableIcon />}
      maxWidth="sm"
      footer={
        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
          <Button onClick={onClose} disabled={saving} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={primaryBtnSx}
          >
            Save window
          </Button>
        </Stack>
      }
    >
      {loading ? (
        <Stack alignItems="center" py={4}>
          <CircularProgress size={28} sx={{ color: primaryGreen }} />
        </Stack>
      ) : (
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          {error ? (
            <Alert severity="error" sx={{ borderRadius: "12px" }} onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          {preview ? (
            <Alert
              severity={preview.is_open ? "success" : "info"}
              sx={{ borderRadius: "12px" }}
            >
              <Typography sx={{ fontFamily: fontBody, fontWeight: 700, mb: 0.5 }}>
                {admissionWindowLabel(preview)}
              </Typography>
              {preview.starts_at || preview.ends_at ? (
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.85rem" }}>
                  Window: {formatDateTime(preview.starts_at)} → {formatDateTime(preview.ends_at)}
                </Typography>
              ) : null}
              {preview.closed_message ? (
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.85rem", mt: 0.75 }}>
                  Public message: {preview.closed_message}
                </Typography>
              ) : null}
            </Alert>
          ) : null}

          <FormControlLabel
            control={<Switch checked={form.is_enabled} onChange={setField("is_enabled")} color="primary" />}
            label={
              <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary }}>
                Enable applications during the window
              </Typography>
            }
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              type="datetime-local"
              label="Opens"
              value={form.starts_at}
              onChange={setField("starts_at")}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
            <TextField
              type="datetime-local"
              label="Closes"
              value={form.ends_at}
              onChange={setField("ends_at")}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
          </Stack>

          <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem", color: textMuted }}>
            Apply is enabled only when the switch is on and the current time is between Opens and
            Closes. The public closed notice is generated automatically from this schedule.
          </Typography>
        </Stack>
      )}
    </PremiumDialog>
  );
}
