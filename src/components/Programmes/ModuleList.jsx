import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
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
  Chip,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, MenuBook as ModuleIcon } from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  primaryGreen,
  primaryDark,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  pageShellSx,
  fetchResourceList,
  deleteResource,
  formatYear,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, HeroActionButton } from "../Users/usersUi";
import ProgrammesTabs from "./ProgrammesTabs";

export default function ModuleList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const token = localStorage.getItem("token");
  const programmeFilterId = new URLSearchParams(location.search).get("programme_id") || "";

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
      const json = await fetchResourceList("modules", token, {
        page: page + 1,
        limit: rowsPerPage,
        programme_id: programmeFilterId,
        search: debouncedSearch || undefined,
      });
      setItems(Array.isArray(json.data) ? json.data : []);
      setTotal(json.pagination?.total ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load modules");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, programmeFilterId, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, programmeFilterId]);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete module?",
      text: `"${row.name}" will be permanently removed.`,
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteResource("modules", row.id, token);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
      await load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Could not delete module", confirmButtonColor: primaryGreen });
    }
  };

  if (loading && items.length === 0) {
    return <BrandPageLoader message="Loading modules…" />;
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Programme modules"
        subtitle="Manage the modules taught across each programme"
        icon={<ModuleIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <HeroActionButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(programmeFilterId ? `/programmes/modules/create?programme_id=${programmeFilterId}` : "/programmes/modules/create")}
          >
            Add module
          </HeroActionButton>
        }
      />

      <ProgrammesTabs
        value="modules"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search modules…"
      />

      {programmeFilterId ? (
        <Chip
          label="Filtered by programme · clear"
          onClick={() => navigate("/programmes/modules")}
          onDelete={() => navigate("/programmes/modules")}
          sx={{ mb: 2, fontWeight: 600, bgcolor: "rgba(0,96,80,0.08)", color: primaryDark }}
        />
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0,96,80,0.1)", bgcolor: "#fff", boxShadow: "0 16px 40px -16px rgba(20,26,58,0.1)" }}>
        <TableContainer>
          <Table size="medium" sx={{ minWidth: 860 }}>
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
                <TableCell>Code</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Programme</TableCell>
                <TableCell align="right">Hours</TableCell>
                <TableCell align="right">Credits</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Year</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: primaryGreen }} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography sx={{ color: textSecondary, fontWeight: 600 }}>No modules yet.</Typography>
                    <Button
                      variant="text"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/programmes/modules/create")}
                      sx={{ mt: 1, color: primaryGreen, fontWeight: 700, textTransform: "none" }}
                    >
                      Add first module
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "rgba(0,96,80,0.04)" }, "& td": { borderColor: "rgba(0,96,80,0.06)" } }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: textMuted, fontSize: "0.85rem" }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: primaryDark }}>{row.code}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: textPrimary }}>{row.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.85rem", color: textSecondary }}>{row.programme?.name || "—"}</Typography>
                    </TableCell>
                    <TableCell align="right">{row.hours ?? 0}</TableCell>
                    <TableCell align="right">{row.credits ?? 0}</TableCell>
                    <TableCell>{row.semester || "—"}</TableCell>
                    <TableCell>{formatYear(row.year_of_study)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                        {[
                          { title: "View", icon: <ViewIcon fontSize="small" />, onClick: () => navigate(`/programmes/modules/${row.id}`), color: textSecondary },
                          { title: "Edit", icon: <EditIcon fontSize="small" />, onClick: () => navigate(`/programmes/modules/${row.id}/edit`), color: primaryGreen },
                          { title: "Delete", icon: <DeleteIcon fontSize="small" />, onClick: () => void handleDelete(row), color: primaryDark },
                        ].map((action) => (
                          <Tooltip key={action.title} title={action.title}>
                            <IconButton size="small" onClick={action.onClick} sx={{ color: action.color, "&:hover": { bgcolor: warmCream } }}>
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
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
          sx={{ borderTop: "1px solid rgba(0,96,80,0.1)", "& .MuiTablePagination-toolbar": { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 } }}
        />
      </Box>
    </Box>
  );
}
