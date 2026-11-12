import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
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
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CampaignIcon from "@mui/icons-material/Campaign";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton, PremiumDialog } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  getPortalUser,
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

const SHAPE_LABELS = {
  event_card: "Event card",
  ticket: "Ticket",
};

const LEGACY_SHAPE_MAP = {
  circle: "event_card",
  pill: "ticket",
  rounded_square: "event_card",
  diamond: "event_card",
  hexagon: "event_card",
  oval: "event_card",
  speech_bubble: "event_card",
  ribbon: "ticket",
  banner: "ticket",
  star: "event_card",
};

function normalizeShape(shape) {
  const raw = String(shape || "").trim();
  if (SHAPE_LABELS[raw]) return raw;
  return LEGACY_SHAPE_MAP[raw] || "event_card";
}

const STATUS_COLORS = {
  draft: { bg: "rgba(15,23,42,0.08)", color: textSecondary },
  pending: { bg: "rgba(200,168,64,0.2)", color: "#7a5c00" },
  approved: { bg: primaryGreen, color: "#fff" },
  rejected: { bg: "rgba(198,40,40,0.12)", color: "#c62828" },
};

const emptyForm = () => ({
  title: "",
  body: "",
  shape: "event_card",
  accent: "gold",
  position_hint: "mid_right",
  display_start: "",
  display_end: "",
  sort_order: "0",
});

function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function rowToForm(row) {
  return {
    title: row.title || "",
    body: row.body || "",
    shape: normalizeShape(row.shape),
    accent: row.accent || "gold",
    position_hint: row.position_hint || "mid_right",
    display_start: toLocalInput(row.display_start),
    display_end: toLocalInput(row.display_end),
    sort_order: String(row.sort_order ?? 0),
  };
}

function ShapePreview({ shape, accent = "gold" }) {
  const colors = {
    gold: { bg: "#c8a840", fg: "#1e2858", surface: "#fffcf8" },
    blue: { bg: "#1B5EA8", fg: "#fff", surface: "#fff" },
    navy: { bg: "#1e2858", fg: "#fff", surface: "#1e2858" },
    cream: { bg: "#1e2858", fg: "#c8a840", surface: "#fffcf8" },
  };
  const c = colors[accent] || colors.gold;
  const style = normalizeShape(shape);
  const isTicket = style === "ticket";
  return (
    <Box
      sx={{
        width: 56,
        height: 36,
        bgcolor: accent === "navy" ? "#1e2858" : c.surface,
        color: accent === "navy" ? "#fff" : textPrimary,
        borderRadius: "10px",
        border: `1px solid ${c.bg}`,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.6,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isTicket ? (
        <Box
          sx={{
            position: "absolute",
            left: -5,
            top: "50%",
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: warmCream,
            transform: "translateY(-50%)",
            boxShadow: `inset 0 0 0 1px ${c.bg}`,
          }}
        />
      ) : null}
      <Box
        sx={{
          width: 14,
          height: 18,
          borderRadius: "4px",
          bgcolor: c.bg,
          color: c.fg,
          ml: isTicket ? 0.6 : 0,
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: "0.48rem", fontWeight: 800, fontFamily: fontBody, lineHeight: 1.1 }}>
        {isTicket ? "Ticket" : "Event"}
      </Typography>
    </Box>
  );
}

export default function UpcomingActivities() {
  const token = getPortalToken();
  const user = getPortalUser();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    shapes: Object.keys(SHAPE_LABELS),
    accents: [],
    positions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (statusFilter) params.set("status", statusFilter);
      const [listRes, metaRes] = await Promise.all([
        fetch(`/api/upcoming-activities?${params}`, { headers: authJsonHeaders(token) }),
        fetch("/api/upcoming-activities/meta", { headers: authJsonHeaders(token) }),
      ]);
      const listData = await listRes.json().catch(() => ({}));
      const metaData = await metaRes.json().catch(() => ({}));
      if (!listRes.ok || !listData.success) throw new Error(listData.message || "Failed to load");
      setItems(listData.data || []);
      setTotal(listData.pagination?.total || 0);
      if (metaData.success) setMeta(metaData.data);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

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

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        text: "Please enter an activity title.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        body: form.body.trim(),
        shape: form.shape,
        accent: form.accent,
        position_hint: form.position_hint,
        display_start: form.display_start || null,
        display_end: form.display_end || null,
        sort_order: form.sort_order || 0,
      };
      const url = editingId ? `/api/upcoming-activities/${editingId}` : "/api/upcoming-activities";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      await Swal.fire({
        icon: "success",
        title: editingId ? "Updated" : "Published",
        text: editingId
          ? "Activity updated and live on the home hero."
          : "Activity published to the home hero.",
        timer: 1400,
        showConfirmButton: false,
      });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not save activity",
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete activity?",
      text: `"${row.title}" will be removed and will no longer appear on the home hero.`,
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/upcoming-activities/${row.id}`, {
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
        await load();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not delete activity",
        confirmButtonColor: primaryGreen,
      });
    }
  };

  if (loading && !items.length) {
    return <BrandPageLoader label="Loading upcoming activities…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Upcoming activities"
        subtitle="Create once — it publishes straight to the home hero."
        icon={<CampaignIcon />}
        actions={
          <HeroActionButton startIcon={<AddIcon />} onClick={openAdd}>
            New activity
          </HeroActionButton>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        {[
          { value: "", label: "All" },
          { value: "approved", label: "Live" },
        ].map((s) => (
          <Chip
            key={s.value || "all"}
            label={s.label}
            onClick={() => {
              setStatusFilter(s.value);
              setPage(0);
            }}
            sx={{
              fontFamily: fontBody,
              fontWeight: 700,
              bgcolor: statusFilter === s.value ? primaryGreen : "rgba(27,94,168,0.08)",
              color: statusFilter === s.value ? "#fff" : textPrimary,
            }}
          />
        ))}
      </Stack>

      <TableContainer
        sx={{
          bgcolor: warmCream,
          borderRadius: "16px",
          border: "1px solid rgba(27,94,168,0.12)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>Activity</TableCell>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>Shape</TableCell>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>Window</TableCell>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => {
              const st = STATUS_COLORS[row.status] || STATUS_COLORS.draft;
              return (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary }}>
                      {row.title}
                    </Typography>
                    {row.body && (
                      <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted }}>
                        {row.body}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ShapePreview shape={normalizeShape(row.shape)} accent={row.accent} />
                      <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem" }}>
                        {SHAPE_LABELS[normalizeShape(row.shape)] || normalizeShape(row.shape)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary }}>
                      {row.display_start
                        ? new Date(row.display_start).toLocaleString(undefined, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Anytime"}
                      {" → "}
                      {row.display_end
                        ? new Date(row.display_end).toLocaleString(undefined, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Open"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status === "approved" ? "Live" : row.status}
                      sx={{
                        height: 22,
                        textTransform: "capitalize",
                        fontWeight: 700,
                        bgcolor: st.bg,
                        color: st.color,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(row)} sx={ghostBtnSx}>
                        Edit
                      </Button>
                      {isAdmin && (
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(row)}
                          sx={{ ...ghostBtnSx, color: "#c62828" }}
                        >
                          Delete
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {!items.length && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography sx={{ py: 4, textAlign: "center", color: textMuted, fontFamily: fontBody }}>
                    No upcoming activities yet. Create one and it goes live on the home hero.
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
        onClose={() => !saving && setDialogOpen(false)}
        title={editingId ? "Edit activity" : "New upcoming activity"}
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
              label="Short message"
              fullWidth
              multiline
              minRows={2}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              sx={inputSx}
              helperText="Keep it brief — it floats on the hero."
            />

            <Typography sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.85rem" }}>
              Card style
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 1,
              }}
            >
              {(meta.shapes || Object.keys(SHAPE_LABELS))
                .map(normalizeShape)
                .filter((shape, idx, arr) => arr.indexOf(shape) === idx)
                .map((shape) => {
                const selected = form.shape === shape;
                return (
                  <Button
                    key={shape}
                    onClick={() => setForm((f) => ({ ...f, shape }))}
                    sx={{
                      flexDirection: "column",
                      gap: 0.75,
                      py: 1.25,
                      borderRadius: "12px",
                      border: selected ? `2px solid ${primaryGreen}` : "1px solid rgba(27,94,168,0.15)",
                      bgcolor: selected ? "rgba(27,94,168,0.06)" : "#fff",
                      textTransform: "none",
                      fontFamily: fontBody,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: textPrimary,
                    }}
                  >
                    <ShapePreview shape={shape} accent={form.accent} />
                    {SHAPE_LABELS[shape] || shape}
                  </Button>
                );
              })}
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Accent</InputLabel>
                <Select
                  label="Accent"
                  value={form.accent}
                  onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))}
                >
                  {(meta.accents || ["gold", "blue", "navy", "cream"]).map((a) => (
                    <MenuItem key={a} value={a}>
                      {a}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Hero position</InputLabel>
                <Select
                  label="Hero position"
                  value={form.position_hint}
                  onChange={(e) => setForm((f) => ({ ...f, position_hint: e.target.value }))}
                >
                  {(meta.positions || []).map((p) => (
                    <MenuItem key={p} value={p}>
                      {p.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="Show from"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.display_start}
                onChange={(e) => setForm((f) => ({ ...f, display_start: e.target.value }))}
                sx={inputSx}
              />
              <TextField
                label="Show until"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.display_end}
                onChange={(e) => setForm((f) => ({ ...f, display_end: e.target.value }))}
                sx={inputSx}
              />
            </Stack>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={ghostBtnSx}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                sx={primaryBtnSx}
              >
                Save & publish
              </Button>
            </Stack>
          </Stack>
        </Box>
      </PremiumDialog>
    </Box>
  );
}
