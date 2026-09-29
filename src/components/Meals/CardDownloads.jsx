import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  Save as SaveIcon,
  AddCircleOutline as AddIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { PremiumDialog, UserAvatar } from "../Users/usersUi";
import {
  fontBody,
  ghostBtnSx,
  inputSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import {
  EmptyNote,
  Panel,
  alertError,
  formatDate,
  formatDateTime,
  mealsApi,
  tableBodySx,
  tableHeadSx,
  toastSuccess,
} from "./mealsShared";

function PolicyPanel({ policy, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (policy) {
      setForm({
        is_enabled: Boolean(policy.is_enabled),
        max_downloads: policy.max_downloads ?? 2,
        start_date: policy.start_date || "",
        end_date: policy.end_date || "",
      });
    }
  }, [policy]);

  if (!form) return null;

  const dirty =
    form.is_enabled !== Boolean(policy.is_enabled) ||
    Number(form.max_downloads) !== policy.max_downloads ||
    (form.start_date || null) !== (policy.start_date || null) ||
    (form.end_date || null) !== (policy.end_date || null);

  const save = async () => {
    setSaving(true);
    try {
      const res = await mealsApi("/admin/download-policy", {
        method: "PUT",
        body: {
          is_enabled: form.is_enabled,
          max_downloads: Number(form.max_downloads),
          start_date: form.start_date || null,
          end_date: form.end_date || null,
        },
      });
      onSaved(res.data);
      toastSuccess("Download limit saved");
    } catch (err) {
      alertError("Could not save the limit", err);
    } finally {
      setSaving(false);
    }
  };

  let status = "Students can download their meal card any number of times.";
  if (policy.is_enabled) {
    status = policy.range_active
      ? `Limit is active now: ${policy.max_downloads} download${policy.max_downloads === 1 ? "" : "s"} per student until ${formatDate(policy.end_date)}.`
      : `Limit is on but today is outside ${formatDate(policy.start_date)} – ${formatDate(policy.end_date)}, so downloads are not limited right now.`;
  }

  return (
    <Panel
      title="Download limit"
      subtitle="Each download creates a new card and stops older printed copies from scanning. Limit how often students can do that."
      action={
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => onSaved(policy)}
            disabled={!dirty || saving}
            sx={ghostBtnSx}
          >
            Discard
          </Button>
          <Button
            onClick={save}
            disabled={!dirty || saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ ...primaryBtnSx, py: 0.8, px: 2, opacity: dirty ? 1 : 0.6 }}
          >
            Save limit
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Alert severity={policy.is_enabled && policy.range_active ? "info" : "success"} sx={{ borderRadius: "12px" }}>
          {status}
        </Alert>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "auto 200px 180px 180px" },
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Switch
              checked={form.is_enabled}
              onChange={(e) => setForm((f) => ({ ...f, is_enabled: e.target.checked }))}
            />
            <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary }}>
              Limit downloads
            </Typography>
          </Stack>
          <TextField
            type="number"
            size="small"
            label="Downloads per student"
            value={form.max_downloads}
            onChange={(e) => setForm((f) => ({ ...f, max_downloads: e.target.value }))}
            disabled={!form.is_enabled}
            slotProps={{ htmlInput: { min: 1, max: 50 } }}
            sx={inputSx}
          />
          <TextField
            type="date"
            size="small"
            label="From"
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            disabled={!form.is_enabled}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={inputSx}
          />
          <TextField
            type="date"
            size="small"
            label="Until"
            value={form.end_date}
            onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            disabled={!form.is_enabled}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form.start_date || undefined } }}
            sx={inputSx}
          />
        </Box>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: textMuted }}>
          Only downloads made between these dates count. Extra downloads you allow a student apply to this period only.
        </Typography>
      </Stack>
    </Panel>
  );
}

function GrantDialog({ student, onClose, onGranted }) {
  const [extra, setExtra] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setExtra(1);
    setReason("");
  }, [student]);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await mealsApi("/admin/downloads/grants", {
        method: "POST",
        body: { student_id: student.id, extra_downloads: Number(extra), reason: reason.trim() },
      });
      toastSuccess("Downloads allowed", res.message);
      onGranted();
    } catch (err) {
      alertError("Could not allow downloads", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PremiumDialog
      open={Boolean(student)}
      onClose={onClose}
      title="Allow more downloads"
      subtitle={student ? `${student.full_name} · ${student.admission_number || "—"}` : ""}
      icon={<AddIcon />}
      footer={
        <>
          <Button onClick={onClose} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving || !reason.trim() || !(Number(extra) >= 1 && Number(extra) <= 10)}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ ...primaryBtnSx, py: 0.9 }}
          >
            Allow
          </Button>
        </>
      }
    >
      {student ? (
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.86rem", color: textSecondary }}>
            Used {student.used} of {student.allowed} in the current period
            {student.extra ? ` (already ${student.extra} extra)` : ""}.
          </Typography>
          <TextField
            type="number"
            size="small"
            label="Extra downloads"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 10 } }}
            sx={inputSx}
          />
          <TextField
            size="small"
            label="Reason"
            placeholder="e.g. Lost card, reported to the dean"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
            sx={inputSx}
          />
        </Stack>
      ) : null}
    </PremiumDialog>
  );
}

function HistoryDialog({ student, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!student) return;
    setData(null);
    setError("");
    mealsApi(`/admin/downloads/${student.id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, [student]);

  const sectionTitle = (text) => (
    <Typography
      sx={{
        fontFamily: fontBody,
        fontSize: "0.7rem",
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: textMuted,
        mb: 0.75,
      }}
    >
      {text}
    </Typography>
  );

  return (
    <PremiumDialog
      open={Boolean(student)}
      onClose={onClose}
      title="Meal card history"
      subtitle={student ? `${student.full_name} · ${student.admission_number || "—"}` : ""}
      icon={<HistoryIcon />}
      maxWidth="md"
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!data && !error ? (
        <Box sx={{ py: 4, display: "grid", placeItems: "center" }}>
          <CircularProgress size={26} />
        </Box>
      ) : null}
      {data ? (
        <Stack spacing={2.5}>
          {data.allowance?.limited ? (
            <Alert severity={data.allowance.remaining > 0 ? "info" : "warning"} sx={{ borderRadius: "12px" }}>
              {data.allowance.used} of {data.allowance.allowed} downloads used between{" "}
              {formatDate(data.allowance.range_start)} and {formatDate(data.allowance.range_end)} ·{" "}
              {data.allowance.remaining} left
            </Alert>
          ) : null}

          <Box>
            {sectionTitle("Cards")}
            {data.cards.length ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {data.cards.map((c) => (
                  <Chip
                    key={c.id}
                    label={`#${c.version} · ${c.status === "active" ? "Active" : c.status === "replaced" ? "Replaced" : "Revoked"} · ${formatDate(c.issued_at)}`}
                    sx={{
                      fontFamily: fontBody,
                      fontWeight: 700,
                      bgcolor: c.status === "active" ? "rgba(15,118,110,0.12)" : "rgba(0,0,0,0.05)",
                      color: c.status === "active" ? "#0f766e" : textSecondary,
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.84rem", color: textSecondary }}>
                No card downloaded yet.
              </Typography>
            )}
          </Box>

          <Box>
            {sectionTitle("Downloads")}
            {data.downloads.length ? (
              <Table size="small">
                <TableHead sx={tableHeadSx}>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Card</TableCell>
                    <TableCell>IP address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={tableBodySx}>
                  {data.downloads.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{formatDateTime(d.downloaded_at)}</TableCell>
                      <TableCell>{d.card_version ? `#${d.card_version}` : "—"}</TableCell>
                      <TableCell>{d.ip_address || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.84rem", color: textSecondary }}>
                No downloads yet.
              </Typography>
            )}
          </Box>

          <Box>
            {sectionTitle("Extra downloads allowed")}
            {data.grants.length ? (
              <Table size="small">
                <TableHead sx={tableHeadSx}>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Extra</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={tableBodySx}>
                  {data.grants.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{formatDateTime(g.createdAt || g.created_at)}</TableCell>
                      <TableCell>+{g.extra_downloads}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(g.range_start)} – {formatDate(g.range_end)}
                      </TableCell>
                      <TableCell>{g.reason || "—"}</TableCell>
                      <TableCell>{g.granted_by_name || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.84rem", color: textSecondary }}>
                None.
              </Typography>
            )}
          </Box>
        </Stack>
      ) : null}
    </PremiumDialog>
  );
}

export default function CardDownloads() {
  const [policy, setPolicy] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [grantFor, setGrantFor] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);

  useEffect(() => {
    mealsApi("/admin/download-policy")
      .then((res) => setPolicy(res.data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadUsage = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page + 1), limit: String(limit), status });
      if (appliedSearch) params.set("search", appliedSearch);
      const res = await mealsApi(`/admin/downloads?${params}`);
      setRows(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, appliedSearch]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const policySaved = (next) => {
    setPolicy({ ...next });
    loadUsage();
  };

  const hasRange = Boolean(policy?.start_date && policy?.end_date);

  return (
    <Stack spacing={2.5}>
      {error ? (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      {policy ? <PolicyPanel policy={policy} onSaved={policySaved} /> : null}

      <Panel
        title="Student downloads"
        subtitle={
          hasRange
            ? `Counted between ${formatDate(policy.start_date)} and ${formatDate(policy.end_date)}`
            : "Set a limit period above to count downloads per student"
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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
              sx={{ ...inputSx, flex: 1 }}
            />
            <TextField
              select
              size="small"
              label="Show"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              sx={{ ...inputSx, width: { xs: "100%", sm: 220 } }}
            >
              <MenuItem value="all">All students</MenuItem>
              <MenuItem value="at_limit" disabled={!hasRange}>
                Reached the limit
              </MenuItem>
            </TextField>
          </Stack>

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
                    <TableCell sx={{ minWidth: 170 }}>Used in period</TableCell>
                    <TableCell>Active card</TableCell>
                    <TableCell>All-time</TableCell>
                    <TableCell>Last download</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody sx={tableBodySx}>
                  {rows.map((r) => {
                    const pct = r.allowed ? Math.min(100, (r.used / r.allowed) * 100) : 0;
                    return (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <UserAvatar name={r.full_name} role="student" src={r.profile_image_url} size={30} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.84rem", color: textPrimary }}>
                                {r.full_name}
                              </Typography>
                              <Typography noWrap sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                                {r.admission_number || "—"}
                                {r.programme_name ? ` · ${r.programme_name}` : ""}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {hasRange ? (
                            <Box>
                              <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.82rem", color: r.at_limit ? "#b45309" : textPrimary }}>
                                  {r.used} / {r.allowed}
                                </Typography>
                                {r.extra ? (
                                  <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: primaryGreen, fontWeight: 700 }}>
                                    +{r.extra} extra
                                  </Typography>
                                ) : null}
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={pct}
                                sx={{
                                  mt: 0.5,
                                  height: 5,
                                  borderRadius: 3,
                                  bgcolor: "rgba(27,94,168,0.1)",
                                  "& .MuiLinearProgress-bar": { bgcolor: r.at_limit ? "#d97706" : primaryGreen },
                                }}
                              />
                            </Box>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{r.active_version ? `#${r.active_version}` : "None"}</TableCell>
                        <TableCell>{r.total_downloads}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {r.last_download ? formatDateTime(r.last_download) : "Never"}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                          <Button
                            size="small"
                            startIcon={<HistoryIcon fontSize="small" />}
                            onClick={() => setHistoryFor(r)}
                            sx={{ ...ghostBtnSx, fontSize: "0.78rem" }}
                          >
                            History
                          </Button>
                          <Button
                            size="small"
                            startIcon={<DownloadIcon fontSize="small" />}
                            onClick={() => setGrantFor(r)}
                            disabled={!hasRange}
                            sx={{
                              ...ghostBtnSx,
                              fontSize: "0.78rem",
                              color: r.at_limit ? "#b45309" : primaryGreen,
                              fontWeight: 800,
                            }}
                          >
                            Allow more
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : !loading ? (
              <EmptyNote>
                {status === "at_limit" ? "No student has reached the limit." : "No students found."}
              </EmptyNote>
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
            rowsPerPageOptions={[10, 25, 50]}
            sx={{ ".MuiTablePagination-toolbar": { fontFamily: fontBody } }}
          />
        </Stack>
      </Panel>

      <GrantDialog
        student={grantFor}
        onClose={() => setGrantFor(null)}
        onGranted={() => {
          setGrantFor(null);
          loadUsage();
        }}
      />
      <HistoryDialog student={historyFor} onClose={() => setHistoryFor(null)} />
    </Stack>
  );
}
