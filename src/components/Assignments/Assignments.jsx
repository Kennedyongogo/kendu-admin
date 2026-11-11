import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
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
  Delete as DeleteIcon,
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
  };
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
  const isWriter = isAdmin || actor?.role === "lecturer";
  const lockedDepartmentId = !isAdmin ? actor?.department_id || "" : "";

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
      if (lockedDepartmentId) params.set("department_id", lockedDepartmentId);

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
  }, [page, rowsPerPage, search, lockedDepartmentId]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm(),
      department_id: lockedDepartmentId || "",
    });
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(rowToForm(row));
    setDialogOpen(true);
  };

  const save = async () => {
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
    if (isAdmin && !form.department_id) {
      Swal.fire({
        icon: "warning",
        title: "Department required",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const token = getPortalToken();
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        instructions: form.instructions.trim() || null,
        academic_year: form.academic_year.trim(),
        year_of_study: form.year_of_study || null,
        semester: form.semester || null,
        due_at: form.due_at || null,
        is_published: Boolean(form.is_published),
        programme_id: form.programme_id || null,
        unit_id: form.unit_id || null,
      };
      if (isAdmin) payload.department_id = form.department_id;

      const res = await fetch(editing ? `/api/assignments/${editing.id}` : "/api/assignments", {
        method: editing ? "PUT" : "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify(payload),
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
        {!isAdmin && !lockedDepartmentId ? (
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
                {isWriter ? <TableCell align="right">Actions</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isWriter ? 6 : 5}>
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
                        {row.year_of_study != null ? ` · Y${row.year_of_study}` : ""}
                        {row.semester != null ? ` · Sem ${row.semester}` : ""}
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
                    {isWriter ? (
                      <TableCell align="right">
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
                      </TableCell>
                    ) : null}
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
        actions={
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
              {saving ? "Saving…" : "Save"}
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
          {isAdmin ? (
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              >
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                    {d.code ? ` (${d.code})` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Programme</InputLabel>
            <Select
              label="Programme"
              value={form.programme_id}
              onChange={(e) => setForm({ ...form, programme_id: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Academic year"
              required
              fullWidth
              value={form.academic_year}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
              sx={inputSx}
            />
            <TextField
              label="Year of study"
              fullWidth
              value={form.year_of_study}
              onChange={(e) => setForm({ ...form, year_of_study: e.target.value })}
              sx={inputSx}
            />
            <TextField
              label="Semester"
              fullWidth
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              sx={inputSx}
            />
          </Stack>
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
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
