import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
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
  formatRole,
  getActorFromStorage,
  getPortalToken,
  creatableRolesForKind,
  createRoleActionLabel,
  isAdminPortalRole,
  roleTabFor,
  primaryGreen,
  textSecondary,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
} from "./usersShared";
import { UsersHero, FormSection, fadeUp, UserAvatar } from "./usersUi";
import useProgrammeEnrolmentOptions from "./useProgrammeEnrolmentOptions";

const initialForm = (kind = "admin", lockedRole = null) => ({
  email: "",
  password: kind === "student" ? "123456" : "",
  full_name: "",
  phone: "",
  admission_number: "",
  role: kind === "student" ? "student" : lockedRole || "lecturer",
  position: "",
  is_public: false,
  department_ids: [],
  programme_id: "",
  year_of_study: "",
  semester: "",
  gender: "",
  boarding_status: "",
  student_status: "active",
  profileFile: null,
  profilePreview: "",
});

export default function UsersCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createKind = searchParams.get("for") === "student" ? "student" : "admin";
  const isStudentCreate = createKind === "student";
  const roleParam = String(searchParams.get("role") || "").trim().toLowerCase();
  const lockedRole = isStudentCreate
    ? "student"
    : isAdminPortalRole(roleParam)
      ? roleParam
      : "admin";

  const [form, setForm] = useState(() => initialForm(createKind, lockedRole));
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const actor = getActorFromStorage();
  const creatableRoles = useMemo(
    () => creatableRolesForKind(actor?.role, createKind),
    [actor?.role, createKind]
  );
  const allowedRoles = useMemo(() => {
    if (isStudentCreate) return creatableRoles.includes("student") ? ["student"] : [];
    if (lockedRole && creatableRoles.includes(lockedRole)) return [lockedRole];
    return creatableRoles;
  }, [creatableRoles, isStudentCreate, lockedRole]);
  const createLabel = createRoleActionLabel(form.role || lockedRole || "lecturer");
  const lockedRoleTab = roleTabFor(form.role || lockedRole);
  const enrolment = useProgrammeEnrolmentOptions(
    form.role === "student" ? form.programme_id : ""
  );

  useEffect(() => {
    setForm(initialForm(createKind, lockedRole));
  }, [createKind, lockedRole]);

  useEffect(() => {
    if (!allowedRoles.length) return;
    if (!allowedRoles.includes(form.role)) {
      setForm((prev) => ({ ...prev, role: allowedRoles[0] }));
    }
  }, [allowedRoles, form.role]);

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

  const listPath = isStudentCreate
    ? "/students"
    : lockedRole
      ? `/users?role=${encodeURIComponent(lockedRole)}`
      : "/users";
  const goBack = () => navigate(listPath);

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
    if (!allowedRoles.includes(form.role)) {
      Swal.fire({
        icon: "error",
        title: "Invalid role",
        text: isStudentCreate
          ? "Only the student role can be used here."
          : lockedRole
            ? `This page creates ${formatRole(lockedRole)} accounts only.`
            : "Only admin or staff roles can be used here.",
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
    if ((form.role === "hod" || form.role === "lecturer") && !form.department_ids?.length) {
      Swal.fire({
        icon: "error",
        title: "Department required",
        text: "A head of department or lecturer must belong to at least one academic department.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (form.role === "student" && (!form.gender || !form.boarding_status)) {
      Swal.fire({
        icon: "error",
        title: "Student details incomplete",
        text: "Gender and boarding status are required for students.",
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
        body.append("department_ids", JSON.stringify(form.department_ids || []));
      }
      if (form.role === "student") {
        body.append("admission_number", form.admission_number.trim());
        body.append("programme_id", form.programme_id);
        body.append("year_of_study", form.year_of_study);
        body.append("semester", form.semester);
        body.append("gender", form.gender);
        body.append("boarding_status", form.boarding_status);
        body.append("student_status", form.student_status || "active");
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
        title: isStudentCreate
          ? "Student created"
          : `${lockedRoleTab?.label || formatRole(form.role)} created`,
        text: data.data?.full_name
          ? `${data.data.full_name} was added successfully.`
          : "The account was created.",
        confirmButtonColor: primaryGreen,
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(listPath, { replace: true });
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
        title={createLabel}
        subtitle={
          isStudentCreate
            ? "Add a new student account"
            : lockedRole
              ? `Add a new ${lockedRoleTab?.label || formatRole(lockedRole)} account`
              : "Add a new admin or staff account"
        }
        icon={<PersonAddIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title={isStudentCreate ? "Back to students" : "Back to admin"}>
            <IconButton
              onClick={goBack}
              type="button"
              aria-label={isStudentCreate ? "Back to students" : "Back to admin"}
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
                    borderColor: "rgba(27,94,168,0.3)",
                    color: primaryGreen,
                    "&:hover": { borderColor: primaryGreen, bgcolor: "rgba(27,94,168,0.06)" },
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
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Gender"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      sx={inputSx}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Boarding"
                      value={form.boarding_status}
                      onChange={(e) => setForm({ ...form, boarding_status: e.target.value })}
                      sx={inputSx}
                    >
                      <MenuItem value="boarder">Boarder</MenuItem>
                      <MenuItem value="non_boarder">Non-boarder</MenuItem>
                    </TextField>
                  </Stack>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Student status"
                    value={form.student_status || "active"}
                    onChange={(e) => setForm({ ...form, student_status: e.target.value })}
                    sx={inputSx}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="awaiting_semester">Awaiting semester</MenuItem>
                  </TextField>
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
                  <FormControl
                    fullWidth
                    required={form.role === "hod" || form.role === "lecturer"}
                    sx={inputSx}
                  >
                    <InputLabel>Departments</InputLabel>
                    <Select
                      label="Departments"
                      multiple
                      value={form.department_ids}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          department_ids:
                            typeof e.target.value === "string"
                              ? e.target.value.split(",")
                              : e.target.value,
                        })
                      }
                      input={<OutlinedInput label="Departments" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((id) => {
                            const dept = departments.find((d) => d.id === id);
                            return (
                              <Chip
                                key={id}
                                size="small"
                                label={dept ? `${dept.name}${dept.code ? ` (${dept.code})` : ""}` : id}
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          <Checkbox checked={form.department_ids.includes(dept.id)} />
                          <ListItemText
                            primary={dept.name}
                            secondary={dept.code || undefined}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {(form.role === "hod" || form.role === "lecturer") ? (
                    <Typography sx={{ fontSize: "0.78rem", color: textSecondary, mt: -1 }}>
                      Heads of department and lecturers can belong to more than one department.
                    </Typography>
                  ) : null}
                </>
              )}
              <TextField
                label="Role"
                fullWidth
                required
                value={formatRole(form.role)}
                InputProps={{ readOnly: true }}
                helperText={
                  isStudentCreate
                    ? "Student accounts are created from this page only."
                    : "Role is fixed to the tab you created from. Switch tabs to create a different role."
                }
                sx={inputSx}
              />
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
            {saving ? "Creating…" : createLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
