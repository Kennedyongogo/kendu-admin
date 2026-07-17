import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
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
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Schedule as ScheduleIcon, Save as SaveIcon } from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  primaryGreen,
  textSecondary,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
  fetchProgrammesOptions,
  fetchResourceOne,
  saveResource,
  emptyHourForm,
  hourToForm,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, fadeUp } from "../Users/usersUi";

export default function HourFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id) && location.pathname.endsWith("/edit");
  const preselectProgrammeId = new URLSearchParams(location.search).get("programme_id") || "";

  const [form, setForm] = useState({ ...emptyHourForm(), programme_id: preselectProgrammeId });
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const goBack = () => navigate("/programmes/hours");

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
          const row = await fetchResourceOne("hours", id, token);
          if (active) setForm(hourToForm(row));
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

  const computedTotal = () => {
    if (form.total_hours !== "" && form.total_hours !== null && form.total_hours !== undefined) {
      return Number(form.total_hours);
    }
    return (Number(form.year_1_hours) || 0) + (Number(form.year_2_hours) || 0) + (Number(form.year_3_hours) || 0);
  };

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
    if (!form.nature.trim()) {
      Swal.fire({ icon: "warning", title: "Nature required", text: "Please describe the nature of these hours.", confirmButtonColor: primaryGreen });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        programme_id: form.programme_id,
        nature: form.nature.trim(),
        specific_nature: form.specific_nature || "",
        year_1_hours: Number(form.year_1_hours) || 0,
        year_2_hours: Number(form.year_2_hours) || 0,
        year_3_hours: Number(form.year_3_hours) || 0,
        sort_order: form.sort_order === "" ? undefined : Number(form.sort_order),
      };
      if (form.total_hours !== "" && form.total_hours !== null && form.total_hours !== undefined) {
        payload.total_hours = Number(form.total_hours);
      }
      await saveResource("hours", isEdit ? id : null, token, payload);
      await Swal.fire({
        icon: "success",
        title: isEdit ? "Hour distribution updated" : "Hour distribution created",
        timer: 1600,
        showConfirmButton: false,
        confirmButtonColor: primaryGreen,
      });
      navigate("/programmes/hours", { replace: true });
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
        title={isEdit ? "Edit hour distribution" : "Add hour distribution"}
        subtitle="Break down teaching/practice hours by year for a programme"
        icon={<ScheduleIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title="Back to hours">
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
        <FormSection title="Hour distribution details">
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
              <TextField
                label="Nature"
                placeholder="e.g. Theory, Clinical practice"
                required
                fullWidth
                value={form.nature}
                onChange={set("nature")}
                sx={inputSx}
              />
              <TextField
                label="Specific nature"
                placeholder="e.g. Ward rotation"
                fullWidth
                value={form.specific_nature}
                onChange={set("specific_nature")}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
              <TextField label="Year 1 hours" type="number" fullWidth value={form.year_1_hours} onChange={set("year_1_hours")} sx={inputSx} />
              <TextField label="Year 2 hours" type="number" fullWidth value={form.year_2_hours} onChange={set("year_2_hours")} sx={inputSx} />
              <TextField label="Year 3 hours" type="number" fullWidth value={form.year_3_hours} onChange={set("year_3_hours")} sx={inputSx} />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Total hours"
                type="number"
                fullWidth
                value={form.total_hours}
                onChange={set("total_hours")}
                helperText={`Leave blank to auto-calculate (currently ${computedTotal()})`}
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
            </Box>
            <Typography sx={{ fontSize: "0.78rem", color: textSecondary }}>
              Total hours will be calculated automatically as Year 1 + Year 2 + Year 3 if left blank.
            </Typography>
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
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create hour block"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
