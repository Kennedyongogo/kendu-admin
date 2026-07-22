import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { alpha } from "@mui/material/styles";
import {
  authJsonHeaders,
  getPortalToken,
  primaryGreen,
  primaryDark,
  navy,
  accentGold,
  textPrimary,
  textSecondary,
  fontBody,
  fontDisplay,
} from "../Users/usersShared";

const REASON_LABELS = {
  admission: "Admission",
  admin_transfer: "Admin transfer",
  semester_transfer: "Semester transfer",
  year_transfer: "Year transfer",
  placement_update: "Placement update",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CohortTransferRegisterPanel({
  programmeId,
  yearOfStudy,
  searchQuery = "",
  refreshKey = 0,
  registerVisible = true,
}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [backfillBusy, setBackfillBusy] = useState(false);
  const [backfillMessage, setBackfillMessage] = useState("");
  const abortRef = useRef(null);
  const prevRefreshKeyRef = useRef(refreshKey);
  const hadVisibleLoadRef = useRef(false);

  const loadRegister = useCallback(
    async ({ silent = false } = {}) => {
      if (!programmeId || !yearOfStudy || !registerVisible) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const token = getPortalToken();
      if (!token) return;

      if (!silent) setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ limit: "100" });
        if (semesterFilter) params.set("semester", semesterFilter);
        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(
          `/api/cohort-transfer/programmes/${encodeURIComponent(programmeId)}/years/${encodeURIComponent(
            yearOfStudy
          )}/register?${params}`,
          { headers: authJsonHeaders(token), signal: controller.signal }
        );
        const data = await res.json().catch(() => ({}));
        if (controller.signal.aborted) return;
        if (!res.ok || !data.success) throw new Error(data.message || "Could not load register.");
        setEntries(Array.isArray(data.data?.entries) ? data.data.entries : []);
      } catch (e) {
        if (controller.signal.aborted || e.name === "AbortError") return;
        setError(e.message || "Could not load register.");
        if (!silent) setEntries([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [programmeId, yearOfStudy, registerVisible, searchQuery, semesterFilter]
  );

  useEffect(() => {
    if (!registerVisible || !programmeId || !yearOfStudy) return;
    hadVisibleLoadRef.current = true;
    void loadRegister();
    return () => abortRef.current?.abort();
  }, [programmeId, yearOfStudy, registerVisible, searchQuery, semesterFilter, loadRegister]);

  useEffect(() => {
    if (!registerVisible || !hadVisibleLoadRef.current) {
      prevRefreshKeyRef.current = refreshKey;
      return;
    }
    if (prevRefreshKeyRef.current === refreshKey) return;
    prevRefreshKeyRef.current = refreshKey;
    void loadRegister({ silent: true });
  }, [refreshKey, registerVisible, loadRegister]);

  const runBackfill = async () => {
    const token = getPortalToken();
    if (!token) return;
    setBackfillBusy(true);
    setBackfillMessage("");
    try {
      const res = await fetch("/api/cohort-transfer/register/backfill", {
        method: "POST",
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Backfill failed.");
      setBackfillMessage(data.message || "Backfill complete.");
      void loadRegister({ silent: entries.length > 0 });
    } catch (e) {
      setBackfillMessage(e.message || "Backfill failed.");
    } finally {
      setBackfillBusy(false);
    }
  };

  return (
    <Box sx={{ mt: 0.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ sm: "center" }}
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${alpha(primaryGreen, 0.06)} 0%, ${alpha(accentGold, 0.08)} 100%)`,
          border: `1px solid ${alpha(primaryGreen, 0.12)}`,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.05rem", color: primaryDark }}>
            Movement register
          </Typography>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", color: textSecondary, mt: 0.2 }}>
            Year {yearOfStudy} · From → To history for every transfer
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={backfillBusy ? <CircularProgress size={14} /> : <HistoryIcon />}
          disabled={backfillBusy}
          onClick={() => void runBackfill()}
          sx={{
            fontWeight: 800,
            fontFamily: fontBody,
            textTransform: "none",
            borderRadius: "10px",
            borderColor: alpha(primaryGreen, 0.35),
            color: primaryDark,
          }}
        >
          Backfill admissions
        </Button>
        <TextField
          select
          size="small"
          label="Semester"
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          sx={{
            minWidth: 140,
            "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff", fontFamily: fontBody },
          }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="1">Semester 1</MenuItem>
          <MenuItem value="2">Semester 2</MenuItem>
        </TextField>
      </Stack>

      {backfillMessage ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setBackfillMessage("")}>
          {backfillMessage}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} sx={{ color: primaryGreen }} />
        </Box>
      ) : error ? (
        <Typography color="error" variant="body2" sx={{ fontFamily: fontBody }}>
          {error}
        </Typography>
      ) : !entries.length ? (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            borderRadius: "16px",
            border: `1.5px dashed ${alpha(primaryGreen, 0.22)}`,
            bgcolor: alpha(primaryGreen, 0.03),
          }}
        >
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary }}>
            No movements yet
          </Typography>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary, mt: 0.5 }}>
            {searchQuery
              ? `No rows match "${searchQuery}".`
              : "Transfers and admissions for this year will appear here."}
          </Typography>
        </Box>
      ) : (
        <TableContainer
          sx={{
            borderRadius: "16px",
            border: `1px solid ${alpha(navy, 0.08)}`,
            boxShadow: `0 8px 28px ${alpha(navy, 0.05)}`,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  background: `linear-gradient(90deg, ${primaryGreen} 0%, ${navy} 100%)`,
                  "& .MuiTableCell-root": {
                    color: "#fff",
                    fontWeight: 800,
                    fontFamily: fontBody,
                    fontSize: "0.72rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    borderBottom: "none",
                    py: 1.25,
                  },
                }}
              >
                <TableCell>Date</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Placement</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>By</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((row, i) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    bgcolor: i % 2 ? alpha(primaryGreen, 0.03) : "#fff",
                    "& .MuiTableCell-root": {
                      fontFamily: fontBody,
                      borderColor: alpha(navy, 0.06),
                      py: 1.15,
                    },
                  }}
                >
                  <TableCell>{formatDate(row.started_on)}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: textPrimary }}>
                      {row.student?.full_name || "—"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: textSecondary }}>
                      {row.student?.admission_number || ""}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{row.placement_label}</TableCell>
                  <TableCell sx={{ fontSize: "0.78rem", color: textSecondary }}>
                    {row.previous_history?.placement_label || "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={REASON_LABELS[row.reason] || row.reason}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        bgcolor: alpha(accentGold, 0.15),
                        color: navy,
                        border: `1px solid ${alpha(accentGold, 0.35)}`,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>{row.moved_by_user?.full_name || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.is_active ? "Active" : "Completed"}
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.68rem",
                        bgcolor: row.is_active ? alpha(primaryGreen, 0.12) : alpha(navy, 0.08),
                        color: row.is_active ? primaryGreen : navy,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
