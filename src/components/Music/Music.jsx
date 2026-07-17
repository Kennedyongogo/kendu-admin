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
  Slider,
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
  LibraryMusic as LibraryMusicIcon,
  PauseRounded as PauseIcon,
  PlayArrowRounded as PlayIcon,
  CloudUpload as CloudUploadIcon,
  MusicNote as MusicNoteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import {
  UsersHero,
  HeroActionButton,
  PremiumDialog,
} from "../Users/usersUi";
import {
  authJsonHeaders,
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

const emptyForm = () => ({
  title: "",
  description: "",
  sort_order: "0",
  volume: 0.35,
  is_active: true,
  file: null,
  existingFileLabel: "",
});

function formatVolume(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "35%";
  return `${Math.round(n * 100)}%`;
}

function rowToForm(row) {
  return {
    title: row.title || "",
    description: row.description || "",
    sort_order: String(row.sort_order ?? 0),
    volume: Number(row.volume) || 0.35,
    is_active: row.is_active !== false,
    file: null,
    existingFileLabel: row.filename || "Current audio file",
  };
}

export default function Music() {
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

  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const isEdit = Boolean(editingId);

  const token = localStorage.getItem("token");

  const loadTracks = useCallback(async () => {
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
      const res = await fetch(`/api/music?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load music tracks");
      }
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load music tracks");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage]);

  useEffect(() => {
    void loadTracks();
  }, [loadTracks]);

  useEffect(() => {
    return () => {
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.src = "";
      }
    };
  }, []);

  const stopPlayback = () => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    setPlayingId(null);
    setProgress(0);
  };

  const togglePlay = async (row) => {
    const el = audioRef.current;
    if (!el || !row?.audio_url) return;

    if (playingId === row.id) {
      stopPlayback();
      return;
    }

    try {
      el.pause();
      el.src = row.audio_url;
      el.volume = Math.min(1, Math.max(0, Number(row.volume) || 0.35));
      setProgress(0);
      setPlayingId(row.id);
      await el.play();
    } catch (err) {
      setPlayingId(null);
      Swal.fire({
        icon: "error",
        title: "Could not play",
        text: err.message || "Browser blocked audio playback.",
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete track?",
      text: `"${row.title}" will be removed from the public home playlist.`,
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      if (playingId === row.id) stopPlayback();
      const res = await fetch(`/api/music/${row.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1200,
        showConfirmButton: false,
      });
      if (items.length <= 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        await loadTracks();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not delete track",
        confirmButtonColor: primaryGreen,
      });
    }
  };

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

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        text: "Please enter a track title.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!isEdit && !form.file) {
      Swal.fire({
        icon: "warning",
        title: "Audio required",
        text: "Please choose an audio file (mp3, wav, ogg, m4a…).",
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
      body.append("description", form.description.trim());
      body.append("sort_order", String(Number(form.sort_order) || 0));
      body.append("volume", String(form.volume));
      body.append("is_active", String(form.is_active));
      if (form.file) body.append("audio", form.file);

      const res = await fetch(editing ? `/api/music/${editId}` : "/api/music", {
        method: editing ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (editing ? "Could not update track" : "Could not upload track"));
      }

      setSaving(false);
      closeDialog({ force: true });
      await Swal.fire({
        icon: "success",
        title: editing ? "Track updated" : "Track added",
        timer: 1400,
        showConfirmButton: false,
      });
      if (!editing) setPage(0);
      await loadTracks();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: editing ? "Update failed" : "Upload failed",
        text: err.message || "Could not save music track",
        confirmButtonColor: primaryGreen,
      });
      setSaving(false);
    }
  };

  if (loading && items.length === 0) {
    return <BrandPageLoader message="Loading music…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (!el.duration) return;
          setProgress((el.currentTime / el.duration) * 100);
        }}
        onEnded={() => {
          setPlayingId(null);
          setProgress(0);
        }}
        style={{ display: "none" }}
      />

      <UsersHero
        title="Music"
        subtitle="Background tracks for the public home page — upload, preview, and manage the playlist."
        icon={<LibraryMusicIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add track
          </HeroActionButton>
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
          bgcolor: "#fff",
          boxShadow: "0 12px 40px -24px rgba(20,26,58,0.18)",
          overflow: "hidden",
        }}
      >
        {loading ? <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: primaryGreen } }} /> : null}
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
              <TableCell>Track</TableCell>
              <TableCell width={110}>Status</TableCell>
              <TableCell width={100}>Volume</TableCell>
              <TableCell width={90}>Order</TableCell>
              <TableCell align="right" width={168}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
                    <MusicNoteIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: fontDisplay,
                      fontWeight: 700,
                      color: textPrimary,
                      mb: 0.5,
                    }}
                  >
                    No tracks yet
                  </Typography>
                  <Typography sx={{ color: textSecondary, fontWeight: 500, mb: 1.5 }}>
                    Add audio that will play on the public home page.
                  </Typography>
                  <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    sx={{ color: primaryGreen, fontWeight: 700, textTransform: "none" }}
                  >
                    Add first track
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row, idx) => {
                const isPlaying = playingId === row.id;
                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      bgcolor: isPlaying ? "rgba(0,96,80,0.04)" : undefined,
                      transition: "background 0.15s ease",
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
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isPlaying
                              ? `linear-gradient(145deg, ${primaryGreen}, #004840)`
                              : warmCream,
                            color: isPlaying ? "#fff" : primaryGreen,
                            border: "1px solid rgba(0,96,80,0.12)",
                            boxShadow: isPlaying ? "0 8px 18px -8px rgba(0,96,80,0.55)" : "none",
                          }}
                        >
                          <MusicNoteIcon fontSize="small" />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
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
                          {row.description ? (
                            <Typography
                              sx={{
                                color: textMuted,
                                fontSize: "0.78rem",
                                mt: 0.25,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 360,
                              }}
                            >
                              {row.description}
                            </Typography>
                          ) : null}
                          {isPlaying ? (
                            <Box sx={{ mt: 0.75, maxWidth: 220 }}>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: "rgba(0,96,80,0.12)",
                                  "& .MuiLinearProgress-bar": { bgcolor: primaryGreen, borderRadius: 2 },
                                }}
                              />
                            </Box>
                          ) : null}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.is_active !== false ? "Active" : "Inactive"}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: row.is_active !== false ? "rgba(0,96,80,0.12)" : "rgba(30,40,88,0.08)",
                          color: row.is_active !== false ? primaryGreen : textMuted,
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, fontWeight: 600 }}>
                      {formatVolume(row.volume)}
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, fontWeight: 600 }}>
                      {row.sort_order ?? 0}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={isPlaying ? "Stop preview" : "Play preview"} arrow>
                          <IconButton
                            onClick={() => void togglePlay(row)}
                            aria-label={isPlaying ? "Stop" : "Play"}
                            sx={{
                              color: isPlaying ? "#fff" : primaryGreen,
                              bgcolor: isPlaying ? primaryGreen : "rgba(0,96,80,0.08)",
                              "&:hover": {
                                bgcolor: isPlaying ? "#004840" : "rgba(0,96,80,0.16)",
                              },
                            }}
                          >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit track" arrow>
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
                        <Tooltip title="Delete track" arrow>
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
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
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
        title={isEdit ? "Edit music track" : "Add music track"}
        subtitle={
          isEdit
            ? "Update details or replace the audio file. Leave file empty to keep the current track."
            : "Uploads play on the public home page when active."
        }
        icon={<LibraryMusicIcon />}
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
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add track"}
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
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              sx={inputSx}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Sort order"
                type="number"
                fullWidth
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                sx={inputSx}
              />
              <Box sx={{ flex: 1, px: 0.5, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: textMuted,
                    mb: 0.5,
                  }}
                >
                  Volume ({Math.round(form.volume * 100)}%)
                </Typography>
                <Slider
                  value={form.volume}
                  min={0.05}
                  max={1}
                  step={0.05}
                  onChange={(_e, v) => setForm((f) => ({ ...f, volume: v }))}
                  sx={{ color: primaryGreen }}
                />
              </Box>
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen } }}
                />
              }
              label={
                <Typography sx={{ fontFamily: fontBody, fontWeight: 600, color: textPrimary }}>
                  Active on public home
                </Typography>
              }
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setForm((f) => ({
                  ...f,
                  file,
                  title: f.title || (file ? file.name.replace(/\.[^.]+$/, "") : ""),
                }));
              }}
            />
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "1.5px dashed rgba(0,96,80,0.35)",
                borderRadius: "16px",
                bgcolor: warmCream,
                px: 2.5,
                py: 3,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                maxWidth: "100%",
                overflow: "hidden",
                "&:hover": {
                  borderColor: primaryGreen,
                  bgcolor: "rgba(0,96,80,0.06)",
                },
              }}
            >
              <CloudUploadIcon sx={{ color: primaryGreen, fontSize: 36, mb: 0.5 }} />
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontWeight: 700,
                  color: textPrimary,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  px: 1,
                }}
                title={form.file?.name || form.existingFileLabel || undefined}
              >
                {form.file
                  ? form.file.name
                  : isEdit
                    ? form.existingFileLabel || "Keep current file (or choose a new one)"
                    : "Choose audio file"}
              </Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textMuted, mt: 0.5 }}>
                {isEdit
                  ? "Optional — pick a new file only if you want to replace the audio"
                  : "MP3, WAV, OGG, M4A up to 20MB"}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </PremiumDialog>
    </Box>
  );
}
