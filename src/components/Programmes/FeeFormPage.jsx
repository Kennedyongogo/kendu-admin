import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Payments as PaymentsIcon, Save as SaveIcon } from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  primaryGreen,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
  fetchProgrammesOptions,
  fetchResourceOne,
  saveResource,
  emptyFeeForm,
  feeToForm,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
  CURRENCY_OPTIONS,
  getPortalToken,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, fadeUp } from "../Users/usersUi";

export default function FeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id) && location.pathname.endsWith("/edit");
  const preselectProgrammeId = new URLSearchParams(location.search).get("programme_id") || "";

  const [form, setForm] = useState({ ...emptyFeeForm(), programme_id: preselectProgrammeId });
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const token = getPortalToken();
  const goBack = () => navigate("/programmes/fees");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const opts = await fetchProgrammesOptions(token);
        if (!active) return;
        setProgrammes(opts);
        if (isEdit) {
          const row = await fetchResourceOne("fees", id, token);
          if (active) setForm(feeToForm(row));
        }
      } catch (err) {
        if (active) setError(err.message || "Could not load data");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit, id, token]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      Swal.fire({ icon: "error", title: "Not signed in", text: "Please sign in again.", confirmButtonColor: primaryGreen });
      return;
    }
    if (!form.programme_id) {
      Swal.fire({ icon: "warning", title: "Programme required", text: "Please select a programme.", confirmButtonColor: primaryGreen });
      return;
    }
    if (!form.amount || Number(form.amount) < 0) {
      Swal.fire({ icon: "warning", title: "Amount required", text: "Please enter a valid amount.", confirmButtonColor: primaryGreen });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        programme_id: form.programme_id,
        year_of_study: Number(form.year_of_study),
        semester: Number(form.semester),
        amount: Number(form.amount),
        currency: form.currency || "KES",
        label: form.label || "",
        sort_order: form.sort_order === "" ? undefined : Number(form.sort_order),
      };
      await saveResource("fees", isEdit ? id : null, token, payload);
      await Swal.fire({
        icon: "success",
        title: isEdit ? "Fee updated" : "Fee created",
        timer: 1600,
        showConfirmButton: false,
        confirmButtonColor: primaryGreen,
      });
      navigate("/programmes/fees", { replace: true });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <BrandPageLoader message="Loading…" />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={pageShellSx}>
      <UsersHero
        title={isEdit ? "Edit fee" : "Add fee"}
        subtitle="Set the tuition or other fee amount for a programme, year, and semester"
        icon={<PaymentsIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title="Back to fees">
            <IconButton
              onClick={goBack}
              type="button"
              sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={2.5} component={motion.div} variants={fadeUp} custom={1} initial="hidden" animate="visible">
        <FormSection title="Fee details">
          <Stack spacing={2}>
            <FormControl fullWidth required sx={inputSx}>
              <InputLabel>Programme</InputLabel>
              <Select label="Programme" value={form.programme_id} onChange={set("programme_id")}>
                {programmes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl fullWidth required sx={inputSx}>
                <InputLabel>Year of study</InputLabel>
                <Select label="Year of study" value={form.year_of_study} onChange={set("year_of_study")}>
                  {YEAR_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required sx={inputSx}>
                <InputLabel>Semester</InputLabel>
                <Select label="Semester" value={form.semester} onChange={set("semester")}>
                  {SEMESTER_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
              <TextField
                label="Amount"
                type="number"
                required
                fullWidth
                value={form.amount}
                onChange={set("amount")}
                InputProps={{ startAdornment: <InputAdornment position="start">{form.currency}</InputAdornment> }}
                sx={inputSx}
              />
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Currency</InputLabel>
                <Select label="Currency" value={form.currency} onChange={set("currency")}>
                  {CURRENCY_OPTIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Label"
              placeholder="e.g. Tuition, Examination"
              fullWidth
              value={form.label}
              onChange={set("label")}
              sx={inputSx}
            />
            <TextField
              label="Sort order"
              type="number"
              fullWidth
              value={form.sort_order}
              onChange={set("sort_order")}
              helperText="Optional — controls display order"
              sx={inputSx}
            />
          </Stack>
        </FormSection>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, justifyContent: "flex-end", pt: 1 }}>
          <Button type="button" variant="text" onClick={goBack} sx={{ ...ghostBtnSx, py: 1.25 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            sx={{ ...primaryBtnSx, minWidth: 160 }}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create fee"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
