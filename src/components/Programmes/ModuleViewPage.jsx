import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Button, IconButton, Tooltip, Stack, CircularProgress, Alert } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  MenuBook as ModuleIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Grade as GradeIcon,
  CalendarMonth as CalendarMonthIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from "@mui/icons-material";
import { primaryGreen, pageShellSx, fetchResourceOne, formatYear, getPortalToken } from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, DetailField, fadeUp } from "../Users/usersUi";

export default function ModuleViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getPortalToken();
  const goBack = () => navigate("/programmes/modules");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchResourceOne("modules", id, token);
        if (active) setRow(data);
      } catch (err) {
        if (active) setError(err.message || "Could not load module");
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

  if (error || !row) {
    return (
      <Box sx={pageShellSx}>
        <Alert severity="error" sx={{ borderRadius: "14px" }}>
          {error || "Module not found"}
        </Alert>
        <Button onClick={goBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2, color: primaryGreen, fontWeight: 700, textTransform: "none" }}>
          Back to modules
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={`${row.code} · ${row.name}`}
        subtitle={row.programme?.name || "Module details"}
        icon={<ModuleIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit module">
              <IconButton
                onClick={() => navigate(`/programmes/modules/${id}/edit`)}
                sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Back to modules">
              <IconButton
                onClick={goBack}
                sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      <Stack spacing={2.5} component={motion.div} variants={fadeUp} custom={1} initial="hidden" animate="visible">
        <FormSection title="Module details">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <DetailField icon={<SchoolIcon fontSize="small" />} label="Programme" value={row.programme?.name} />
            <DetailField icon={<CalendarMonthIcon fontSize="small" />} label="Year of study" value={formatYear(row.year_of_study)} />
            <DetailField icon={<CalendarMonthIcon fontSize="small" />} label="Semester" value={row.semester || "—"} />
            <DetailField icon={<AccessTimeIcon fontSize="small" />} label="Hours" value={row.hours ?? 0} />
            <DetailField icon={<GradeIcon fontSize="small" />} label="Credits" value={row.credits ?? 0} />
            <DetailField icon={<FormatListNumberedIcon fontSize="small" />} label="Sort order" value={row.sort_order ?? 0} />
          </Box>
        </FormSection>
      </Stack>
    </Box>
  );
}
