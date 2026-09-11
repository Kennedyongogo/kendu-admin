import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  Alert,
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
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import LocalLibraryRoundedIcon from "@mui/icons-material/LocalLibraryRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import MiscellaneousServicesRoundedIcon from "@mui/icons-material/MiscellaneousServicesRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AssignmentReturnRoundedIcon from "@mui/icons-material/AssignmentReturnRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  accentGold,
  authJsonHeaders,
  fontBody,
  fontDisplay,
  inputSx,
  navy,
  pageShellSx,
  primaryDark,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { HeroActionButton, PremiumDialog, UsersHero } from "../Users/usersUi";
import BrandPageLoader from "../Util/BrandPageLoader";

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

const ROLE_COLORS = {
  student: primaryGreen,
  staff: navy,
  admin: accentGold,
};

const emptyBookForm = {
  title: "",
  author: "",
  quantity: 1,
  programme_id: "",
  notes: "",
};

const emptyRuleForm = {
  name: "",
  body: "",
  is_active: true,
};

const emptyElearnForm = {
  title: "",
  description: "",
  url: "",
  resource_type: "link",
  programme_id: "",
  is_active: true,
};

const emptyServiceForm = {
  name: "",
  description: "",
  category: "other",
  availability_note: "",
  is_active: true,
};

const SERVICE_CATEGORIES = [
  { value: "research", label: "Research & reference" },
  { value: "access", label: "Computers & internet" },
  { value: "print", label: "Print, copy & scan" },
  { value: "space", label: "Study spaces" },
  { value: "lending", label: "Lending support" },
  { value: "other", label: "Other" },
];

const serviceCategoryLabel = (value) =>
  SERVICE_CATEGORIES.find((c) => c.value === value)?.label || value || "Other";


function dateLabel(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateLabel(text, max = 22) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function StatCard({ icon, label, value, hint, accent = primaryGreen, index = 0, onClick }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      sx={{
        ...cardSx,
        p: 2.25,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              boxShadow: "0 20px 44px -18px rgba(20,26,58,0.22)",
            }
          : undefined,
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
              fontSize: { xs: "1.55rem", xl: "1.85rem" },
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

function ChartCard({ title, subtitle, children, index = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      sx={{ ...cardSx, p: { xs: 2, sm: 2.5 } }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.35 }}>
        <InsightsRoundedIcon sx={{ color: primaryGreen, fontSize: 20 }} />
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.05rem" }}>
          {title}
        </Typography>
      </Stack>
      <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.78rem", mb: 1.5 }}>
        {subtitle}
      </Typography>
      {children}
    </Box>
  );
}

function StatusChip({ status }) {
  const map = {
    active: { label: "On loan", bg: "rgba(0,96,80,0.12)", color: primaryGreen },
    overdue: { label: "Overdue", bg: "rgba(185,28,28,0.12)", color: "#b91c1c" },
    returned: { label: "Returned", bg: "rgba(30,40,88,0.1)", color: navy },
  };
  const tone = map[status] || map.active;
  return (
    <Chip
      size="small"
      label={tone.label}
      sx={{
        height: 24,
        fontWeight: 800,
        fontSize: "0.68rem",
        bgcolor: tone.bg,
        color: tone.color,
        fontFamily: fontBody,
      }}
    />
  );
}

function LibraryTabs({ activeTab, onChange, tabs }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={1}
      initial="hidden"
      animate="visible"
      sx={{
        mb: 2.75,
        p: { xs: 0.85, sm: 1 },
        borderRadius: "18px",
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(0,96,80,0.1)",
        boxShadow: "0 10px 28px -18px rgba(20,26,58,0.18)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: 0.85,
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x proximity",
          pb: 0.35,
          mx: { xs: -0.35, sm: 0 },
          px: { xs: 0.35, sm: 0 },
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(0,96,80,0.28)",
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "rgba(0,96,80,0.06)",
            borderRadius: 999,
          },
        }}
      >
        {tabs.map((item, index) => {
          const selected = activeTab === index;
          return (
            <Box
              key={item.key}
              component="button"
              type="button"
              onClick={() => onChange(index)}
              sx={{
                appearance: "none",
                border: selected ? "1px solid rgba(0,96,80,0.22)" : "1px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                borderRadius: "14px",
                px: 1.35,
                py: 1.2,
                minHeight: 72,
                minWidth: { xs: 168, sm: 178 },
                flex: "0 0 auto",
                scrollSnapAlign: "start",
                display: "flex",
                alignItems: "center",
                gap: 1.15,
                bgcolor: selected
                  ? `linear-gradient(145deg, ${primaryGreen} 0%, ${primaryDark} 120%)`
                  : "transparent",
                background: selected
                  ? `linear-gradient(145deg, ${primaryGreen} 0%, ${primaryDark} 120%)`
                  : "transparent",
                color: selected ? "#fff" : textPrimary,
                boxShadow: selected ? "0 10px 22px -12px rgba(0,96,80,0.55)" : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: selected ? undefined : warmCream,
                  background: selected
                    ? `linear-gradient(145deg, ${primaryGreen} 0%, ${primaryDark} 120%)`
                    : warmCream,
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  bgcolor: selected ? "rgba(255,255,255,0.16)" : "rgba(0,96,80,0.08)",
                  color: selected ? "#fff" : primaryGreen,
                  "& svg": { fontSize: 20 },
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
                  <Typography
                    sx={{
                      fontFamily: fontBody,
                      fontWeight: 800,
                      fontSize: "0.86rem",
                      lineHeight: 1.2,
                      color: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </Typography>
                  {item.count != null ? (
                    <Box
                      sx={{
                        minWidth: 24,
                        height: 22,
                        px: 0.7,
                        borderRadius: "999px",
                        display: "grid",
                        placeItems: "center",
                        fontFamily: fontBody,
                        fontWeight: 800,
                        fontSize: "0.68rem",
                        bgcolor: selected ? "rgba(255,255,255,0.2)" : "rgba(0,96,80,0.1)",
                        color: selected ? "#fff" : primaryGreen,
                        flexShrink: 0,
                      }}
                    >
                      {item.count}
                    </Box>
                  ) : null}
                </Stack>
                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.7rem",
                    mt: 0.35,
                    color: selected ? "rgba(255,255,255,0.78)" : textSecondary,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 140,
                  }}
                >
                  {item.hint}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [programmes, setProgrammes] = useState([]);

  const [books, setBooks] = useState([]);
  const [bookPage, setBookPage] = useState(0);
  const [bookRows, setBookRows] = useState(10);
  const [bookTotal, setBookTotal] = useState(0);
  const [bookSearch, setBookSearch] = useState("");
  const [bookDialog, setBookDialog] = useState(false);
  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [editingBook, setEditingBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);
  const [savingBook, setSavingBook] = useState(false);

  const [rules, setRules] = useState([]);
  const [ruleDialog, setRuleDialog] = useState(false);
  const [ruleForm, setRuleForm] = useState(emptyRuleForm);
  const [editingRule, setEditingRule] = useState(null);
  const [savingRule, setSavingRule] = useState(false);

  const [loans, setLoans] = useState([]);
  const [loanPage, setLoanPage] = useState(0);
  const [loanRows, setLoanRows] = useState(10);
  const [loanTotal, setLoanTotal] = useState(0);
  const [loanStatus, setLoanStatus] = useState("");
  const [loanSearch, setLoanSearch] = useState("");

  const [elearn, setElearn] = useState([]);
  const [elearnPage, setElearnPage] = useState(0);
  const [elearnRows, setElearnRows] = useState(10);
  const [elearnTotal, setElearnTotal] = useState(0);
  const [elearnSearch, setElearnSearch] = useState("");
  const [elearnDialog, setElearnDialog] = useState(false);
  const [elearnForm, setElearnForm] = useState(emptyElearnForm);
  const [editingElearn, setEditingElearn] = useState(null);
  const [savingElearn, setSavingElearn] = useState(false);

  const [services, setServices] = useState([]);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [editingService, setEditingService] = useState(null);
  const [savingService, setSavingService] = useState(false);

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(path, {
      ...options,
      headers: {
        ...authJsonHeaders(),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }, []);

  const loadStats = useCallback(async () => {
    const data = await api("/api/library/stats");
    setStats(data.data);
  }, [api]);

  const loadProgrammes = useCallback(async () => {
    const res = await fetch("/api/programmes?is_active=true&limit=100");
    const data = await res.json().catch(() => ({}));
    setProgrammes(Array.isArray(data.data) ? data.data : []);
  }, []);

  const loadBooks = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(bookPage + 1),
      limit: String(bookRows),
    });
    if (bookSearch.trim()) params.set("search", bookSearch.trim());
    const data = await api(`/api/library/books?${params}`);
    setBooks(data.data || []);
    setBookTotal(data.pagination?.total || 0);
  }, [api, bookPage, bookRows, bookSearch]);

  const loadRules = useCallback(async () => {
    const data = await api("/api/library/rules");
    setRules(data.data || []);
  }, [api]);

  const loadLoans = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(loanPage + 1),
      limit: String(loanRows),
    });
    if (loanStatus) params.set("status", loanStatus);
    if (loanSearch.trim()) params.set("search", loanSearch.trim());
    const data = await api(`/api/library/loans?${params}`);
    setLoans(data.data || []);
    setLoanTotal(data.pagination?.total || 0);
  }, [api, loanPage, loanRows, loanStatus, loanSearch]);

  const loadElearn = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(elearnPage + 1),
      limit: String(elearnRows),
    });
    if (elearnSearch.trim()) params.set("search", elearnSearch.trim());
    const data = await api(`/api/library/elearning?${params}`);
    setElearn(data.data || []);
    setElearnTotal(data.pagination?.total || 0);
  }, [api, elearnPage, elearnRows, elearnSearch]);

  const loadServices = useCallback(async () => {
    const data = await api("/api/library/services");
    setServices(data.data || []);
  }, [api]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([
        loadStats(),
        loadProgrammes(),
        loadBooks(),
        loadRules(),
        loadLoans(),
        loadElearn(),
        loadServices(),
      ]);
    } catch (err) {
      setError(err.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  }, [loadStats, loadProgrammes, loadBooks, loadRules, loadLoans, loadElearn, loadServices]);

  useEffect(() => {
    void loadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return;
    loadBooks().catch((err) => setError(err.message));
  }, [bookPage, bookRows]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return;
    const t = window.setTimeout(() => {
      setBookPage(0);
      loadBooks().catch((err) => setError(err.message));
    }, 320);
    return () => window.clearTimeout(t);
  }, [bookSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return;
    loadLoans().catch((err) => setError(err.message));
  }, [loanPage, loanRows, loanStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return;
    const t = window.setTimeout(() => {
      setLoanPage(0);
      loadLoans().catch((err) => setError(err.message));
    }, 320);
    return () => window.clearTimeout(t);
  }, [loanSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return;
    loadElearn().catch((err) => setError(err.message));
  }, [elearnPage, elearnRows]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return;
    const t = window.setTimeout(() => {
      setElearnPage(0);
      loadElearn().catch((err) => setError(err.message));
    }, 320);
    return () => window.clearTimeout(t);
  }, [elearnSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const programmeBar = useMemo(() => {
    const rows = stats?.by_programme || [];
    return {
      labels: rows.map((r) => truncateLabel(r.programme_name, 18)),
      copies: rows.map((r) => Number(r.copies) || 0),
      titles: rows.map((r) => Number(r.book_titles) || 0),
    };
  }, [stats]);

  const rolePie = useMemo(
    () =>
      (stats?.by_borrower_role || []).map((row, index) => ({
        id: index,
        value: Number(row.count) || 0,
        label: row.role.charAt(0).toUpperCase() + row.role.slice(1),
        color: ROLE_COLORS[row.role] || primaryGreen,
      })),
    [stats]
  );
  const hasRoleLoans = rolePie.some((r) => r.value > 0);

  const openBookCreate = () => {
    setEditingBook(null);
    setBookForm(emptyBookForm);
    setBookDialog(true);
  };
  const openBookEdit = (row) => {
    setEditingBook(row);
    setBookForm({
      title: row.title || "",
      author: row.author || "",
      quantity: row.quantity || 1,
      programme_id: row.programme_id || "",
      notes: row.notes || "",
    });
    setBookDialog(true);
  };

  const saveBook = async () => {
    if (!String(bookForm.title || "").trim() || !bookForm.programme_id) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Book title and programme are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    setSavingBook(true);
    const wasEditing = Boolean(editingBook);
    try {
      const body = {
        ...bookForm,
        quantity: Number(bookForm.quantity),
      };
      if (editingBook) {
        await api(`/api/library/books/${editingBook.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await api("/api/library/books", { method: "POST", body: JSON.stringify(body) });
      }
      setBookDialog(false);
      setEditingBook(null);
      await Promise.all([loadBooks(), loadStats()]);
      Swal.fire({
        icon: "success",
        title: wasEditing ? "Book updated" : "Book created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSavingBook(false);
    }
  };

  const deleteBook = async (row) => {
    const result = await Swal.fire({
      title: "Delete book?",
      text: `Remove “${row.title}”?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await api(`/api/library/books/${row.id}`, { method: "DELETE" });
      await Promise.all([loadBooks(), loadStats()]);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const openRuleCreate = () => {
    setEditingRule(null);
    setRuleForm(emptyRuleForm);
    setRuleDialog(true);
  };
  const openRuleEdit = (row) => {
    setEditingRule(row);
    setRuleForm({
      name: row.name || row.title || "",
      body: row.body || "",
      is_active: row.is_active !== false,
    });
    setRuleDialog(true);
  };

  const saveRule = async () => {
    if (!String(ruleForm.name || "").trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Rule title is required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!String(ruleForm.body || "").trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Rule text is required (e.g. “If a book is overdue, a fine is charged.”).",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    setSavingRule(true);
    const wasEditing = Boolean(editingRule);
    try {
      const body = {
        name: String(ruleForm.name).trim(),
        body: String(ruleForm.body).trim(),
        is_active: ruleForm.is_active !== false,
      };
      if (editingRule) {
        await api(`/api/library/rules/${editingRule.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await api("/api/library/rules", { method: "POST", body: JSON.stringify(body) });
      }
      setRuleDialog(false);
      setEditingRule(null);
      await Promise.all([loadRules(), loadStats()]);
      Swal.fire({
        icon: "success",
        title: wasEditing ? "Rule updated" : "Rule created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSavingRule(false);
    }
  };

  const deleteRule = async (row) => {
    const result = await Swal.fire({
      title: "Delete rule?",
      text: `Remove “${row.name}”?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await api(`/api/library/rules/${row.id}`, { method: "DELETE" });
      await Promise.all([loadRules(), loadStats()]);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const returnLoan = async (row) => {
    const result = await Swal.fire({
      title: "Return book?",
      text: `Mark “${row.book_title}” as returned by ${row.borrower_name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Return",
    });
    if (!result.isConfirmed) return;

    try {
      await api(`/api/library/loans/${row.id}/return`, { method: "POST", body: JSON.stringify({}) });
      await Promise.all([loadLoans(), loadBooks(), loadStats()]);
      Swal.fire({ icon: "success", title: "Book returned", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    }
  };

  const openElearnCreate = () => {
    setEditingElearn(null);
    setElearnForm(emptyElearnForm);
    setElearnDialog(true);
  };
  const openElearnEdit = (row) => {
    setEditingElearn(row);
    setElearnForm({
      title: row.title || "",
      description: row.description || "",
      url: row.url || "",
      resource_type: row.resource_type || "link",
      programme_id: row.programme_id || "",
      is_active: row.is_active !== false,
    });
    setElearnDialog(true);
  };

  const saveElearn = async () => {
    if (!String(elearnForm.title || "").trim() || !String(elearnForm.url || "").trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Title and URL are required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    setSavingElearn(true);
    const wasEditing = Boolean(editingElearn);
    try {
      const body = {
        ...elearnForm,
        programme_id: elearnForm.programme_id || null,
      };
      if (editingElearn) {
        await api(`/api/library/elearning/${editingElearn.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await api("/api/library/elearning", { method: "POST", body: JSON.stringify(body) });
      }
      setElearnDialog(false);
      setEditingElearn(null);
      await Promise.all([loadElearn(), loadStats()]);
      Swal.fire({
        icon: "success",
        title: wasEditing ? "Resource updated" : "Resource created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSavingElearn(false);
    }
  };

  const deleteElearn = async (row) => {
    const result = await Swal.fire({
      title: "Delete resource?",
      text: `Remove “${row.title}”?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await api(`/api/library/elearning/${row.id}`, { method: "DELETE" });
      await Promise.all([loadElearn(), loadStats()]);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    }
  };

  const openServiceCreate = () => {
    setEditingService(null);
    setServiceForm(emptyServiceForm);
    setServiceDialog(true);
  };
  const openServiceEdit = (row) => {
    setEditingService(row);
    setServiceForm({
      name: row.name || "",
      description: row.description || "",
      category: row.category || "other",
      availability_note: row.availability_note || "",
      is_active: row.is_active !== false,
    });
    setServiceDialog(true);
  };

  const saveService = async () => {
    if (!String(serviceForm.name || "").trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Service name is required.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    setSavingService(true);
    const wasEditing = Boolean(editingService);
    try {
      const body = {
        name: String(serviceForm.name).trim(),
        description: String(serviceForm.description || "").trim() || null,
        category: serviceForm.category || "other",
        availability_note: String(serviceForm.availability_note || "").trim() || null,
        is_active: serviceForm.is_active !== false,
      };
      if (editingService) {
        await api(`/api/library/services/${editingService.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await api("/api/library/services", { method: "POST", body: JSON.stringify(body) });
      }
      setServiceDialog(false);
      setEditingService(null);
      await Promise.all([loadServices(), loadStats()]);
      Swal.fire({
        icon: "success",
        title: wasEditing ? "Service updated" : "Service created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: primaryGreen });
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (row) => {
    const result = await Swal.fire({
      title: "Delete service?",
      text: `Remove “${row.name}”?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await api(`/api/library/services/${row.id}`, { method: "DELETE" });
      await Promise.all([loadServices(), loadStats()]);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    }
  };

  if (loading) return <BrandPageLoader message="Loading library…" />;

  const summary = stats?.summary || {};

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Library"
        subtitle="Books, services, rules, loans, and e-learning."
        icon={<LocalLibraryRoundedIcon sx={{ fontSize: 28 }} />}
        actions={
          tab === 1 ? (
            <HeroActionButton variant="contained" startIcon={<AddRoundedIcon />} onClick={openBookCreate}>
              Add book
            </HeroActionButton>
          ) : tab === 2 ? (
            <HeroActionButton variant="contained" startIcon={<AddRoundedIcon />} onClick={openRuleCreate}>
              Add rule
            </HeroActionButton>
          ) : tab === 3 ? (
            <HeroActionButton
              variant="contained"
              startIcon={<SwapHorizRoundedIcon />}
              onClick={() => navigate("/library/issue")}
            >
              Issue book
            </HeroActionButton>
          ) : tab === 4 ? (
            <HeroActionButton variant="contained" startIcon={<AddRoundedIcon />} onClick={openElearnCreate}>
              Add resource
            </HeroActionButton>
          ) : tab === 5 ? (
            <HeroActionButton variant="contained" startIcon={<AddRoundedIcon />} onClick={openServiceCreate}>
              Add service
            </HeroActionButton>
          ) : null
        }
      />

      <LibraryTabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          {
            key: "dashboard",
            label: "Dashboard",
            hint: "Overview & insights",
            icon: <DashboardRoundedIcon />,
          },
          {
            key: "books",
            label: "Books",
            hint: "Catalogue & stock",
            count: bookTotal,
            icon: <MenuBookRoundedIcon />,
          },
          {
            key: "rules",
            label: "Rules",
            hint: "Loan policies",
            count: rules.length,
            icon: <RuleRoundedIcon />,
          },
          {
            key: "loans",
            label: "Loans",
            hint: "Charge & discharge",
            count: loanTotal,
            icon: <SwapHorizRoundedIcon />,
          },
          {
            key: "elearning",
            label: "E-learning",
            hint: "Digital resources",
            count: elearnTotal,
            icon: <AutoStoriesRoundedIcon />,
          },
          {
            key: "services",
            label: "Services",
            hint: "What the library offers",
            count: services.length,
            icon: <MiscellaneousServicesRoundedIcon />,
          },
        ]}
      />

      {error ? (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: "14px" }}
          onClose={() => setError("")}
          action={
            <Button color="inherit" onClick={() => loadAll()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      {tab === 0 ? (
        <Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            <StatCard
              index={0}
              label="Book titles"
              value={summary.book_titles ?? 0}
              hint={`${summary.copies ?? 0} physical copies in stock`}
              icon={<MenuBookRoundedIcon />}
              onClick={() => setTab(1)}
            />
            <StatCard
              index={1}
              label="Available now"
              value={summary.available ?? 0}
              hint="Copies ready to issue"
              icon={<Inventory2RoundedIcon />}
              accent="#2e7d32"
              onClick={() => setTab(1)}
            />
            <StatCard
              index={2}
              label="On loan"
              value={summary.on_loan ?? 0}
              hint={`${summary.overdue ?? 0} overdue`}
              icon={<SwapHorizRoundedIcon />}
              accent={navy}
              onClick={() => setTab(3)}
            />
            <StatCard
              index={3}
              label="Overdue"
              value={summary.overdue ?? 0}
              hint="Past due date, not returned"
              icon={<WarningAmberRoundedIcon />}
              accent="#b26a00"
              onClick={() => {
                setLoanStatus("overdue");
                setTab(3);
              }}
            />
            <StatCard
              index={4}
              label="Returned"
              value={summary.returned ?? 0}
              hint="Completed discharges"
              icon={<AssignmentReturnRoundedIcon />}
              accent={primaryGreen}
              onClick={() => {
                setLoanStatus("returned");
                setTab(3);
              }}
            />
            <StatCard
              index={5}
              label="E-learning"
              value={summary.elearning ?? 0}
              hint="Published digital resources"
              icon={<AutoStoriesRoundedIcon />}
              accent={navy}
              onClick={() => setTab(4)}
            />
            <StatCard
              index={6}
              label="Active rules"
              value={summary.rules ?? 0}
              hint="Loan policies in force"
              icon={<RuleRoundedIcon />}
              accent={accentGold}
              onClick={() => setTab(2)}
            />
            <StatCard
              index={7}
              label="Services"
              value={summary.services ?? 0}
              hint="Active library services"
              icon={<MiscellaneousServicesRoundedIcon />}
              accent={navy}
              onClick={() => setTab(5)}
            />
            <StatCard
              index={8}
              label="Programmes covered"
              value={(stats?.by_programme || []).length}
              hint="With catalogue books"
              icon={<SchoolRoundedIcon />}
              accent={primaryDark}
              onClick={() => setTab(1)}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.45fr) minmax(300px, 0.85fr)" },
              gap: 2,
              mt: 2,
            }}
          >
            <ChartCard
              index={1}
              title="Copies by programme"
              subtitle="Physical stock attached to each academic programme"
            >
              {programmeBar.labels.length ? (
                <BarChart
                  height={280}
                  series={[
                    { data: programmeBar.copies, label: "Copies", color: primaryGreen },
                    { data: programmeBar.titles, label: "Titles", color: navy },
                  ]}
                  xAxis={[{ data: programmeBar.labels, scaleType: "band" }]}
                  borderRadius={8}
                  grid={{ horizontal: true }}
                  margin={{ left: 40, right: 12, top: 30, bottom: 40 }}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography sx={{ fontFamily: fontBody, color: textSecondary }}>
                    Add books linked to programmes to see this chart.
                  </Typography>
                </Box>
              )}
            </ChartCard>

            <ChartCard index={2} title="Active loans by role" subtitle="Who currently holds library books">
              {hasRoleLoans ? (
                <PieChart
                  height={280}
                  series={[
                    {
                      data: rolePie,
                      innerRadius: 58,
                      outerRadius: 100,
                      paddingAngle: 3,
                      cornerRadius: 6,
                    },
                  ]}
                  slotProps={{ legend: { direction: "row", position: { vertical: "bottom", horizontal: "center" } } }}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography sx={{ fontFamily: fontBody, color: textSecondary }}>
                    No books are on loan yet.
                  </Typography>
                </Box>
              )}
            </ChartCard>
          </Box>

          <Box component={motion.div} variants={fadeUp} custom={3} initial="hidden" animate="visible" sx={{ ...cardSx, mt: 2, p: 2.25 }}>
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, mb: 1.5 }}>
              Recent loans
            </Typography>
            {(stats?.recent_loans || []).length === 0 ? (
              <Typography sx={{ fontFamily: fontBody, color: textSecondary, py: 3, textAlign: "center" }}>
                Issue a book to see activity here.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {(stats.recent_loans || []).map((row) => (
                  <Stack
                    key={row.id}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ sm: "center" }}
                    sx={{
                      p: 1.35,
                      borderRadius: "14px",
                      bgcolor: warmCream,
                      border: "1px solid rgba(0,96,80,0.08)",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary, fontSize: "0.9rem" }}>
                        {row.book_title}
                      </Typography>
                      <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.78rem" }}>
                        {row.borrower_name} · {row.borrower_role} · issued {dateLabel(row.issued_at)}
                      </Typography>
                    </Box>
                    <StatusChip status={row.status} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      ) : null}

      {tab === 1 ? (
        <Box sx={cardSx}>
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,96,80,0.08)" }}>
            <TextField
              size="small"
              placeholder="Search books…"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: textMuted, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...inputSx, minWidth: { sm: 280 }, maxWidth: 420 }}
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(0,96,80,0.04)" }}>
                  {["No", "Title", "Author", "Programme", "Stock", "Available", "Action"].map((h) => (
                    <TableCell key={h} sx={{ fontFamily: fontBody, fontWeight: 800 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((row, idx) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontFamily: fontBody, fontWeight: 700, color: textMuted, width: 56 }}>
                      {bookPage * bookRows + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>{row.title}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody, color: textSecondary }}>{row.author || "—"}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody }}>{row.programme_name || "—"}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody }}>{row.quantity}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody, fontWeight: 700, color: primaryGreen }}>{row.available}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                        <Tooltip title="View">
                          <IconButton onClick={() => setViewingBook(row)} sx={{ color: navy }}>
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => openBookEdit(row)}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => deleteBook(row)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!books.length ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, fontFamily: fontBody, color: textSecondary }}>
                      No books yet. Add your first title.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={bookTotal}
            page={bookPage}
            onPageChange={(_, p) => setBookPage(p)}
            rowsPerPage={bookRows}
            onRowsPerPageChange={(e) => {
              setBookRows(parseInt(e.target.value, 10));
              setBookPage(0);
            }}
          />
        </Box>
      ) : null}

      {tab === 2 ? (
        <Box sx={{ ...cardSx, p: { xs: 2, sm: 2.5 } }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.05rem", mb: 0.5 }}>
            Library rules
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.82rem", mb: 2.25, maxWidth: 560 }}>
            Write policy as “if X, then Y” — published rules, not loan calculators.
          </Typography>
          {rules.length ? (
            <Stack spacing={1.5}>
              {rules.map((row) => (
                  <Box
                    key={row.id}
                    sx={{
                      borderLeft: `3px solid ${row.is_active ? primaryGreen : "rgba(30,40,88,0.25)"}`,
                      pl: 2,
                      pr: 1,
                      py: 1.25,
                      bgcolor: row.is_active ? "rgba(0,96,80,0.03)" : "rgba(30,40,88,0.03)",
                      borderRadius: "0 12px 12px 0",
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: "wrap" }}>
                          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1rem" }}>
                            {row.name || row.title}
                          </Typography>
                          {!row.is_active ? (
                            <Chip
                              size="small"
                              label="Inactive"
                              sx={{ height: 20, fontWeight: 700, fontSize: "0.65rem", bgcolor: "rgba(30,40,88,0.08)", color: textSecondary }}
                            />
                          ) : null}
                        </Stack>
                        <Typography
                          sx={{
                            fontFamily: fontBody,
                            color: textSecondary,
                            fontSize: "0.88rem",
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {row.body || "—"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                        <IconButton onClick={() => openRuleEdit(row)} size="small">
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => deleteRule(row)} size="small">
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, py: 4, textAlign: "center" }}>
              No rules yet. Add one such as: “If a book is returned late, a fine is charged per day overdue.”
            </Typography>
          )}
        </Box>
      ) : null}

      {tab === 3 ? (
        <Box sx={cardSx}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{ p: 2, borderBottom: "1px solid rgba(0,96,80,0.08)" }}
          >
            <TextField
              size="small"
              placeholder="Search by book title…"
              value={loanSearch}
              onChange={(e) => setLoanSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: textMuted, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...inputSx, minWidth: { sm: 240 }, maxWidth: 360 }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={loanStatus}
              onChange={(e) => {
                setLoanPage(0);
                setLoanStatus(e.target.value);
              }}
              sx={{ ...inputSx, minWidth: 150, maxWidth: 180 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">On loan</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
            </TextField>
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(0,96,80,0.04)" }}>
                  {["No", "Book", "Borrower", "Role", "Issued", "Due", "Returned", "Status", "Action"].map((h) => (
                    <TableCell key={h} sx={{ fontFamily: fontBody, fontWeight: 800 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((row, idx) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontFamily: fontBody, fontWeight: 700, color: textMuted, width: 56 }}>
                      {loanPage * loanRows + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>{row.book_title}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody }}>
                      {row.borrower_name}
                      {row.borrower_admission ? (
                        <Typography sx={{ fontSize: "0.72rem", color: textSecondary }}>{row.borrower_admission}</Typography>
                      ) : null}
                    </TableCell>
                    <TableCell sx={{ fontFamily: fontBody, textTransform: "capitalize" }}>{row.borrower_role}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody, whiteSpace: "nowrap" }}>{dateLabel(row.issued_at)}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody, whiteSpace: "nowrap" }}>{dateLabel(row.due_at)}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody, whiteSpace: "nowrap" }}>{dateLabel(row.returned_at)}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                        {row.status !== "returned" ? (
                          <Tooltip title="Discharge / return">
                            <IconButton onClick={() => returnLoan(row)} sx={{ color: primaryGreen }}>
                              <AssignmentReturnRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!loans.length ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5, fontFamily: fontBody, color: textSecondary }}>
                      No loans recorded yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={loanTotal}
            page={loanPage}
            onPageChange={(_, p) => setLoanPage(p)}
            rowsPerPage={loanRows}
            onRowsPerPageChange={(e) => {
              setLoanRows(parseInt(e.target.value, 10));
              setLoanPage(0);
            }}
          />
        </Box>
      ) : null}

      {tab === 4 ? (
        <Box sx={cardSx}>
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,96,80,0.08)" }}>
            <TextField
              size="small"
              placeholder="Search e-learning…"
              value={elearnSearch}
              onChange={(e) => setElearnSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: textMuted, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...inputSx, minWidth: { sm: 280 }, maxWidth: 420 }}
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(0,96,80,0.04)" }}>
                  {["No", "Title", "Type", "Programme", "Link", "Status", "Action"].map((h) => (
                    <TableCell key={h} sx={{ fontFamily: fontBody, fontWeight: 800 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {elearn.map((row, idx) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontFamily: fontBody, fontWeight: 700, color: textMuted, width: 56 }}>
                      {elearnPage * elearnRows + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontFamily: fontBody, fontWeight: 700 }}>{row.title}</TableCell>
                    <TableCell sx={{ fontFamily: fontBody, textTransform: "uppercase", fontSize: "0.75rem" }}>
                      {row.resource_type}
                    </TableCell>
                    <TableCell sx={{ fontFamily: fontBody }}>{row.programme_name || "All programmes"}</TableCell>
                    <TableCell>
                      <Tooltip title={row.url}>
                        <IconButton component="a" href={row.url} target="_blank" rel="noreferrer" size="small">
                          <OpenInNewRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.is_active ? "Active" : "Off"}
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          bgcolor: row.is_active ? "rgba(0,96,80,0.1)" : "rgba(30,40,88,0.08)",
                          color: row.is_active ? primaryGreen : textSecondary,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                        <IconButton onClick={() => openElearnEdit(row)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => deleteElearn(row)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!elearn.length ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, fontFamily: fontBody, color: textSecondary }}>
                      No e-learning resources yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={elearnTotal}
            page={elearnPage}
            onPageChange={(_, p) => setElearnPage(p)}
            rowsPerPage={elearnRows}
            onRowsPerPageChange={(e) => {
              setElearnRows(parseInt(e.target.value, 10));
              setElearnPage(0);
            }}
          />
        </Box>
      ) : null}

      {tab === 5 ? (
        <Box sx={{ ...cardSx, p: { xs: 2, sm: 2.5 } }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.05rem", mb: 0.5 }}>
            Library services
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.82rem", mb: 2.25, maxWidth: 580 }}>
            Services the library offers beyond borrowing — printing, reference help, study rooms, and more.
          </Typography>
          {services.length ? (
            <Stack spacing={1.5}>
              {services.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    borderLeft: `3px solid ${row.is_active ? primaryGreen : "rgba(30,40,88,0.25)"}`,
                    pl: 2,
                    pr: 1,
                    py: 1.25,
                    bgcolor: row.is_active ? "rgba(0,96,80,0.03)" : "rgba(30,40,88,0.03)",
                    borderRadius: "0 12px 12px 0",
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: "wrap" }}>
                        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1rem" }}>
                          {row.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={serviceCategoryLabel(row.category)}
                          sx={{
                            height: 20,
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            bgcolor: "rgba(0,96,80,0.1)",
                            color: primaryGreen,
                          }}
                        />
                        {!row.is_active ? (
                          <Chip
                            size="small"
                            label="Inactive"
                            sx={{ height: 20, fontWeight: 700, fontSize: "0.65rem", bgcolor: "rgba(30,40,88,0.08)", color: textSecondary }}
                          />
                        ) : null}
                      </Stack>
                      {row.description ? (
                        <Typography
                          sx={{
                            fontFamily: fontBody,
                            color: textSecondary,
                            fontSize: "0.88rem",
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                            mb: row.availability_note ? 0.75 : 0,
                          }}
                        >
                          {row.description}
                        </Typography>
                      ) : null}
                      {row.availability_note ? (
                        <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.78rem" }}>
                          {row.availability_note}
                        </Typography>
                      ) : null}
                    </Box>
                    <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                      <IconButton onClick={() => openServiceEdit(row)} size="small">
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => deleteService(row)} size="small">
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, py: 4, textAlign: "center" }}>
              No services yet. Add offerings such as photocopying, research help, or study rooms.
            </Typography>
          )}
        </Box>
      ) : null}

      <PremiumDialog
        open={bookDialog}
        onClose={() => setBookDialog(false)}
        title={editingBook ? "Edit book" : "Add book"}
        subtitle="Store the title, how many copies you hold, and the programme it supports."
        icon={<MenuBookRoundedIcon />}
        footer={
          <>
            <Button onClick={() => setBookDialog(false)} sx={{ textTransform: "none", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={savingBook || !bookForm.title || !bookForm.programme_id}
              onClick={saveBook}
              startIcon={savingBook ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ textTransform: "none", fontWeight: 800, bgcolor: primaryGreen, borderRadius: "12px" }}
            >
              {editingBook ? "Save changes" : "Create book"}
            </Button>
          </>
        }
      >
        <Stack spacing={1.75} sx={{ pt: 1 }}>
          <TextField label="Book title" value={bookForm.title} onChange={(e) => setBookForm((f) => ({ ...f, title: e.target.value }))} fullWidth sx={inputSx} />
          <TextField label="Author" value={bookForm.author} onChange={(e) => setBookForm((f) => ({ ...f, author: e.target.value }))} fullWidth sx={inputSx} />
          <TextField
            label="Quantity"
            type="number"
            value={bookForm.quantity}
            onChange={(e) => setBookForm((f) => ({ ...f, quantity: e.target.value }))}
            fullWidth
            sx={inputSx}
            inputProps={{ min: 1 }}
          />
          <TextField
            select
            label="Programme"
            value={bookForm.programme_id}
            onChange={(e) => setBookForm((f) => ({ ...f, programme_id: e.target.value }))}
            fullWidth
            sx={inputSx}
          >
            {programmes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            value={bookForm.notes}
            onChange={(e) => setBookForm((f) => ({ ...f, notes: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
            sx={inputSx}
          />
        </Stack>
      </PremiumDialog>

      <PremiumDialog
        open={Boolean(viewingBook)}
        onClose={() => setViewingBook(null)}
        title="Book details"
        subtitle="Catalogue record for this library title."
        icon={<MenuBookRoundedIcon />}
        footer={
          <>
            <Button onClick={() => setViewingBook(null)} sx={{ textTransform: "none", fontWeight: 700 }}>
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={() => {
                const row = viewingBook;
                setViewingBook(null);
                if (row) openBookEdit(row);
              }}
              sx={{ textTransform: "none", fontWeight: 800, bgcolor: primaryGreen, borderRadius: "12px" }}
            >
              Edit book
            </Button>
          </>
        }
      >
        {viewingBook ? (
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            {[
              { label: "Title", value: viewingBook.title },
              { label: "Author", value: viewingBook.author || "—" },
              { label: "Programme", value: viewingBook.programme_name || "—" },
              { label: "Total copies", value: viewingBook.quantity },
              { label: "Available", value: viewingBook.available },
              { label: "On loan", value: viewingBook.on_loan ?? Math.max(0, Number(viewingBook.quantity || 0) - Number(viewingBook.available || 0)) },
              { label: "Notes", value: viewingBook.notes || "—" },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: 1,
                  p: 1.25,
                  borderRadius: "12px",
                  bgcolor: warmCream,
                  border: "1px solid rgba(0,96,80,0.08)",
                }}
              >
                <Typography sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.75rem", color: textMuted }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontFamily: fontBody, fontWeight: 600, fontSize: "0.88rem", color: textPrimary }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : null}
      </PremiumDialog>

      <PremiumDialog
        open={ruleDialog}
        onClose={() => setRuleDialog(false)}
        title={editingRule ? "Edit rule" : "Add rule"}
        subtitle="Write it like a law: if this happens, then this consequence follows."
        icon={<RuleRoundedIcon />}
        footer={
          <>
            <Button onClick={() => setRuleDialog(false)} sx={{ textTransform: "none", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={savingRule || !ruleForm.name || !ruleForm.body}
              onClick={saveRule}
              startIcon={savingRule ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ textTransform: "none", fontWeight: 800, bgcolor: primaryGreen, borderRadius: "12px" }}
            >
              {editingRule ? "Save changes" : "Add rule"}
            </Button>
          </>
        }
      >
        <Stack spacing={1.75} sx={{ pt: 1 }}>
          <TextField
            select
            label="Status"
            value={ruleForm.is_active ? "active" : "inactive"}
            onChange={(e) => setRuleForm((f) => ({ ...f, is_active: e.target.value === "active" }))}
            fullWidth
            sx={inputSx}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <TextField
            label="Title"
            placeholder="e.g. Overdue returns"
            value={ruleForm.name}
            onChange={(e) => setRuleForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            sx={inputSx}
          />
          <TextField
            label="Rule text"
            placeholder="If a borrowed book is returned after its due date, a fine is charged for each day overdue."
            value={ruleForm.body}
            onChange={(e) => setRuleForm((f) => ({ ...f, body: e.target.value }))}
            fullWidth
            multiline
            minRows={4}
            sx={inputSx}
            helperText="Condition → consequence."
          />
        </Stack>
      </PremiumDialog>

      <PremiumDialog
        open={elearnDialog}
        onClose={() => setElearnDialog(false)}
        title={editingElearn ? "Edit e-learning" : "Add e-learning"}
        subtitle="Publish a digital resource students and staff can open online."
        icon={<AutoStoriesRoundedIcon />}
        footer={
          <>
            <Button onClick={() => setElearnDialog(false)} sx={{ textTransform: "none", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={savingElearn || !elearnForm.title || !elearnForm.url}
              onClick={saveElearn}
              startIcon={savingElearn ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ textTransform: "none", fontWeight: 800, bgcolor: primaryGreen, borderRadius: "12px" }}
            >
              {editingElearn ? "Save changes" : "Create resource"}
            </Button>
          </>
        }
      >
        <Stack spacing={1.75} sx={{ pt: 1 }}>
          <TextField label="Title" value={elearnForm.title} onChange={(e) => setElearnForm((f) => ({ ...f, title: e.target.value }))} fullWidth sx={inputSx} />
          <TextField label="URL" value={elearnForm.url} onChange={(e) => setElearnForm((f) => ({ ...f, url: e.target.value }))} fullWidth sx={inputSx} />
          <TextField
            select
            label="Type"
            value={elearnForm.resource_type}
            onChange={(e) => setElearnForm((f) => ({ ...f, resource_type: e.target.value }))}
            fullWidth
            sx={inputSx}
          >
            <MenuItem value="link">Link</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            select
            label="Programme (optional)"
            value={elearnForm.programme_id}
            onChange={(e) => setElearnForm((f) => ({ ...f, programme_id: e.target.value }))}
            fullWidth
            sx={inputSx}
          >
            <MenuItem value="">All programmes</MenuItem>
            {programmes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description"
            value={elearnForm.description}
            onChange={(e) => setElearnForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
            sx={inputSx}
          />
        </Stack>
      </PremiumDialog>

      <PremiumDialog
        open={serviceDialog}
        onClose={() => setServiceDialog(false)}
        title={editingService ? "Edit service" : "Add service"}
        subtitle="Describe what the library offers and when it is available."
        icon={<MiscellaneousServicesRoundedIcon />}
        footer={
          <>
            <Button onClick={() => setServiceDialog(false)} sx={{ textTransform: "none", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={savingService || !serviceForm.name}
              onClick={saveService}
              startIcon={savingService ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ textTransform: "none", fontWeight: 800, bgcolor: primaryGreen, borderRadius: "12px" }}
            >
              {editingService ? "Save changes" : "Add service"}
            </Button>
          </>
        }
      >
        <Stack spacing={1.75} sx={{ pt: 1 }}>
          <TextField
            label="Service name"
            placeholder="e.g. Photocopying & printing"
            value={serviceForm.name}
            onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            sx={inputSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              select
              label="Category"
              value={serviceForm.category}
              onChange={(e) => setServiceForm((f) => ({ ...f, category: e.target.value }))}
              fullWidth
              sx={inputSx}
            >
              {SERVICE_CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={serviceForm.is_active ? "active" : "inactive"}
              onChange={(e) => setServiceForm((f) => ({ ...f, is_active: e.target.value === "active" }))}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
          <TextField
            label="Description"
            placeholder="What this service includes and who can use it."
            value={serviceForm.description}
            onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
            sx={inputSx}
          />
          <TextField
            label="Availability"
            placeholder="e.g. Weekdays 8am–5pm · Ground floor counter"
            value={serviceForm.availability_note}
            onChange={(e) => setServiceForm((f) => ({ ...f, availability_note: e.target.value }))}
            fullWidth
            sx={inputSx}
          />
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
