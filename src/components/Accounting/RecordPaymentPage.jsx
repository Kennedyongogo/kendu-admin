import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCardRoundedIcon from "@mui/icons-material/AddCardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import BrandPageLoader from "../Util/BrandPageLoader";
import {
  accentGold,
  accentGoldMuted,
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
  profileImageSrc,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { UsersHero, FormSection, fadeUp } from "../Users/usersUi";

const VISIBLE_STUDENTS = 8;

function money(amount, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

// datetime-local value in the user's timezone (toISOString would give UTC).
const localDateTimeValue = (date = new Date()) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const METHOD_OPTIONS = [
  { value: "mpesa", label: "M-Pesa", icon: <PhoneIphoneRoundedIcon /> },
  { value: "bank", label: "Bank", icon: <AccountBalanceRoundedIcon /> },
  { value: "cash", label: "Cash", icon: <PaymentsRoundedIcon /> },
  { value: "card", label: "Card", icon: <CreditCardRoundedIcon /> },
  { value: "other", label: "Other", icon: <MoreHorizRoundedIcon /> },
];

function StudentCard({ student, selected, onSelect, index }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={Math.min(index, 6) * 0.5}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(student)}
      sx={{
        position: "relative",
        borderRadius: "18px",
        overflow: "hidden",
        bgcolor: "var(--kd-surface)",
        border: selected ? `2px solid ${primaryGreen}` : "1px solid rgba(27,94,168,0.12)",
        boxShadow: selected
          ? "0 18px 40px -14px rgba(27,94,168,0.45)"
          : "0 10px 28px -18px rgba(20,26,58,0.16)",
        cursor: "pointer",
        textAlign: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 44px -16px rgba(27,94,168,0.38)",
          borderColor: primaryGreen,
        },
      }}
    >
      <Box
        sx={{
          height: 54,
          background: selected
            ? `linear-gradient(135deg, ${primaryGreen} 0%, ${primaryDark} 100%)`
            : `linear-gradient(135deg, ${warmCream} 0%, rgba(27,94,168,0.1) 100%)`,
          transition: "background 0.25s ease",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: selected ? "none" : "2px solid rgba(27,94,168,0.3)",
          bgcolor: selected ? "#fff" : "var(--kd-surface)",
          transition: "all 0.2s ease",
        }}
      >
        {selected ? <CheckCircleRoundedIcon sx={{ fontSize: 24, color: primaryGreen }} /> : null}
      </Box>
      <Avatar
        src={profileImageSrc(student)}
        alt={student.full_name}
        sx={{
          width: 60,
          height: 60,
          mx: "auto",
          mt: -3.75,
          fontFamily: fontDisplay,
          fontWeight: 700,
          fontSize: "1.15rem",
          bgcolor: selected ? primaryGreen : accentGold,
          color: selected ? "#fff" : navy,
          border: "3px solid var(--kd-surface)",
          boxShadow: "0 8px 20px rgba(20,26,58,0.2)",
          position: "relative",
        }}
      >
        {getInitials(student.full_name)}
      </Avatar>
      <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
        <Typography
          noWrap
          sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "0.92rem", letterSpacing: "-0.01em" }}
        >
          {student.full_name}
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mt: 0.7,
            px: 1.2,
            py: 0.35,
            maxWidth: "100%",
            borderRadius: "999px",
            bgcolor: selected ? "rgba(27,94,168,0.1)" : warmCream,
            border: "1px solid rgba(27,94,168,0.14)",
          }}
        >
          <BadgeRoundedIcon sx={{ fontSize: 14, color: selected ? primaryGreen : textMuted, flexShrink: 0 }} />
          <Typography
            noWrap
            sx={{
              fontFamily: fontBody,
              fontWeight: 700,
              fontSize: "0.72rem",
              color: selected ? primaryGreen : textSecondary,
              letterSpacing: "0.02em",
            }}
          >
            {student.admission_number || "No admission no."}
          </Typography>
        </Box>
        <Box sx={{ mt: 1.25, pt: 1.1, borderTop: "1px dashed rgba(27,94,168,0.15)" }}>
          <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center" sx={{ minWidth: 0 }}>
            <SchoolRoundedIcon sx={{ fontSize: 15, color: selected ? primaryGreen : accentGold, flexShrink: 0 }} />
            <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, color: textSecondary, fontSize: "0.74rem" }}>
              {student.programme?.name || "No programme"}
            </Typography>
          </Stack>
          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.7rem", fontWeight: 600, mt: 0.4 }}>
            {student.year_of_study
              ? `Year ${student.year_of_study} · Semester ${student.semester || 1}`
              : "Study period not set"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function MethodTile({ option, selected, onSelect }) {
  return (
    <Box
      onClick={() => onSelect(option.value)}
      sx={{
        py: 1.25,
        px: 1,
        borderRadius: "14px",
        border: selected ? `2px solid ${primaryGreen}` : "1px solid rgba(27,94,168,0.15)",
        bgcolor: selected ? "rgba(27,94,168,0.06)" : "var(--kd-surface)",
        boxShadow: selected ? "0 10px 24px -12px rgba(27,94,168,0.4)" : "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.6,
        transition: "all 0.18s ease",
        "&:hover": {
          borderColor: primaryGreen,
          bgcolor: "rgba(27,94,168,0.04)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "11px",
          display: "grid",
          placeItems: "center",
          color: selected ? "#fff" : primaryGreen,
          background: selected
            ? `linear-gradient(145deg, ${primaryGreen} 0%, ${primaryDark} 130%)`
            : "rgba(27,94,168,0.08)",
          transition: "all 0.18s ease",
          "& svg": { fontSize: 20 },
        }}
      >
        {option.icon}
      </Box>
      <Typography
        sx={{
          fontFamily: fontBody,
          fontWeight: 700,
          fontSize: "0.76rem",
          color: selected ? primaryGreen : textSecondary,
        }}
      >
        {option.label}
      </Typography>
    </Box>
  );
}

export default function RecordPaymentPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    method: "mpesa",
    reference: "",
    paid_at: localDateTimeValue(),
    narrative: "",
  });

  const token = getPortalToken();
  const goBack = () => navigate("/accounting");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/accounting/students", {
          headers: authJsonHeaders(token),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(data.message || "Could not load students");
        if (active) setStudents(data.data || []);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    if (!selected?.id) {
      setLedger(null);
      return undefined;
    }
    (async () => {
      setLedgerLoading(true);
      try {
        const response = await fetch(`/api/accounting/students/${selected.id}`, {
          headers: authJsonHeaders(token),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(data.message || "Could not load student fees");
        if (active) setLedger(data.data || null);
      } catch (requestError) {
        if (active) {
          setLedger(null);
          Swal.fire({
            icon: "warning",
            title: "Fee summary unavailable",
            text: requestError.message,
            confirmButtonColor: primaryGreen,
          });
        }
      } finally {
        if (active) setLedgerLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [selected?.id, token]);

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      [
        student.full_name,
        student.admission_number,
        student.email,
        student.phone,
        student.programme?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [search, students]);

  const visible = useMemo(() => {
    const slice = matches.slice(0, VISIBLE_STUDENTS);
    // Keep the selected student visible even when the search moves them out of the first page.
    if (selected && !slice.some((student) => student.id === selected.id) && matches.some((student) => student.id === selected.id)) {
      return [selected, ...slice.slice(0, VISIBLE_STUDENTS - 1)];
    }
    return slice;
  }, [matches, selected]);

  const setField = (field) => (event) => setForm((old) => ({ ...old, [field]: event.target.value }));

  const submitPayment = async () => {
    if (!selected) {
      Swal.fire({ icon: "warning", title: "Select a student", text: "Choose the student who made this payment.", confirmButtonColor: primaryGreen });
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      Swal.fire({ icon: "warning", title: "Amount required", text: "Enter the amount paid.", confirmButtonColor: primaryGreen });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/accounting/payments", {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          student_id: selected.id,
          amount: Number(form.amount),
          method: form.method,
          reference: form.reference.trim(),
          // Send a full ISO timestamp so the server doesn't reinterpret the local time in its own timezone.
          paid_at: form.paid_at ? new Date(form.paid_at).toISOString() : undefined,
          narrative: form.narrative.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Could not record payment");
      const credit = Number(data.data?.summary?.credit || 0);
      await Swal.fire({
        icon: "success",
        title: "Payment recorded",
        text:
          credit > 0
            ? `${selected.full_name} now has ${money(credit, data.data?.summary?.currency)} excess fee credit on account.`
            : `${selected.full_name}'s oldest outstanding balance was reduced.`,
        timer: credit > 0 ? 3200 : 2000,
        showConfirmButton: credit > 0,
        confirmButtonColor: primaryGreen,
      });
      navigate("/accounting", { replace: true });
    } catch (requestError) {
      Swal.fire({ icon: "error", title: "Payment not recorded", text: requestError.message, confirmButtonColor: primaryGreen });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <BrandPageLoader message="Loading students…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Record payment"
        subtitle="Select the student, then capture the verified payment details below"
        icon={<AddCardRoundedIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title="Back to accounting">
            <IconButton
              onClick={goBack}
              type="button"
              sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={2.5}>
        <Box
          component={motion.div}
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          sx={{
            bgcolor: "var(--kd-surface)",
            border: "1px solid rgba(27,94,168,0.1)",
            borderRadius: "20px",
            boxShadow: "0 12px 36px -16px rgba(20,26,58,0.12)",
            overflow: "hidden",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
            spacing={1.5}
            sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid rgba(27,94,168,0.08)", bgcolor: warmCream }}
          >
            <Box>
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.08rem" }}>
                Choose a student
              </Typography>
              <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.74rem" }}>
                {selected
                  ? `Selected: ${selected.full_name} · ${selected.admission_number || "No admission number"}`
                  : `Showing ${visible.length} of ${matches.length} students — search to narrow down`}
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search name, admission no, phone or programme"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ ...inputSx, width: { xs: "100%", md: 360 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Box sx={{ p: 2 }}>
            {visible.length ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1.75,
                }}
              >
                {visible.map((student, index) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    index={index}
                    selected={selected?.id === student.id}
                    onSelect={(value) => setSelected((old) => (old?.id === value.id ? null : value))}
                  />
                ))}
              </Box>
            ) : (
              <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
                <PersonSearchRoundedIcon sx={{ fontSize: 46, color: "rgba(27,94,168,0.25)" }} />
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary }}>
                  No students match your search
                </Typography>
                <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.85rem" }}>
                  Try the student's name, admission number, phone or programme.
                </Typography>
              </Stack>
            )}

            {matches.length > visible.length ? (
              <Typography sx={{ mt: 1.75, textAlign: "center", fontFamily: fontBody, color: textMuted, fontSize: "0.78rem", fontWeight: 600 }}>
                {matches.length - visible.length} more student{matches.length - visible.length === 1 ? "" : "s"} — refine your search to find them
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box component={motion.div} variants={fadeUp} custom={1} initial="hidden" animate="visible">
          <FormSection title="Payment details">
            <Stack spacing={2}>
              {selected ? (
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: "rgba(27,94,168,0.05)",
                      border: "1px dashed rgba(27,94,168,0.3)",
                    }}
                  >
                    <Avatar
                      src={profileImageSrc(selected)}
                      alt={selected.full_name}
                      sx={{
                        width: 42,
                        height: 42,
                        fontFamily: fontDisplay,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        bgcolor: primaryGreen,
                        color: "#fff",
                      }}
                    >
                      {getInitials(selected.full_name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, fontSize: "0.9rem" }}>
                        {selected.full_name}
                      </Typography>
                      <Typography noWrap sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.76rem", fontWeight: 600 }}>
                        {selected.admission_number || "No admission number"} · {selected.programme?.name || "No programme"}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => setSelected(null)}
                      sx={{ textTransform: "none", fontFamily: fontBody, fontWeight: 700, color: textSecondary, flexShrink: 0 }}
                    >
                      Change
                    </Button>
                  </Stack>

                  {ledgerLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5 }}>
                      <CircularProgress size={16} sx={{ color: primaryGreen }} />
                      <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted }}>
                        Loading fee summary…
                      </Typography>
                    </Stack>
                  ) : ledger?.summary ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                        gap: 1,
                      }}
                    >
                      {[
                        {
                          label: "Billed",
                          value: money(ledger.summary.total_charged, ledger.summary.currency),
                          icon: <ReceiptLongRoundedIcon sx={{ fontSize: 16 }} />,
                        },
                        {
                          label: "Paid",
                          value: money(ledger.summary.total_paid, ledger.summary.currency),
                          icon: <PaymentsRoundedIcon sx={{ fontSize: 16 }} />,
                        },
                        {
                          label: "Balance",
                          value: money(ledger.summary.balance, ledger.summary.currency),
                          icon: <AccountBalanceWalletRoundedIcon sx={{ fontSize: 16 }} />,
                        },
                        {
                          label: "Excess credit",
                          value: money(ledger.summary.credit || 0, ledger.summary.currency),
                          icon: <SavingsRoundedIcon sx={{ fontSize: 16 }} />,
                          highlight: Number(ledger.summary.credit) > 0,
                        },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            p: 1.15,
                            borderRadius: "12px",
                            bgcolor: item.highlight ? "rgba(200,168,64,0.12)" : "rgba(27,94,168,0.04)",
                            border: item.highlight
                              ? "1px solid rgba(200,168,64,0.4)"
                              : "1px solid rgba(27,94,168,0.1)",
                          }}
                        >
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.35, color: textMuted }}>
                            {item.icon}
                            <Typography sx={{ fontFamily: fontBody, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              {item.label}
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "0.95rem", color: textPrimary }}>
                            {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : null}

                  {ledger?.summary?.credit > 0 ? (
                    <Alert severity="info" sx={{ borderRadius: "12px", fontFamily: fontBody }}>
                      This student already has {money(ledger.summary.credit, ledger.summary.currency)} excess
                      credit. Recording more than the outstanding balance will increase that credit.
                    </Alert>
                  ) : ledger?.summary && Number(form.amount) > Number(ledger.summary.balance || 0) ? (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontFamily: fontBody }}>
                      Amount is above the outstanding balance of {money(ledger.summary.balance, ledger.summary.currency)}.
                      The excess will be kept as fee credit on this student&apos;s account.
                    </Alert>
                  ) : null}
                </Stack>
              ) : (
                <Alert severity="info" icon={<PersonSearchRoundedIcon />} sx={{ borderRadius: "14px", fontFamily: fontBody }}>
                  Select a student from the cards above to record their payment.
                </Alert>
              )}

              <Box>
                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontWeight: 700,
                    fontSize: "0.74rem",
                    color: textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    mb: 1,
                  }}
                >
                  Payment method
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(5, 1fr)" },
                    gap: 1.25,
                  }}
                >
                  {METHOD_OPTIONS.map((option) => (
                    <MethodTile
                      key={option.value}
                      option={option}
                      selected={form.method === option.value}
                      onSelect={(value) => setForm((old) => ({ ...old, method: value }))}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <TextField
                  label="Amount paid"
                  type="number"
                  required
                  value={form.amount}
                  onChange={setField("amount")}
                  sx={{
                    ...inputSx,
                    "& input": {
                      fontFamily: fontDisplay,
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: textPrimary,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: primaryGreen, fontSize: "0.9rem" }}>
                          KES
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Payment date and time"
                  type="datetime-local"
                  value={form.paid_at}
                  onChange={setField("paid_at")}
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventRoundedIcon sx={{ color: textMuted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TextField
                label="Transaction / receipt reference"
                helperText="Must be unique. Leave blank to generate an internal reference."
                value={form.reference}
                onChange={setField("reference")}
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptLongRoundedIcon sx={{ color: textMuted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Note (optional)"
                placeholder="e.g. Paid at the accounts office, cheque number, payer name…"
                value={form.narrative}
                onChange={setField("narrative")}
                multiline
                minRows={2}
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.25 }}>
                      <EditNoteRoundedIcon sx={{ color: textMuted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </FormSection>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, justifyContent: "flex-end" }}>
          <Button
            type="button"
            onClick={goBack}
            disabled={saving}
            sx={{ textTransform: "none", fontFamily: fontBody, fontWeight: 600, color: textSecondary, px: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitPayment}
            disabled={saving || !selected}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddCardRoundedIcon />}
            sx={{
              textTransform: "none",
              fontFamily: fontBody,
              fontWeight: 700,
              borderRadius: "12px",
              px: 3,
              py: 1.1,
              background: `linear-gradient(135deg, ${accentGold} 0%, ${accentGoldMuted} 100%)`,
              color: navy,
              boxShadow: "0 8px 24px -4px rgba(160,128,40,0.4)",
              "&:hover": { background: `linear-gradient(135deg, ${accentGoldMuted} 0%, ${accentGold} 100%)` },
              "&.Mui-disabled": { background: "rgba(30,40,88,0.12)", color: "rgba(30,40,88,0.4)" },
            }}
          >
            {saving ? "Recording…" : "Record payment"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
