import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
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
import {
  AssignmentInd as AssignmentIndIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, RoleTabs } from "../Users/usersUi";
import {
  authJsonHeaders,
  fontBody,
  fontDisplay,
  inputSx,
  pageShellSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import {
  ADMISSION_STATUS_TABS,
  admissionStatusChipSx,
  formatAdmissionStatus,
  formatDateTime,
} from "./admissionsShared";
import StatusUpdateDialog from "./StatusUpdateDialog";

export default function Admissions() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusTarget, setStatusTarget] = useState(null);

  const token = localStorage.getItem("token");
  const statusFilter = ADMISSION_STATUS_TABS[activeTab]?.value;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
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
      if (statusFilter) params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admissions?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load applications");
      }
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load applications");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, activeTab]);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete application?",
      text: `"${row.full_name}" will be permanently removed.`,
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: primaryGreen,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/admissions/${row.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      await Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
      if (items.length <= 1 && page > 0) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not delete",
        confirmButtonColor: primaryGreen,
      });
    }
  };

  if (loading && items.length === 0) {
    return <BrandPageLoader message="Loading admissions…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Admissions"
        subtitle="Review and manage applications from the public admissions form"
        icon={<AssignmentIndIcon sx={{ fontSize: 28, color: "#fff" }} />}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2.5,
          width: "100%",
        }}
      >
        <Box sx={{ minWidth: 0, "& > *": { mb: "0 !important" } }}>
          <RoleTabs
            activeTab={activeTab}
            onChange={(_e, idx) => setActiveTab(idx)}
            tabs={ADMISSION_STATUS_TABS}
          />
        </Box>
        <TextField
          size="small"
          placeholder="Search name, email, phone, ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            ...inputSx,
            width: { xs: "100%", md: 300 },
            ml: { md: "auto" },
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              ...inputSx["& .MuiOutlinedInput-root"],
              bgcolor: "#fff",
              height: 44,
            },
          }}
        />
      </Box>

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
              <TableCell>Applicant</TableCell>
              <TableCell>Programme</TableCell>
              <TableCell width={120}>KCSE</TableCell>
              <TableCell width={130}>Status</TableCell>
              <TableCell width={150}>Submitted</TableCell>
              <TableCell align="right" width={150}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                    No applications
                  </Typography>
                  <Typography sx={{ color: textSecondary }}>Nothing in this tab yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row, idx) => {
                const chip = admissionStatusChipSx(row.status);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "rgba(0,96,80,0.04)" },
                      "& td": { borderColor: "rgba(0,96,80,0.06)", fontFamily: fontBody },
                    }}
                  >
                    <TableCell sx={{ color: textMuted, fontWeight: 600 }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: textPrimary }}>{row.full_name}</Typography>
                      <Typography sx={{ fontSize: "0.78rem", color: textMuted }}>{row.email}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: textMuted }}>{row.phone}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, fontWeight: 600 }}>
                      {row.programme?.name || "—"}
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, fontWeight: 700 }}>{row.kcse_grade}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={formatAdmissionStatus(row.status)}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: chip.bg,
                          color: chip.color,
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: textMuted, fontSize: "0.82rem" }}>
                      {formatDateTime(row.created_at)}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View application" arrow>
                          <IconButton
                            onClick={() => navigate(`/admissions/${row.id}`)}
                            sx={{
                              color: primaryGreen,
                              bgcolor: "rgba(0,96,80,0.08)",
                              "&:hover": { bgcolor: "rgba(0,96,80,0.16)" },
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update status" arrow>
                          <IconButton
                            onClick={() => setStatusTarget(row)}
                            sx={{
                              color: "#1e2858",
                              bgcolor: "rgba(30,40,88,0.08)",
                              "&:hover": { bgcolor: "rgba(30,40,88,0.14)" },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            onClick={() => void handleDelete(row)}
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
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { fontFamily: fontBody },
          }}
        />
      </TableContainer>

      <StatusUpdateDialog
        open={Boolean(statusTarget)}
        application={statusTarget}
        onClose={() => setStatusTarget(null)}
        onSaved={() => void load()}
      />
    </Box>
  );
}
