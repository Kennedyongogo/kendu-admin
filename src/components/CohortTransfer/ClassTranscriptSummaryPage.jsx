import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import { alpha } from "@mui/material/styles";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import {
  authJsonHeaders,
  getPortalToken,
  primaryGreen,
  primaryDark,
  navy,
  accentGold,
  textPrimary,
  textSecondary,
  fontDisplay,
  fontBody,
} from "../Users/usersShared";

function currentAcademicYearHint() {
  const now = new Date();
  const y = now.getFullYear();
  const start = now.getMonth() >= 7 ? y : y - 1;
  return `${start}/${start + 1}`;
}

export default function ClassTranscriptSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const seed = location.state || {};

  const [programmes, setProgrammes] = useState([]);
  const [programmeId, setProgrammeId] = useState(seed.programme_id || "");
  const [yearOfStudy, setYearOfStudy] = useState(seed.year_of_study || 1);
  const [semester, setSemester] = useState(seed.semester || 1);
  const [academicYear, setAcademicYear] = useState(seed.academic_year || currentAcademicYearHint());
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/programmes?is_active=true&limit=100", {
          headers: authJsonHeaders(getPortalToken()),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || "Could not load programmes.");
        if (!cancelled) {
          const rows = Array.isArray(json.data) ? json.data : [];
          setProgrammes(rows);
          if (!programmeId && rows[0]?.id) setProgrammeId(rows[0].id);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load programmes.");
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    if (!programmeId) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        programme_id: programmeId,
        year_of_study: String(yearOfStudy),
        semester: String(semester),
      });
      if (String(academicYear || "").trim()) {
        params.set("academic_year", String(academicYear).trim());
      }
      const res = await fetch(`/api/transcripts/class-summary?${params}`, {
        headers: authJsonHeaders(getPortalToken()),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || "Could not load class summary.");
      setSummary(json.data);
    } catch (err) {
      setSummary(null);
      setError(err.message || "Could not load class summary.");
    } finally {
      setLoading(false);
    }
  }, [programmeId, yearOfStudy, semester, academicYear]);

  useEffect(() => {
    if (!bootLoading && programmeId) load();
  }, [bootLoading, programmeId, load]);

  const gradeChips = useMemo(() => {
    const tally = summary?.grade_tally || {};
    return Object.entries(tally)
      .filter(([, count]) => Number(count) > 0)
      .map(([grade, count]) => ({ grade, count: Number(count) }));
  }, [summary]);

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 72px)",
        mx: { xs: -1.5, sm: -2, md: -3 },
        mt: { xs: -1, sm: -1.5 },
        mb: { xs: -1.5, sm: -2, md: -3 },
        display: "flex",
        flexDirection: "column",
        background: `
          radial-gradient(ellipse 70% 45% at 100% -10%, ${alpha(accentGold, 0.14)} 0%, transparent 55%),
          radial-gradient(ellipse 55% 40% at 0% 100%, ${alpha(primaryGreen, 0.08)} 0%, transparent 50%),
          linear-gradient(180deg, #f3f7f5 0%, #eef3f1 48%, #f7f4ef 100%)
        `,
      }}
    >
      <Box
        sx={{
          color: "#fff",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 1.75, sm: 2 },
          pb: { xs: 2.25, sm: 2.75 },
          background: `linear-gradient(125deg, ${navy} 0%, ${primaryDark} 45%, ${primaryGreen} 100%)`,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/cohort-transfer")}
              sx={{
                textTransform: "none",
                fontFamily: fontBody,
                fontWeight: 800,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                px: 1.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
              }}
            >
              Back to cohort transfer
            </Button>
            <Button
              startIcon={<RefreshRoundedIcon />}
              onClick={() => load()}
              disabled={loading || !programmeId}
              sx={{
                textTransform: "none",
                fontFamily: fontBody,
                fontWeight: 800,
                color: navy,
                bgcolor: accentGold,
                borderRadius: "12px",
                px: 1.75,
                "&:hover": { bgcolor: "#d4b34a" },
              }}
            >
              Refresh
            </Button>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              <AssessmentOutlinedIcon sx={{ color: accentGold }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Examinations
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.4rem", sm: "1.65rem" },
                  lineHeight: 1.1,
                }}
              >
                Class transcript summary
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 2 }}
        >
          <FormControl size="small" sx={{ minWidth: 220, flex: 1 }}>
            <InputLabel>Programme</InputLabel>
            <Select
              label="Programme"
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              disabled={bootLoading}
            >
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              label="Year"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(Number(e.target.value))}
            >
              {Array.from({ length: 6 }, (_, i) => i + 1).map((y) => (
                <MenuItem key={y} value={y}>
                  Year {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              <MenuItem value={1}>Semester 1</MenuItem>
              <MenuItem value={2}>Semester 2</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Academic year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2025/2026"
            sx={{ minWidth: 140 }}
          />
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        ) : null}

        {bootLoading || loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: primaryGreen }} />
          </Box>
        ) : summary ? (
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: "18px",
                border: `1px solid ${alpha(navy, 0.08)}`,
                bgcolor: "#fff",
                p: 2,
              }}
            >
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                {summary.programme?.name || "Programme"}
              </Typography>
              <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.85rem", mb: 1.5 }}>
                Year {summary.filters?.year_of_study} · Semester {summary.filters?.semester}
                {summary.filters?.academic_year ? ` · ${summary.filters.academic_year}` : ""}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip size="small" label={`${summary.counts?.students || 0} students`} sx={{ fontWeight: 700 }} />
                <Chip
                  size="small"
                  label={`${summary.counts?.issued || 0} issued`}
                  sx={{ fontWeight: 700, bgcolor: alpha(primaryGreen, 0.12), color: primaryGreen }}
                />
                <Chip
                  size="small"
                  label={`${summary.counts?.draft || 0} draft`}
                  sx={{ fontWeight: 700, bgcolor: alpha(accentGold, 0.18), color: navy }}
                />
                <Chip size="small" label={`${summary.counts?.none || 0} none`} sx={{ fontWeight: 700 }} />
                {gradeChips.map((g) => (
                  <Chip
                    key={g.grade}
                    size="small"
                    variant="outlined"
                    label={`Grade ${g.grade}: ${g.count}`}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>

            <TableContainer
              sx={{
                borderRadius: "18px",
                border: `1px solid ${alpha(navy, 0.08)}`,
                bgcolor: "#fff",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Admission</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Units</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Grades</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(summary.students || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography sx={{ py: 2, color: textSecondary, fontFamily: fontBody }}>
                          No students in this class placement.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.students.map((row) => (
                      <TableRow
                        key={row.student_id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/cohort-transfer/students/${row.student_id}/transcript`, {
                            state: {
                              student: {
                                id: row.student_id,
                                full_name: row.full_name,
                                admission_number: row.admission_number,
                                year_of_study: yearOfStudy,
                                semester,
                              },
                              programmeName: summary.programme?.name,
                            },
                          })
                        }
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, color: textPrimary }}>{row.full_name}</Typography>
                        </TableCell>
                        <TableCell>{row.admission_number || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.transcript_status}
                            sx={{
                              height: 22,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              fontSize: "0.65rem",
                              bgcolor:
                                row.transcript_status === "issued"
                                  ? alpha(primaryGreen, 0.12)
                                  : row.transcript_status === "draft"
                                    ? alpha(accentGold, 0.18)
                                    : alpha(navy, 0.06),
                              color:
                                row.transcript_status === "issued"
                                  ? primaryGreen
                                  : row.transcript_status === "draft"
                                    ? navy
                                    : textSecondary,
                            }}
                          />
                        </TableCell>
                        <TableCell>{row.line_count || 0}</TableCell>
                        <TableCell>
                          {(row.lines || [])
                            .map((line) => `${line.unit_code}:${line.grade}`)
                            .join(" · ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}
