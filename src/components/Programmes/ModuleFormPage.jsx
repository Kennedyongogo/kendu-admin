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
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, MenuBook as ModuleIcon, Save as SaveIcon } from "@mui/icons-material";
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
  emptyModuleForm,
  moduleToForm,
  YEAR_OPTIONS,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, fadeUp } from "../Users/usersUi";

export default function ModuleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id) && location.pathname.endsWith("/edit");
  const preselectProgrammeId = new URLSearchParams(location.search).get("programme_id") || "";

  const [form, setForm] = useState({ ...emptyModuleForm(), programme_id: preselectProgrammeId });
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const goBack = () => navigate("/programmes/modules");

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
          const row = await fetchResourceOne("modules", id, token);
          if (active) setForm(moduleToForm(row));
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
    if (!form.code.trim() || !form.name.trim()) {
      Swal.fire({ icon: "warning", title: "Missing fields", text: "Code and name are required.", confirmButtonColor: primaryGreen });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        programme_id: form.programme_id,
        code: form.code.trim(),
        name: form.name.trim(),
        hours: Number(form.hours) || 0,
        credits: Number(form.credits) || 0,
        semester: form.semester || "",
        year_of_study: form.year_of_study === "" ? undefined : Number(form.year_of_study),
        sort_order: form.sort_order === "" ? undefined : Number(form.sort_order),
      };
      await saveResource("modules", isEdit ? id : null, token, payload);
      await Swal.fire({
        icon: "success",
        title: isEdit ? "Module updated" : "Module created",
        timer: 1600,
        showConfirmButton: false,
        confirmButtonColor: primaryGreen,
      });
      navigate("/programmes/modules", { replace: true });
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
        title={isEdit ? "Edit module" : "Add module"}
        subtitle="Define a module taught within a programme"
        icon={<ModuleIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title="Back to modules">
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
        <FormSection title="Module details">
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

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" }, gap: 2 }}>
              <TextField label="Code" placeholder="e.g. NUR101" required fullWidth value={form.code} onChange={set("code")} sx={inputSx} />
              <TextField label="Module name" required fullWidth value={form.name} onChange={set("name")} sx={inputSx} />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField label="Hours" type="number" fullWidth value={form.hours} onChange={set("hours")} sx={inputSx} />
              <TextField label="Credits" type="number" fullWidth value={form.credits} onChange={set("credits")} sx={inputSx} />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Semester"
                placeholder='e.g. "1", "2", or "1/2"'
                fullWidth
                value={form.semester}
                onChange={set("semester")}
                helperText="Free text — use 1/2 for full-year modules"
                sx={inputSx}
              />
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Year of study</InputLabel>
                <Select label="Year of study" value={form.year_of_study} onChange={set("year_of_study")}>
                  {YEAR_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

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
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create module"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
