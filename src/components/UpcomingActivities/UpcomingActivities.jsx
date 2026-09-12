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
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
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
  circle: "Circle",
  pill: "Pill",
  rounded_square: "Rounded square",
  diamond: "Diamond",
  hexagon: "Hexagon",
  oval: "Oval",
  speech_bubble: "Speech bubble",
  ribbon: "Ribbon",
  banner: "Banner",
  star: "Star",
};

const STATUS_COLORS = {
  draft: { bg: "rgba(15,23,42,0.08)", color: textSecondary },
  pending: { bg: "rgba(200,168,64,0.2)", color: "#7a5c00" },
  approved: { bg: primaryGreen, color: "#fff" },
  rejected: { bg: "rgba(198,40,40,0.12)", color: "#c62828" },
};

const emptyForm = () => ({
  title: "",
  body: "",
  shape: "pill",
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
    shape: row.shape || "pill",
    accent: row.accent || "gold",
    position_hint: row.position_hint || "mid_right",
    display_start: toLocalInput(row.display_start),
    display_end: toLocalInput(row.display_end),
    sort_order: String(row.sort_order ?? 0),
  };
}

function ShapePreview({ shape, accent = "gold" }) {
  const colors = {
    gold: { bg: "#c8a840", fg: "#1e2858" },
    blue: { bg: "#1B5EA8", fg: "#fff" },
    navy: { bg: "#1e2858", fg: "#fff" },
    cream: { bg: "#f4f1ea", fg: "#1e2858" },
  };
  const c = colors[accent] || colors.gold;
  const clip = {
    diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  };
  const radius = {
    circle: "50%",
    pill: "999px",
    rounded_square: "14px",
    oval: "50% / 40%",
    speech_bubble: "16px 16px 16px 4px",
    ribbon: "4px 18px 18px 4px",
    banner: "8px",
    diamond: 0,
    hexagon: 0,
    star: 0,
  };
  return (
    <Box
      sx={{
        width: 44,
        height: shape === "banner" || shape === "pill" ? 28 : 44,
        bgcolor: c.bg,
        color: c.fg,
        borderRadius: radius[shape] ?? "12px",
        clipPath: clip[shape] || "none",
        display: "grid",
        placeItems: "center",
        fontSize: "0.55rem",
        fontWeight: 800,
        fontFamily: fontBody,
        flexShrink: 0,
      }}
    >
      {shape === "star" || shape === "diamond" || shape === "hexagon" ? "" : "Ad"}
    </Box>
  );
}

export default function UpcomingActivities() {
  const token = getPortalToken();
  const user = getPortalUser();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ shapes: Object.keys(SHAPE_LABELS), accents: [], positions: [] });
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
        title: editingId ? "Updated" : "Created",
        text: editingId ? "Activity changes saved as draft." : "Activity saved as draft.",
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

  const runAction = async (row, action) => {
    const labels = {
      submit: {
        confirmTitle: "Submit for approval?",
        confirmText: `"${row.title}" will be sent for admin approval.`,
        confirmButtonText: "Submit",
        successTitle: "Submitted",
        successText: "Waiting for admin approval.",
      },
      approve: {
        confirmTitle: "Approve activity?",
        confirmText: `"${row.title}" will float on the home hero in its display window.`,
        confirmButtonText: "Approve",
        successTitle: "Approved",
        successText: "It can now appear on the public home hero.",
      },
    };
    const cfg = labels[action];
    if (!cfg) return;

    const result = await Swal.fire({
      icon: action === "approve" ? "question" : "info",
      title: cfg.confirmTitle,
      text: cfg.confirmText,
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#64748b",
      confirmButtonText: cfg.confirmButtonText,
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/upcoming-activities/${row.id}/${action}`, {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Action failed");
      await Swal.fire({
        icon: "success",
        title: cfg.successTitle,
        text: cfg.successText,
        timer: 1400,
        showConfirmButton: false,
      });
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Action failed",
        confirmButtonColor: primaryGreen,
      });
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
        subtitle="Draft, approve, then float briefly on the home hero."
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
        {["", "draft", "pending", "approved", "rejected"].map((s) => (
          <Chip
            key={s || "all"}
            label={s ? s : "All"}
            onClick={() => {
              setStatusFilter(s);
              setPage(0);
            }}
            sx={{
              fontFamily: fontBody,
              fontWeight: 700,
              textTransform: "capitalize",
              bgcolor: statusFilter === s ? primaryGreen : "rgba(27,94,168,0.08)",
              color: statusFilter === s ? "#fff" : textPrimary,
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
                      <ShapePreview shape={row.shape} accent={row.accent} />
                      <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem" }}>
                        {SHAPE_LABELS[row.shape] || row.shape}
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
                      label={row.status}
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
                      {["draft", "rejected"].includes(row.status) && (
                        <Button
                          size="small"
                          startIcon={<SendIcon />}
                          onClick={() => runAction(row, "submit")}
                          sx={ghostBtnSx}
                        >
                          Submit
                        </Button>
                      )}
                      {isAdmin && ["draft", "pending", "rejected"].includes(row.status) && (
                        <Button
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => runAction(row, "approve")}
                          sx={{ ...ghostBtnSx, color: primaryGreen }}
                        >
                          Approve
                        </Button>
                      )}
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
                    No upcoming activities yet. Create one, submit for approval, then it can float on the home hero.
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
              Choose a shape
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
                gap: 1,
              }}
            >
              {(meta.shapes || Object.keys(SHAPE_LABELS)).map((shape) => {
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
                      fontSize: "0.68rem",
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
                Save as draft
              </Button>
            </Stack>
          </Stack>
        </Box>
      </PremiumDialog>
    </Box>
  );
}
