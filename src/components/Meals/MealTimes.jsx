import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  EventRepeat as EventRepeatIcon,
} from "@mui/icons-material";
import {
  fontBody,
  ghostBtnSx,
  inputSx,
  primaryBtnSx,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import {
  EmptyNote,
  MEAL_CODES,
  MEAL_META,
  MealChip,
  Panel,
  alertError,
  confirmAction,
  formatDate,
  mealsApi,
  tableBodySx,
  tableHeadSx,
  toastSuccess,
  todayLocal,
} from "./mealsShared";

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const EMPTY_OVERRIDE = { service_date: "", meal_code: "L", start_time: "", end_time: "", reason: "" };

function DefaultTimes({ periods, onSaved }) {
  const [rows, setRows] = useState(periods);
  const [saving, setSaving] = useState(false);

  useEffect(() => setRows(periods), [periods]);

  const dirty = useMemo(
    () =>
      rows.some((r) => {
        const p = periods.find((x) => x.meal_code === r.meal_code);
        return p && (p.start_time !== r.start_time || p.end_time !== r.end_time || p.is_active !== r.is_active);
      }),
    [rows, periods]
  );

  const patch = (code, next) => setRows((prev) => prev.map((r) => (r.meal_code === code ? { ...r, ...next } : r)));

  const save = async () => {
    setSaving(true);
    try {
      const res = await mealsApi("/admin/periods", {
        method: "PUT",
        body: {
          periods: rows.map((r) => ({
            meal_code: r.meal_code,
            start_time: r.start_time,
            end_time: r.end_time,
            is_active: r.is_active,
          })),
        },
      });
      onSaved(res.data);
      toastSuccess("Meal times saved", "New scans follow these times from now on.");
    } catch (err) {
      alertError("Could not save meal times", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Default meal times"
      subtitle="Scans are accepted only inside these times. They apply every day unless you change a specific day below."
      action={
        <Stack direction="row" spacing={1}>
          <Button onClick={() => setRows(periods)} disabled={!dirty || saving} sx={ghostBtnSx}>
            Discard
          </Button>
          <Button
            onClick={save}
            disabled={!dirty || saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ ...primaryBtnSx, py: 0.8, px: 2, opacity: dirty ? 1 : 0.6 }}
          >
            Save times
          </Button>
        </Stack>
      }
    >
      <Stack spacing={1.5}>
        {rows.map((r) => {
          const meta = MEAL_META[r.meal_code];
          return (
            <Stack
              key={r.meal_code}
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ sm: "center" }}
              sx={{
                p: 1.5,
                borderRadius: "14px",
                border: "1px solid rgba(27,94,168,0.1)",
                borderLeft: `4px solid ${meta.color}`,
                opacity: r.is_active ? 1 : 0.6,
              }}
            >
              <Box sx={{ width: { sm: 150 }, flexShrink: 0 }}>
                <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary }}>{meta.name}</Typography>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                  Code {r.meal_code}
                </Typography>
              </Box>
              <TextField
                type="time"
                size="small"
                label="Starts"
                value={r.start_time}
                onChange={(e) => patch(r.meal_code, { start_time: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ ...inputSx, width: { xs: "100%", sm: 150 } }}
              />
              <TextField
                type="time"
                size="small"
                label="Ends"
                value={r.end_time}
                onChange={(e) => patch(r.meal_code, { end_time: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ ...inputSx, width: { xs: "100%", sm: 150 } }}
              />
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: { sm: "auto" } }}>
                <Switch
                  checked={r.is_active}
                  onChange={(e) => patch(r.meal_code, { is_active: e.target.checked })}
                />
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary }}>
                  {r.is_active ? "Served" : "Not served"}
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Panel>
  );
}

function DayOverrides({ periods }) {
  const today = todayLocal();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_OVERRIDE, service_date: today });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await mealsApi(`/admin/overrides?from=${addDays(today, -14)}`);
      setRows(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const periodFor = useCallback((code) => periods.find((p) => p.meal_code === code), [periods]);

  useEffect(() => {
    setForm((f) => {
      if (f.start_time || f.end_time) return f;
      const p = periodFor(f.meal_code);
      return p ? { ...f, start_time: p.start_time, end_time: p.end_time } : f;
    });
  }, [periodFor]);

  const pickMeal = (code) => {
    const p = periodFor(code);
    setForm((f) => ({ ...f, meal_code: code, start_time: p?.start_time || "", end_time: p?.end_time || "" }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await mealsApi("/admin/overrides", { method: "POST", body: form });
      toastSuccess("Meal time changed", res.message);
      const p = periodFor(EMPTY_OVERRIDE.meal_code);
      setForm({
        ...EMPTY_OVERRIDE,
        service_date: form.service_date,
        start_time: p?.start_time || "",
        end_time: p?.end_time || "",
      });
      load();
    } catch (err) {
      alertError("Could not change meal time", err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const ok = await confirmAction({
      title: "Go back to the default time?",
      text: `${row.meal_name} on ${formatDate(row.service_date)} will use ${row.default_start}–${row.default_end} again.`,
      confirmText: "Reset time",
      danger: true,
    });
    if (!ok) return;
    try {
      await mealsApi(`/admin/overrides/${row.id}`, { method: "DELETE" });
      toastSuccess("Back to default time");
      load();
    } catch (err) {
      alertError("Could not reset", err);
    }
  };

  const edit = (row) =>
    setForm({
      service_date: row.service_date,
      meal_code: row.meal_code,
      start_time: row.start_time,
      end_time: row.end_time,
      reason: row.reason || "",
    });

  const def = periodFor(form.meal_code);
  const canSave = form.service_date >= today && form.start_time && form.end_time && form.reason.trim();

  return (
    <Panel
      title="Change a meal time for one day"
      subtitle="Use this when a meal runs early or late. Only today and future days can be changed; for past days use manual marking."
    >
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "170px 150px 130px 130px 1fr auto" },
            alignItems: "start",
          }}
        >
          <TextField
            type="date"
            size="small"
            label="Day"
            value={form.service_date}
            onChange={(e) => setForm((f) => ({ ...f, service_date: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
            sx={inputSx}
          />
          <TextField
            select
            size="small"
            label="Meal"
            value={form.meal_code}
            onChange={(e) => pickMeal(e.target.value)}
            sx={inputSx}
          >
            {MEAL_CODES.map((c) => (
              <MenuItem key={c} value={c}>
                {MEAL_META[c].name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="time"
            size="small"
            label="Starts"
            value={form.start_time}
            onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={def ? `Default ${def.start_time}` : " "}
            sx={inputSx}
          />
          <TextField
            type="time"
            size="small"
            label="Ends"
            value={form.end_time}
            onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={def ? `Default ${def.end_time}` : " "}
            sx={inputSx}
          />
          <TextField
            size="small"
            label="Reason"
            placeholder="e.g. Lunch delayed by chapel service"
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            sx={inputSx}
          />
          <Button
            onClick={save}
            disabled={!canSave || saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <EventRepeatIcon />}
            sx={{ ...primaryBtnSx, py: 0.9, px: 2, whiteSpace: "nowrap", opacity: canSave ? 1 : 0.6 }}
          >
            Save change
          </Button>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {loading ? (
          <Box sx={{ py: 3, display: "grid", placeItems: "center" }}>
            <CircularProgress size={26} />
          </Box>
        ) : rows.length ? (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead sx={tableHeadSx}>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Meal</TableCell>
                  <TableCell>Time that day</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Changed by</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody sx={tableBodySx}>
                {rows.map((r) => (
                  <TableRow key={r.id} sx={{ opacity: r.editable ? 1 : 0.6 }}>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: r.service_date === today ? 800 : 500 }}>
                      {formatDate(r.service_date)}
                      {r.service_date === today ? " (today)" : ""}
                    </TableCell>
                    <TableCell>
                      <MealChip code={r.meal_code} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                      {r.start_time}–{r.end_time}
                    </TableCell>
                    <TableCell sx={{ color: `${textMuted} !important`, whiteSpace: "nowrap" }}>
                      {r.default_start}–{r.default_end}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>{r.reason || "—"}</TableCell>
                    <TableCell>{r.creator?.full_name || "—"}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {r.editable ? (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => edit(r)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset to default time">
                            <IconButton size="small" onClick={() => remove(r)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Past days are kept for the record">
                          <LockIcon fontSize="small" sx={{ color: textMuted, mr: 0.75 }} />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <EmptyNote>No day-specific changes in the last two weeks or coming up.</EmptyNote>
        )}
      </Stack>
    </Panel>
  );
}

export default function MealTimes() {
  const [periods, setPeriods] = useState([]);
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await mealsApi("/admin/periods");
        setPeriods(res.data || []);
        setTimezone(res.timezone || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {timezone ? (
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary }}>
          All times use school time ({timezone}).
        </Typography>
      ) : null}
      <DefaultTimes periods={periods} onSaved={setPeriods} />
      <DayOverrides periods={periods} />
    </Stack>
  );
}
