import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Search as SearchIcon, DeleteOutline as DeleteIcon } from "@mui/icons-material";
import { UserAvatar } from "../Users/usersUi";
import { fontBody, inputSx, textMuted, textPrimary } from "../Users/usersShared";
import {
  EmptyNote,
  MEAL_CODES,
  MEAL_META,
  MealChip,
  MethodChip,
  Panel,
  alertError,
  confirmAction,
  formatDate,
  formatTime,
  mealsApi,
  tableBodySx,
  tableHeadSx,
  toastSuccess,
  todayLocal,
} from "./mealsShared";

export default function ServingLog() {
  const today = todayLocal();
  const [filters, setFilters] = useState({ date_from: today, date_to: today, meal_code: "", method: "", search: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(15);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.search === search.trim() ? f : { ...f, search: search.trim() }));
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page + 1), limit: String(limit) });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      const res = await mealsApi(`/admin/servings?${params}`);
      setRows(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(0);
  };

  const remove = async (row) => {
    const ok = await confirmAction({
      title: "Remove this serving?",
      text: `${MEAL_META[row.meal_code]?.name} for ${row.student?.full_name || "student"} on ${formatDate(row.service_date)} will be deleted. The student could then be served that meal again.`,
      confirmText: "Remove",
      danger: true,
    });
    if (!ok) return;
    try {
      await mealsApi(`/admin/servings/${row.id}`, { method: "DELETE" });
      toastSuccess("Serving removed");
      load();
    } catch (err) {
      alertError("Could not remove", err);
    }
  };

  return (
    <Panel title="Serving log" subtitle={`${total} record${total === 1 ? "" : "s"} match your filters`}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr 1fr", md: "160px 160px 140px 140px 1fr" },
          }}
        >
          <TextField
            type="date"
            size="small"
            label="From"
            value={filters.date_from}
            onChange={(e) => setFilter("date_from", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={inputSx}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            value={filters.date_to}
            onChange={(e) => setFilter("date_to", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={inputSx}
          />
          <TextField
            select
            size="small"
            label="Meal"
            value={filters.meal_code}
            onChange={(e) => setFilter("meal_code", e.target.value)}
            sx={inputSx}
          >
            <MenuItem value="">All meals</MenuItem>
            {MEAL_CODES.map((c) => (
              <MenuItem key={c} value={c}>
                {MEAL_META[c].name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Method"
            value={filters.method}
            onChange={(e) => setFilter("method", e.target.value)}
            sx={inputSx}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="qr">QR scan</MenuItem>
            <MenuItem value="manual">Manual</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Student"
            placeholder="Name or admission no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ ...inputSx, gridColumn: { xs: "1 / -1", md: "auto" } }}
          />
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box sx={{ overflowX: "auto", position: "relative", minHeight: 120 }}>
          {loading ? (
            <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 1 }}>
              <CircularProgress size={26} />
            </Box>
          ) : null}
          {rows.length ? (
            <Table size="small" sx={{ opacity: loading ? 0.5 : 1 }}>
              <TableHead sx={tableHeadSx}>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Meal</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Recorded by</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody sx={tableBodySx}>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UserAvatar name={r.student?.full_name} role="student" src={r.student?.profile_image_url} size={30} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.84rem", color: textPrimary }}>
                            {r.student?.full_name || "—"}
                          </Typography>
                          <Typography noWrap sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                            {r.student?.admission_number || "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(r.service_date)}</TableCell>
                    <TableCell>
                      <MealChip code={r.meal_code} />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatTime(r.served_at)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MethodChip method={r.method} />
                        {r.card_version ? (
                          <Typography sx={{ fontFamily: fontBody, fontSize: "0.7rem", color: textMuted }}>
                            #{r.card_version}
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{r.server?.full_name || "—"}</TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>{r.note || "—"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove mistaken record">
                        <IconButton size="small" onClick={() => remove(r)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !loading ? (
            <EmptyNote>No meals recorded for these filters.</EmptyNote>
          ) : null}
        </Box>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[15, 30, 50]}
          sx={{ ".MuiTablePagination-toolbar": { fontFamily: fontBody } }}
        />
      </Stack>
    </Panel>
  );
}
