import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Button, IconButton, Tooltip, Stack, CircularProgress, Alert } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Payments as PaymentsIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarMonthIcon,
  Sell as SellIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from "@mui/icons-material";
import {
  primaryGreen,
  pageShellSx,
  fetchResourceOne,
  formatMoney,
  formatSemester,
  formatYear,
  getPortalToken,
} from "./programmesShared";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, DetailField, fadeUp } from "../Users/usersUi";

export default function FeeViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getPortalToken();
  const goBack = () => navigate("/programmes/fees");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchResourceOne("fees", id, token);
        if (active) setRow(data);
      } catch (err) {
        if (active) setError(err.message || "Could not load fee");
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
          {error || "Fee entry not found"}
        </Alert>
        <Button onClick={goBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2, color: primaryGreen, fontWeight: 700, textTransform: "none" }}>
          Back to fees
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={row.label || `${formatYear(row.year_of_study)} · ${formatSemester(row.semester)}`}
        subtitle={row.programme?.name || "Fee details"}
        icon={<PaymentsIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit fee">
              <IconButton
                onClick={() => navigate(`/programmes/fees/${id}/edit`)}
                sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Back to fees">
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
        <FormSection title="Fee details">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <DetailField icon={<SchoolIcon fontSize="small" />} label="Programme" value={row.programme?.name} />
            <DetailField icon={<SellIcon fontSize="small" />} label="Label" value={row.label || "—"} />
            <DetailField icon={<CalendarMonthIcon fontSize="small" />} label="Year of study" value={formatYear(row.year_of_study)} />
            <DetailField icon={<CalendarMonthIcon fontSize="small" />} label="Semester" value={formatSemester(row.semester)} />
            <DetailField icon={<PaymentsIcon fontSize="small" />} label="Amount" value={formatMoney(row.amount, row.currency)} />
            <DetailField icon={<FormatListNumberedIcon fontSize="small" />} label="Sort order" value={row.sort_order ?? 0} />
          </Box>
        </FormSection>
      </Stack>
    </Box>
  );
}
