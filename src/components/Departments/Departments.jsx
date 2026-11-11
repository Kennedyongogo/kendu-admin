import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
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
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AccountTree as AccountTreeIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton, PremiumDialog } from "../Users/usersUi";
import { getPortalUser } from "../../auth/portalAuth";
import { canManageProgrammesAndDepartments } from "../../auth/roleAccess";
import {
  authJsonHeaders,
  getPortalToken,
  ghostBtnSx,
  inputSx,
  pageShellSx,
  primaryBtnSx,
  primaryDark,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";

const emptyForm = () => ({
  name: "",
  code: "",
  description: "",
  is_active: true,
});

function rowToForm(row) {
  return {
    name: row.name || "",
    code: row.code || "",
    description: row.description || "",
    is_active: row.is_active !== false,
  };
}

export default function Departments() {
  const navigate = useNavigate();
  const location = useLocation();
  const canManage = canManageProgrammesAndDepartments(getPortalUser()?.role);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);

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

      const res = await fetch(`/api/departments?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load departments");

      setRows(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const editDepartment = location.state?.editDepartment;
    if (!editDepartment) return;
    navigate(location.pathname, { replace: true, state: {} });
    if (!canManage) return;
    setEditing(editDepartment);
    setForm(rowToForm(editDepartment));
    setDialogOpen(true);
  }, [location.pathname, location.state, navigate, canManage]);

  const openCreate = () => {
    if (!canManage) return;
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    if (!canManage) return;
    setEditing(row);
    setForm(rowToForm(row));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name required",
        text: "Enter a department name.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const token = getPortalToken();
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        description: form.description.trim() || null,
        is_active: form.is_active,
      };
      const url = editing ? `/api/departments/${editing.id}` : "/api/departments";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: authJsonHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm());
      await load();
      Swal.fire({
        icon: "success",
        title: editing ? "Department updated" : "Department created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Delete department?",
      text: `Remove "${row.name}"? Programmes and staff must be unlinked first.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const token = getPortalToken();
      const res = await fetch(`/api/departments/${row.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      await load();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Cannot delete", text: err.message, confirmButtonColor: primaryGreen });
    }
  };

  if (loading && !rows.length) {
    return <BrandPageLoader message="Loading departments…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Departments"
        subtitle="Academic departments that own programmes and staff"
        icon={<AccountTreeIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          canManage ? (
            <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Add department
            </HeroActionButton>
          ) : null
        }
      />

      <Box
        sx={{
          mt: 2.5,
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
            All departments
          </Typography>
          <TextField
            size="small"
            placeholder="Search departments…"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            sx={{ ...inputSx, minWidth: { sm: 260 } }}
          />
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: "12px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        ) : null}

        <TableContainer sx={{ overflowX: "hidden" }}>
          <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(27,94,168,0.04)" }}>
                {[
                  { h: "Name", w: "auto" },
                  { h: "Code", w: 120 },
                  { h: "Actions", w: 132 },
                ].map(({ h, w }) => (
                  <TableCell
                    key={h}
                    align={h === "Actions" ? "right" : "left"}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      width: w,
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
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} sx={{ color: primaryGreen }} />
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ overflow: "hidden" }}>
                      <Typography sx={{ fontWeight: 700, color: textPrimary, fontSize: "0.9rem" }} noWrap>
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, fontWeight: 600 }}>
                      {row.code || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                        {[
                          {
                            title: "View",
                            icon: <ViewIcon fontSize="small" />,
                            onClick: () => setViewing(row),
                            color: textSecondary,
                          },
                          ...(canManage
                            ? [
                                {
                                  title: "Edit",
                                  icon: <EditIcon fontSize="small" />,
                                  onClick: () => openEdit(row),
                                  color: primaryGreen,
                                },
                                {
                                  title: "Delete",
                                  icon: <DeleteIcon fontSize="small" />,
                                  onClick: () => handleDelete(row),
                                  color: primaryDark,
                                },
                              ]
                            : []),
                        ].map((action) => (
                          <Tooltip key={action.title} title={action.title}>
                            <IconButton
                              size="small"
                              onClick={action.onClick}
                              sx={{
                                color: action.color,
                                bgcolor: "transparent",
                                "&:hover": { bgcolor: warmCream },
                              }}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography sx={{ color: textMuted }}>
                      {canManage
                        ? "No departments yet. Create one to start linking programmes and staff."
                        : "No departments yet."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      <PremiumDialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        maxWidth="sm"
        title={viewing?.name || "Department"}
        subtitle="Department details"
        icon={<AccountTreeIcon />}
        footer={
          <Stack direction="row" justifyContent="flex-end" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Button onClick={() => setViewing(null)} sx={ghostBtnSx}>
              Close
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const id = viewing?.id;
                setViewing(null);
                if (id) navigate(`/departments/${id}`);
              }}
              sx={{ ...ghostBtnSx, border: "1px solid rgba(27,94,168,0.22)" }}
            >
              Full page
            </Button>
            {canManage ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  const row = viewing;
                  setViewing(null);
                  if (row) openEdit(row);
                }}
                sx={primaryBtnSx}
              >
                Edit
              </Button>
            ) : null}
          </Stack>
        }
      >
        {viewing ? (
          <Stack spacing={2}>
            {[
              { label: "Name", value: viewing.name || "—" },
              { label: "Code", value: viewing.code || "—" },
              { label: "Description", value: viewing.description || "—" },
              {
                label: "Programmes",
                value: String(viewing.programmes_count ?? viewing.programmes?.length ?? 0),
              },
              {
                label: "HOD",
                value: (() => {
                  const count =
                    viewing.hod_count ??
                    (Array.isArray(viewing.hods)
                      ? viewing.hods.length
                      : (viewing.staff || []).filter((s) => s.role === "hod").length);
                  const names = (viewing.hods || (viewing.staff || []).filter((s) => s.role === "hod"))
                    .map((s) => s.full_name || s.email)
                    .filter(Boolean);
                  if (!count) return "0";
                  return names.length ? `${count} · ${names.join(", ")}` : String(count);
                })(),
              },
              {
                label: "Lecturers",
                value: (() => {
                  const count =
                    viewing.lecturer_count ??
                    (Array.isArray(viewing.lecturers)
                      ? viewing.lecturers.length
                      : (viewing.staff || []).filter((s) => s.role === "lecturer").length);
                  const names = (
                    viewing.lecturers || (viewing.staff || []).filter((s) => s.role === "lecturer")
                  )
                    .map((s) => s.full_name || s.email)
                    .filter(Boolean);
                  if (!count) return "0";
                  return names.length ? `${count} · ${names.join(", ")}` : String(count);
                })(),
              },
              { label: "Status", value: viewing.is_active === false ? "Inactive" : "Active" },
            ].map((item) => (
              <Box key={item.label}>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: textMuted,
                    mb: 0.5,
                  }}
                >
                  {item.label}
                </Typography>
                <Typography sx={{ fontWeight: 600, color: textPrimary, fontSize: "0.95rem", lineHeight: 1.45 }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : null}
      </PremiumDialog>

      <PremiumDialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        title={editing ? "Edit department" : "Add department"}
        subtitle="Programmes and staff will be linked to this department."
        icon={<AccountTreeIcon />}
        footer={
          <Stack direction="row" justifyContent="flex-end" spacing={1.25}>
            <Button onClick={closeDialog} disabled={saving} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={primaryBtnSx}
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create department"}
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <TextField
            label="Department name"
            required
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Clinical Medicine"
            sx={inputSx}
          />
          <TextField
            label="Code"
            fullWidth
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. CLMED"
            helperText="Optional short code"
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
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: primaryGreen },
                }}
              />
            }
            label="Active"
          />
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
