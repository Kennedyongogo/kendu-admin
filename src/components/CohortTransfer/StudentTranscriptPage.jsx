import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolIcon from "@mui/icons-material/School";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LayersIcon from "@mui/icons-material/Layers";
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
  profileImageSrc,
} from "../Users/usersShared";

function DetailChip({ icon: Icon, label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.35,
        py: 0.95,
        borderRadius: "14px",
        bgcolor: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.16)",
        minWidth: 0,
      }}
    >
      <Icon sx={{ fontSize: 18, color: accentGold, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: fontBody,
            fontSize: "0.58rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.68)",
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: fontBody,
            fontWeight: 700,
            fontSize: "0.84rem",
            color: "#fff",
            lineHeight: 1.2,
          }}
          noWrap
        >
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

export default function StudentTranscriptPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const location = useLocation();
  const navState = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [context, setContext] = useState(null);
  const [transcripts, setTranscripts] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers = authJsonHeaders(getPortalToken());
      const [ctxRes, listRes] = await Promise.all([
        fetch(`/api/transcripts/students/${encodeURIComponent(studentId)}/context`, { headers }),
        fetch(`/api/transcripts/students/${encodeURIComponent(studentId)}`, { headers }),
      ]);
      const ctxJson = await ctxRes.json();
      const listJson = await listRes.json();
      if (!ctxRes.ok || !ctxJson.success) {
        throw new Error(ctxJson.message || "Failed to load student.");
      }
      if (!listRes.ok || !listJson.success) {
        throw new Error(listJson.message || "Failed to load transcripts.");
      }
      setContext(ctxJson.data);
      setTranscripts(listJson.data || []);
    } catch (err) {
      setError(err.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const student = context?.student || navState.student || null;
  const programmeName =
    context?.programme?.name || navState.programmeName || student?.programme_name || null;
  const name = student?.full_name || student?.admission_number || "Student";
  const photo = profileImageSrc(student);
  const placement =
    student?.year_of_study != null || student?.semester != null
      ? `Year ${student?.year_of_study ?? "—"} · Semester ${student?.semester ?? "—"}`
      : "—";

  const openEditor = (transcriptId) => {
    const path = transcriptId
      ? `/cohort-transfer/students/${studentId}/transcripts/${transcriptId}`
      : `/cohort-transfer/students/${studentId}/transcripts/new`;
    navigate(path, {
      state: {
        student,
        programmeName,
      },
    });
  };

  const openPdf = async (transcriptId) => {
    const res = await fetch(`/api/transcripts/${encodeURIComponent(transcriptId)}/pdf`, {
      headers: { Authorization: `Bearer ${getPortalToken()}`, Accept: "application/pdf" },
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.message || "Could not open PDF.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

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
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 1.75, sm: 2 },
          pb: { xs: 2.25, sm: 2.75 },
          background: `linear-gradient(125deg, ${navy} 0%, ${primaryDark} 45%, ${primaryGreen} 100%)`,
          flexShrink: 0,
        }}
      >
        <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
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
              startIcon={<AddRoundedIcon />}
              onClick={() => openEditor(null)}
              disabled={loading || !student}
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
              New transcript
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <Avatar
              src={photo || undefined}
              sx={{
                width: 72,
                height: 72,
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: "1.6rem",
                bgcolor: "rgba(255,255,255,0.14)",
                border: `2.5px solid ${accentGold}`,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Academic transcripts
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.45rem", sm: "1.75rem" },
                  lineHeight: 1.15,
                  mt: 0.35,
                }}
              >
                {name}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.1,
            }}
          >
            <DetailChip icon={BadgeOutlinedIcon} label="Admission no." value={student?.admission_number} />
            <DetailChip icon={SchoolIcon} label="Programme" value={programmeName} />
            <DetailChip icon={LayersIcon} label="Current placement" value={placement} />
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 2.5 } }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: primaryGreen }} />
          </Box>
        ) : transcripts.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 7,
              px: 2,
              borderRadius: "22px",
              border: `1.5px dashed ${alpha(primaryGreen, 0.28)}`,
              bgcolor: alpha("#fff", 0.7),
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 42, color: alpha(primaryGreen, 0.45), mb: 1 }} />
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.2rem" }}>
              No transcripts yet
            </Typography>
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, mt: 0.75, maxWidth: 420, mx: "auto" }}>
              Create a transcript for a semester after the student has registered units. Select registered
              units, assign grades, and save.
            </Typography>
            <Button
              startIcon={<AddRoundedIcon />}
              onClick={() => openEditor(null)}
              sx={{
                mt: 2.5,
                textTransform: "none",
                fontFamily: fontBody,
                fontWeight: 800,
                bgcolor: primaryGreen,
                color: "#fff",
                borderRadius: "12px",
                px: 2.5,
                "&:hover": { bgcolor: primaryDark },
              }}
            >
              Create first transcript
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {transcripts.map((row) => (
              <Box
                key={row.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.75,
                  borderRadius: "16px",
                  bgcolor: "#fff",
                  border: `1px solid ${alpha(navy, 0.08)}`,
                  boxShadow: `0 4px 16px ${alpha(navy, 0.05)}`,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(primaryGreen, 0.1),
                    color: primaryGreen,
                    flexShrink: 0,
                  }}
                >
                  <DescriptionOutlinedIcon />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography
                      sx={{
                        fontFamily: fontBody,
                        fontWeight: 800,
                        color: textPrimary,
                        fontSize: "0.95rem",
                      }}
                    >
                      Year {row.year_of_study} · Sem {row.semester} · {row.academic_year}
                    </Typography>
                    <Chip
                      size="small"
                      label={row.status}
                      sx={{
                        height: 22,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                        bgcolor:
                          row.status === "issued" ? alpha(primaryGreen, 0.12) : alpha(accentGold, 0.18),
                        color: row.status === "issued" ? primaryGreen : navy,
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.8rem", mt: 0.25 }}>
                    {row.programme_name || programmeName || "Programme"} · {row.line_count} unit
                    {row.line_count === 1 ? "" : "s"}
                    {row.recommendation ? ` · ${row.recommendation}` : ""}
                  </Typography>
                </Box>
                <Tooltip title="Open PDF">
                  <IconButton onClick={() => openPdf(row.id)} sx={{ color: primaryGreen }}>
                    <PictureAsPdfOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit transcript">
                  <IconButton onClick={() => openEditor(row.id)} sx={{ color: navy }}>
                    <EditOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
