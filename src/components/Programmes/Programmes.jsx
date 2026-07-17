import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  primaryGreen,
  primaryDark,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  pageShellSx,
  authHeaders,
  programmeImageSrc,
  formatCategory,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton } from "../Users/usersUi";
import ProgrammesTabs from "./ProgrammesTabs";

function ProgrammeThumb({ src, size = 42 }) {
  return (
    <Avatar
      src={src || undefined}
      variant="rounded"
      sx={{
        width: size,
        height: size,
        borderRadius: "12px",
        bgcolor: "rgba(0,96,80,0.1)",
        color: primaryGreen,
        boxShadow: "0 4px 12px rgba(20,26,58,0.08)",
      }}
    >
      {!src ? <MenuBookIcon sx={{ fontSize: size * 0.45 }} /> : null}
    </Avatar>
  );
}

export default function Programmes() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadProgrammes = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!token) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);

    try {
      const res = await fetch(`/api/programmes?${params.toString()}`, {
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load programmes");
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load programmes");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    void loadProgrammes();
  }, [loadProgrammes]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const deleteProgramme = async (row) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete programme?",
      text: `"${row.name}" will be permanently removed, along with its fees, hours, and modules.`,
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/programmes/${row.id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1200,
        showConfirmButton: false,
      });
      await loadProgrammes();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not delete programme",
        confirmButtonColor: primaryGreen,
      });
    }
  };

  if (loading && items.length === 0) {
    return <BrandPageLoader message="Loading programmes…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Programmes"
        subtitle="Manage academic programmes offered by the school"
        icon={<MenuBookIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <HeroActionButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/programmes/create")}
          >
            Add programme
          </HeroActionButton>
        }
      />

      <ProgrammesTabs
        value="programmes"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search programmes…"
      />

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
          <Table size="medium" sx={{ minWidth: 760 }}>
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
                <TableCell>Programme</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: primaryGreen }} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography sx={{ color: textSecondary, fontWeight: 600 }}>
                      No programmes in this tab.
                    </Typography>
                    <Button
                      variant="text"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/programmes/create")}
                      sx={{ mt: 1, color: primaryGreen, fontWeight: 700, textTransform: "none" }}
                    >
                      Create first programme
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => {
                  const active = row.is_active !== false;
                  const img = programmeImageSrc(row);
                  return (
                    <TableRow
                      key={row.id}
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
                          <ProgrammeThumb src={img} size={44} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, color: textPrimary, lineHeight: 1.25 }}>
                              {row.name || "—"}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.78rem",
                                color: textSecondary,
                                maxWidth: 340,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.description || "No description"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: textSecondary }}>
                          {formatCategory(row.category)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: textSecondary }}>
                          {row.duration || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            bgcolor: active ? "rgba(0,96,80,0.1)" : "rgba(30,40,88,0.06)",
                            color: active ? primaryDark : textSecondary,
                            border: `1px solid ${active ? "rgba(0,96,80,0.2)" : "rgba(30,40,88,0.1)"}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                          {[
                            {
                              title: "View",
                              icon: <ViewIcon fontSize="small" />,
                              onClick: () => navigate(`/programmes/${row.id}`),
                              color: textSecondary,
                            },
                            {
                              title: "Edit",
                              icon: <EditIcon fontSize="small" />,
                              onClick: () => navigate(`/programmes/${row.id}/edit`),
                              color: primaryGreen,
                            },
                            {
                              title: "Delete",
                              icon: <DeleteIcon fontSize="small" />,
                              onClick: () => void deleteProgramme(row),
                              color: primaryDark,
                            },
                          ].map((action) => (
                            <Tooltip key={action.title} title={action.title}>
                              <IconButton
                                size="small"
                                onClick={action.onClick}
                                sx={{
                                  color: action.color,
                                  bgcolor: "transparent",
                                  "&:hover": { bgcolor: warmCream },
                                }}
                              >
                                {action.icon}
                              </IconButton>
                            </Tooltip>
                          ))}
                        </Stack>
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
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid rgba(0,96,80,0.1)",
            "& .MuiTablePagination-toolbar": {
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 600,
            },
          }}
        />
      </Box>
    </Box>
  );
}

