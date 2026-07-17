import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Typography, Button, Chip, IconButton, Tooltip, Stack, CircularProgress, Alert } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  MenuBook as MenuBookIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  Grade as GradeIcon,
  School as SchoolIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  CalendarMonth as CalendarMonthIcon,
  Payments as PaymentsIcon,
  Schedule as ScheduleIcon,
  MenuBook as ModuleIconAlt,
} from "@mui/icons-material";
import {
  primaryGreen,
  primaryDark,
  textSecondary,
  pageShellSx,
  authHeaders,
  programmeImageSrc,
  formatCategory,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, DetailField, fadeUp } from "../Users/usersUi";

export default function ProgrammeViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const goBack = () => navigate("/programmes");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/programmes/${id}`, { headers: authHeaders(token) });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Could not load programme");
        if (active) setProgramme(data.data);
      } catch (err) {
        if (active) setError(err.message || "Could not load programme");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, token]);

  if (loading) {
    return <BrandPageLoader message="Loading…" />;
  }

  if (error || !programme) {
    return (
      <Box sx={pageShellSx}>
        <Alert severity="error" sx={{ borderRadius: "14px" }}>
          {error || "Programme not found"}
        </Alert>
        <Button onClick={goBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2, color: primaryGreen, fontWeight: 700, textTransform: "none" }}>
          Back to programmes
        </Button>
      </Box>
    );
  }

  const active = programme.is_active !== false;
  const img = programmeImageSrc(programme);
  const feeCount = Array.isArray(programme.fee_structure) ? programme.fee_structure.length : 0;
  const hourCount = Array.isArray(programme.hour_distributions) ? programme.hour_distributions.length : 0;
  const moduleCount = Array.isArray(programme.modules) ? programme.modules.length : 0;
  const subjectCount = Array.isArray(programme.subject_requirements)
    ? programme.subject_requirements.length
    : 0;

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={programme.name}
        subtitle="Programme overview"
        icon={<MenuBookIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit programme">
              <IconButton
                onClick={() => navigate(`/programmes/${id}/edit`)}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Back to programmes">
              <IconButton
                onClick={goBack}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      <Stack spacing={2.5} component={motion.div} variants={fadeUp} custom={1} initial="hidden" animate="visible">
        <FormSection title="Overview">
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "stretch", md: "flex-start" }}>
            <Box
              sx={{
                width: { xs: "100%", sm: 280, md: 320 },
                maxWidth: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "20px",
                overflow: "hidden",
                bgcolor: "rgba(0,96,80,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1.5px solid rgba(0,96,80,0.14)",
                boxShadow: "0 12px 32px rgba(20,26,58,0.08)",
              }}
            >
              {img ? (
                <Box component="img" src={img} alt={programme.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <MenuBookIcon sx={{ fontSize: 72, color: primaryGreen, opacity: 0.55 }} />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, pt: { md: 0.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip
                  label={active ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    bgcolor: active ? "rgba(0,96,80,0.1)" : "rgba(30,40,88,0.06)",
                    color: active ? primaryDark : textSecondary,
                  }}
                />
                {feeCount ? (
                  <Chip
                    icon={<PaymentsIcon sx={{ fontSize: 16 }} />}
                    label={`${feeCount} fee${feeCount === 1 ? "" : "s"}`}
                    size="small"
                    onClick={() => navigate(`/programmes/fees?programme_id=${id}`)}
                    sx={{ fontWeight: 600, fontSize: "0.72rem", cursor: "pointer" }}
                  />
                ) : null}
                {hourCount ? (
                  <Chip
                    icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                    label={`${hourCount} hour block${hourCount === 1 ? "" : "s"}`}
                    size="small"
                    onClick={() => navigate(`/programmes/hours?programme_id=${id}`)}
                    sx={{ fontWeight: 600, fontSize: "0.72rem", cursor: "pointer" }}
                  />
                ) : null}
                {moduleCount ? (
                  <Chip
                    icon={<ModuleIconAlt sx={{ fontSize: 16 }} />}
                    label={`${moduleCount} module${moduleCount === 1 ? "" : "s"}`}
                    size="small"
                    onClick={() => navigate(`/programmes/modules?programme_id=${id}`)}
                    sx={{ fontWeight: 600, fontSize: "0.72rem", cursor: "pointer" }}
                  />
                ) : null}
                {subjectCount ? (
                  <Chip
                    icon={<GradeIcon sx={{ fontSize: 16 }} />}
                    label={`${subjectCount} subject${subjectCount === 1 ? "" : "s"}`}
                    size="small"
                    onClick={() => navigate(`/programmes/subjects?programme_id=${id}`)}
                    sx={{ fontWeight: 600, fontSize: "0.72rem", cursor: "pointer" }}
                  />
                ) : null}
              </Stack>
              <Typography sx={{ mt: 1.25, color: textSecondary, fontSize: "0.95rem", lineHeight: 1.6 }}>
                {programme.description || "No description provided."}
              </Typography>
            </Box>
          </Stack>
        </FormSection>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <FormSection title="Basics">
            <Stack spacing={1.5}>
              <DetailField icon={<SchoolIcon fontSize="small" />} label="Category" value={formatCategory(programme.category)} />
              <DetailField icon={<WorkspacePremiumIcon fontSize="small" />} label="Award" value={programme.award} />
              <DetailField icon={<AccessTimeIcon fontSize="small" />} label="Duration" value={programme.duration} />
              <DetailField
                icon={<CalendarMonthIcon fontSize="small" />}
                label="Mode of study"
                value={programme.mode ? formatCategory(programme.mode) : "—"}
              />
            </Stack>
          </FormSection>

          <FormSection title="Entry requirements">
            <Stack spacing={1.5}>
              <DetailField icon={<GradeIcon fontSize="small" />} label="Minimum KCSE grade" value={programme.minimum_kcse_grade} />
              <DetailField icon={<DescriptionIcon fontSize="small" />} label="Description" value={programme.description} />
            </Stack>
          </FormSection>
        </Box>

        <FormSection title="Schedule & calendar">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 1.5 }}>
            <DetailField compact label="Weeks per year" value={programme.weeks_per_year} />
            <DetailField compact label="Duration (years)" value={programme.duration_years} />
            <DetailField compact label="Semester 1 weeks" value={programme.semester_1_weeks} />
            <DetailField compact label="Semester 1 period" value={programme.semester_1_period} />
            <DetailField compact label="Semester 2 weeks" value={programme.semester_2_weeks} />
            <DetailField compact label="Semester 2 period" value={programme.semester_2_period} />
            <DetailField compact label="Mid semester 1 break" value={programme.break_mid_sem1} />
            <DetailField compact label="End of semester 1 break" value={programme.break_end_sem1} />
            <DetailField compact label="End of semester 2 break" value={programme.break_end_sem2} />
          </Box>
        </FormSection>
      </Stack>
    </Box>
  );
}
