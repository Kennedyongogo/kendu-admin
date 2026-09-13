import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Badge as BadgeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import StudentsDashboard from "./StudentsDashboard";
import {
  DetailField,
  HeroActionButton,
  PremiumDialog,
  RoleTabs,
  UserAvatar,
  UsersHero,
} from "../Users/usersUi";
import useProgrammeEnrolmentOptions from "../Users/useProgrammeEnrolmentOptions";
import {
  authJsonHeaders,
  getPortalToken,
  ghostBtnSx,
  inputSx,
  pageShellSx,
  primaryBtnSx,
  primaryGreen,
  profileImageSrc,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";

const STUDENT_TABS = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Students", value: "list" },
];

function tabIndexFromSearch(searchParams) {
  return searchParams.get("tab") === "list" ? 1 : 0;
}

const emptyForm = () => ({
  email: "",
  full_name: "",
  phone: "",
  admission_number: "",
  programme_id: "",
  year_of_study: "",
  semester: "",
  gender: "",
  boarding_status: "",
  profileFile: null,
  profilePreview: "",
  removeProfileImage: false,
});

function mapStudentToForm(student) {
  return {
    email: student.email ?? "",
    full_name: student.full_name ?? "",
    phone: student.phone ?? "",
    admission_number: student.admission_number ?? "",
    programme_id: student.programme_id || student.programme?.id || "",
    year_of_study: student.year_of_study != null ? String(student.year_of_study) : "",
    semester: student.semester != null ? String(student.semester) : "",
    gender: student.gender || "",
    boarding_status: student.boarding_status || "",
    profileFile: null,
    profilePreview: profileImageSrc(student),
    removeProfileImage: false,
  };
}

function formatGender(value) {
  if (value === "male") return "Male";
  if (value === "female") return "Female";
  return "—";
}

function formatBoarding(value) {
  if (value === "boarder") return "Boarder";
  if (value === "non_boarder") return "Non-boarder";
  return "—";
}

function formatDateTime(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Students() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = tabIndexFromSearch(searchParams);
  const isListTab = activeTab === 1;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [programmes, setProgrammes] = useState([]);

  const [selected, setSelected] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const enrolment = useProgrammeEnrolmentOptions(form.programme_id);

  const handleTabChange = (_e, next) => {
    const value = STUDENT_TABS[next]?.value || "dashboard";
    setSearchParams(value === "list" ? { tab: "list" } : {}, { replace: true });
  };

  useEffect(() => {
    if (!form.programme_id || enrolment.loading) return;
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
  }, [form.programme_id, enrolment.loading, enrolment.years, enrolment.semesters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getPortalToken();
      const params = new URLSearchParams({
        role: "student",
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/users?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load students");

      setRows(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    if (!isListTab) return;
    load();
  }, [load, isListTab]);

  useEffect(() => {
    if (!isListTab) return;
    (async () => {
      try {
        const token = getPortalToken();
        const res = await fetch("/api/programmes?is_active=true&limit=100", {
          headers: authJsonHeaders(token),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) setProgrammes(Array.isArray(data.data) ? data.data : []);
      } catch {
        setProgrammes([]);
      }
    })();
  }, [isListTab]);

  const closeDialogs = () => {
    setOpenView(false);
    setOpenEdit(false);
    setSelected(null);
    setForm(emptyForm());
  };

  const handleView = (student) => {
    setSelected(student);
    setOpenView(true);
  };

  const handleEditOpen = (student) => {
    setSelected(student);
    setForm(mapStudentToForm(student));
    setOpenEdit(true);
  };

  const handleDelete = async (student) => {
    const result = await Swal.fire({
      title: "Delete student?",
      text: `Remove "${student.full_name}"? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const token = getPortalToken();
      const res = await fetch(`/api/users/${student.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      if (selected?.id === student.id) closeDialogs();
      await load();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Student removed successfully.",
        confirmButtonColor: primaryGreen,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const handleToggleActive = async (student) => {
    const token = getPortalToken();
    if (!token) return;
    const currentlyActive = student.is_active !== false;
    try {
      const res = await fetch(`/api/users/${student.id}/toggle-status`, {
        method: "PUT",
        headers: authJsonHeaders(token),
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not update status");
      }
      if (selected?.id === student.id && data.data) {
        setSelected(data.data);
      }
      await load();
      Swal.fire({
        icon: "success",
        title: currentlyActive ? "Student deactivated" : "Student activated",
        timer: 1400,
        showConfirmButton: false,
        confirmButtonColor: primaryGreen,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;

    if (!String(form.admission_number || "").trim()) {
      Swal.fire({
        icon: "warning",
        title: "Admission number required",
        text: "Students must have an admission number.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!form.programme_id || !form.year_of_study || !form.semester) {
      Swal.fire({
        icon: "warning",
        title: "Enrolment incomplete",
        text: "Programme, year of study, and semester are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!form.gender || !form.boarding_status) {
      Swal.fire({
        icon: "warning",
        title: "Student details incomplete",
        text: "Gender and boarding status are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Save student changes?",
      text: `Update details for "${form.full_name || selected.full_name}".`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Save",
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      const token = getPortalToken();
      const body = new FormData();
      body.append("email", form.email.trim());
      body.append("full_name", form.full_name.trim());
      body.append("phone", form.phone?.trim() || "");
      body.append("admission_number", form.admission_number.trim());
      body.append("role", "student");
      body.append("is_public", "false");
      body.append("position", "");
      body.append("department_id", "");
      body.append("programme_id", form.programme_id);
      body.append("year_of_study", form.year_of_study);
      body.append("semester", form.semester);
      body.append("gender", form.gender);
      body.append("boarding_status", form.boarding_status);
      if (form.profileFile) {
        body.append("profile_image", form.profileFile);
      } else if (form.removeProfileImage) {
        body.append("remove_profile_image", "true");
      }

      const res = await fetch(`/api/users/${selected.id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");

      setOpenEdit(false);
      setSelected(null);
      setForm(emptyForm());
      await load();
      Swal.fire({
        icon: "success",
        title: "Student updated",
        text: "Changes saved successfully.",
        confirmButtonColor: primaryGreen,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  if (isListTab && loading && !rows.length) {
    return <BrandPageLoader message="Loading students…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={isListTab ? "Students" : "Students dashboard"}
        subtitle={
          isListTab
            ? "View and manage enrolled student accounts"
            : "Gender and boarding insights across the school"
        }
        icon={<SchoolIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          isListTab ? (
            <HeroActionButton
              variant="contained"
              startIcon={<PersonIcon />}
              onClick={() => navigate("/users/create?for=student")}
            >
              Add student
            </HeroActionButton>
          ) : null
        }
      />

      <RoleTabs activeTab={activeTab} onChange={handleTabChange} tabs={STUDENT_TABS} />

      {!isListTab ? (
        <StudentsDashboard onOpenList={() => handleTabChange(null, 1)} />
      ) : (
      <Box
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid rgba(27,94,168,0.1)",
          bgcolor: "var(--kd-surface)",
          boxShadow: "0 16px 40px -16px rgba(20,26,58,0.1)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          sx={{ px: 2, py: 1.75, bgcolor: warmCream, borderBottom: "1px solid rgba(27,94,168,0.08)" }}
        >
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: textPrimary }}>
            All students
          </Typography>
          <TextField
            size="small"
            placeholder="Search name, admission no, email…"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            sx={{ ...inputSx, minWidth: { sm: 280 } }}
          />
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: "12px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        ) : null}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(27,94,168,0.04)" }}>
                {["No", "Name", "Programme", "Gender", "Boarding", "Actions"].map((h) => (
                  <TableCell
                    key={h}
                    align={h === "Actions" ? "right" : "left"}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} sx={{ color: primaryGreen }} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography sx={{ color: textSecondary, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                      No students found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    <TableCell sx={{ color: textMuted, fontWeight: 600, width: 64 }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                        <UserAvatar name={row.full_name} role="student" src={row} size={40} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            noWrap
                            sx={{
                              fontFamily: '"Plus Jakarta Sans", sans-serif',
                              fontWeight: 700,
                              color: textPrimary,
                              fontSize: "0.9rem",
                            }}
                          >
                            {row.full_name}
                          </Typography>
                          <Typography
                            noWrap
                            sx={{
                              fontFamily: '"Plus Jakarta Sans", sans-serif',
                              color: textMuted,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {row.admission_number || "No admission number"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontWeight: 600,
                          color: textPrimary,
                          fontSize: "0.86rem",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {row.programme?.name || "—"}
                      </Typography>
                      {(row.year_of_study != null || row.semester != null) && (
                        <Typography
                          sx={{
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            color: textMuted,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            mt: 0.25,
                          }}
                        >
                          {[
                            row.year_of_study != null ? `Year ${row.year_of_study}` : null,
                            row.semester != null ? `Sem ${row.semester}` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontWeight: 600,
                          color: textPrimary,
                          fontSize: "0.86rem",
                        }}
                      >
                        {formatGender(row.gender)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontWeight: 600,
                          color: textPrimary,
                          fontSize: "0.86rem",
                        }}
                      >
                        {formatBoarding(row.boarding_status)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                        {(() => {
                          const active = row.is_active !== false;
                          return (
                            <>
                              <Tooltip title="View">
                                <IconButton size="small" onClick={() => handleView(row)} sx={{ color: primaryGreen }}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEditOpen(row)} sx={{ color: textSecondary }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={active ? "Deactivate" : "Activate"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleActive(row)}
                                  sx={{ color: active ? "#c8a840" : textMuted }}
                                >
                                  {active ? (
                                    <ToggleOnIcon fontSize="small" />
                                  ) : (
                                    <ToggleOffIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleDelete(row)} sx={{ color: "#b42318" }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          );
                        })()}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_e, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid rgba(27,94,168,0.08)",
            ".MuiTablePagination-toolbar": { fontFamily: '"Plus Jakarta Sans", sans-serif' },
          }}
        />
      </Box>
      )}

      {/* View — all columns, no SweetAlert */}
      <PremiumDialog
        open={openView}
        onClose={closeDialogs}
        title="Student details"
        subtitle="Full student profile"
        icon={<ViewIcon />}
        footer={
          <>
            <Button onClick={closeDialogs} sx={ghostBtnSx}>
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                if (!selected) return;
                setOpenView(false);
                handleEditOpen(selected);
              }}
              sx={primaryBtnSx}
            >
              Edit
            </Button>
          </>
        }
      >
        {selected && (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
              <UserAvatar name={selected.full_name} role="student" src={selected} size={80} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: '"Fraunces", serif',
                    fontWeight: 700,
                    color: textPrimary,
                    fontSize: "1.15rem",
                    lineHeight: 1.2,
                  }}
                >
                  {selected.full_name}
                </Typography>
                <Chip
                  size="small"
                  label={selected.is_active !== false ? "Active" : "Inactive"}
                  sx={{
                    mt: 0.75,
                    height: 24,
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    bgcolor:
                      selected.is_active !== false ? "rgba(46,125,50,0.12)" : "rgba(180,35,24,0.1)",
                    color: selected.is_active !== false ? "#2e7d32" : "#b42318",
                  }}
                />
              </Box>
            </Stack>

            <DetailField icon={<PersonIcon fontSize="small" />} label="Full name" value={selected.full_name} />
            <DetailField icon={<EmailIcon fontSize="small" />} label="Email" value={selected.email} />
            <DetailField icon={<PhoneIcon fontSize="small" />} label="Phone" value={selected.phone || "—"} />
            <DetailField
              icon={<BadgeIcon fontSize="small" />}
              label="Admission number"
              value={selected.admission_number || "—"}
            />
            <DetailField
              icon={<MenuBookIcon fontSize="small" />}
              label="Programme"
              value={selected.programme?.name || "—"}
            />
            <DetailField
              icon={<SchoolIcon fontSize="small" />}
              label="Award"
              value={selected.programme?.award || "—"}
            />
            <DetailField
              icon={<BadgeIcon fontSize="small" />}
              label="Year of study"
              value={selected.year_of_study != null ? `Year ${selected.year_of_study}` : "—"}
            />
            <DetailField
              icon={<BadgeIcon fontSize="small" />}
              label="Semester"
              value={selected.semester != null ? `Semester ${selected.semester}` : "—"}
            />
            <DetailField
              icon={<PersonIcon fontSize="small" />}
              label="Gender"
              value={formatGender(selected.gender)}
            />
            <DetailField
              icon={<SchoolIcon fontSize="small" />}
              label="Boarding"
              value={formatBoarding(selected.boarding_status)}
            />
            <DetailField
              icon={<PersonIcon fontSize="small" />}
              label="Account status"
              value={selected.is_active !== false ? "Active" : "Inactive"}
            />
            <DetailField
              icon={<PersonIcon fontSize="small" />}
              label="Last login"
              value={formatDateTime(selected.last_login)}
            />
            <DetailField
              icon={<PersonIcon fontSize="small" />}
              label="Created"
              value={formatDateTime(selected.created_at || selected.createdAt)}
            />
            <DetailField
              icon={<PersonIcon fontSize="small" />}
              label="Updated"
              value={formatDateTime(selected.updated_at || selected.updatedAt)}
            />
            <Box
              sx={{
                p: 1.75,
                borderRadius: "14px",
                bgcolor: warmCream,
                border: "1px solid rgba(27,94,168,0.1)",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: textSecondary, fontWeight: 600 }}>
                Student ID:{" "}
                <Box component="span" sx={{ fontWeight: 700, color: textPrimary, wordBreak: "break-all" }}>
                  {selected.id}
                </Box>
              </Typography>
            </Box>
          </Stack>
        )}
      </PremiumDialog>

      {/* Edit — SweetAlert on confirm / result */}
      <PremiumDialog
        open={openEdit}
        onClose={closeDialogs}
        title="Edit student"
        subtitle="Update enrolment and profile details"
        icon={<EditIcon />}
        footer={
          <>
            <Button onClick={closeDialogs} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={primaryBtnSx}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <UserAvatar
              name={form.full_name || selected?.full_name}
              role="student"
              src={form.removeProfileImage ? "" : form.profilePreview || selected}
              size={72}
            />
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  component="label"
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
                  {form.profilePreview && !form.removeProfileImage ? "Change photo" : "Upload photo"}
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
                        removeProfileImage: false,
                      }));
                      e.target.value = "";
                    }}
                  />
                </Button>
                {(form.profilePreview || selected?.profile_image || selected?.profile_image_url) &&
                !form.removeProfileImage ? (
                  <Button
                    type="button"
                    variant="text"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        profileFile: null,
                        profilePreview: "",
                        removeProfileImage: true,
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
              <Typography sx={{ fontSize: "0.75rem", color: textSecondary, mt: 0.75 }}>
                JPEG, PNG, or WebP · max 5MB
              </Typography>
            </Box>
          </Box>

          <TextField
            label="Email address"
            type="email"
            fullWidth
            required
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
            label="Full name"
            fullWidth
            required
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
          <TextField
            label="Admission number"
            fullWidth
            required
            value={form.admission_number}
            onChange={(e) => setForm({ ...form, admission_number: e.target.value })}
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
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              sx={inputSx}
            >
              {enrolment.semesters.map((s) => (
                <MenuItem key={s} value={String(s)}>
                  Semester {s}
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
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
