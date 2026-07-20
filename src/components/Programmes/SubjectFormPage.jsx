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
  FormControlLabel,
  Switch,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Grade as GradeIcon, Save as SaveIcon } from "@mui/icons-material";
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
  emptySubjectForm,
  subjectToForm,
  getPortalToken,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, fadeUp } from "../Users/usersUi";

export default function SubjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id) && location.pathname.endsWith("/edit");
  const preselectProgrammeId = new URLSearchParams(location.search).get("programme_id") || "";

  const [form, setForm] = useState({ ...emptySubjectForm(), programme_id: preselectProgrammeId });
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const token = getPortalToken();
  const goBack = () => navigate("/programmes/subjects");

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
          const row = await fetchResourceOne("subjects", id, token);
          if (active) setForm(subjectToForm(row));
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
      Swal.fire({
        icon: "error",
        title: "Not signed in",
        text: "Please sign in again.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!form.programme_id) {
      Swal.fire({
        icon: "warning",
        title: "Programme required",
        text: "Please select a programme.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!form.subject.trim() || !form.minimum_grade.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Subject and minimum grade are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        programme_id: form.programme_id,
        subject: form.subject.trim(),
        minimum_grade: form.minimum_grade.trim(),
        is_required: form.is_required !== false,
        sort_order: form.sort_order === "" ? undefined : Number(form.sort_order),
      };
      await saveResource("subjects", isEdit ? id : null, token, payload);
      await Swal.fire({
        icon: "success",
        title: isEdit ? "Subject updated" : "Subject created",
        timer: 1600,
        showConfirmButton: false,
        confirmButtonColor: primaryGreen,
      });
      navigate("/programmes/subjects", { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
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
        title={isEdit ? "Edit subject requirement" : "Add subject requirement"}
        subtitle="Set the minimum KCSE grade required in a specific subject for a programme"
        icon={<GradeIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title="Back to subjects">
            <IconButton
              onClick={goBack}
              type="button"
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
        <FormSection title="Subject requirement">
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

            <TextField
              label="Subject"
              placeholder="e.g. Biology, English, Mathematics"
              required
              fullWidth
              value={form.subject}
              onChange={set("subject")}
              sx={inputSx}
            />

            <TextField
              label="Minimum grade"
              placeholder="e.g. C+, C, C-"
              required
              fullWidth
              value={form.minimum_grade}
              onChange={set("minimum_grade")}
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

            <FormControlLabel
              control={
                <Switch
                  checked={form.is_required !== false}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, is_required: e.target.checked }))
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: primaryGreen,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontWeight: 600, color: "#1e2858", fontSize: "0.9rem" }}>
                  Required subject
                </Typography>
              }
            />
          </Stack>
        </FormSection>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            justifyContent: "flex-end",
            pt: 1,
          }}
        >
          <Button type="button" variant="text" onClick={goBack} sx={{ ...ghostBtnSx, py: 1.25 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            sx={{ ...primaryBtnSx, minWidth: 180 }}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create subject"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
