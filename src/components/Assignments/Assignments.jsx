import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
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
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton, PremiumDialog } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  getPortalUser,
  ghostBtnSx,
  inputSx,
  pageShellSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import { canManageAssignments } from "../../auth/roleAccess";
import useProgrammeEnrolmentOptions from "../Users/useProgrammeEnrolmentOptions";

const emptyForm = () => ({
  title: "",
  description: "",
  instructions: "",
  department_id: "",
  programme_id: "",
  unit_id: "",
  academic_year: "2025/2026",
  year_of_study: "",
  semester: "",
  due_at: "",
  is_published: false,
  documentFile: null,
  existingDocumentName: "",
  removeDocument: false,
});

function rowToForm(row) {
  return {
    title: row.title || "",
    description: row.description || "",
    instructions: row.instructions || "",
    department_id: row.department_id || row.department?.id || "",
    programme_id: row.programme_id || row.programme?.id || "",
    unit_id: row.unit_id || row.unit?.id || "",
    academic_year: row.academic_year || "2025/2026",
    year_of_study: row.year_of_study != null ? String(row.year_of_study) : "",
    semester: row.semester != null ? String(row.semester) : "",
    due_at: row.due_at ? String(row.due_at).slice(0, 16) : "",
    is_published: Boolean(row.is_published),
    documentFile: null,
    existingDocumentName: row.document_original_name || row.document_filename || "",
    removeDocument: false,
  };
}

function formatBytes(n) {
  const v = Number(n) || 0;
  if (!v) return "";
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function formatWhen(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function Assignments() {
  const actor = useMemo(() => getPortalUser(), []);
  const isAdmin = actor?.role === "admin";
  const isWriter = canManageAssignments(actor?.role);
  const actorDepartmentIds = useMemo(() => {
    if (isAdmin) return [];
    const ids = Array.isArray(actor?.department_ids) ? actor.department_ids.map(String) : [];
    if (actor?.department_id) ids.unshift(String(actor.department_id));
    return [...new Set(ids.filter(Boolean))];
  }, [actor, isAdmin]);
  const defaultDepartmentId = actorDepartmentIds[0] || "";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const enrolment = useProgrammeEnrolmentOptions(form.programme_id);

  const departmentOptions = useMemo(() => {
    if (isAdmin) return departments;
    if (!actorDepartmentIds.length) return departments;
    return departments.filter((d) => actorDepartmentIds.includes(String(d.id)));
  }, [isAdmin, departments, actorDepartmentIds]);

  const programmesForDepartment = useMemo(() => {
    if (!form.department_id) return [];
    return programmes.filter((p) => {
      const ids = Array.isArray(p.department_ids)
        ? p.department_ids.map(String)
        : Array.isArray(p.departments)
          ? p.departments.map((d) => String(d.id))
          : p.department_id
            ? [String(p.department_id)]
            : [];
      return ids.includes(String(form.department_id));
    });
  }, [programmes, form.department_id]);

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

  const loadLookups = useCallback(async () => {
    const token = getPortalToken();
    try {
      const [deptRes, progRes] = await Promise.all([
        fetch("/api/departments?is_active=true&limit=100", { headers: authJsonHeaders(token) }),
        fetch("/api/programmes?is_active=true&limit=100", { headers: authJsonHeaders(token) }),
      ]);
      const deptData = await deptRes.json().catch(() => ({}));
      const progData = await progRes.json().catch(() => ({}));
      if (deptRes.ok && deptData.success) {
        setDepartments(Array.isArray(deptData.data) ? deptData.data : []);
      }
      if (progRes.ok && progData.success) {
        setProgrammes(Array.isArray(progData.data) ? progData.data : []);
      }
    } catch {
      setDepartments([]);
      setProgrammes([]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getPortalToken();
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (search.trim()) params.set("search", search.trim());
      if (!isAdmin && defaultDepartmentId) params.set("department_id", defaultDepartmentId);

      const res = await fetch(`/api/assignments?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load assignments");

      setRows(Array.isArray(data.data) ? data.data : []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError(err.message);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, isAdmin, defaultDepartmentId]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    if (!isWriter) return;
    setEditing(null);
    setForm({
      ...emptyForm(),
      department_id: defaultDepartmentId || "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    if (!isWriter) return;
    setEditing(row);
    setForm(rowToForm(row));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDialogOpen(true);
  };

  const downloadDocument = async (row) => {
    if (!row?.id || !row.has_document) return;
    try {
      const token = getPortalToken();
      const res = await fetch(`/api/assignments/${row.id}/document`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Could not download document");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = row.document_original_name || "assignment-document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const save = async () => {
    if (!isWriter) return;
    if (!form.title.trim()) {
      Swal.fire({ icon: "warning", title: "Title required", confirmButtonColor: primaryGreen });
      return;
    }
    if (!form.academic_year.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Academic year required",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!form.department_id) {
      Swal.fire({
        icon: "warning",
        title: "Department required",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!form.programme_id) {
      Swal.fire({
        icon: "warning",
        title: "Programme required",
        text: "Pick a programme in the selected department so the right students see this assignment.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!form.year_of_study || !form.semester) {
      Swal.fire({
        icon: "warning",
        title: "Year and semester required",
        text: "Use the programme years and semesters to target the correct cohort.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const token = getPortalToken();
      const body = new FormData();
      body.append("title", form.title.trim());
      body.append("description", form.description.trim());
      body.append("instructions", form.instructions.trim());
      body.append("academic_year", form.academic_year.trim());
      body.append("year_of_study", form.year_of_study || "");
      body.append("semester", form.semester || "");
      body.append("due_at", form.due_at || "");
      body.append("is_published", String(Boolean(form.is_published)));
      body.append("programme_id", form.programme_id || "");
      body.append("unit_id", form.unit_id || "");
      body.append("department_id", form.department_id);
      if (form.documentFile) body.append("document", form.documentFile);
      if (editing && form.removeDocument && !form.documentFile) {
        body.append("remove_document", "true");
      }

      const res = await fetch(editing ? `/api/assignments/${editing.id}` : "/api/assignments", {
        method: editing ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not save assignment");

      setDialogOpen(false);
      await load();
      Swal.fire({
        icon: "success",
        title: editing ? "Assignment updated" : "Assignment created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!isWriter) return;
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete assignment?",
      text: row.title,
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      const token = getPortalToken();
      const res = await fetch(`/api/assignments/${row.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not delete assignment");
      await load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    }
  };

  if (loading && rows.length === 0) {
    return <BrandPageLoader message="Loading assignments…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        icon={<AssignmentIcon />}
        title="Assignments"
        subtitle={
          isWriter
            ? "Create and publish coursework for programmes and units."
            : "Weekly assignment summary across departments."
        }
        actions={
          isWriter ? (
            <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Add assignment
            </HeroActionButton>
          ) : null
        }
      />

      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search assignments"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          sx={{ ...inputSx, maxWidth: 360 }}
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
        {!isAdmin && !defaultDepartmentId ? (
          <Alert severity="warning">
            Your account has no department assigned. Ask an admin to link you to an academic department.
          </Alert>
        ) : null}
      </Stack>

      <Box
        sx={{
          borderRadius: "20px",
          bgcolor: "var(--kd-surface)",
          border: "1px solid rgba(27,94,168,0.1)",
          boxShadow: "0 20px 48px -18px rgba(20,26,58,0.14)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Programme</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Document</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={{ py: 4, textAlign: "center", color: textSecondary, fontFamily: "inherit" }}>
                      No assignments yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: textPrimary }}>{row.title}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: textMuted }}>
                        {row.academic_year}
                        {row.year_of_study != null ? ` · Year ${row.year_of_study}` : ""}
                        {row.semester != null ? ` · Semester ${row.semester}` : ""}
                        {row.programme?.name ? ` · ${row.programme.name}` : ""}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.department?.name || "—"}</TableCell>
                    <TableCell>{row.programme?.name || "—"}</TableCell>
                    <TableCell>{formatWhen(row.due_at)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.is_published ? "Published" : "Draft"}
                        sx={{
                          fontWeight: 700,
                          bgcolor: row.is_published ? "rgba(27,94,168,0.12)" : "rgba(30,40,88,0.08)",
                          color: row.is_published ? primaryGreen : textMuted,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.has_document ? (
                        <Typography sx={{ fontSize: "0.78rem", color: textSecondary }}>
                          {row.document_original_name || "Attached"}
                          {row.document_size ? ` · ${formatBytes(row.document_size)}` : ""}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: "0.78rem", color: textMuted }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center">
                        {row.has_document ? (
                          <Tooltip title="Download document">
                            <IconButton size="small" onClick={() => void downloadDocument(row)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                        {isWriter ? (
                          <>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(row)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => remove(row)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : null}
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
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      <PremiumDialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        title={editing ? "Edit assignment" : "Add assignment"}
        footer={
          <Stack direction="row" spacing={1.25}>
            <HeroActionButton
              variant="outlined"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              sx={ghostBtnSx}
            >
              Cancel
            </HeroActionButton>
            <HeroActionButton variant="contained" onClick={save} disabled={saving} sx={primaryBtnSx}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create assignment"}
            </HeroActionButton>
          </Stack>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Title"
            required
            fullWidth
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={inputSx}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={inputSx}
          />
          <TextField
            label="Instructions"
            fullWidth
            multiline
            minRows={2}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            sx={inputSx}
          />
          <FormControl fullWidth required sx={inputSx}>
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={form.department_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  department_id: e.target.value,
                  programme_id: "",
                  year_of_study: "",
                  semester: "",
                  unit_id: "",
                })
              }
            >
              {departmentOptions.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                  {d.code ? ` (${d.code})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required sx={inputSx}>
            <InputLabel>Programme</InputLabel>
            <Select
              label="Programme"
              value={form.programme_id}
              disabled={!form.department_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  programme_id: e.target.value,
                  year_of_study: "",
                  semester: "",
                })
              }
            >
              {!form.department_id ? (
                <MenuItem value="">Select a department first</MenuItem>
              ) : programmesForDepartment.length === 0 ? (
                <MenuItem value="">No programmes in this department</MenuItem>
              ) : (
                programmesForDepartment.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                    {p.duration_years ? ` · ${p.duration_years} yr` : ""}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Academic year"
              required
              fullWidth
              value={form.academic_year}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
              helperText="Calendar label, e.g. 2025/2026"
              sx={inputSx}
            />
            <TextField
              select
              label="Year of study"
              required
              fullWidth
              value={form.year_of_study}
              disabled={!form.programme_id || enrolment.loading || enrolment.years.length === 0}
              helperText={
                !form.programme_id
                  ? "Select a programme first"
                  : enrolment.loading
                    ? "Loading years…"
                    : "From programme duration"
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
              label="Semester"
              required
              fullWidth
              value={form.semester}
              disabled={!form.programme_id || enrolment.loading || enrolment.semesters.length === 0}
              helperText={!form.programme_id ? "Select a programme first" : undefined}
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
          <Typography sx={{ color: textMuted, fontSize: "0.78rem", mt: -1 }}>
            Students see this only when their programme, year, and semester match.
          </Typography>
          <TextField
            label="Due date"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.due_at}
            onChange={(e) => setForm({ ...form, due_at: e.target.value })}
            sx={inputSx}
          />
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.is_published)}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen } }}
              />
            }
            label="Published for students"
          />
          <Box>
            <Typography sx={{ fontWeight: 700, color: textPrimary, mb: 1, fontSize: "0.9rem" }}>
              Assignment document
            </Typography>
            <Typography sx={{ color: textMuted, fontSize: "0.78rem", mb: 1.25 }}>
              Optional PDF, Word, Excel, PowerPoint, image, or text file for students to download.
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setForm((prev) => ({
                  ...prev,
                  documentFile: file,
                  removeDocument: false,
                }));
              }}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ ...ghostBtnSx, justifyContent: "flex-start" }}
              >
                {form.documentFile
                  ? form.documentFile.name
                  : form.existingDocumentName && !form.removeDocument
                    ? `Replace (${form.existingDocumentName})`
                    : "Choose document"}
              </Button>
              {editing && form.existingDocumentName && !form.removeDocument && !form.documentFile ? (
                <Button
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      removeDocument: true,
                      documentFile: null,
                    }))
                  }
                  sx={{ ...ghostBtnSx, color: "#b91c1c" }}
                >
                  Remove document
                </Button>
              ) : null}
              {form.removeDocument ? (
                <Typography sx={{ color: textMuted, fontSize: "0.78rem" }}>
                  Document will be removed on save.
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
