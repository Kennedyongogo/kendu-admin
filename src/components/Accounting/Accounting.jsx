import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AddCardRoundedIcon from "@mui/icons-material/AddCardRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import {
  accentGold,
  authJsonHeaders,
  getPortalToken,
  fontBody,
  fontDisplay,
  getInitials,
  inputSx,
  navy,
  pageShellSx,
  primaryGreen,
  primaryDark,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { UsersHero, RoleTabs, HeroActionButton, PremiumDialog } from "../Users/usersUi";
import BrandPageLoader from "../Util/BrandPageLoader";

const money = (value, currency = "KES") =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const cardSx = {
  bgcolor: "var(--kd-surface)",
  border: "1px solid rgba(0,96,80,0.1)",
  borderRadius: "20px",
  boxShadow: "0 12px 36px -16px rgba(20,26,58,0.12)",
  overflow: "hidden",
};

const METHOD_TONES = {
  mpesa: { bg: "rgba(0,96,80,0.1)", color: primaryGreen },
  bank: { bg: "rgba(30,40,88,0.1)", color: navy },
  cash: { bg: "rgba(200,168,64,0.2)", color: "#8a6d1c" },
  card: { bg: "rgba(106,76,147,0.12)", color: "#6a4c93" },
  other: { bg: "rgba(30,40,88,0.08)", color: textSecondary },
};

const PAYMENT_METHODS = [
  { key: "mpesa", label: "M-Pesa", color: primaryGreen },
  { key: "bank", label: "Bank", color: navy },
  { key: "cash", label: "Cash", color: accentGold },
  { key: "card", label: "Card", color: "#6a4c93" },
  { key: "other", label: "Other", color: "#457b9d" },
];

const STATUS_TONES = {
  confirmed: { label: "Confirmed", bg: "rgba(46,125,50,0.12)", color: "#2e7d32", dot: "#2e7d32" },
  pending: { label: "Pending", bg: "rgba(178,106,0,0.12)", color: "#b26a00", dot: "#b26a00" },
  failed: { label: "Failed", bg: "rgba(185,28,28,0.1)", color: "#b91c1c", dot: "#b91c1c" },
  reversed: { label: "Reversed", bg: "rgba(30,40,88,0.1)", color: navy, dot: navy },
};

function StatCard({ label, value, hint, icon, accent = primaryGreen, index = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      sx={{
        ...cardSx,
        p: 2.25,
        position: "relative",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 20px 44px -18px rgba(20,26,58,0.22)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accent}, ${accentGold})`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: fontBody,
              color: textMuted,
              fontWeight: 700,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: fontDisplay,
              color: textPrimary,
              fontWeight: 700,
              fontSize: { xs: "1.45rem", xl: "1.75rem" },
              letterSpacing: "-0.02em",
              mt: 0.5,
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.74rem", mt: 0.35 }}>
            {hint}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: `linear-gradient(145deg, ${accent} 0%, ${primaryDark} 130%)`,
            boxShadow: `0 8px 20px -6px ${accent}66`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

function ChartCard({ title, subtitle, actions, children, index = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      sx={{ ...cardSx, p: 0 }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={1.5}
        sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid rgba(0,96,80,0.08)", bgcolor: warmCream }}
      >
        <Box>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.08rem" }}>
            {title}
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.74rem" }}>{subtitle}</Typography>
        </Box>
        {actions || null}
      </Stack>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

function MethodChip({ method }) {
  const tone = METHOD_TONES[method] || METHOD_TONES.other;
  const label = method === "mpesa" ? "M-Pesa" : method.charAt(0).toUpperCase() + method.slice(1);
  return (
    <Chip
      size="small"
      label={label}
      sx={{ bgcolor: tone.bg, color: tone.color, fontFamily: fontBody, fontWeight: 700, fontSize: "0.72rem", border: "none" }}
    />
  );
}

function StatusChip({ status }) {
  const tone = STATUS_TONES[status] || { label: status, bg: "rgba(30,40,88,0.08)", color: textSecondary, dot: textSecondary };
  return (
    <Chip
      size="small"
      label={
        <Stack direction="row" spacing={0.7} alignItems="center">
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: tone.dot }} />
          <span>{tone.label}</span>
        </Stack>
      }
      sx={{ bgcolor: tone.bg, color: tone.color, fontFamily: fontBody, fontWeight: 700, fontSize: "0.72rem", border: "none" }}
    />
  );
}

const headCellSx = {
  fontFamily: fontBody,
  fontWeight: 700,
  fontSize: "0.72rem",
  color: textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  bgcolor: warmCream,
  borderBottom: "1px solid rgba(0,96,80,0.12)",
  whiteSpace: "nowrap",
};

function DetailItem({ icon, label, children }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "14px",
        border: "1px solid rgba(0,96,80,0.1)",
        bgcolor: "var(--kd-surface)",
        minWidth: 0,
      }}
    >
      <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mb: 0.6 }}>
        <Box sx={{ color: primaryGreen, display: "flex", "& svg": { fontSize: 16 } }}>{icon}</Box>
        <Typography
          sx={{
            fontFamily: fontBody,
            fontWeight: 700,
            fontSize: "0.66rem",
            color: textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Box sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.86rem", color: textPrimary, overflowWrap: "anywhere" }}>
        {children}
      </Box>
    </Box>
  );
}

function PaymentDetailsDialog({ payment, onClose }) {
  if (!payment) return null;
  return (
    <PremiumDialog
      open
      onClose={onClose}
      title="Payment details"
      subtitle={`Reference ${payment.provider_receipt || payment.reference || "—"}`}
      icon={<ReceiptLongRoundedIcon />}
      footer={
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            textTransform: "none",
            fontFamily: fontBody,
            fontWeight: 700,
            borderRadius: "12px",
            px: 2.5,
            bgcolor: primaryGreen,
            "&:hover": { bgcolor: primaryDark },
          }}
        >
          Close
        </Button>
      }
    >
      <Stack spacing={2}>
        <Box
          sx={{
            p: 2,
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${warmCream} 0%, rgba(0,96,80,0.07) 100%)`,
            border: "1px solid rgba(0,96,80,0.12)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  bgcolor: accentGold,
                  color: navy,
                  boxShadow: "0 6px 16px rgba(20,26,58,0.15)",
                }}
              >
                {getInitials(payment.student?.full_name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1rem" }}>
                  {payment.student?.full_name || "Unknown student"}
                </Typography>
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <BadgeRoundedIcon sx={{ fontSize: 14, color: textMuted }} />
                  <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 600, color: textSecondary, fontSize: "0.78rem" }}>
                    {payment.student?.admission_number || "No admission number"}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Box sx={{ textAlign: { sm: "right" }, flexShrink: 0 }}>
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 800, color: primaryGreen, fontSize: "1.45rem", letterSpacing: "-0.02em" }}>
                {money(payment.amount, payment.currency)}
              </Typography>
              <Stack direction="row" spacing={0.75} justifyContent={{ sm: "flex-end" }} sx={{ mt: 0.5 }}>
                <MethodChip method={payment.method} />
                <StatusChip status={payment.status} />
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
          <DetailItem icon={<TagRoundedIcon />} label="Internal reference">
            {payment.reference || "—"}
          </DetailItem>
          <DetailItem icon={<VerifiedRoundedIcon />} label="Provider receipt">
            {payment.provider_receipt || "—"}
          </DetailItem>
          <DetailItem icon={<EventRoundedIcon />} label="Paid on">
            {dateTime(payment.paid_at)}
          </DetailItem>
          <DetailItem icon={<EventRoundedIcon />} label="Recorded on">
            {dateTime(payment.createdAt)}
          </DetailItem>
          <DetailItem icon={<PhoneIphoneRoundedIcon />} label="Payer phone">
            {payment.phone || "—"}
          </DetailItem>
          <DetailItem icon={<PersonRoundedIcon />} label="Recorded by">
            {payment.recorder?.full_name || (payment.recorded_by ? "Accounts office" : "System / online payment")}
          </DetailItem>
        </Box>

        {payment.narrative ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: "14px",
              bgcolor: warmCream,
              border: "1px dashed rgba(0,96,80,0.25)",
            }}
          >
            <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mb: 0.5 }}>
              <EditNoteRoundedIcon sx={{ fontSize: 16, color: primaryGreen }} />
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontWeight: 700,
                  fontSize: "0.66rem",
                  color: textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Note
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.85rem" }}>
              {payment.narrative}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </PremiumDialog>
  );
}

export default function Accounting() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentRowsPerPage, setPaymentRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [collectionYear, setCollectionYear] = useState(new Date().getFullYear());
  const [collectionMonth, setCollectionMonth] = useState("");
  const [viewPayment, setViewPayment] = useState(null);

  const token = getPortalToken();

  const loadDashboard = useCallback(async () => {
    const params = new URLSearchParams({ year: String(collectionYear) });
    if (collectionMonth) params.set("month", String(collectionMonth));
    const response = await fetch(`/api/accounting/dashboard?${params}`, {
      headers: authJsonHeaders(token),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Could not load accounting dashboard");
    setDashboard(data.data);
  }, [collectionMonth, collectionYear, token]);

  const loadCollectionCharts = useCallback(async () => {
    const params = new URLSearchParams({ year: String(collectionYear) });
    if (collectionMonth) params.set("month", String(collectionMonth));
    const response = await fetch(`/api/accounting/dashboard/collections?${params}`, {
      headers: authJsonHeaders(token),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not load collection charts");
    }
    setDashboard((current) =>
      current
        ? {
            ...current,
            collection_trend: data.data.collection_trend,
            collection_filter: data.data.collection_filter,
            by_method: data.data.by_method,
          }
        : current
    );
  }, [collectionMonth, collectionYear, token]);

  const loadPayments = useCallback(
    async (page = paymentPage, rowsPerPage = paymentRowsPerPage) => {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);
      const response = await fetch(`/api/accounting/payments?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Could not load payment records");
      setPayments(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    },
    [paymentPage, paymentRowsPerPage, search, status, token]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [loadDashboard]);

  useEffect(() => {
    loadAll();
    // Full-page load only on mount; filter changes refresh their own sections.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Year/month filter changes only refresh the dashboard charts.
  useEffect(() => {
    if (loading) return;
    let active = true;
    setChartLoading(true);
    loadCollectionCharts()
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setChartLoading(false);
      });
    return () => {
      active = false;
    };
  }, [collectionYear, collectionMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPayments().catch((requestError) => setError(requestError.message));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [paymentPage, paymentRowsPerPage, search, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const methodChart = useMemo(
    () => {
      const totals = new Map(
        (dashboard?.by_method || []).map((row) => [
          String(row.method || "").toLowerCase(),
          Number(row.amount) || 0,
        ])
      );
      return PAYMENT_METHODS.map((method, index) => ({
        id: index,
        key: method.key,
        value: totals.get(method.key) || 0,
        label: method.label,
        color: method.color,
      }));
    },
    [dashboard]
  );
  const hasMethodCollections = methodChart.some((row) => row.value > 0);

  if (loading) {
    return <BrandPageLoader message="Loading accounting…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Accounting"
        subtitle="Monitor fee collection and maintain verified student payment records."
        icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 28 }} />}
        actions={
          <HeroActionButton variant="contained" startIcon={<AddCardRoundedIcon />} onClick={() => navigate("/accounting/record-payment")}>
            Record payment
          </HeroActionButton>
        }
      />

      <RoleTabs
        activeTab={tab}
        onChange={(_, value) => setTab(value)}
        tabs={[
          { label: "Dashboard" },
          { label: `Payment records (${pagination.total || 0})` },
        ]}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} action={<Button color="inherit" onClick={loadAll}>Retry</Button>}>
          {error}
        </Alert>
      ) : null}

      {tab === 0 && dashboard ? (
        <Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }, gap: 2 }}>
            <StatCard
              index={0}
              label="Total billed"
              value={money(dashboard.summary.billed)}
              hint={`${dashboard.summary.students} active students`}
              icon={<ReceiptLongRoundedIcon />}
            />
            <StatCard
              index={1}
              label="Collected"
              value={money(dashboard.summary.collected)}
              hint={`${dashboard.summary.collection_rate}% of billed fees`}
              icon={<PaymentsRoundedIcon />}
              accent="#2e7d32"
            />
            <StatCard
              index={2}
              label="Outstanding"
              value={money(dashboard.summary.outstanding)}
              hint="Student balances remaining"
              icon={<AccountBalanceWalletRoundedIcon />}
              accent="#b26a00"
            />
            <StatCard
              index={3}
              label="Collection rate"
              value={`${dashboard.summary.collection_rate}%`}
              hint="Paid against billed fees"
              icon={<TrendingUpRoundedIcon />}
              accent={navy}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.5fr) minmax(320px, 0.8fr)" }, gap: 2, mt: 2 }}>
            <ChartCard
              index={1}
              title={collectionMonth ? "Daily collections" : "Monthly collections"}
              subtitle={
                collectionMonth
                  ? `Confirmed payments for ${MONTHS[Number(collectionMonth) - 1]} ${collectionYear} · ${money(dashboard.collection_filter?.period_total || 0)}`
                  : `Confirmed payments throughout ${collectionYear} · ${money(dashboard.collection_filter?.period_total || 0)}`
              }
              actions={
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                  <TextField
                    select
                    size="small"
                    label="Year"
                    value={collectionYear}
                    onChange={(event) => setCollectionYear(Number(event.target.value))}
                    sx={{ ...inputSx, minWidth: 105 }}
                  >
                    {(dashboard.collection_filter?.available_years || [collectionYear]).map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Month"
                    value={collectionMonth}
                    onChange={(event) => setCollectionMonth(event.target.value)}
                    sx={{ ...inputSx, minWidth: 135 }}
                  >
                    <MenuItem value="">All months</MenuItem>
                    {MONTHS.map((month, index) => (
                      <MenuItem key={month} value={index + 1}>{month}</MenuItem>
                    ))}
                  </TextField>
                </Stack>
              }
            >
              <Box sx={{ position: "relative", opacity: chartLoading ? 0.45 : 1, transition: "opacity 0.2s ease" }}>
                <BarChart
                  height={280}
                  xAxis={[{
                    scaleType: "band",
                    data: dashboard.collection_trend.map((row) => row.label),
                    label: collectionMonth ? "Day of month" : "Month",
                    tickLabelStyle: { fontSize: collectionMonth ? 9 : 11, fontFamily: fontBody },
                  }]}
                  series={[{
                    data: dashboard.collection_trend.map((row) => row.amount),
                    label: "Collections",
                    color: primaryGreen,
                  }]}
                  borderRadius={7}
                  grid={{ horizontal: true }}
                  margin={{ top: 35, right: 20, bottom: 25, left: 70 }}
                  sx={{
                    "& .MuiChartsGrid-line": { stroke: "rgba(0,96,80,0.08)" },
                    "& .MuiChartsAxis-tickLabel": { fontFamily: fontBody },
                  }}
                />
                {chartLoading ? (
                  <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <CircularProgress size={28} sx={{ color: primaryGreen }} />
                  </Box>
                ) : null}
              </Box>
            </ChartCard>

            <ChartCard
              index={2}
              title="Payment methods"
              subtitle="Confirmed collections by channel for the selected period"
            >
              <Box sx={{ position: "relative", opacity: chartLoading ? 0.45 : 1, transition: "opacity 0.2s ease" }}>
                {hasMethodCollections ? (
                  <PieChart
                    height={230}
                    series={[{
                      data: methodChart,
                      innerRadius: 62,
                      outerRadius: 95,
                      paddingAngle: 3,
                      cornerRadius: 5,
                      highlightScope: { faded: "global", highlighted: "item" },
                    }]}
                    colors={PAYMENT_METHODS.map((method) => method.color)}
                    margin={{ top: 20, bottom: 10, left: 20, right: 20 }}
                    slotProps={{ legend: { hidden: true } }}
                  />
                ) : (
                  <Stack sx={{ height: 230 }} alignItems="center" justifyContent="center" spacing={1}>
                    <InsightsRoundedIcon sx={{ fontSize: 42, color: "rgba(0,96,80,0.25)" }} />
                    <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.85rem" }}>
                      No confirmed payments in this period.
                    </Typography>
                  </Stack>
                )}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
                    gap: 1,
                    pt: 1.25,
                    borderTop: "1px solid rgba(0,96,80,0.08)",
                  }}
                >
                  {methodChart.map((method) => (
                    <Stack key={method.key} direction="row" spacing={0.8} alignItems="center">
                      <Box sx={{ width: 9, height: 9, borderRadius: "3px", bgcolor: method.color, flexShrink: 0 }} />
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          color: textSecondary,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {method.label} · {money(method.value)}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </Box>
            </ChartCard>
          </Box>
        </Box>
      ) : (
        <Box component={motion.div} variants={fadeUp} custom={0} initial="hidden" animate="visible">
          <Box sx={{ ...cardSx }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ md: "center" }}
              spacing={1.5}
              sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid rgba(0,96,80,0.08)", bgcolor: warmCream }}
            >
              <Box>
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.08rem" }}>
                  Payment records
                </Typography>
                <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.74rem" }}>
                  {pagination.total || 0} verified transactions
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <TextField
                  size="small"
                  placeholder="Search student or admission number"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPaymentPage(0);
                  }}
                  sx={{ ...inputSx, width: { xs: "100%", sm: 320 } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: textMuted }} /></InputAdornment> }}
                />
                <TextField
                  select
                  size="small"
                  label="Status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPaymentPage(0);
                  }}
                  sx={{ ...inputSx, minWidth: 150 }}
                >
                  <MenuItem value="">All statuses</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="reversed">Reversed</MenuItem>
                </TextField>
              </Stack>
            </Stack>

            <TableContainer>
              <Table sx={{ tableLayout: "auto", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellSx}>#</TableCell>
                    <TableCell sx={headCellSx}>Student</TableCell>
                    <TableCell sx={headCellSx}>Reference</TableCell>
                    <TableCell sx={headCellSx}>Method</TableCell>
                    <TableCell sx={headCellSx}>Amount</TableCell>
                    <TableCell sx={headCellSx}>Status</TableCell>
                    <TableCell sx={{ ...headCellSx, textAlign: "center" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length ? (
                    payments.map((payment, index) => (
                      <TableRow
                        key={payment.id}
                        hover
                        sx={{
                          transition: "background 0.15s ease",
                          "&:hover": { bgcolor: "rgba(0,96,80,0.035)" },
                          "& td": { borderColor: "rgba(0,96,80,0.07)" },
                        }}
                      >
                        <TableCell sx={{ fontFamily: fontBody, fontWeight: 700, color: textMuted, fontSize: "0.82rem" }}>
                          {paymentPage * paymentRowsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                fontFamily: fontDisplay,
                                bgcolor: accentGold,
                                color: navy,
                                boxShadow: "0 4px 12px rgba(20,26,58,0.1)",
                              }}
                            >
                              {getInitials(payment.student?.full_name)}
                            </Avatar>
                            <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, fontSize: "0.86rem" }}>
                              {payment.student?.full_name || "—"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.8rem", fontWeight: 600, overflowWrap: "anywhere" }}>
                          {payment.provider_receipt || payment.reference}
                        </TableCell>
                        <TableCell>
                          <MethodChip method={payment.method} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: fontBody, color: textPrimary, fontWeight: 800, fontSize: "0.86rem" }}>
                          {money(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <StatusChip status={payment.status} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Tooltip title="View payment details">
                            <IconButton
                              size="small"
                              onClick={() => setViewPayment(payment)}
                              sx={{
                                color: primaryGreen,
                                bgcolor: "rgba(0,96,80,0.07)",
                                "&:hover": { bgcolor: "rgba(0,96,80,0.16)" },
                              }}
                            >
                              <VisibilityRoundedIcon sx={{ fontSize: 19 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ border: "none" }}>
                        <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
                          <ReceiptLongRoundedIcon sx={{ fontSize: 44, color: "rgba(0,96,80,0.22)" }} />
                          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary }}>
                            No payment records found
                          </Typography>
                          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.85rem" }}>
                            Try adjusting the search or status filter, or record a new payment.
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={pagination.total || 0}
              page={paymentPage}
              onPageChange={(_, page) => setPaymentPage(page)}
              rowsPerPage={paymentRowsPerPage}
              onRowsPerPageChange={(event) => {
                setPaymentRowsPerPage(Number.parseInt(event.target.value, 10));
                setPaymentPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: "1px solid rgba(0,96,80,0.1)",
                "& .MuiTablePagination-toolbar": {
                  fontFamily: fontBody,
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </Box>
      )}

      <PaymentDetailsDialog payment={viewPayment} onClose={() => setViewPayment(null)} />
    </Box>
  );
}
