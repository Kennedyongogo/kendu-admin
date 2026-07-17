import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Avatar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MenuBook as MenuBookIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  primaryGreen,
  primaryDark,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
} from "../Users/usersShared";
import {
  UsersHero,
  RoleTabs,
  PremiumDialog,
  DetailField,
  HeroActionButton,
} from "../Users/usersUi";

const STATUS_TABS = [
  { label: "All", value: null },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const emptyForm = () => ({
  name: "",
  description: "",
  duration: "",
  is_active: true,
  imageFile: null,
  imagePreview: "",
});

function authHeaders(token, isMultipart = false) {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  if (!isMultipart) headers["Content-Type"] = "application/json";
  return headers;
}

function programmeImageSrc(row) {
  if (!row) return "";
  if (row.image_url) return row.image_url;
  if (row.image) {
    if (/^https?:\/\//i.test(row.image)) return row.image;
    return `/uploads/programmes/${row.image}`;
  }
  return "";
}

function ProgrammeThumb({ name, src, size = 42 }) {
  const imageSrc = src || "";
  return (
    <Avatar
      src={imageSrc || undefined}
      variant="rounded"
      sx={{
        width: size,
        height: size,
        borderRadius: "12px",
        bgcolor: "rgba(0,96,80,0.1)",
        color: primaryGreen,
        boxShadow: "0 4px 12px rgba(20,26,58,0.08)",
      }}
    >
      {!imageSrc ? <MenuBookIcon sx={{ fontSize: size * 0.45 }} /> : null}
    </Avatar>
  );
}

export default function Programmes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [openView, setOpenView] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  const loadProgrammes = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!token) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage),
    });
    const status = STATUS_TABS[activeTab]?.value;
    if (status === "active") params.set("is_active", "true");
    if (status === "inactive") params.set("is_active", "false");

    try {
      const res = await fetch(`/api/programmes?${params.toString()}`, {
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load programmes");
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load programmes");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, activeTab]);

  useEffect(() => {
    void loadProgrammes();
  }, [loadProgrammes]);

  const handleTabChange = (_e, value) => {
    setActiveTab(value);
    setPage(0);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpenForm(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      description: row.description || "",
      duration: row.duration || "",
      is_active: row.is_active !== false,
      imageFile: null,
      imagePreview: programmeImageSrc(row),
    });
    setOpenForm(true);
  };

  const openViewDialog = (row) => {
    setSelected(row);
    setOpenView(true);
  };

  const closeDialogs = () => {
    setOpenView(false);
    setOpenForm(false);
    setEditing(null);
    setSelected(null);
    setForm(emptyForm());
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const saveProgramme = async () => {
    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name required",
        text: "Please enter a programme name",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("description", form.description || "");
      body.append("duration", form.duration || "");
      body.append("is_active", String(form.is_active));
      if (form.imageFile) body.append("image", form.imageFile);

      const url = editing ? `/api/programmes/${editing.id}` : "/api/programmes";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: authHeaders(token, true),
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      Swal.fire({
        icon: "success",
        title: editing ? "Programme updated" : "Programme created",
        timer: 1400,
        showConfirmButton: false,
      });
      closeDialogs();
      await loadProgrammes();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not save programme",
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteProgramme = async (row) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete programme?",
      text: `"${row.name}" will be permanently removed.`,
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/programmes/${row.id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1200,
        showConfirmButton: false,
      });
      await loadProgrammes();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not delete programme",
        confirmButtonColor: primaryGreen,
      });
    }
  };

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Programmes"
        subtitle="Manage academic programmes offered by the school"
        icon={<MenuBookIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add programme
          </HeroActionButton>
        }
      />

      <RoleTabs activeTab={activeTab} onChange={handleTabChange} tabs={STATUS_TABS} />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid rgba(0,96,80,0.1)",
          bgcolor: "#fff",
          boxShadow: "0 16px 40px -16px rgba(20,26,58,0.1)",
        }}
      >
        <TableContainer>
          <Table size="medium" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: warmCream,
                  "& .MuiTableCell-head": {
                    color: textSecondary,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderBottom: "1px solid rgba(0,96,80,0.1)",
                    py: 1.75,
                  },
                }}
              >
                <TableCell width={56}>#</TableCell>
                <TableCell>Programme</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: primaryGreen }} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography sx={{ color: textSecondary, fontWeight: 600 }}>
                      No programmes in this tab.
                    </Typography>
                    <Button
                      variant="text"
                      startIcon={<AddIcon />}
                      onClick={openCreate}
                      sx={{ mt: 1, color: primaryGreen, fontWeight: 700, textTransform: "none" }}
                    >
                      Create first programme
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => {
                  const active = row.is_active !== false;
                  const img = programmeImageSrc(row);
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        transition: "background 0.15s ease",
                        "&:hover": { bgcolor: "rgba(0,96,80,0.04)" },
                        "& td": { borderColor: "rgba(0,96,80,0.06)" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: textMuted, fontSize: "0.85rem" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <ProgrammeThumb name={row.name} src={img} size={44} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, color: textPrimary, lineHeight: 1.25 }}>
                              {row.name || "—"}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.78rem",
                                color: textSecondary,
                                maxWidth: 360,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.description || "No description"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: textSecondary }}>
                          {row.duration || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            bgcolor: active ? "rgba(0,96,80,0.1)" : "rgba(30,40,88,0.06)",
                            color: active ? primaryDark : textSecondary,
                            border: `1px solid ${active ? "rgba(0,96,80,0.2)" : "rgba(30,40,88,0.1)"}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                          {[
                            {
                              title: "View",
                              icon: <ViewIcon fontSize="small" />,
                              onClick: () => openViewDialog(row),
                              color: textSecondary,
                            },
                            {
                              title: "Edit",
                              icon: <EditIcon fontSize="small" />,
                              onClick: () => openEdit(row),
                              color: primaryGreen,
                            },
                            {
                              title: "Delete",
                              icon: <DeleteIcon fontSize="small" />,
                              onClick: () => void deleteProgramme(row),
                              color: primaryDark,
                            },
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
                  );
                })
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid rgba(0,96,80,0.1)",
            "& .MuiTablePagination-toolbar": {
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 600,
            },
          }}
        />
      </Box>

      <PremiumDialog
        open={openView}
        onClose={closeDialogs}
        title={selected?.name || "Programme details"}
        subtitle="Programme overview"
        icon={<MenuBookIcon />}
        footer={
          <Button onClick={closeDialogs} sx={ghostBtnSx}>
            Close
          </Button>
        }
      >
        {selected ? (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <ProgrammeThumb name={selected.name} src={programmeImageSrc(selected)} size={72} />
              <Box>
                <Chip
                  label={selected.is_active !== false ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    bgcolor:
                      selected.is_active !== false ? "rgba(0,96,80,0.1)" : "rgba(30,40,88,0.06)",
                    color: selected.is_active !== false ? primaryDark : textSecondary,
                  }}
                />
              </Box>
            </Stack>
            <DetailField
              icon={<MenuBookIcon fontSize="small" />}
              label="Programme name"
              value={selected.name}
            />
            <DetailField
              icon={<AccessTimeIcon fontSize="small" />}
              label="Duration"
              value={selected.duration || "—"}
            />
            <DetailField
              icon={<DescriptionIcon fontSize="small" />}
              label="Description"
              value={selected.description || "—"}
            />
          </Stack>
        ) : null}
      </PremiumDialog>

      <PremiumDialog
        open={openForm}
        onClose={saving ? undefined : closeDialogs}
        title={editing ? "Edit programme" : "Add programme"}
        subtitle={editing ? "Update programme details" : "Create a new academic programme"}
        icon={editing ? <EditIcon /> : <AddIcon />}
        footer={
          <>
            <Button onClick={closeDialogs} disabled={saving} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => void saveProgramme()}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={primaryBtnSx}
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ProgrammeThumb
              name={form.name || editing?.name}
              src={form.imagePreview}
              size={72}
            />
            <Box>
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
                  "&:hover": { borderColor: primaryGreen, bgcolor: "rgba(0,96,80,0.06)" },
                }}
              >
                {form.imagePreview ? "Change image" : "Upload image"}
                <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={onImageChange} />
              </Button>
              <Typography sx={{ fontSize: "0.75rem", color: textSecondary, mt: 0.75 }}>
                JPEG, PNG, or WebP · max 5MB
              </Typography>
            </Box>
          </Box>
          <TextField
            label="Programme name"
            fullWidth
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={inputSx}
          />
          <TextField
            label="Duration"
            placeholder="e.g. 3 years, 18 months"
            fullWidth
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            sx={inputSx}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
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
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    bgcolor: primaryGreen,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 600, color: textPrimary, fontSize: "0.9rem" }}>
                Active
              </Typography>
            }
          />
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
