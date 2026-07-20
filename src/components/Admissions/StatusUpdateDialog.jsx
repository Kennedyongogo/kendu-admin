import React, { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
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
import { ADMISSION_STATUSES, formatAdmissionStatus } from "./admissionsShared";

export default function StatusUpdateDialog({ open, application, onClose, onSaved }) {
  const [status, setStatus] = useState(application?.status || "pending");
  const [note, setNote] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (open && application) {
      setStatus(application.status || "pending");
      setNote("");
      setAdmissionNumber("");
    }
  }, [open, application]);

  const willCreateStudent =
    status === "accepted" && application?.status !== "accepted";

  const handleSave = async () => {
    if (!application?.id) return;
    if (!note.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Note required",
        text: "Add a note explaining this status change.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (willCreateStudent && !admissionNumber.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Admission number required",
        text: "Enter the admission number to assign when accepting this applicant.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    const token = getPortalToken();
    setSaving(true);
    try {
      const payload = { status, note: note.trim() };
      if (willCreateStudent) {
        payload.admission_number = admissionNumber.trim();
      }

      const res = await fetch(`/api/admissions/${application.id}/status`, {
        method: "PUT",
        headers: authJsonHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not update status");
      }
      onClose();

      const student = data.student_account;
      if (status === "accepted" && student?.created) {
        await Swal.fire({
          icon: "success",
          title: "Accepted — student created",
          html: `
            <p style="margin:0 0 8px">Application accepted and a student account was created.</p>
            <p style="margin:0;text-align:left">
              <strong>Name:</strong> ${student.user?.full_name || "—"}<br/>
              <strong>Email:</strong> ${student.user?.email || "—"}<br/>
              <strong>Admission no.:</strong> ${student.user?.admission_number || "—"}<br/>
              <strong>Year / Sem:</strong> Year 1 · Semester 1<br/>
              <strong>Default password:</strong> <code>${student.default_password || "123456"}</code>
            </p>
          `,
          confirmButtonColor: primaryGreen,
        });
      } else if (status === "accepted" && student && !student.created) {
        await Swal.fire({
          icon: student.reason === "already_exists" ? "info" : "warning",
          title: "Status updated",
          text:
            student.reason === "already_exists"
              ? "Application accepted. A student account with this email already exists."
              : `Application accepted, but student was not created: ${student.message}`,
          confirmButtonColor: primaryGreen,
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "Status updated",
          timer: 1400,
          showConfirmButton: false,
        });
      }

      onSaved?.(data.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message || "Could not update status",
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PremiumDialog
      open={open}
      onClose={() => !saving && onClose()}
      title="Update status"
      subtitle={
        application
          ? `${application.full_name} · currently ${formatAdmissionStatus(application.status)}`
          : "Change application status"
      }
      icon={<EditIcon />}
      footer={
        <>
          <Button onClick={onClose} disabled={saving} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={primaryBtnSx}
          >
            {saving ? "Saving…" : "Save status"}
          </Button>
        </>
      }
    >
      <Stack spacing={2.25}>
        <FormControl fullWidth sx={inputSx}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {ADMISSION_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {willCreateStudent ? (
          <>
            <Alert severity="info" sx={{ borderRadius: "12px" }}>
              Accepting creates a student account (name, email, phone, programme) in{" "}
              <strong>Year 1, Semester 1</strong>. You must assign an admission number. Default
              password: <strong>123456</strong>.
            </Alert>
            <TextField
              label="Admission number"
              required
              fullWidth
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="e.g. ADM-2026-001"
              helperText="Required — this becomes the student’s login admission number"
              sx={inputSx}
            />
          </>
        ) : null}

        <TextField
          label="Note for this change"
          required
          fullWidth
          multiline
          minRows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Documents verified; offer letter ready…"
          sx={inputSx}
        />
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted }}>
          This note is saved in the application history with the new status (
          <Typography component="span" sx={{ color: textPrimary, fontWeight: 700 }}>
            {formatAdmissionStatus(status)}
          </Typography>
          ).
        </Typography>
      </Stack>
    </PremiumDialog>
  );
}
