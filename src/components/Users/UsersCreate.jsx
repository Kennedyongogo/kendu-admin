import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  PhotoCamera,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  ALL_ROLES,
  formatRole,
  getActorFromStorage,
  getPortalToken,
  assignableRoles,
  primaryGreen,
  textSecondary,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
} from "./usersShared";
import { UsersHero, FormSection, fadeUp, UserAvatar } from "./usersUi";
import useProgrammeEnrolmentOptions from "./useProgrammeEnrolmentOptions";

const initialForm = () => ({
  email: "",
  password: "",
  full_name: "",
  phone: "",
  admission_number: "",
  role: "staff",
  position: "",
  is_public: false,
  department_id: "",
  programme_id: "",
  year_of_study: "",
  semester: "",
  profileFile: null,
  profilePreview: "",
});

export default function UsersCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm());
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const actor = getActorFromStorage();
  const creatableRoles = assignableRoles(actor?.role);
  const enrolment = useProgrammeEnrolmentOptions(
    form.role === "student" ? form.programme_id : ""
  );

  useEffect(() => {
    if (form.role !== "student" || !form.programme_id || enrolment.loading) return;
    setForm((prev) => {
      const yearOk = enrolment.years.some((y) => String(y) === String(prev.year_of_study));
      const semOk = enrolment.semesters.some((s) => String(s) === String(prev.semester));
      if (yearOk && semOk) return prev;
      return {
        ...prev,
        year_of_study: yearOk
          ? prev.year_of_study
          : enrolment.years[0] != null
            ? String(enrolment.years[0])
            : "",
        semester: semOk
          ? prev.semester
          : enrolment.semesters[0] != null
            ? String(enrolment.semesters[0])
            : "",
      };
    });
  }, [form.role, form.programme_id, enrolment.loading, enrolment.years, enrolment.semesters]);

  useEffect(() => {
    (async () => {
      try {
        const token = getPortalToken();
        const [progRes, deptRes] = await Promise.all([
          fetch("/api/programmes?is_active=true&limit=100", {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          }),
          fetch("/api/departments?is_active=true&limit=100", {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          }),
        ]);
        const progData = await progRes.json().catch(() => ({}));
        const deptData = await deptRes.json().catch(() => ({}));
        if (progRes.ok && progData.success) setProgrammes(Array.isArray(progData.data) ? progData.data : []);
        if (deptRes.ok && deptData.success) setDepartments(Array.isArray(deptData.data) ? deptData.data : []);
      } catch {
        setProgrammes([]);
        setDepartments([]);
      }
    })();
  }, []);

  const goBack = () => navigate("/users");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getPortalToken();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Not signed in",
        text: "Please sign in again.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!form.email?.trim() || !form.password || !form.full_name?.trim() || !form.role) {
      Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Email, password, full name, and role are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (form.role === "student" && !form.admission_number?.trim()) {
      Swal.fire({
        icon: "error",
        title: "Admission number required",
        text: "Students must have an admission number.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (form.role === "student" && (!form.programme_id || !form.year_of_study || !form.semester)) {
      Swal.fire({
        icon: "error",
        title: "Student enrolment incomplete",
        text: "Programme, year of study, and semester are required for students.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("email", form.email.trim());
      body.append("password", form.password);
      body.append("full_name", form.full_name.trim());
      body.append("phone", form.phone?.trim() || "");
      body.append("role", form.role);
      body.append(
        "is_public",
        form.role !== "student" && form.is_public ? "true" : "false"
      );
      if (form.role !== "student") {
        body.append("position", form.position?.trim() || "");
        body.append("department_id", form.department_id || "");
      }
      if (form.role === "student") {
        body.append("admission_number", form.admission_number.trim());
        body.append("programme_id", form.programme_id);
        body.append("year_of_study", form.year_of_study);
        body.append("semester", form.semester);
      }
      if (form.profileFile) body.append("profile_image", form.profileFile);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not create user");
      }

      await Swal.fire({
        icon: "success",
        title: "User created",
        text: data.data?.full_name
          ? `${data.data.full_name} was added successfully.`
          : "The account was created.",
        confirmButtonColor: primaryGreen,
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/users", { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create failed",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={pageShellSx}>
      <UsersHero
        title="Create user"
        subtitle="Add a new admin, staff, or student account"
        icon={<PersonAddIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title="Back to users">
            <IconButton
              onClick={goBack}
              type="button"
              aria-label="Back to users"
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

      <Stack spacing={2.5} component={motion.div} variants={fadeUp} custom={1} initial="hidden" animate="visible">
        <FormSection title="Profile photo">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems="center">
            <UserAvatar
              name={form.full_name || "New"}
              role={form.role}
              src={form.profilePreview}
              size={88}
            />
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Button
                  component="label"
                  startIcon={<PhotoCamera />}
                  variant="outlined"
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "12px",
                    borderColor: "rgba(0,96,80,0.3)",
                    color: primaryGreen,
                    "&:hover": { borderColor: primaryGreen, bgcolor: "rgba(0,96,80,0.06)" },
                  }}
                >
                  {form.profilePreview ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setForm((prev) => ({
                        ...prev,
                        profileFile: file,
                        profilePreview: URL.createObjectURL(file),
                      }));
                      e.target.value = "";
                    }}
                  />
                </Button>
                {form.profilePreview ? (
                  <Button
                    type="button"
                    variant="text"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        profileFile: null,
                        profilePreview: "",
                      }))
                    }
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      textTransform: "none",
                      fontWeight: 600,
                      color: textSecondary,
                      "&:hover": { color: "#b42318", bgcolor: "rgba(180,35,24,0.06)" },
                    }}
                  >
                    Remove photo
                  </Button>
                ) : null}
              </Stack>
              <Typography sx={{ fontSize: "0.8rem", color: textSecondary, mt: 1 }}>
                Optional · JPEG, PNG, or WebP · max 5MB
              </Typography>
            </Box>
          </Stack>
        </FormSection>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          <FormSection title="Account credentials">
            <Stack spacing={2}>
              <TextField
                label="Email address"
                type="email"
                required
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
              <TextField
                label="Password"
                required
                fullWidth
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        sx={{ color: textSecondary }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Stack>
          </FormSection>

          <FormSection title="Personal & role">
            <Stack spacing={2}>
              <TextField
                label="Full name"
                required
                fullWidth
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
              <TextField
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
              {form.role === "student" ? (
                <>
                  <TextField
                    label="Admission number"
                    fullWidth
                    required
                    value={form.admission_number}
                    onChange={(e) => setForm({ ...form, admission_number: e.target.value })}
                    helperText="Required for student accounts"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                  <FormControl fullWidth required sx={inputSx}>
                    <InputLabel>Programme</InputLabel>
                    <Select
                      label="Programme"
                      value={form.programme_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          programme_id: e.target.value,
                          year_of_study: "",
                          semester: "",
                        })
                      }
                    >
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
                      label="Year of study"
                      value={form.year_of_study}
                      disabled={!form.programme_id || enrolment.loading || enrolment.years.length === 0}
                      helperText={
                        !form.programme_id
                          ? "Select a programme first"
                          : enrolment.loading
                            ? "Loading years…"
                            : undefined
                      }
                      onChange={(e) => setForm({ ...form, year_of_study: e.target.value })}
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
                      label="Semester"
                      value={form.semester}
                      disabled={!form.programme_id || enrolment.loading || enrolment.semesters.length === 0}
                      helperText={
                        !form.programme_id
                          ? "Select a programme first"
                          : enrolment.loading
                            ? "Loading semesters…"
                            : undefined
                      }
                      onChange={(e) => setForm({ ...form, semester: e.target.value })}
                      sx={inputSx}
                    >
                      {enrolment.semesters.map((s) => (
                        <MenuItem key={s} value={String(s)}>
                          {enrolment.semester_labels?.[s] || `Semester ${s}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </>
              ) : (
                <>
                  <TextField
                    label="Position / title"
                    fullWidth
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    helperText="e.g. Principal, Clinical Instructor"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                  <FormControl fullWidth sx={inputSx}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      label="Department"
                      value={form.department_id}
                      onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                    >
                      <MenuItem value="">
                        <em>Not assigned</em>
                      </MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                          {dept.code ? ` (${dept.code})` : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
              <FormControl fullWidth required sx={inputSx}>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={form.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    setForm({
                      ...form,
                      role,
                      admission_number: role === "student" ? form.admission_number : "",
                      position: role === "student" ? "" : form.position,
                      is_public: role === "student" ? false : form.is_public,
                      department_id: role === "student" ? "" : form.department_id,
                      programme_id: role === "student" ? form.programme_id : "",
                      year_of_study: role === "student" ? form.year_of_study : "",
                      semester: role === "student" ? form.semester : "",
                      password: role === "student" && !form.password ? "123456" : form.password,
                    });
                  }}
                >
                  {(creatableRoles.length ? creatableRoles : ALL_ROLES).map((r) => (
                    <MenuItem key={r} value={r}>
                      {formatRole(r)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {form.role !== "student" ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(form.is_public)}
                      onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          bgcolor: primaryGreen,
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "#1e2858", fontSize: "0.9rem" }}>
                        Show on public site
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: textSecondary }}>
                        Visible on Meet our staff when enabled
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", ml: 0, mt: 0.5 }}
                />
              ) : null}
            </Stack>
          </FormSection>
        </Box>

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
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <PersonAddIcon />}
            sx={{ ...primaryBtnSx, minWidth: 160 }}
          >
            {saving ? "Creating…" : "Create user"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
