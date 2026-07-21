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
  MenuItem,
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
  CampaignRounded as CampaignIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PushPinRounded as PinIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton, PremiumDialog } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  getPortalUser,
  fontBody,
  fontDisplay,
  ghostBtnSx,
  inputSx,
  navy,
  pageShellSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";

const CATEGORY_OPTIONS = [
  { value: "news", label: "News" },
  { value: "event", label: "Event" },
  { value: "exam", label: "Exam / Academic" },
  { value: "admission", label: "Admission" },
  { value: "general", label: "General notice" },
];

const AUDIENCE_OPTIONS = [
  { value: "public", label: "Public site only" },
  { value: "students", label: "Student portal only" },
  { value: "all", label: "Everyone (public + students)" },
];

const categoryLabel = (v) => CATEGORY_OPTIONS.find((o) => o.value === v)?.label || v;
const audienceLabel = (v) => AUDIENCE_OPTIONS.find((o) => o.value === v)?.label || v;

const emptyForm = () => ({
  title: "",
  category: "news",
  audience: "public",
  excerpt: "",
  body: "",
  event_date: "",
  event_end: "",
  is_published: true,
  is_pinned: false,
  coverFile: null,
  coverPreview: "",
  removeCover: false,
});

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function rowToForm(row) {
  return {
    title: row.title || "",
    category: row.category || "news",
    audience: row.category === "exam" ? "students" : row.audience || "public",
    excerpt: row.excerpt || "",
    body: row.body || "",
    event_date: toInputDate(row.event_date),
    event_end: toInputDate(row.event_end),
    is_published: row.is_published !== false,
    is_pinned: Boolean(row.is_pinned),
    coverFile: null,
    coverPreview: row.cover_image_url || "",
    removeCover: false,
  };
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function Announcements() {
  const currentUser = getPortalUser();
  const isAdmin = currentUser?.role === "admin";

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
  const token = getPortalToken();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!token) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      const res = await fetch(`/api/announcements?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load announcements");
      }
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load announcements");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage]);

  useEffect(() => {
    void load();
  }, [load]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
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

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete announcement?",
      text: `"${row.title}" will be removed from the site.`,
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/announcements/${row.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }
      await Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
      if (items.length <= 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        await load();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not delete announcement",
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        text: "Please enter a title.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    const editing = isEdit;
    const editId = editingId;

    setSaving(true);
    try {
      const body = new FormData();
      body.append("title", form.title.trim());
      body.append("category", form.category);
      body.append("audience", form.audience);
      body.append("excerpt", form.excerpt.trim());
      body.append("body", form.body);
      body.append("event_date", form.event_date || "");
      body.append("event_end", form.event_end || "");
      body.append("is_published", String(form.is_published));
      body.append("is_pinned", String(form.is_pinned));
      if (form.coverFile) body.append("cover", form.coverFile);
      if (editing && form.removeCover && !form.coverFile) {
        body.append("remove_cover_image", "true");
      }

      const res = await fetch(
        editing ? `/api/announcements/${editId}` : "/api/announcements",
        {
          method: editing ? "PUT" : "POST",
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          body,
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (editing ? "Could not update" : "Could not create"));
      }

      setSaving(false);
      closeDialog({ force: true });
      await Swal.fire({
        icon: "success",
        title: editing ? "Announcement updated" : "Announcement published",
        timer: 1400,
        showConfirmButton: false,
      });
      if (!editing) setPage(0);
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: editing ? "Update failed" : "Create failed",
        text: err.message || "Could not save announcement",
        confirmButtonColor: primaryGreen,
      });
      setSaving(false);
    }
  };

  if (loading && items.length === 0) {
    return <BrandPageLoader message="Loading announcements…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="News & Events"
        subtitle="Publish news, events and notices for the public site and the student portal."
        icon={<CampaignIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          isAdmin ? (
            <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
              New post
            </HeroActionButton>
          ) : null
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <TableContainer
        sx={{
          borderRadius: "18px",
          border: "1px solid rgba(0,96,80,0.12)",
          bgcolor: "var(--kd-surface)",
          boxShadow: "0 12px 40px -24px rgba(20,26,58,0.18)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: primaryGreen } }} />
        ) : null}
        <Table>
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
                  fontFamily: fontBody,
                },
              }}
            >
              <TableCell width={56}>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell width={130}>Category</TableCell>
              <TableCell width={150}>Audience</TableCell>
              <TableCell width={120}>Status</TableCell>
              <TableCell width={120}>Date</TableCell>
              <TableCell align="right" width={140}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "18px",
                      mx: "auto",
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(145deg, ${primaryGreen}, ${navy})`,
                      color: "#fff",
                    }}
                  >
                    <CampaignIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Typography
                    sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, mb: 0.5 }}
                  >
                    No announcements yet
                  </Typography>
                  <Typography sx={{ color: textSecondary, fontWeight: 500, mb: 1.5 }}>
                    Share news, upcoming events or exam notices with your audience.
                  </Typography>
                  {isAdmin ? (
                    <Button
                      variant="text"
                      startIcon={<AddIcon />}
                      onClick={openAddDialog}
                      sx={{ color: primaryGreen, fontWeight: 700, textTransform: "none" }}
                    >
                      Create first post
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ) : (
              items.map((row, idx) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:hover": { bgcolor: "rgba(0,96,80,0.04)" },
                    "& td": { borderColor: "rgba(0,96,80,0.06)", fontFamily: fontBody },
                  }}
                >
                  <TableCell sx={{ color: textMuted, fontWeight: 600 }}>
                    {page * rowsPerPage + idx + 1}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: "12px",
                          flexShrink: 0,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: warmCream,
                          color: primaryGreen,
                          border: "1px solid rgba(0,96,80,0.12)",
                        }}
                      >
                        {row.cover_image_url ? (
                          <Box
                            component="img"
                            src={row.cover_image_url}
                            alt=""
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <CampaignIcon fontSize="small" />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          {row.is_pinned ? (
                            <PinIcon sx={{ fontSize: 15, color: "#c8a840" }} />
                          ) : null}
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: textPrimary,
                              fontSize: "0.95rem",
                              lineHeight: 1.3,
                            }}
                          >
                            {row.title}
                          </Typography>
                        </Stack>
                        {row.excerpt ? (
                          <Typography
                            sx={{
                              color: textMuted,
                              fontSize: "0.78rem",
                              mt: 0.25,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 340,
                            }}
                          >
                            {row.excerpt}
                          </Typography>
                        ) : null}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={categoryLabel(row.category)}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        bgcolor: "rgba(30,40,88,0.08)",
                        color: navy,
                        borderRadius: "8px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: "0.8rem" }}>
                    {audienceLabel(row.audience)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.is_published ? "Published" : "Draft"}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        bgcolor: row.is_published ? "rgba(0,96,80,0.12)" : "rgba(30,40,88,0.08)",
                        color: row.is_published ? primaryGreen : textMuted,
                        borderRadius: "8px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: "0.8rem" }}>
                    {formatDate(row.event_date || row.published_at || row.created_at)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {isAdmin ? (
                        <>
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              onClick={() => openEditDialog(row)}
                              aria-label="Edit"
                              sx={{
                                color: navy,
                                bgcolor: "rgba(30,40,88,0.08)",
                                "&:hover": { bgcolor: "rgba(30,40,88,0.14)" },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              onClick={() => void handleDelete(row)}
                              aria-label="Delete"
                              sx={{
                                color: "#b91c1c",
                                bgcolor: "rgba(185,28,28,0.08)",
                                "&:hover": { bgcolor: "rgba(185,28,28,0.16)" },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Typography sx={{ color: textMuted, fontSize: "0.78rem", pr: 1 }}>
                          View only
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
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
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: "1px solid rgba(0,96,80,0.08)",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontFamily: fontBody,
            },
          }}
        />
      </TableContainer>

      <PremiumDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={isEdit ? "Edit announcement" : "New announcement"}
        subtitle={
          isEdit
            ? "Update the post. Changes go live immediately when published."
            : "Publish news, an event or a notice to your chosen audience."
        }
        icon={<CampaignIcon />}
        maxWidth="md"
        footer={
          <>
            <Button onClick={closeDialog} disabled={saving} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : isEdit ? (
                  <SaveIcon />
                ) : (
                  <AddIcon />
                )
              }
              sx={primaryBtnSx}
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Publish"}
            </Button>
          </>
        }
      >
        <Box component="form" onSubmit={handleSave} sx={{ maxWidth: "100%", overflowX: "hidden" }}>
          <Stack spacing={2.25} sx={{ minWidth: 0, maxWidth: "100%" }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              sx={inputSx}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Category"
                fullWidth
                value={form.category}
                onChange={(e) => {
                  const category = e.target.value;
                  setForm((f) => ({
                    ...f,
                    category,
                    // Exam notices are only visible inside the student portal
                    audience: category === "exam" ? "students" : f.audience,
                  }));
                }}
                sx={inputSx}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Audience"
                fullWidth
                disabled={form.category === "exam"}
                helperText={
                  form.category === "exam"
                    ? "Exam notices are shown to students only, after login."
                    : undefined
                }
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                sx={inputSx}
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Short summary (optional)"
              fullWidth
              multiline
              minRows={2}
              helperText="Shown on cards. Leave empty to auto-generate from the body."
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              sx={inputSx}
            />
            <TextField
              label="Body"
              fullWidth
              multiline
              minRows={5}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              sx={inputSx}
            />
            {(form.category === "event" || form.category === "exam") && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Start date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.event_date}
                  onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                  sx={inputSx}
                />
                <TextField
                  label="End date (optional)"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.event_end}
                  onChange={(e) => setForm((f) => ({ ...f, event_end: e.target.value }))}
                  sx={inputSx}
                />
              </Stack>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_published}
                    onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                    sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen } }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: fontBody, fontWeight: 600, color: textPrimary }}>
                    Published (visible now)
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_pinned}
                    onChange={(e) => setForm((f) => ({ ...f, is_pinned: e.target.checked }))}
                    sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen } }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: fontBody, fontWeight: 600, color: textPrimary }}>
                    Pin to top
                  </Typography>
                }
              />
            </Stack>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                setForm((f) => ({
                  ...f,
                  coverFile: file,
                  coverPreview: URL.createObjectURL(file),
                  removeCover: false,
                }));
              }}
            />
            <Box
              sx={{
                border: "1.5px dashed rgba(0,96,80,0.35)",
                borderRadius: "16px",
                bgcolor: warmCream,
                p: 2,
                textAlign: "center",
              }}
            >
              {form.coverPreview ? (
                <Box
                  component="img"
                  src={form.coverPreview}
                  alt="Cover preview"
                  sx={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                    borderRadius: "12px",
                    mb: 1.5,
                  }}
                />
              ) : (
                <CloudUploadIcon sx={{ color: primaryGreen, fontSize: 36, mb: 0.5 }} />
              )}
              <Typography
                sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, mb: 0.5 }}
              >
                {form.coverPreview ? "Cover image" : "Add a cover image (optional)"}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button
                  type="button"
                  variant="text"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: primaryGreen, fontWeight: 700, textTransform: "none" }}
                >
                  {form.coverPreview ? "Replace" : "Choose image"}
                </Button>
                {form.coverPreview ? (
                  <Button
                    type="button"
                    variant="text"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        coverFile: null,
                        coverPreview: "",
                        removeCover: true,
                      }))
                    }
                    sx={{
                      color: textSecondary,
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": { color: "#b42318", bgcolor: "rgba(180,35,24,0.06)" },
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </Stack>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted, mt: 0.5 }}>
                JPG, PNG, WEBP or GIF up to 8MB
              </Typography>
            </Box>
          </Stack>
        </Box>
      </PremiumDialog>
    </Box>
  );
}
