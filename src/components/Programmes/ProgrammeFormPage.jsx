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
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon,
  Save as SaveIcon,
  Image as ImageIcon,
  DeleteOutline as DeleteOutlineIcon,
  Grade as GradeIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  primaryGreen,
  textSecondary,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
  authHeaders,
  CATEGORY_OPTIONS,
  MODE_OPTIONS,
  emptyProgrammeForm,
  programmeToForm,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, fadeUp } from "../Users/usersUi";

export default function ProgrammeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id) && location.pathname.endsWith("/edit");

  const [form, setForm] = useState(emptyProgrammeForm());
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const goBack = () => navigate("/programmes");

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/programmes/${id}`, { headers: authHeaders(token) });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Could not load programme");
        if (active) setForm(programmeToForm(data.data));
      } catch (err) {
        if (active) setError(err.message || "Could not load programme");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit, id, token]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
      removeImage: false,
    }));
    e.target.value = "";
  };

  const onRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: "",
      removeImage: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      Swal.fire({ icon: "error", title: "Not signed in", text: "Please sign in again.", confirmButtonColor: primaryGreen });
      return;
    }
    if (!form.name.trim()) {
      Swal.fire({ icon: "warning", title: "Name required", text: "Please enter a programme name.", confirmButtonColor: primaryGreen });
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("description", form.description || "");
      body.append("duration", form.duration || "");
      body.append("category", form.category || "");
      body.append("award", form.award || "");
      body.append("minimum_kcse_grade", form.minimum_kcse_grade || "");
      body.append("mode", form.mode || "");
      body.append("weeks_per_year", form.weeks_per_year ?? "");
      body.append("duration_years", form.duration_years ?? "");
      body.append("semester_1_weeks", form.semester_1_weeks ?? "");
      body.append("semester_1_period", form.semester_1_period || "");
      body.append("semester_2_weeks", form.semester_2_weeks ?? "");
      body.append("semester_2_period", form.semester_2_period || "");
      body.append("break_mid_sem1", form.break_mid_sem1 || "");
      body.append("break_end_sem1", form.break_end_sem1 || "");
      body.append("break_end_sem2", form.break_end_sem2 || "");
      body.append("is_active", String(form.is_active));
      if (form.imageFile) {
        body.append("image", form.imageFile);
      } else if (isEdit && form.removeImage) {
        body.append("remove_image", "true");
        body.append("image", "");
      }

      const url = isEdit ? `/api/programmes/${id}` : "/api/programmes";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(token, true), body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");

      await Swal.fire({
        icon: "success",
        title: isEdit ? "Programme updated" : "Programme created",
        timer: 1600,
        showConfirmButton: false,
        confirmButtonColor: primaryGreen,
      });
      navigate(isEdit ? `/programmes/${id}` : "/programmes", { replace: true });
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
        title={isEdit ? "Edit programme" : "Add programme"}
        subtitle={isEdit ? "Update programme details, entry requirements, and schedule" : "Create a new academic programme"}
        icon={<MenuBookIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title="Back to programmes">
            <IconButton
              onClick={goBack}
              type="button"
              aria-label="Back to programmes"
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.22)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
              }}
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
        <FormSection title="Basics">
          <Stack spacing={2}>
            <TextField
              label="Programme name"
              required
              fullWidth
              value={form.name}
              onChange={set("name")}
              sx={inputSx}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={form.category} onChange={set("category")}>
                  <MenuItem value="">
                    <em>Not set</em>
                  </MenuItem>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Award"
                placeholder="e.g. Diploma in Community Health Nursing"
                fullWidth
                value={form.award}
                onChange={set("award")}
                sx={inputSx}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Duration"
                placeholder="e.g. 3 years, 18 months"
                fullWidth
                value={form.duration}
                onChange={set("duration")}
                sx={inputSx}
              />
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Mode of study</InputLabel>
                <Select label="Mode of study" value={form.mode} onChange={set("mode")}>
                  <MenuItem value="">
                    <em>Not set</em>
                  </MenuItem>
                  {MODE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={form.description}
              onChange={set("description")}
              sx={inputSx}
            />
          </Stack>
        </FormSection>

        <FormSection title="Entry requirements">
          <TextField
            label="Minimum KCSE grade"
            placeholder="e.g. C+ (Plus)"
            fullWidth
            value={form.minimum_kcse_grade}
            onChange={set("minimum_kcse_grade")}
            InputProps={{
              startAdornment: <GradeIcon sx={{ color: primaryGreen, fontSize: 20, mr: 1 }} />,
            }}
            sx={inputSx}
          />
        </FormSection>

        <FormSection title="Schedule & calendar">
          <Stack spacing={2}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Weeks per year"
                type="number"
                fullWidth
                value={form.weeks_per_year}
                onChange={set("weeks_per_year")}
                sx={inputSx}
              />
              <TextField
                label="Duration (years)"
                type="number"
                fullWidth
                value={form.duration_years}
                onChange={set("duration_years")}
                sx={inputSx}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Semester 1 weeks"
                type="number"
                fullWidth
                value={form.semester_1_weeks}
                onChange={set("semester_1_weeks")}
                sx={inputSx}
              />
              <TextField
                label="Semester 1 period"
                placeholder="e.g. Jan – Apr"
                fullWidth
                value={form.semester_1_period}
                onChange={set("semester_1_period")}
                sx={inputSx}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Semester 2 weeks"
                type="number"
                fullWidth
                value={form.semester_2_weeks}
                onChange={set("semester_2_weeks")}
                sx={inputSx}
              />
              <TextField
                label="Semester 2 period"
                placeholder="e.g. May – Aug"
                fullWidth
                value={form.semester_2_period}
                onChange={set("semester_2_period")}
                sx={inputSx}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Mid semester 1 break"
                fullWidth
                value={form.break_mid_sem1}
                onChange={set("break_mid_sem1")}
                sx={inputSx}
              />
              <TextField
                label="End of semester 1 break"
                fullWidth
                value={form.break_end_sem1}
                onChange={set("break_end_sem1")}
                sx={inputSx}
              />
              <TextField
                label="End of semester 2 break"
                fullWidth
                value={form.break_end_sem2}
                onChange={set("break_end_sem2")}
                sx={inputSx}
              />
            </Box>
          </Stack>
        </FormSection>

        <FormSection title="Image & status">
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "stretch", md: "flex-start" }}>
            <Box
              sx={{
                width: { xs: "100%", sm: 280, md: 320 },
                maxWidth: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "20px",
                overflow: "hidden",
                bgcolor: "rgba(0,96,80,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1.5px solid rgba(0,96,80,0.14)",
                boxShadow: "0 12px 32px rgba(20,26,58,0.08)",
              }}
            >
              {form.imagePreview ? (
                <Box
                  component="img"
                  src={form.imagePreview}
                  alt="Programme"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <MenuBookIcon sx={{ fontSize: 72, color: primaryGreen, opacity: 0.55 }} />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, pt: { md: 1 } }}>
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "12px",
                    borderColor: "rgba(0,96,80,0.3)",
                    color: primaryGreen,
                    py: 1.1,
                    px: 2.25,
                    "&:hover": { borderColor: primaryGreen, bgcolor: "rgba(0,96,80,0.06)" },
                  }}
                >
                  {form.imagePreview ? "Change image" : "Upload image"}
                  <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={onImageChange} />
                </Button>
                {form.imagePreview ? (
                  <Button
                    type="button"
                    variant="outlined"
                    color="inherit"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={onRemoveImage}
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "12px",
                      borderColor: "rgba(30,40,88,0.22)",
                      color: "#1e2858",
                      py: 1.1,
                      px: 2.25,
                      "&:hover": { borderColor: "#1e2858", bgcolor: "rgba(30,40,88,0.06)" },
                    }}
                  >
                    Remove image
                  </Button>
                ) : null}
              </Stack>
              <Typography sx={{ fontSize: "0.8rem", color: textSecondary, mt: 1.25, lineHeight: 1.5 }}>
                {form.removeImage && !form.imagePreview
                  ? "Image will be removed when you save."
                  : "Use a clear programme photo. JPEG, PNG, or WebP · max 5MB."}
              </Typography>
              <FormControlLabel
                sx={{ mt: 2.5, ml: 0 }}
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: primaryGreen },
                    }}
                  />
                }
                label={<Typography sx={{ fontWeight: 600, color: "#1e2858", fontSize: "0.9rem" }}>Active</Typography>}
              />
            </Box>
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
            sx={{ ...primaryBtnSx, minWidth: 170 }}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create programme"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
