import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Search as SearchIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { UserAvatar } from "../Users/usersUi";
import { fontBody, inputSx, textMuted, textPrimary, textSecondary } from "../Users/usersShared";
import {
  EmptyNote,
  MEAL_CODES,
  MEAL_META,
  Panel,
  alertError,
  confirmAction,
  formatDate,
  mealsApi,
  toastSuccess,
  todayLocal,
} from "./mealsShared";

export default function ManualMarking() {
  const today = todayLocal();
  const [date, setDate] = useState(today);
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const requestId = useRef(0);

  const isPast = date < today;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return undefined;
    }
    const id = ++requestId.current;
    const t = setTimeout(async () => {
      setSearching(true);
      setError("");
      try {
        const res = await mealsApi(
          `/students/search?q=${encodeURIComponent(q)}&date=${encodeURIComponent(date)}`
        );
        if (id === requestId.current) setResults(res.data || []);
      } catch (err) {
        if (id === requestId.current) setError(err.message);
      } finally {
        if (id === requestId.current) setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, date]);

  const mark = async (student, code) => {
    const meal = MEAL_META[code].name;
    if (isPast && !note.trim()) {
      alertError("Add a note first", new Error("Explain why a past meal is being marked, e.g. scanner was offline."));
      return;
    }
    const ok = await confirmAction({
      title: `Mark ${meal}?`,
      text: `${student.full_name} (${student.admission_number || "no admission no."}) — ${formatDate(date)}`,
      confirmText: `Mark ${meal}`,
    });
    if (!ok) return;
    const key = `${student.id}-${code}`;
    setBusyKey(key);
    try {
      const res = await mealsApi("/servings/manual", {
        method: "POST",
        body: {
          student_id: student.id,
          meal_code: code,
          service_date: date,
          note: note.trim() || undefined,
        },
      });
      setResults((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, served: { ...s.served, [code]: true } } : s))
      );
      toastSuccess("Marked", res.message);
    } catch (err) {
      if (err.status === 409) {
        setResults((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, served: { ...s.served, [code]: true } } : s))
        );
      }
      alertError("Could not mark meal", err);
    } finally {
      setBusyKey("");
    }
  };

  return (
    <Panel
      title="Manual marking"
      subtitle="Record a meal when a card cannot be scanned. Each student can only be served each meal once per day."
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "180px 1fr" },
          }}
        >
          <TextField
            type="date"
            size="small"
            label="Day"
            value={date}
            onChange={(e) => setDate(e.target.value && e.target.value <= today ? e.target.value : today)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: today } }}
            sx={inputSx}
          />
          <TextField
            size="small"
            label="Find student"
            placeholder="Name, admission number or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {searching ? <CircularProgress size={16} /> : <SearchIcon fontSize="small" />}
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />
        </Box>

        {isPast ? (
          <TextField
            size="small"
            label="Note (required for past days)"
            placeholder="e.g. Scanner was offline during lunch"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={inputSx}
          />
        ) : null}

        {error ? <Alert severity="error">{error}</Alert> : null}

        {query.trim().length < 2 ? (
          <EmptyNote>Type at least two characters to find a student.</EmptyNote>
        ) : !searching && !results.length ? (
          <EmptyNote>No students match “{query.trim()}”.</EmptyNote>
        ) : (
          <Stack spacing={1}>
            {results.map((s) => (
              <Stack
                key={s.id}
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
                sx={{
                  p: 1.25,
                  borderRadius: "14px",
                  border: "1px solid rgba(27,94,168,0.1)",
                  opacity: s.is_active ? 1 : 0.55,
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                  <UserAvatar name={s.full_name} role="student" src={s.profile_image_url} size={38} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary }}>
                      {s.full_name}
                    </Typography>
                    <Typography noWrap sx={{ fontFamily: fontBody, fontSize: "0.75rem", color: textMuted }}>
                      {s.admission_number || "—"}
                      {s.programme_name ? ` · ${s.programme_name}` : ""}
                      {!s.is_active ? " · inactive" : ""}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.75}>
                  {MEAL_CODES.map((code) => {
                    const meta = MEAL_META[code];
                    const served = Boolean(s.served?.[code]);
                    const busy = busyKey === `${s.id}-${code}`;
                    return (
                      <Button
                        key={code}
                        size="small"
                        disabled={served || busy || !s.is_active}
                        onClick={() => mark(s, code)}
                        startIcon={
                          busy ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : served ? (
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          ) : null
                        }
                        sx={{
                          fontFamily: fontBody,
                          fontWeight: 800,
                          textTransform: "none",
                          borderRadius: "10px",
                          minWidth: 96,
                          border: `1px solid ${meta.color}`,
                          color: meta.color,
                          bgcolor: served ? meta.soft : "transparent",
                          "&.Mui-disabled": {
                            color: served ? meta.color : textSecondary,
                            borderColor: served ? meta.color : "rgba(0,0,0,0.12)",
                            opacity: served ? 0.8 : 0.5,
                          },
                          "&:hover": { bgcolor: meta.soft },
                        }}
                      >
                        {meta.name}
                      </Button>
                    );
                  })}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Panel>
  );
}
