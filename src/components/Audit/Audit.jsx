import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LanOutlinedIcon from "@mui/icons-material/LanOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import {
  authJsonHeaders,
  primaryGreen,
  primaryDark,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  inputSx,
  ghostBtnSx,
  pageShellSx,
} from "../Users/usersShared";
import {
  UsersHero,
  RoleTabs,
  PremiumDialog,
  DetailField,
  UserAvatar,
} from "../Users/usersUi";
import BrandPageLoader from "../Util/BrandPageLoader";

/** Matches backend resource_type values from audit middleware / controllers */
const RESOURCE_TABS = [
  { label: "All", value: null },
  { label: "Users", value: "user" },
  { label: "Programmes", value: "programme" },
  { label: "System", value: "system" },
];

/** Matches AuditTrail.action ENUM */
const ACTION_OPTIONS = [
  { label: "All actions", value: "" },
  { label: "Create", value: "create" },
  { label: "Read", value: "read" },
  { label: "Update", value: "update" },
  { label: "Delete", value: "delete" },
  { label: "Login", value: "login" },
  { label: "Logout", value: "logout" },
  { label: "Other", value: "other" },
];

/** Matches AuditTrail.status ENUM */
const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
];

const ACTION_STYLES = {
  create: { color: "#15803d", bg: "#dcfce7" },
  read: { color: "#1e2858", bg: "rgba(30,40,88,0.1)" },
  update: { color: "#a16207", bg: "#fef3c7" },
  delete: { color: "#b91c1c", bg: "#fee2e2" },
  login: { color: "#006050", bg: "rgba(0,96,80,0.12)" },
  logout: { color: "#57534e", bg: "#f5f5f4" },
  other: { color: "#57534e", bg: "#f5f5f4" },
};

const STATUS_STYLES = {
  success: { color: "#15803d", bg: "#dcfce7" },
  failed: { color: "#b91c1c", bg: "#fee2e2" },
};

function formatLabel(value) {
  if (!value) return "—";
  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionTone(action) {
  return ACTION_STYLES[String(action || "").toLowerCase()] || ACTION_STYLES.other;
}

function statusTone(status) {
  return STATUS_STYLES[String(status || "").toLowerCase()] || ACTION_STYLES.other;
}

function AuditChip({ label, tone }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        fontWeight: 700,
        fontSize: "0.72rem",
        height: 26,
        borderRadius: "8px",
        color: tone.color,
        bgcolor: tone.bg,
        border: "none",
      }}
    />
  );
}

function JsonBlock({ title, data, variant = "neutral" }) {
  if (!data || (typeof data === "object" && !Object.keys(data).length)) return null;
  const palette =
    variant === "old"
      ? { bg: "#fef2f2", border: "rgba(185,28,28,0.16)", label: "#b91c1c" }
      : variant === "new"
        ? { bg: "#f0fdf4", border: "rgba(21,128,61,0.16)", label: "#15803d" }
        : { bg: warmCream, border: "rgba(0,96,80,0.1)", label: textSecondary };

  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: `1px solid ${palette.border}`,
        bgcolor: palette.bg,
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${palette.border}` }}>
        <Typography
          sx={{
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontSize: "0.72rem",
            fontWeight: 800,
            color: palette.label,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: "0.78rem",
          lineHeight: 1.55,
          color: textPrimary,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: 220,
          overflow: "auto",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </Box>
    </Box>
  );
}

function StatPill({ label, value, accent = primaryGreen }) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        minWidth: 140,
        flex: 1,
        borderRadius: "16px",
        bgcolor: "#fff",
        border: "1px solid rgba(0,96,80,0.1)",
        boxShadow: "0 8px 24px -12px rgba(20,26,58,0.12)",
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontSize: "0.72rem",
          fontWeight: 700,
          color: textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 800,
          fontSize: "1.5rem",
          color: accent,
          lineHeight: 1.2,
          mt: 0.25,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function Audit() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please sign in again.");
        return;
      }

      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });

      const resourceType = RESOURCE_TABS[selectedTab]?.value;
      if (resourceType) queryParams.set("resource_type", resourceType);
      if (actionFilter) queryParams.set("action", actionFilter);
      if (statusFilter) queryParams.set("status", statusFilter);
      if (searchQuery.trim()) queryParams.set("q", searchQuery.trim());

      const response = await fetch(`/api/audit-trail?${queryParams}`, {
        headers: authJsonHeaders(token),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not load audit logs.");
        setAuditLogs([]);
        setTotalLogs(0);
        return;
      }

      setAuditLogs(Array.isArray(data.data) ? data.data : []);
      setTotalLogs(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Could not load audit logs.");
      setAuditLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedTab, actionFilter, statusFilter, searchQuery]);

  useEffect(() => {
    void fetchAuditLogs();
  }, [fetchAuditLogs]);

  const pageStats = useMemo(() => {
    const success = auditLogs.filter((l) => l.status === "success").length;
    const failed = auditLogs.filter((l) => l.status === "failed").length;
    return { success, failed };
  }, [auditLogs]);

  const handleViewLog = async (log) => {
    setSelectedLog(log);
    setOpenViewDialog(true);
    const token = localStorage.getItem("token");
    if (!token || !log?.id) return;

    setDetailLoading(true);
    try {
      const res = await fetch(`/api/audit-trail/${log.id}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setSelectedLog(data.data);
      }
    } catch {
      // keep list row data if detail fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDialog = () => {
    setOpenViewDialog(false);
    setSelectedLog(null);
    setDetailLoading(false);
  };

  const handleTabChange = (_e, value) => {
    setSelectedTab(value);
    setPage(0);
  };

  const applySearch = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  if (loading && auditLogs.length === 0) {
    return <BrandPageLoader message="Loading audit trail…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Audit Trail"
        subtitle="Track who did what in the admin portal — actions, resources, and outcomes."
        icon={<HistoryIcon sx={{ fontSize: 28, color: "#fff" }} />}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
        <StatPill label="Total entries" value={totalLogs.toLocaleString()} />
        <StatPill label="Success on page" value={pageStats.success} accent="#15803d" />
        <StatPill label="Failed on page" value={pageStats.failed} accent="#b91c1c" />
      </Stack>

      <RoleTabs activeTab={selectedTab} onChange={handleTabChange} tabs={RESOURCE_TABS} />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <TextField
          size="small"
          placeholder="Search description…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applySearch();
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{ ...inputSx, flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ ...inputSx, minWidth: 160 }}>
          <InputLabel>Action</InputLabel>
          <Select
            label="Action"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
          >
            {ACTION_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ ...inputSx, minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={applySearch}
          sx={{
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "12px",
            bgcolor: primaryGreen,
            px: 2.5,
            "&:hover": { bgcolor: primaryDark },
          }}
        >
          Search
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid rgba(0,96,80,0.1)",
          bgcolor: "#fff",
          boxShadow: "0 16px 40px -16px rgba(20,26,58,0.1)",
        }}
      >
        <TableContainer>
          <Table size="medium" sx={{ minWidth: 720 }}>
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
                  },
                }}
              >
                <TableCell width={56}>#</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>When</TableCell>
                <TableCell align="right" width={72}>
                  View
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: primaryGreen }} />
                  </TableCell>
                </TableRow>
              ) : auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <HistoryIcon sx={{ fontSize: 40, color: "rgba(0,96,80,0.25)", mb: 1 }} />
                      <Typography
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontWeight: 700,
                          color: textPrimary,
                        }}
                      >
                        No audit logs found
                      </Typography>
                      <Typography sx={{ fontSize: "0.88rem", color: textMuted, mt: 0.5 }}>
                        Try another filter, or activity will appear as staff use the portal.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log, idx) => {
                  const name = log.user?.full_name || "System";
                  const when = log.created_at || log.createdAt;
                  return (
                    <TableRow
                      key={log.id}
                      hover
                      sx={{
                        transition: "background 0.15s ease",
                        "&:hover": { bgcolor: "rgba(0,96,80,0.04)" },
                        "& td": { borderColor: "rgba(0,96,80,0.06)" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: textMuted, fontSize: "0.85rem" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <UserAvatar name={name} role={log.user?.role || "admin"} size={40} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, color: textPrimary, fontSize: "0.88rem" }}>
                              {name}
                            </Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: textMuted }} noWrap>
                              {log.user?.email || "System activity"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <AuditChip label={formatLabel(log.action)} tone={actionTone(log.action)} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: textPrimary }}>
                          {formatLabel(log.resource_type)}
                        </Typography>
                        {log.resource_id ? (
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              color: textMuted,
                              fontFamily: "monospace",
                              maxWidth: 120,
                            }}
                            noWrap
                            title={log.resource_id}
                          >
                            {log.resource_id}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <AuditChip label={formatLabel(log.status)} tone={statusTone(log.status)} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: textSecondary }}>
                          {formatDate(when)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            onClick={() => void handleViewLog(log)}
                            sx={{
                              color: primaryGreen,
                              bgcolor: "rgba(0,96,80,0.08)",
                              "&:hover": { bgcolor: "rgba(0,96,80,0.16)" },
                            }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid rgba(0,96,80,0.08)",
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            color: textSecondary,
          }}
        />
      </Box>

      <PremiumDialog
        open={openViewDialog}
        onClose={closeDialog}
        title="Audit log details"
        subtitle={
          selectedLog
            ? formatDate(selectedLog.created_at || selectedLog.createdAt)
            : ""
        }
        icon={<HistoryIcon />}
        maxWidth="md"
        footer={
          <Button onClick={closeDialog} sx={ghostBtnSx}>
            Close
          </Button>
        }
      >
        {detailLoading && !selectedLog ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CircularProgress sx={{ color: primaryGreen }} />
          </Box>
        ) : selectedLog ? (
          <Stack spacing={2}>
            {detailLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 0.5 }}>
                <CircularProgress size={22} sx={{ color: primaryGreen }} />
              </Box>
            ) : null}
            <Box
              sx={{
                p: 2,
                borderRadius: "18px",
                background: `linear-gradient(135deg, ${warmCream} 0%, #fff 100%)`,
                border: "1px solid rgba(0,96,80,0.1)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <UserAvatar
                  name={selectedLog.user?.full_name || "System"}
                  role={selectedLog.user?.role || "admin"}
                  size={48}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: textPrimary,
                    }}
                  >
                    {selectedLog.user?.full_name || "System"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: textSecondary }}>
                    {selectedLog.user?.email || "No user email"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                  <AuditChip label={formatLabel(selectedLog.action)} tone={actionTone(selectedLog.action)} />
                  <AuditChip label={formatLabel(selectedLog.status)} tone={statusTone(selectedLog.status)} />
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <DetailField
                icon={<CategoryOutlinedIcon fontSize="small" />}
                label="Resource type"
                value={formatLabel(selectedLog.resource_type)}
              />
              <DetailField
                icon={<FingerprintOutlinedIcon fontSize="small" />}
                label="Resource ID"
                value={selectedLog.resource_id || "—"}
              />
              <DetailField
                icon={<LanOutlinedIcon fontSize="small" />}
                label="IP address"
                value={selectedLog.ip_address || "—"}
              />
              <DetailField
                icon={<ScheduleOutlinedIcon fontSize="small" />}
                label="Date & time"
                value={formatDate(selectedLog.created_at || selectedLog.createdAt)}
              />
            </Box>

            <DetailField
              icon={<DescriptionOutlinedIcon fontSize="small" />}
              label="Description"
              value={selectedLog.description || "—"}
            />

            {selectedLog.user_agent ? (
              <DetailField
                icon={<DevicesOutlinedIcon fontSize="small" />}
                label="User agent"
                value={selectedLog.user_agent}
              />
            ) : null}

            <JsonBlock title="Previous values" data={selectedLog.old_values} variant="old" />
            <JsonBlock title="New values" data={selectedLog.new_values} variant="new" />
            <JsonBlock title="Metadata" data={selectedLog.metadata} variant="neutral" />
          </Stack>
        ) : null}
      </PremiumDialog>
    </Box>
  );
}
