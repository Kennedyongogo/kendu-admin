import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  Alert,
  Avatar,
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditIcon from "@mui/icons-material/Edit";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
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

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(n) {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function emptyBriefingForm() {
  return {
    title: "",
    body: "",
    excerpt: "",
    department_id: "school",
    is_pinned: false,
    is_published: true,
    requires_acknowledgement: false,
  };
}

function StatChip({ label, value, accent }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: "12px",
        bgcolor: "rgba(0,96,80,0.05)",
        border: "1px solid rgba(0,96,80,0.1)",
        minWidth: 100,
      }}
    >
      <Typography
        sx={{
          fontFamily: fontBody,
          fontSize: "0.62rem",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: textMuted,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: fontDisplay,
          fontWeight: 700,
          fontSize: "1.2rem",
          color: accent || primaryGreen,
          lineHeight: 1.15,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function StaffCommons() {
  const currentUser = getPortalUser();
  const isAdmin = currentUser?.role === "admin";
  const token = getPortalToken();

  const [tab, setTab] = useState("briefings");
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const [briefings, setBriefings] = useState([]);
  const [briefingsLoading, setBriefingsLoading] = useState(true);
  const [briefingSearch, setBriefingSearch] = useState("");
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [briefingDetailLoading, setBriefingDetailLoading] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyBriefingForm());
  const [saving, setSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceSearch, setResourceSearch] = useState("");

  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const messagesEndRef = useRef(null);

  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    if (!token) return;
    setLoadingOverview(true);
    try {
      const res = await fetch("/api/staff-commons/overview", { headers: authJsonHeaders(token) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load overview");
      setOverview(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOverview(false);
    }
  }, [token]);

  const loadBriefings = useCallback(async () => {
    if (!token) return;
    setBriefingsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (briefingSearch.trim()) params.set("search", briefingSearch.trim());
      const res = await fetch(`/api/staff-commons/briefings?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load briefings");
      setBriefings(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBriefingsLoading(false);
    }
  }, [token, briefingSearch]);

  const loadResources = useCallback(async () => {
    if (!token) return;
    setResourcesLoading(true);
    try {
      const params = new URLSearchParams();
      if (resourceSearch.trim()) params.set("search", resourceSearch.trim());
      const res = await fetch(`/api/staff-commons/resources?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load resources");
      setResources(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setResourcesLoading(false);
    }
  }, [token, resourceSearch]);

  const loadChannels = useCallback(async () => {
    if (!token) return;
    setChannelsLoading(true);
    try {
      const res = await fetch("/api/staff-commons/channels", { headers: authJsonHeaders(token) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load channels");
      setChannels(data.data || []);
      setActiveChannelId((prev) => prev || data.data?.[0]?.id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setChannelsLoading(false);
    }
  }, [token]);

  const loadMessages = useCallback(async () => {
    if (!token || !activeChannelId) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/staff-commons/channels/${activeChannelId}/messages`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load messages");
      setMessages(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setMessagesLoading(false);
    }
  }, [token, activeChannelId]);

  const loadDepartments = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await fetch("/api/departments", { headers: authJsonHeaders(token) });
      const data = await res.json();
      if (res.ok && data.success) setDepartments(data.data || []);
    } catch {
      /* optional */
    }
  }, [token, isAdmin]);

  useEffect(() => {
    loadOverview();
    loadDepartments();
  }, [loadOverview, loadDepartments]);

  useEffect(() => {
    if (tab !== "briefings") return undefined;
    const t = setTimeout(() => loadBriefings(), briefingSearch ? 350 : 0);
    return () => clearTimeout(t);
  }, [tab, briefingSearch, loadBriefings]);

  useEffect(() => {
    if (tab === "resources") loadResources();
    if (tab === "channels") loadChannels();
  }, [tab, loadResources, loadChannels]);

  useEffect(() => {
    if (tab !== "resources") return undefined;
    const t = setTimeout(() => loadResources(), resourceSearch ? 350 : 0);
    return () => clearTimeout(t);
  }, [tab, resourceSearch, loadResources]);

  useEffect(() => {
    if (tab === "channels" && activeChannelId) loadMessages();
  }, [tab, activeChannelId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  const openBriefingDetail = async (id) => {
    setBriefingDetailLoading(true);
    try {
      const res = await fetch(`/api/staff-commons/briefings/${id}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load briefing");
      setSelectedBriefing(data.data);
      if (!data.data.is_read) {
        await fetch(`/api/staff-commons/briefings/${id}/read`, {
          method: "POST",
          headers: authJsonHeaders(token),
        });
        loadOverview();
        loadBriefings();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not open briefing", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setBriefingDetailLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyBriefingForm());
    setPendingFiles([]);
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      body: item.body || "",
      excerpt: item.excerpt || "",
      department_id: item.department_id || "school",
      is_pinned: Boolean(item.is_pinned),
      is_published: Boolean(item.is_published),
      requires_acknowledgement: Boolean(item.requires_acknowledgement),
    });
    setPendingFiles([]);
    setDialogOpen(true);
  };

  const saveBriefing = async () => {
    if (!form.title.trim()) {
      Swal.fire({ icon: "warning", title: "Title required", confirmButtonColor: primaryGreen });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("body", form.body || "");
      fd.append("excerpt", form.excerpt || "");
      fd.append("department_id", form.department_id);
      fd.append("is_pinned", String(form.is_pinned));
      fd.append("is_published", String(form.is_published));
      fd.append("requires_acknowledgement", String(form.requires_acknowledgement));
      pendingFiles.forEach((f) => fd.append("attachments", f));

      const url = editingId ? `/api/staff-commons/briefings/${editingId}` : "/api/staff-commons/briefings";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");

      setDialogOpen(false);
      Swal.fire({
        icon: "success",
        title: editingId ? "Briefing updated" : "Briefing published",
        timer: 1400,
        showConfirmButton: false,
      });
      loadBriefings();
      loadOverview();
      if (tab === "resources") loadResources();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSaving(false);
    }
  };

  const deleteBriefing = async (item) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete briefing?",
      text: item.title,
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/staff-commons/briefings/${item.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      if (selectedBriefing?.id === item.id) setSelectedBriefing(null);
      loadBriefings();
      loadOverview();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err.message, confirmButtonColor: primaryGreen });
    }
  };

  const postMessage = async () => {
    const body = messageDraft.trim();
    if (!body || !activeChannelId) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/staff-commons/channels/${activeChannelId}/messages`, {
        method: "POST",
        headers: authJsonHeaders(token, true),
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not send message");
      setMessageDraft("");
      setMessages((prev) => [...prev, data.data]);
      loadChannels();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Send failed", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setPosting(false);
    }
  };

  if (loadingOverview && !overview) {
    return <BrandPageLoader message="Loading Staff Commons…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Staff Commons"
        subtitle={
          isAdmin
            ? "Internal briefings, department channels, and downloadable updates for admin and staff."
            : "Read briefings, join your department channel, and download school updates."
        }
        icon={<GroupsRoundedIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => {
                loadOverview();
                if (tab === "briefings") loadBriefings();
                if (tab === "resources") loadResources();
                if (tab === "channels") {
                  loadChannels();
                  loadMessages();
                }
              }}
              sx={{ ...ghostBtnSx, color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
            >
              Refresh
            </Button>
            {isAdmin && tab === "briefings" ? (
              <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
                New briefing
              </HeroActionButton>
            ) : null}
          </Stack>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
        <StatChip label="Briefings" value={overview?.briefings ?? "—"} />
        <StatChip
          label="Unread"
          value={overview?.unread_briefings ?? "—"}
          accent={overview?.unread_briefings ? "#9a6700" : primaryGreen}
        />
        <StatChip label="Downloads" value={overview?.resources ?? "—"} />
        <StatChip label="Channels" value={overview?.channels ?? "—"} />
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          minHeight: 42,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 700,
            fontFamily: fontBody,
            minHeight: 42,
          },
          "& .Mui-selected": { color: `${primaryGreen} !important` },
          "& .MuiTabs-indicator": { bgcolor: primaryGreen, height: 3, borderRadius: 2 },
        }}
      >
        <Tab value="briefings" icon={<CampaignRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Briefings" />
        <Tab value="channels" icon={<ChatRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Channels" />
        <Tab value="resources" icon={<FolderOpenRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Resources" />
      </Tabs>

      {tab === "briefings" ? (
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              size="small"
              placeholder="Search briefings…"
              value={briefingSearch}
              onChange={(e) => setBriefingSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadBriefings()}
              sx={{ ...inputSx, mb: 1.5, maxWidth: 360 }}
            />
            {briefingsLoading ? <LinearProgress sx={{ mb: 1, "& .MuiLinearProgress-bar": { bgcolor: primaryGreen } }} /> : null}
            <Stack spacing={1.25}>
              {briefings.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => openBriefingDetail(item.id)}
                  sx={{
                    p: 1.75,
                    borderRadius: "16px",
                    border: `1px solid ${selectedBriefing?.id === item.id ? primaryGreen : "rgba(0,96,80,0.12)"}`,
                    bgcolor: selectedBriefing?.id === item.id ? "rgba(0,96,80,0.04)" : "var(--kd-surface)",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background-color 0.15s",
                    "&:hover": { bgcolor: "rgba(0,96,80,0.03)" },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                        {item.is_pinned ? (
                          <Chip size="small" icon={<PushPinRoundedIcon sx={{ fontSize: "14px !important" }} />} label="Pinned" sx={{ fontWeight: 700, height: 22 }} />
                        ) : null}
                        {!item.is_read ? (
                          <Chip size="small" label="Unread" sx={{ fontWeight: 700, height: 22, bgcolor: "rgba(154,103,0,0.12)", color: "#9a6700" }} />
                        ) : null}
                        <Chip
                          size="small"
                          label={item.department_name || "School-wide"}
                          sx={{ fontWeight: 700, height: 22, bgcolor: "rgba(0,96,80,0.08)", color: primaryGreen }}
                        />
                      </Stack>
                      <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.05rem" }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem", color: textSecondary, mt: 0.35, lineHeight: 1.45 }}>
                        {item.excerpt || "No preview"}
                      </Typography>
                      <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted, mt: 0.75 }}>
                        {formatDate(item.published_at || item.created_at)}
                        {item.attachments?.length ? ` · ${item.attachments.length} file(s)` : ""}
                      </Typography>
                    </Box>
                    {isAdmin ? (
                      <Stack direction="row" spacing={0.25} onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => openEditDialog(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteBriefing(item)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ) : null}
                  </Stack>
                </Box>
              ))}
              {!briefingsLoading && !briefings.length ? (
                <Box sx={{ py: 6, textAlign: "center", borderRadius: "16px", border: "1px dashed rgba(0,96,80,0.2)", bgcolor: warmCream }}>
                  <Typography sx={{ fontFamily: fontBody, color: textSecondary }}>No briefings yet.</Typography>
                </Box>
              ) : null}
            </Stack>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", lg: 380 },
              flexShrink: 0,
              borderRadius: "18px",
              border: "1px solid rgba(0,96,80,0.12)",
              bgcolor: "var(--kd-surface)",
              p: 2,
              minHeight: 320,
            }}
          >
            {briefingDetailLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                <CircularProgress size={28} sx={{ color: primaryGreen }} />
              </Stack>
            ) : selectedBriefing ? (
              <Stack spacing={1.5}>
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.25rem", color: textPrimary }}>
                  {selectedBriefing.title}
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={selectedBriefing.department_name || "School-wide"} sx={{ fontWeight: 700 }} />
                  {selectedBriefing.is_read ? (
                    <Chip size="small" icon={<CheckCircleRoundedIcon />} label="Read" color="success" variant="outlined" />
                  ) : null}
                  {selectedBriefing.requires_acknowledgement && selectedBriefing.read_stats ? (
                    <Chip
                      size="small"
                      icon={<MarkEmailReadRoundedIcon />}
                      label={`${selectedBriefing.read_stats.read_count}/${selectedBriefing.read_stats.total_staff} acknowledged`}
                      sx={{ fontWeight: 700 }}
                    />
                  ) : null}
                </Stack>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.88rem", color: textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {selectedBriefing.body || selectedBriefing.excerpt || "—"}
                </Typography>
                {(selectedBriefing.attachments || []).length ? (
                  <Stack spacing={0.75}>
                    <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: textMuted }}>
                      Attachments
                    </Typography>
                    {selectedBriefing.attachments.map((att) => (
                      <Button
                        key={att.id}
                        size="small"
                        startIcon={<DownloadRoundedIcon />}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 700 }}
                      >
                        {att.original_name || att.filename}
                      </Button>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240, textAlign: "center" }}>
                <CampaignRoundedIcon sx={{ fontSize: 40, color: primaryGreen, opacity: 0.4, mb: 1 }} />
                <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.88rem" }}>
                  Select a briefing to read the full memo and download attachments.
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      ) : null}

      {tab === "channels" ? (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ minHeight: 480 }}>
          <Box
            sx={{
              width: { xs: "100%", md: 260 },
              flexShrink: 0,
              borderRadius: "16px",
              border: "1px solid rgba(0,96,80,0.12)",
              bgcolor: "var(--kd-surface)",
              overflow: "hidden",
            }}
          >
            {channelsLoading ? <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: primaryGreen } }} /> : null}
            <Stack spacing={0}>
              {channels.map((ch) => (
                <Box
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    cursor: "pointer",
                    bgcolor: activeChannelId === ch.id ? "rgba(0,96,80,0.08)" : "transparent",
                    borderLeft: activeChannelId === ch.id ? `3px solid ${primaryGreen}` : "3px solid transparent",
                    "&:hover": { bgcolor: "rgba(0,96,80,0.04)" },
                  }}
                >
                  <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.88rem", color: textPrimary }}>
                    {ch.name}
                  </Typography>
                  <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                    {ch.is_school_wide ? "All staff" : ch.department_name || "Department"}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              borderRadius: "16px",
              border: "1px solid rgba(0,96,80,0.12)",
              bgcolor: "var(--kd-surface)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid rgba(0,96,80,0.08)", bgcolor: warmCream }}>
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary }}>
                {activeChannel?.name || "Select a channel"}
              </Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary }}>
                {activeChannel?.description || "Department and school-wide staff discussion"}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.5, minHeight: 280 }}>
              {messagesLoading ? (
                <Stack alignItems="center" py={4}>
                  <CircularProgress size={24} sx={{ color: primaryGreen }} />
                </Stack>
              ) : (
                <Stack spacing={1.25}>
                  {messages.map((msg) => {
                    const mine = msg.user_id === currentUser?.id;
                    return (
                      <Stack
                        key={msg.id}
                        direction="row"
                        spacing={1}
                        justifyContent={mine ? "flex-end" : "flex-start"}
                        alignItems="flex-end"
                      >
                        {!mine ? (
                          <Avatar sx={{ width: 28, height: 28, bgcolor: primaryGreen, fontSize: "0.75rem" }}>
                            {(msg.author_name || "?")[0]}
                          </Avatar>
                        ) : null}
                        <Box
                          sx={{
                            maxWidth: "78%",
                            px: 1.25,
                            py: 0.85,
                            borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                            bgcolor: mine ? primaryGreen : "rgba(0,96,80,0.06)",
                            color: mine ? "#fff" : textPrimary,
                          }}
                        >
                          {!mine ? (
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, opacity: 0.85, mb: 0.25 }}>
                              {msg.author_name}
                            </Typography>
                          ) : null}
                          <Typography sx={{ fontFamily: fontBody, fontSize: "0.86rem", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                            {msg.body}
                          </Typography>
                          <Typography sx={{ fontSize: "0.62rem", opacity: 0.7, mt: 0.35, textAlign: "right" }}>
                            {formatDateTime(msg.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Stack>
              )}
            </Box>

            {activeChannel?.can_post !== false ? (
              <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: "1px solid rgba(0,96,80,0.08)" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a message…"
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      postMessage();
                    }
                  }}
                  sx={inputSx}
                  multiline
                  maxRows={3}
                />
                <IconButton
                  onClick={postMessage}
                  disabled={posting || !messageDraft.trim()}
                  sx={{ bgcolor: primaryGreen, color: "#fff", "&:hover": { bgcolor: navy }, "&.Mui-disabled": { bgcolor: "rgba(0,96,80,0.2)" } }}
                >
                  {posting ? <CircularProgress size={20} color="inherit" /> : <SendRoundedIcon />}
                </IconButton>
              </Stack>
            ) : (
              <Box sx={{ p: 1.5, borderTop: "1px solid rgba(0,96,80,0.08)", bgcolor: warmCream }}>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textMuted, textAlign: "center" }}>
                  You can read this channel but cannot post here.
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      ) : null}

      {tab === "resources" ? (
        <Box>
          <TextField
            size="small"
            placeholder="Search files or briefing title…"
            value={resourceSearch}
            onChange={(e) => setResourceSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadResources()}
            sx={{ ...inputSx, mb: 1.5, maxWidth: 360 }}
          />
          {resourcesLoading ? <LinearProgress sx={{ mb: 1, "& .MuiLinearProgress-bar": { bgcolor: primaryGreen } }} /> : null}
          <Stack spacing={1}>
            {resources.map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  p: 1.5,
                  borderRadius: "14px",
                  border: "1px solid rgba(0,96,80,0.1)",
                  bgcolor: "var(--kd-surface)",
                  flexWrap: "wrap",
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                  <AttachFileIcon sx={{ color: primaryGreen }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary }} noWrap>
                      {r.original_name}
                    </Typography>
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.75rem", color: textMuted }}>
                      {r.briefing_title} · {r.department_name} · {formatBytes(r.file_size)}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ...primaryBtnSx, textTransform: "none", fontWeight: 700 }}
                >
                  Download
                </Button>
              </Box>
            ))}
            {!resourcesLoading && !resources.length ? (
              <Box sx={{ py: 6, textAlign: "center", borderRadius: "16px", border: "1px dashed rgba(0,96,80,0.2)", bgcolor: warmCream }}>
                <Typography sx={{ fontFamily: fontBody, color: textSecondary }}>No downloadable files yet.</Typography>
              </Box>
            ) : null}
          </Stack>
        </Box>
      ) : null}

      <PremiumDialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        title={editingId ? "Edit briefing" : "New staff briefing"}
        subtitle="Published to staff in the selected scope. Attach circulars and policy updates."
        icon={<CampaignRoundedIcon sx={{ color: primaryGreen }} />}
        maxWidth="md"
        footer={
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button onClick={saveBriefing} disabled={saving} variant="contained" sx={primaryBtnSx}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Publish briefing"}
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth
            required
            sx={inputSx}
          />
          <TextField
            select
            label="Audience scope"
            value={form.department_id}
            onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value }))}
            fullWidth
            sx={inputSx}
          >
            <MenuItem value="school">School-wide (all staff)</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Body"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            fullWidth
            multiline
            minRows={5}
            sx={inputSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControlLabel
              control={<Switch checked={form.is_pinned} onChange={(e) => setForm((f) => ({ ...f, is_pinned: e.target.checked }))} />}
              label="Pin to top"
            />
            <FormControlLabel
              control={<Switch checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />}
              label="Published"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.requires_acknowledgement}
                  onChange={(e) => setForm((f) => ({ ...f, requires_acknowledgement: e.target.checked }))}
                />
              }
              label="Require acknowledgement"
            />
          </Stack>
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => setPendingFiles(Array.from(e.target.files || []))}
            />
            <Button startIcon={<AttachFileIcon />} onClick={() => fileInputRef.current?.click()} sx={ghostBtnSx}>
              Attach files
            </Button>
            {pendingFiles.length ? (
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary, mt: 0.75 }}>
                {pendingFiles.map((f) => f.name).join(", ")}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
