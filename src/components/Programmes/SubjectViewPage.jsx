import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Button, IconButton, Tooltip, Stack, CircularProgress, Alert, Chip } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Grade as GradeIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from "@mui/icons-material";
import { primaryGreen, primaryDark, textSecondary, pageShellSx, fetchResourceOne, getPortalToken } from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, DetailField, fadeUp } from "../Users/usersUi";

export default function SubjectViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getPortalToken();
  const goBack = () => navigate("/programmes/subjects");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchResourceOne("subjects", id, token);
        if (active) setRow(data);
      } catch (err) {
        if (active) setError(err.message || "Could not load subject requirement");
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
          {error || "Subject requirement not found"}
        </Alert>
        <Button
          onClick={goBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2, color: primaryGreen, fontWeight: 700, textTransform: "none" }}
        >
          Back to subjects
        </Button>
      </Box>
    );
  }

  const required = row.is_required !== false;

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={row.subject}
        subtitle={row.programme?.name || "Subject requirement"}
        icon={<GradeIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit subject">
              <IconButton
                onClick={() => navigate(`/programmes/subjects/${id}/edit`)}
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
            <Tooltip title="Back to subjects">
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
        <FormSection title="Requirement details">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <DetailField icon={<SchoolIcon fontSize="small" />} label="Programme" value={row.programme?.name} />
            <DetailField icon={<MenuBookIcon fontSize="small" />} label="Subject" value={row.subject} />
            <DetailField icon={<GradeIcon fontSize="small" />} label="Minimum grade" value={row.minimum_grade} />
            <DetailField
              icon={<FormatListNumberedIcon fontSize="small" />}
              label="Sort order"
              value={row.sort_order ?? 0}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Chip
              label={required ? "Required" : "Optional"}
              sx={{
                fontWeight: 700,
                bgcolor: required ? "rgba(0,96,80,0.1)" : "rgba(30,40,88,0.06)",
                color: required ? primaryDark : textSecondary,
              }}
            />
          </Box>
        </FormSection>
      </Stack>
    </Box>
  );
}
