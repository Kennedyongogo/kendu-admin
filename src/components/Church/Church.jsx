import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Church as ChurchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  DesignServices as DesignIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  Send as SendIcon,
  TaskAlt as ApproveIcon,
  Block as RejectIcon,
  EventBusy as CancelIcon,
  DeleteOutline as DeleteIcon,
  Refresh as RefreshIcon,
  EventSeat as SeatIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { PremiumDialog, fadeUp } from "../Users/usersUi";
import {
  accentGold,
  fontBody,
  fontDisplay,
  ghostBtnSx,
  inputSx,
  navy,
  primaryBtnSx,
  primaryDark,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import { alertError, confirmAction, EmptyNote, toastSuccess } from "../Meals/mealsShared";
import {
  CapacityBar,
  churchApi,
  formatServiceWhen,
  formatTimeOnly,
  fromLocalInput,
  StatusChip,
  toLocalInput,
} from "./churchShared";

const FILTERS = [
  { value: "upcoming", label: "Upcoming", query: "when=upcoming&status=approved,pending,draft,rejected" },
  { value: "pending", label: "Needs approval", query: "status=pending" },
  { value: "drafts", label: "Drafts", query: "status=draft,rejected" },
  { value: "past", label: "Past", query: "when=past&status=approved" },
  { value: "cancelled", label: "Cancelled", query: "status=cancelled" },
];

function DateBlock({ value, status }) {
  const d = new Date(value);
  const valid = !Number.isNaN(d.getTime());
  const muted = status === "cancelled";
  return (
    <Box
      sx={{
        width: 62,
        flexShrink: 0,
        borderRadius: "14px",
        overflow: "hidden",
        textAlign: "center",
        border: "1px solid rgba(27,94,168,0.14)",
        bgcolor: "var(--kd-surface)",
        opacity: muted ? 0.55 : 1,
      }}
    >
      <Box sx={{ bgcolor: muted ? "#64748b" : navy, color: "#fff", py: 0.35 }}>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em" }}>
          {valid ? d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase() : "—"}
        </Typography>
      </Box>
      <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.55rem", color: textPrimary, lineHeight: 1.2, pt: 0.3 }}>
        {valid ? d.getDate() : "?"}
      </Typography>
      <Typography sx={{ fontFamily: fontBody, fontSize: "0.64rem", fontWeight: 800, color: textMuted, pb: 0.5 }}>
        {valid ? d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase() : ""}
      </Typography>
    </Box>
  );
}

function ServiceCard({ service, index, onAction }) {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const s = service;
  const primary =
    s.status === "approved" || s.status === "cancelled"
      ? { label: "Monitor bookings", icon: <VisibilityIcon />, go: () => navigate(`/church/${s.id}`) }
      : s.status === "pending"
        ? { label: "Review & approve", icon: <ApproveIcon />, go: () => navigate(`/church/${s.id}/design`) }
        : { label: "Open designer", icon: <DesignIcon />, go: () => navigate(`/church/${s.id}/design`) };

  const items = [
    s.status !== "cancelled" && { key: "design", label: "Design seating", icon: <DesignIcon fontSize="small" /> },
    { key: "monitor", label: "Booking monitor", icon: <VisibilityIcon fontSize="small" /> },
    { key: "duplicate", label: "Duplicate for another date", icon: <CopyIcon fontSize="small" /> },
    ["draft", "rejected"].includes(s.status) && { key: "submit", label: "Submit for approval", icon: <SendIcon fontSize="small" /> },
    ["draft", "pending"].includes(s.status) && { key: "approve", label: "Approve", icon: <ApproveIcon fontSize="small" /> },
    s.status === "pending" && { key: "reject", label: "Reject", icon: <RejectIcon fontSize="small" /> },
    "divider",
    s.status !== "cancelled" && { key: "cancel", label: "Cancel service", icon: <CancelIcon fontSize="small" />, danger: true },
    !s.booked_count && { key: "delete", label: "Delete", icon: <DeleteIcon fontSize="small" />, danger: true },
  ].filter(Boolean);

  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      sx={{
        borderRadius: "18px",
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(27,94,168,0.1)",
        boxShadow: "0 14px 36px -22px rgba(20,26,58,0.22)",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 20px 44px -22px rgba(20,26,58,0.32)" },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <DateBlock value={s.starts_at} status={s.status} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <StatusChip status={s.status} />
            <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Service actions">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: "1.08rem",
              color: textPrimary,
              lineHeight: 1.25,
              mt: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {s.title}
          </Typography>
          {s.service_type ? (
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: primaryGreen, fontWeight: 700, mt: 0.25 }}>
              {s.service_type}
            </Typography>
          ) : null}
        </Box>
      </Stack>

      <Stack spacing={0.6}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <ScheduleIcon sx={{ fontSize: 16, color: textMuted }} />
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary }}>
            {formatServiceWhen(s.starts_at)}
            {s.ends_at ? ` – ${formatTimeOnly(s.ends_at)}` : ""}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <SeatIcon sx={{ fontSize: 16, color: textMuted }} />
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary }}>
            {s.bookable_seat_count} bookable of {s.seat_count} seats
            {s.status === "approved" && !s.has_started
              ? s.booking_open
                ? ` · booking closes ${formatTimeOnly(s.booking_closes_at)}`
                : " · booking closed"
              : ""}
          </Typography>
        </Stack>
        {s.created_by ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <PersonIcon sx={{ fontSize: 16, color: textMuted }} />
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted }}>
              Created by {s.created_by.full_name}
              {s.reviewed_by && s.status === "approved" ? ` · approved by ${s.reviewed_by.full_name}` : ""}
            </Typography>
          </Stack>
        ) : null}
      </Stack>

      {s.status === "rejected" && s.review_note ? (
        <Box sx={{ borderRadius: "12px", bgcolor: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.16)", px: 1.5, py: 1 }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: "#991b1b" }}>
            <b>Returned:</b> {s.review_note}
          </Typography>
        </Box>
      ) : null}

      {["approved", "cancelled"].includes(s.status) ? (
        <Box>
          <CapacityBar booked={s.booked_count} total={s.bookable_seat_count} />
          {s.has_started && s.booked_count ? (
            <Stack direction="row" spacing={1.5} sx={{ mt: 0.75 }}>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", fontWeight: 800, color: "#047857" }}>
                {s.present_count} attended
              </Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", fontWeight: 800, color: "#b91c1c" }}>
                {s.absent_count} absent
              </Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", fontWeight: 700, color: textMuted }}>
                {Math.max(s.booked_count - s.present_count - s.absent_count, 0)} unchecked
              </Typography>
            </Stack>
          ) : null}
        </Box>
      ) : null}

      <Box sx={{ flex: 1 }} />
      <Button
        onClick={primary.go}
        startIcon={primary.icon}
        fullWidth
        sx={{
          ...(s.status === "pending" ? primaryBtnSx : {}),
          fontFamily: fontBody,
          fontWeight: 700,
          textTransform: "none",
          borderRadius: "12px",
          py: 1,
          ...(s.status !== "pending"
            ? {
                bgcolor: "rgba(27,94,168,0.08)",
                color: primaryDark,
                "&:hover": { bgcolor: "rgba(27,94,168,0.14)" },
              }
            : {}),
        }}
      >
        {primary.label}
      </Button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { borderRadius: "14px", minWidth: 230, boxShadow: "0 18px 44px -14px rgba(20,26,58,0.3)" } } }}
      >
        {items.map((item, i) =>
          item === "divider" ? (
            <Divider key={`d${i}`} sx={{ my: 0.5 }} />
          ) : (
            <MenuItem
              key={item.key}
              onClick={() => {
                setAnchor(null);
                onAction(item.key, s);
              }}
              sx={{ fontFamily: fontBody, py: 1, color: item.danger ? "#b91c1c" : textPrimary }}
            >
              <ListItemIcon sx={{ color: item.danger ? "#b91c1c" : primaryGreen, minWidth: 34 }}>{item.icon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontFamily: fontBody, fontSize: "0.86rem", fontWeight: 600 }}>
                {item.label}
              </ListItemText>
            </MenuItem>
          )
        )}
      </Menu>
    </Box>
  );
}

function DuplicateDialog({ service, onClose, onDone }) {
  const [form, setForm] = useState({ title: "", starts_at: "", ends_at: "", booking_closes_at: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!service) return;
    const week = 7 * 24 * 3600 * 1000;
    const next = (v) => (v ? toLocalInput(new Date(new Date(v).getTime() + week)) : "");
    setForm({
      title: service.title,
      starts_at: next(service.starts_at),
      ends_at: next(service.ends_at),
      booking_closes_at: service.booking_closes_at && service.booking_closes_at !== service.starts_at ? next(service.booking_closes_at) : "",
    });
  }, [service]);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await churchApi(`/services/${service.id}/duplicate`, {
        method: "POST",
        body: {
          title: form.title,
          starts_at: fromLocalInput(form.starts_at),
          ends_at: fromLocalInput(form.ends_at),
          booking_closes_at: fromLocalInput(form.booking_closes_at),
        },
      });
      onDone(res.data);
    } catch (err) {
      alertError("Could not duplicate", err);
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <PremiumDialog
      open={Boolean(service)}
      onClose={onClose}
      title="Duplicate service"
      subtitle="Same seating plan, new date. It starts as a draft."
      icon={<CopyIcon />}
      footer={
        <>
          <Button onClick={onClose} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !form.title || !form.starts_at} sx={primaryBtnSx}>
            {saving ? <CircularProgress size={18} /> : "Create copy"}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="Title" value={form.title} onChange={set("title")} sx={inputSx} fullWidth />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField type="datetime-local" label="Starts" value={form.starts_at} onChange={set("starts_at")} sx={inputSx} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField type="datetime-local" label="Ends" value={form.ends_at} onChange={set("ends_at")} sx={inputSx} fullWidth InputLabelProps={{ shrink: true }} />
        </Stack>
        <TextField
          type="datetime-local"
          label="Booking closes (optional)"
          helperText="Leave empty to close booking when the service starts."
          value={form.booking_closes_at}
          onChange={set("booking_closes_at")}
          sx={inputSx}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
    </PremiumDialog>
  );
}

export default function Church() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = FILTERS.find((f) => f.value === searchParams.get("view")) || FILTERS[0];
  const [services, setServices] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [duplicating, setDuplicating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, pending] = await Promise.all([
        churchApi(`/services?${filter.query}&limit=120`),
        churchApi(`/services?status=pending&limit=1`),
      ]);
      setServices(list.data.services);
      setPendingCount(pending.data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter.query]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const approved = services.filter((s) => s.status === "approved");
    return {
      services: services.length,
      booked: approved.reduce((n, s) => n + s.booked_count, 0),
      seats: approved.reduce((n, s) => n + s.bookable_seat_count, 0),
    };
  }, [services]);

  const onAction = async (key, s) => {
    try {
      if (key === "design") return navigate(`/church/${s.id}/design`);
      if (key === "monitor") return navigate(`/church/${s.id}`);
      if (key === "duplicate") return setDuplicating(s);
      if (key === "submit") {
        await churchApi(`/services/${s.id}/submit`, { method: "POST" });
        toastSuccess("Submitted", "The service is waiting for approval.");
      } else if (key === "approve") {
        const ok = await confirmAction({
          title: "Approve this service?",
          text: "Students will see it in the portal and can start booking seats.",
          confirmText: "Approve",
        });
        if (!ok) return;
        await churchApi(`/services/${s.id}/approve`, { method: "POST", body: {} });
        toastSuccess("Approved", "Booking is now open.");
      } else if (key === "reject") {
        const { value: note, isConfirmed } = await Swal.fire({
          title: "Return for changes",
          input: "textarea",
          inputLabel: "What needs to change?",
          inputPlaceholder: "e.g. Add the side gallery seats",
          showCancelButton: true,
          confirmButtonText: "Reject",
          confirmButtonColor: "#b91c1c",
          reverseButtons: true,
          inputValidator: (v) => (!v?.trim() ? "Please give a reason." : undefined),
        });
        if (!isConfirmed) return;
        await churchApi(`/services/${s.id}/reject`, { method: "POST", body: { note } });
        toastSuccess("Returned", "The creator can edit and resubmit.");
      } else if (key === "cancel") {
        const ok = await confirmAction({
          title: "Cancel this service?",
          text: s.booked_count
            ? `${s.booked_count} booking(s) will be released and every booker notified.`
            : "The service will no longer be bookable.",
          confirmText: "Cancel service",
          danger: true,
        });
        if (!ok) return;
        const res = await churchApi(`/services/${s.id}/cancel`, { method: "POST", body: {} });
        toastSuccess("Cancelled", res.message);
      } else if (key === "delete") {
        const ok = await confirmAction({
          title: "Delete this service?",
          text: "The service and its seating plan will be removed permanently.",
          confirmText: "Delete",
          danger: true,
        });
        if (!ok) return;
        await churchApi(`/services/${s.id}`, { method: "DELETE" });
        toastSuccess("Deleted");
      }
      load();
    } catch (err) {
      alertError("Action failed", err);
    }
    return undefined;
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 72px)",
        mx: { xs: -1.5, sm: -2, md: -3 },
        mt: { xs: -1, sm: -1.5 },
        mb: { xs: -1.5, sm: -2, md: -3 },
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--kd-page-b)",
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55 }}
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 1.5, sm: 1.75 },
          background: `linear-gradient(125deg, ${navy} 0%, ${primaryDark} 42%, ${primaryGreen} 100%)`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ position: "absolute", top: -80, right: -40, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(200,168,64,0.16)", pointerEvents: "none" }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" spacing={1.1} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                flexShrink: 0,
              }}
            >
              <ChurchIcon sx={{ color: accentGold, fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.68)", lineHeight: 1.2 }}>
                Spiritual life
              </Typography>
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: { xs: "1.35rem", sm: "1.5rem" }, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                Church services
              </Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.35, mt: 0.2, display: { xs: "none", sm: "block" } }}>
                Design the seating for each service, approve it, then follow bookings and attendance live.
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={load} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.18)" } }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button startIcon={<AddIcon />} onClick={() => navigate("/church/new")} sx={{ ...primaryBtnSx, py: 1 }}>
              New service
            </Button>
          </Stack>
        </Stack>

        <Tabs
          value={filter.value}
          onChange={(_, v) => setSearchParams(v === FILTERS[0].value ? {} : { view: v }, { replace: true })}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mt: 1.25,
            position: "relative",
            zIndex: 1,
            minHeight: 38,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontFamily: fontBody, minHeight: 38, color: "rgba(255,255,255,0.62)", px: 1.5, fontSize: "0.88rem" },
            "& .Mui-selected": { color: "#fff !important" },
            "& .MuiTabs-indicator": { bgcolor: accentGold, height: 3, borderRadius: 2 },
            "& .MuiTabs-scrollButtons": { color: "#fff" },
          }}
        >
          {FILTERS.map((f) => (
            <Tab
              key={f.value}
              value={f.value}
              label={
                f.value === "pending" && pendingCount ? (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <span>{f.label}</span>
                    <Box component="span" sx={{ bgcolor: accentGold, color: navy, borderRadius: "10px", px: 0.8, fontSize: "0.7rem", fontWeight: 800, lineHeight: "18px" }}>
                      {pendingCount}
                    </Box>
                  </Stack>
                ) : (
                  f.label
                )
              }
            />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          flex: 1,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, sm: 3 },
          background: `
            radial-gradient(ellipse 80% 50% at 100% 0%, rgba(27,94,168,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 0% 100%, rgba(200,168,64,0.08) 0%, transparent 50%),
            var(--kd-page-b)
          `,
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto" }}>
          {filter.value === "upcoming" && !loading && services.length ? (
            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, flexWrap: "wrap", rowGap: 1.5 }}>
              {[
                { label: "Upcoming services", value: stats.services },
                { label: "Seats booked", value: stats.booked },
                { label: "Seats still free", value: Math.max(stats.seats - stats.booked, 0) },
                { label: "Waiting for approval", value: pendingCount },
              ].map((c) => (
                <Box key={c.label} sx={{ flex: "1 1 160px", borderRadius: "16px", bgcolor: "var(--kd-surface)", border: "1px solid rgba(27,94,168,0.1)", px: 2, py: 1.5 }}>
                  <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.6rem", color: textPrimary, lineHeight: 1.1 }}>{c.value}</Typography>
                  <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", fontWeight: 700, color: textMuted }}>{c.label}</Typography>
                </Box>
              ))}
            </Stack>
          ) : null}

          {loading ? (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <CircularProgress sx={{ color: primaryGreen }} />
            </Stack>
          ) : error ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
              <Typography sx={{ fontFamily: fontBody, color: "#b91c1c" }}>{error}</Typography>
              <Button onClick={load} sx={ghostBtnSx}>
                Try again
              </Button>
            </Stack>
          ) : !services.length ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 7 }}>
              <Box sx={{ width: 76, height: 76, borderRadius: "22px", display: "grid", placeItems: "center", bgcolor: "rgba(27,94,168,0.08)" }}>
                <ChurchIcon sx={{ fontSize: 38, color: primaryGreen }} />
              </Box>
              <EmptyNote>
                {filter.value === "pending"
                  ? "Nothing is waiting for approval."
                  : "No services here yet. Create one and draw its seating plan."}
              </EmptyNote>
              {filter.value !== "pending" ? (
                <Button startIcon={<AddIcon />} onClick={() => navigate("/church/new")} sx={primaryBtnSx}>
                  New service
                </Button>
              ) : null}
            </Stack>
          ) : (
            <AnimatePresence>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>
                {services.map((s, i) => (
                  <ServiceCard key={s.id} service={s} index={i} onAction={onAction} />
                ))}
              </Box>
            </AnimatePresence>
          )}
        </Box>
      </Box>

      <DuplicateDialog
        service={duplicating}
        onClose={() => setDuplicating(null)}
        onDone={(created) => {
          setDuplicating(null);
          toastSuccess("Copy created", "Adjust anything you need, then submit it.");
          navigate(`/church/${created.id}/design`);
        }}
      />
    </Box>
  );
}
