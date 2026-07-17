import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Button, IconButton, Tooltip, Stack, CircularProgress, Alert } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Info as InfoIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from "@mui/icons-material";
import { primaryGreen, pageShellSx, fetchResourceOne } from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, DetailField, fadeUp } from "../Users/usersUi";

export default function HourViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const goBack = () => navigate("/programmes/hours");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchResourceOne("hours", id, token);
        if (active) setRow(data);
      } catch (err) {
        if (active) setError(err.message || "Could not load hour distribution");
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
          {error || "Hour distribution not found"}
        </Alert>
        <Button onClick={goBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2, color: primaryGreen, fontWeight: 700, textTransform: "none" }}>
          Back to hours
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={row.nature}
        subtitle={row.programme?.name || "Hour distribution details"}
        icon={<ScheduleIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit entry">
              <IconButton
                onClick={() => navigate(`/programmes/hours/${id}/edit`)}
                sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Back to hours">
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
        <FormSection title="Distribution details">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <DetailField icon={<SchoolIcon fontSize="small" />} label="Programme" value={row.programme?.name} />
            <DetailField icon={<InfoIcon fontSize="small" />} label="Specific nature" value={row.specific_nature || "—"} />
          </Box>
        </FormSection>

        <FormSection title="Hours by year">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 1.5 }}>
            <DetailField compact label="Year 1" value={row.year_1_hours ?? 0} />
            <DetailField compact label="Year 2" value={row.year_2_hours ?? 0} />
            <DetailField compact label="Year 3" value={row.year_3_hours ?? 0} />
            <DetailField compact label="Total hours" value={row.total_hours ?? 0} />
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <DetailField icon={<FormatListNumberedIcon fontSize="small" />} label="Sort order" value={row.sort_order ?? 0} compact />
          </Box>
        </FormSection>
      </Stack>
    </Box>
  );
}
