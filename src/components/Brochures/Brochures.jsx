import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  LinearProgress,
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
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SaveIcon from "@mui/icons-material/Save";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton, PremiumDialog } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  fontBody,
  ghostBtnSx,
  inputSx,
  pageShellSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";

const emptyForm = () => ({
  title: "",
  description: "",
  sort_order: "0",
  is_active: true,
  file: null,
  existingFileLabel: "",
});

function rowToForm(row) {
  return {
    title: row.title || "",
    description: row.description || "",
    sort_order: String(row.sort_order ?? 0),
    is_active: row.is_active !== false,
    file: null,
    existingFileLabel: row.original_name || row.filename || "Current file",
  };
}

function formatBytes(n) {
  const v = Number(n) || 0;
  if (!v) return "—";
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Brochures() {
  const token = getPortalToken();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const isEdit = Boolean(editingId);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      const res = await fetch(`/api/brochures?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load brochures");
      setItems(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load brochures");
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm(rowToForm(row));
    setDialogOpen(true);
  };

  const closeDialog = ({ force = false } = {}) => {
    if (saving && !force) return;
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        text: "Please enter a brochure title.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!isEdit && !form.file) {
      Swal.fire({
        icon: "warning",
        title: "File required",
        text: "Upload a PDF, Word doc, or image.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("title", form.title.trim());
      body.append("description", form.description.trim());
      body.append("sort_order", form.sort_order || "0");
      body.append("is_active", String(form.is_active));
      if (form.file) body.append("file", form.file);

      const url = isEdit ? `/api/brochures/${editingId}` : "/api/brochures";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");

      await Swal.fire({
        icon: "success",
        title: isEdit ? "Updated" : "Uploaded",
        timer: 1200,
        showConfirmButton: false,
      });
      closeDialog({ force: true });
      await loadItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not save brochure",
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete brochure?",
      text: `"${row.title}" will be removed from the public brochures page.`,
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/brochures/${row.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1200,
        showConfirmButton: false,
      });
      if (items.length <= 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        await loadItems();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not delete brochure",
        confirmButtonColor: primaryGreen,
      });
    }
  };

  if (loading && !items.length) {
    return <BrandPageLoader label="Loading brochures…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Brochures"
        subtitle="Upload school brochures and prospectuses for the public website."
        icon={<PictureAsPdfIcon />}
        actions={
          <HeroActionButton startIcon={<AddIcon />} onClick={openAdd}>
            Upload brochure
          </HeroActionButton>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer
        sx={{
          bgcolor: warmCream,
          borderRadius: "16px",
          border: "1px solid rgba(27,94,168,0.12)",
          overflow: "hidden",
        }}
      >
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>File</TableCell>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography sx={{ fontFamily: fontBody, fontWeight: 600, color: textPrimary }}>
                    {row.title}
                  </Typography>
                  {row.description && (
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted }}>
                      {row.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: fontBody, fontSize: "0.85rem", color: textSecondary }}>
                    {row.original_name || row.filename}
                  </Typography>
                  <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                    {formatBytes(row.file_size)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.is_active ? "Public" : "Hidden"}
                    sx={{
                      bgcolor: row.is_active ? primaryGreen : "rgba(15,23,42,0.08)",
                      color: row.is_active ? "#fff" : textSecondary,
                      fontWeight: 700,
                      fontSize: "0.7rem",
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    href={row.file_url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(row)} sx={{ color: "#c62828" }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && !loading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography sx={{ py: 4, textAlign: "center", color: textMuted, fontFamily: fontBody }}>
                    No brochures yet. Upload one to show it on the public site.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <PremiumDialog
        open={dialogOpen}
        onClose={() => closeDialog()}
        title={isEdit ? "Edit brochure" : "Upload brochure"}
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSave}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              sx={inputSx}
            />
            <TextField
              label="Short description"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              sx={inputSx}
            />
            <TextField
              label="Sort order"
              type="number"
              fullWidth
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              sx={inputSx}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
              }
              label="Show on public website"
              sx={{ fontFamily: fontBody }}
            />
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setForm((f) => ({ ...f, file }));
              }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ ...ghostBtnSx, justifyContent: "flex-start" }}
            >
              {form.file
                ? form.file.name
                : isEdit
                  ? `Replace file (${form.existingFileLabel})`
                  : "Choose PDF / Word / image"}
            </Button>
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={() => closeDialog()} sx={ghostBtnSx} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                sx={primaryBtnSx}
              >
                {isEdit ? "Save changes" : "Upload"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </PremiumDialog>
    </Box>
  );
}
