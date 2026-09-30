import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  DesignServices as DesignIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  RemoveCircleOutline as ClearIcon,
  EventSeat as SeatIcon,
  Download as DownloadIcon,
  PersonOff as ReleaseIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  fontBody,
  fontDisplay,
  ghostBtnSx,
  inputSx,
  navy,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import { alertError, confirmAction, EmptyNote, Panel, tableBodySx, tableHeadSx, toastSuccess } from "../Meals/mealsShared";
import {
  churchApi,
  formatServiceWhen,
  formatTimeOnly,
  SEAT_COLORS,
  SeatLegend,
  SeatMapSvg,
  seatStatusFor,
  StatusChip,
} from "./churchShared";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "available", label: "Available" },
  { value: "unchecked", label: "Not checked" },
  { value: "present", label: "Attended" },
  { value: "absent", label: "Absent" },
  { value: "blocked", label: "Blocked" },
];

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function StatCard({ label, value, color, hint }) {
  return (
    <Box
      sx={{
        flex: "1 1 130px",
        borderRadius: "16px",
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(27,94,168,0.1)",
        px: 2,
        py: 1.4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, bgcolor: color }} />
      <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.55rem", color: textPrimary, lineHeight: 1.1 }}>{value}</Typography>
      <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", fontWeight: 700, color: textMuted }}>{label}</Typography>
      {hint ? <Typography sx={{ fontFamily: fontBody, fontSize: "0.68rem", color: textMuted }}>{hint}</Typography> : null}
    </Box>
  );
}

function SeatStatusChip({ status }) {
  const c = SEAT_COLORS[status] || SEAT_COLORS.available;
  const text = status === "booked" || status === "mine" ? "Booked" : c.label;
  const light = status === "available" || status === "blocked";
  return (
    <Chip
      size="small"
      label={text}
      sx={{
        fontFamily: fontBody,
        fontWeight: 800,
        fontSize: "0.7rem",
        height: 22,
        bgcolor: light ? "rgba(27,94,168,0.08)" : c.fill,
        color: light ? c.text : "#fff",
        border: light ? `1px solid ${c.stroke}55` : "none",
      }}
    />
  );
}

function AttendanceButtons({ seat, onMark, busy, size = "small" }) {
  const att = seat.booking?.attendance || null;
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Attended">
        <span>
          <IconButton
            size={size}
            disabled={busy}
            onClick={() => onMark(seat, att === "present" ? null : "present")}
            sx={{ color: att === "present" ? "#fff" : "#047857", bgcolor: att === "present" ? "#059669" : "rgba(5,150,105,0.08)", "&:hover": { bgcolor: att === "present" ? "#047857" : "rgba(5,150,105,0.16)" } }}
          >
            <PresentIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Did not attend">
        <span>
          <IconButton
            size={size}
            disabled={busy}
            onClick={() => onMark(seat, att === "absent" ? null : "absent")}
            sx={{ color: att === "absent" ? "#fff" : "#b91c1c", bgcolor: att === "absent" ? "#dc2626" : "rgba(220,38,38,0.08)", "&:hover": { bgcolor: att === "absent" ? "#b91c1c" : "rgba(220,38,38,0.16)" } }}
          >
            <AbsentIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

function SeatDetail({ seat, booking, onClose, onMark, onRelease, busy, canCheck }) {
  const status = seatStatusFor(seat);
  const c = SEAT_COLORS[status];
  return (
    <Box sx={{ borderRadius: "16px", border: "1px solid rgba(27,94,168,0.12)", bgcolor: "var(--kd-surface)", overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5, background: `linear-gradient(135deg, ${navy}, ${primaryGreen})`, color: "#fff" }}>
        <Box sx={{ width: 46, height: 46, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: c.fill, border: `2px solid ${c.stroke}`, color: c.text, fontFamily: fontBody, fontWeight: 900 }}>
          {seat.label}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.05rem" }}>Seat {seat.label}</Typography>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", opacity: 0.85 }}>{seat.section || "No section"}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box sx={{ p: 2 }}>
        <SeatStatusChip status={status} />
        {seat.booking ? (
          <Stack spacing={1} sx={{ mt: 1.5 }}>
            <Box>
              <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.95rem", color: textPrimary }}>{seat.booking.user_name || "Unknown user"}</Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary }}>
                {seat.booking.admission_number || (seat.booking.role ? seat.booking.role[0].toUpperCase() + seat.booking.role.slice(1) : "")}
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary }}>
              Reference <b style={{ color: textPrimary, letterSpacing: "0.04em" }}>{seat.booking.reference}</b>
              {booking?.created_at ? ` · booked ${formatServiceWhen(booking.created_at, { withYear: false })}` : ""}
            </Typography>
            {booking?.checked_by ? (
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", color: textMuted }}>
                Checked by {booking.checked_by.full_name} at {formatTimeOnly(booking.checked_at)}
              </Typography>
            ) : null}
            {canCheck ? (
              <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                <Button
                  fullWidth
                  disabled={busy}
                  startIcon={<PresentIcon />}
                  onClick={() => onMark(seat, "present")}
                  sx={{ fontFamily: fontBody, fontWeight: 700, textTransform: "none", borderRadius: "10px", bgcolor: seat.booking.attendance === "present" ? "#059669" : "rgba(5,150,105,0.1)", color: seat.booking.attendance === "present" ? "#fff" : "#047857", "&:hover": { bgcolor: "#059669", color: "#fff" } }}
                >
                  Attended
                </Button>
                <Button
                  fullWidth
                  disabled={busy}
                  startIcon={<AbsentIcon />}
                  onClick={() => onMark(seat, "absent")}
                  sx={{ fontFamily: fontBody, fontWeight: 700, textTransform: "none", borderRadius: "10px", bgcolor: seat.booking.attendance === "absent" ? "#dc2626" : "rgba(220,38,38,0.1)", color: seat.booking.attendance === "absent" ? "#fff" : "#b91c1c", "&:hover": { bgcolor: "#dc2626", color: "#fff" } }}
                >
                  Absent
                </Button>
              </Stack>
            ) : null}
            {seat.booking.attendance && canCheck ? (
              <Button size="small" startIcon={<ClearIcon />} disabled={busy} onClick={() => onMark(seat, null)} sx={ghostBtnSx}>
                Clear check
              </Button>
            ) : null}
            <Button size="small" startIcon={<ReleaseIcon />} disabled={busy} onClick={() => onRelease(seat)} sx={{ ...ghostBtnSx, color: "#b91c1c" }}>
              Release this seat
            </Button>
          </Stack>
        ) : (
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem", color: textSecondary, mt: 1.5 }}>
            {status === "blocked" ? "Blocked on the plan; not open for booking." : "Nobody has booked this seat yet."}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function ChurchMonitor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(0.7);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const mapRef = useRef(null);

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoading(true);
      try {
        const [map, list] = await Promise.all([churchApi(`/services/${id}/seat-map`), churchApi(`/services/${id}/bookings`)]);
        setData(map.data);
        setBookings(list.data.bookings);
        setUpdatedAt(new Date());
        setError("");
      } catch (err) {
        if (!quiet) setError(err.message);
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!live) return undefined;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load({ quiet: true });
    }, 15000);
    return () => clearInterval(t);
  }, [live, load]);

  const fit = useCallback(() => {
    const el = mapRef.current;
    if (!el || !data) return;
    const z = (el.clientWidth - 16) / data.layout.width;
    setZoom(Math.max(0.2, Math.min(1.6, Math.floor(z * 20) / 20)));
  }, [data]);

  const fittedOnce = useRef(false);
  useEffect(() => {
    if (data && !fittedOnce.current) {
      fittedOnce.current = true;
      setTimeout(fit, 30);
    }
  }, [data, fit]);

  const bookingBySeat = useMemo(() => new Map(bookings.map((b) => [b.seat_key, b])), [bookings]);
  const seats = useMemo(() => [...(data?.layout.seats || [])].sort((a, b) => collator.compare(a.label, b.label)), [data]);

  const counts = useMemo(() => {
    const c = { total: 0, bookable: 0, booked: 0, present: 0, absent: 0, blocked: 0 };
    for (const s of seats) {
      c.total += 1;
      if (s.status === "blocked") c.blocked += 1;
      else c.bookable += 1;
      if (s.booking) {
        c.booked += 1;
        if (s.booking.attendance === "present") c.present += 1;
        if (s.booking.attendance === "absent") c.absent += 1;
      }
    }
    return c;
  }, [seats]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seats.filter((s) => {
      const st = seatStatusFor(s);
      if (filter === "booked" && !s.booking) return false;
      if (filter === "available" && st !== "available") return false;
      if (filter === "blocked" && st !== "blocked") return false;
      if (filter === "present" && st !== "present") return false;
      if (filter === "absent" && st !== "absent") return false;
      if (filter === "unchecked" && (!s.booking || s.booking.attendance)) return false;
      if (!q) return true;
      return [s.label, s.section, s.booking?.user_name, s.booking?.admission_number, s.booking?.reference]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [seats, filter, query]);

  const selectedSeat = selected ? seats.find((s) => s.id === selected) : null;
  const service = data?.service;
  const canCheck = service && service.status !== "cancelled";

  const patchSeat = (seatId, patch) => {
    setData((d) => ({
      ...d,
      layout: { ...d.layout, seats: d.layout.seats.map((s) => (s.id === seatId ? { ...s, ...patch(s) } : s)) },
    }));
  };

  const mark = async (seat, attendance) => {
    if (!seat.booking) return;
    setBusyId(seat.id);
    try {
      const res = await churchApi(`/bookings/${seat.booking.id}/attendance`, { method: "PATCH", body: { attendance } });
      patchSeat(seat.id, (s) => ({ booking: { ...s.booking, attendance } }));
      setBookings((list) => list.map((b) => (b.id === res.data.id ? { ...b, ...res.data } : b)));
    } catch (err) {
      alertError("Could not update attendance", err);
    } finally {
      setBusyId("");
    }
  };

  const release = async (seat) => {
    const ok = await confirmAction({
      title: `Release seat ${seat.label}?`,
      text: `${seat.booking.user_name || "The booker"} will be notified that the booking was cancelled.`,
      confirmText: "Release seat",
      danger: true,
    });
    if (!ok) return;
    setBusyId(seat.id);
    try {
      await churchApi(`/bookings/${seat.booking.id}`, { method: "DELETE" });
      toastSuccess("Seat released");
      await load({ quiet: true });
    } catch (err) {
      alertError("Could not release the seat", err);
    } finally {
      setBusyId("");
    }
  };

  const exportCsv = () => {
    const header = ["Seat", "Section", "Status", "Booked by", "Admission / role", "Reference", "Booked at", "Attendance"];
    const lines = seats.map((s) => {
      const b = bookingBySeat.get(s.id);
      const st = seatStatusFor(s);
      return [
        s.label,
        s.section || "",
        s.booking ? "Booked" : st === "blocked" ? "Blocked" : "Available",
        s.booking?.user_name || "",
        s.booking?.admission_number || s.booking?.role || "",
        s.booking?.reference || "",
        b?.created_at ? new Date(b.created_at).toLocaleString("en-GB") : "",
        s.booking?.attendance === "present" ? "Attended" : s.booking?.attendance === "absent" ? "Absent" : s.booking ? "Not checked" : "",
      ];
    });
    const csv = [header, ...lines].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(service?.title || "church-service").replace(/[^\w-]+/g, "-")}-seats.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: "60vh" }}>
        <CircularProgress sx={{ color: primaryGreen }} />
      </Stack>
    );
  }
  if (error || !data) {
    return (
      <Stack alignItems="center" spacing={1.5} sx={{ py: 8 }}>
        <Typography sx={{ fontFamily: fontBody, color: "#b91c1c" }}>{error || "Service not found."}</Typography>
        <Button onClick={() => navigate("/church")} sx={ghostBtnSx}>
          Back to services
        </Button>
      </Stack>
    );
  }

  const unchecked = Math.max(counts.booked - counts.present - counts.absent, 0);

  return (
    <Box sx={{ maxWidth: 1380, mx: "auto" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <IconButton onClick={() => navigate("/church")} sx={{ border: "1px solid rgba(27,94,168,0.14)", bgcolor: "var(--kd-surface)" }}>
            <BackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: { xs: "1.3rem", sm: "1.55rem" }, color: textPrimary, letterSpacing: "-0.02em" }}>
                {service.title}
              </Typography>
              <StatusChip status={service.status} />
              {service.booking_open ? (
                <Chip size="small" label="Booking open" sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.7rem", height: 24, bgcolor: "rgba(27,94,168,0.1)", color: primaryGreen }} />
              ) : null}
            </Stack>
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.84rem", color: textSecondary }}>
              {service.service_type ? `${service.service_type} · ` : ""}
              {formatServiceWhen(service.starts_at)}
              {service.ends_at ? ` – ${formatTimeOnly(service.ends_at)}` : ""}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <FormControlLabel
            control={<Switch size="small" checked={live} onChange={(e) => setLive(e.target.checked)} />}
            label={
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", fontWeight: 700, color: textSecondary }}>
                Live{updatedAt ? ` · ${updatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}
              </Typography>
            }
          />
          <Tooltip title="Refresh now">
            <IconButton onClick={() => load({ quiet: true })} sx={{ border: "1px solid rgba(27,94,168,0.14)", bgcolor: "var(--kd-surface)" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {service.status !== "cancelled" ? (
            <Button startIcon={<DesignIcon />} onClick={() => navigate(`/church/${id}/design`)} sx={{ ...ghostBtnSx, border: "1px solid rgba(27,94,168,0.16)", bgcolor: "var(--kd-surface)" }}>
              Edit seating
            </Button>
          ) : null}
          <Button startIcon={<DownloadIcon />} onClick={exportCsv} sx={{ ...ghostBtnSx, border: "1px solid rgba(27,94,168,0.16)", bgcolor: "var(--kd-surface)" }}>
            Export CSV
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mb: 2.5 }}>
        <StatCard label="Bookable seats" value={counts.bookable} color={primaryGreen} hint={counts.blocked ? `${counts.blocked} blocked` : undefined} />
        <StatCard label="Booked" value={counts.booked} color={navy} hint={counts.bookable ? `${Math.round((counts.booked / counts.bookable) * 100)}% full` : undefined} />
        <StatCard label="Still free" value={Math.max(counts.bookable - counts.booked, 0)} color="#94a3b8" />
        <StatCard label="Attended" value={counts.present} color="#059669" />
        <StatCard label="Did not attend" value={counts.absent} color="#dc2626" />
        <StatCard label="Not checked yet" value={unchecked} color="#d97706" />
      </Stack>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: selectedSeat ? "minmax(0,1fr) 320px" : "1fr" }, mb: 2.5 }}>
        <Panel
          title="Seat map"
          subtitle="Click a booked seat to mark attendance during the round check."
          action={
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(2)))}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", fontWeight: 800, color: textSecondary, width: 40, textAlign: "center" }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <IconButton size="small" onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={fit}>
                <FitIcon fontSize="small" />
              </IconButton>
            </Stack>
          }
          sx={{ minWidth: 0 }}
        >
          <SeatLegend sx={{ mb: 1.5 }} />
          <Box ref={mapRef} sx={{ overflow: "auto", maxHeight: "68vh", borderRadius: "12px", border: "1px solid rgba(27,94,168,0.08)", bgcolor: "#f8fafc" }}>
            <SeatMapSvg layout={data.layout} zoom={zoom} selectedSeatId={selected} onSeatClick={(s) => setSelected(s.id === selected ? null : s.id)} />
          </Box>
        </Panel>
        {selectedSeat ? (
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 88 }, alignSelf: "start" }}>
            <SeatDetail
              seat={selectedSeat}
              booking={bookingBySeat.get(selectedSeat.id)}
              onClose={() => setSelected(null)}
              onMark={mark}
              onRelease={release}
              busy={busyId === selectedSeat.id}
              canCheck={canCheck}
            />
          </Box>
        ) : null}
      </Box>

      <Panel
        title="All seats"
        subtitle={`${rows.length} of ${seats.length} seats shown`}
        action={
          <TextField
            size="small"
            placeholder="Search seat, name, admission no. or reference"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ ...inputSx, width: { xs: "100%", sm: 340 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: textMuted }} />
                </InputAdornment>
              ),
            }}
          />
        }
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_, v) => v && setFilter(v)}
          sx={{ mb: 2, flexWrap: "wrap", "& .MuiToggleButton-root": { textTransform: "none", fontFamily: fontBody, fontWeight: 700, fontSize: "0.8rem", px: 1.5, borderRadius: "10px !important", mr: 0.75, mb: 0.75, border: "1px solid rgba(27,94,168,0.16) !important" }, "& .Mui-selected": { bgcolor: `${primaryGreen} !important`, color: "#fff !important" } }}
        >
          {FILTERS.map((f) => (
            <ToggleButton key={f.value} value={f.value}>
              {f.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {!rows.length ? (
          <EmptyNote>No seats match.</EmptyNote>
        ) : (
          <TableContainer sx={{ maxHeight: 620 }}>
            <Table size="small" stickyHeader>
              <TableHead sx={tableHeadSx}>
                <TableRow>
                  <TableCell>Seat</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Booked by</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Booked at</TableCell>
                  <TableCell align="right">Attendance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={tableBodySx}>
                {rows.map((s) => {
                  const st = seatStatusFor(s);
                  const b = bookingBySeat.get(s.id);
                  return (
                    <TableRow
                      key={s.id}
                      hover
                      selected={selected === s.id}
                      onClick={() => setSelected(s.id)}
                      sx={{ cursor: "pointer", "&.Mui-selected": { bgcolor: "rgba(200,168,64,0.12)" } }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <SeatIcon sx={{ fontSize: 18, color: (SEAT_COLORS[st] || SEAT_COLORS.available).stroke }} />
                          <b>{s.label}</b>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: `${textSecondary} !important` }}>{s.section || "—"}</TableCell>
                      <TableCell>
                        <SeatStatusChip status={st} />
                      </TableCell>
                      <TableCell>
                        {s.booking ? (
                          <Box>
                            <Typography sx={{ fontFamily: fontBody, fontSize: "0.84rem", fontWeight: 700, color: textPrimary }}>{s.booking.user_name}</Typography>
                            <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                              {s.booking.admission_number || s.booking.role}
                            </Typography>
                          </Box>
                        ) : (
                          <span style={{ color: "var(--kd-text-muted)" }}>—</span>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, letterSpacing: "0.03em" }}>{s.booking?.reference || "—"}</TableCell>
                      <TableCell sx={{ color: `${textSecondary} !important`, whiteSpace: "nowrap" }}>
                        {b?.created_at ? formatServiceWhen(b.created_at, { withYear: false }) : "—"}
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        {s.booking && canCheck ? (
                          <Stack direction="row" justifyContent="flex-end">
                            <AttendanceButtons seat={s} onMark={mark} busy={busyId === s.id} />
                          </Stack>
                        ) : s.booking ? (
                          <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted }}>
                            {s.booking.attendance === "present" ? "Attended" : s.booking.attendance === "absent" ? "Absent" : "Not checked"}
                          </Typography>
                        ) : (
                          <span style={{ color: "var(--kd-text-muted)" }}>—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Panel>
    </Box>
  );
}
