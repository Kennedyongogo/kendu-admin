import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { UsersHero, HeroActionButton } from "../Users/usersUi";
import { pageShellSx, inputSx, ghostBtnSx } from "../Users/usersShared";
import { downloadDashboardReport } from "./exportDashboardPdf";
import {
  fadeUp,
  cardSx,
  dash,
  buildFilterSummary,
  formatRoleTitle,
} from "./dashboardTheme";

export function StatCard({ icon, label, value, hint, accent, onClick, index = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      sx={{
        ...cardSx,
        p: 2.25,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              boxShadow: "0 20px 44px -18px rgba(20,26,58,0.22)",
            }
          : undefined,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accent}, ${dash.accentGold})`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: dash.fontBody,
              color: dash.textMuted,
              fontWeight: 700,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: dash.fontDisplay,
              color: dash.textPrimary,
              fontWeight: 700,
              fontSize: { xs: "1.55rem", xl: "1.85rem" },
              letterSpacing: "-0.02em",
              mt: 0.5,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{ fontFamily: dash.fontBody, color: dash.textSecondary, fontSize: "0.74rem", mt: 0.35 }}
          >
            {hint}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: `linear-gradient(145deg, ${accent} 0%, ${dash.primaryDark} 130%)`,
            boxShadow: `0 8px 20px -6px ${accent}66`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

export function ViewAllButton({ label = "Open", onClick }) {
  return (
    <Button
      onClick={onClick}
      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "1rem !important" }} />}
      sx={{
        textTransform: "none",
        fontFamily: dash.fontBody,
        fontWeight: 700,
        fontSize: "0.8rem",
        color: dash.primaryGreen,
        borderRadius: "10px",
        px: 1.5,
        bgcolor: "rgba(27,94,168,0.07)",
        flexShrink: 0,
        "&:hover": { bgcolor: "rgba(27,94,168,0.14)" },
      }}
    >
      {label}
    </Button>
  );
}

export function EmptyChart({ message }) {
  return (
    <Stack sx={{ height: 280 }} alignItems="center" justifyContent="center" spacing={1}>
      <InsightsRoundedIcon sx={{ fontSize: 42, color: "rgba(27,94,168,0.25)" }} />
      <Typography sx={{ fontFamily: dash.fontBody, color: dash.textMuted, fontSize: "0.85rem" }}>
        {message}
      </Typography>
    </Stack>
  );
}

export function ChartPanel({
  title,
  subtitle,
  filterLabel,
  actions,
  children,
  index = 0,
  exportTitle,
  exportSection = "full",
  programmeId = "",
}) {
  const panelRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadDashboardReport({
        section: exportSection,
        title: exportTitle || title,
        programmeId,
      });
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Could not export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      sx={{ ...cardSx, p: 0 }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={1.25}
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: "1px solid rgba(27,94,168,0.08)",
          bgcolor: dash.warmCream,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: dash.fontDisplay,
              fontWeight: 700,
              color: dash.textPrimary,
              fontSize: "1.08rem",
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontFamily: dash.fontBody, color: dash.textMuted, fontSize: "0.74rem" }}>
            {subtitle}
          </Typography>
          {filterLabel ? (
            <Typography
              sx={{
                mt: 0.6,
                display: "inline-flex",
                px: 1,
                py: 0.35,
                borderRadius: "8px",
                bgcolor: "rgba(27,94,168,0.08)",
                color: dash.primaryGreen,
                fontFamily: dash.fontBody,
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              Report filter · {filterLabel}
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {actions || null}
          <Button
            size="small"
            aria-label={exporting ? "Exporting PDF" : "Export PDF"}
            onClick={handleExport}
            disabled={exporting}
            sx={{
              ...ghostBtnSx,
              border: "1px solid rgba(27,94,168,0.18)",
              bgcolor: "var(--kd-surface)",
              minWidth: 64,
              width: 64,
              height: 32,
              px: 0,
              py: 0,
              flexShrink: 0,
              "&.Mui-disabled": {
                opacity: 1,
                color: dash.primaryGreen,
                borderColor: "rgba(27,94,168,0.18)",
                bgcolor: "var(--kd-surface)",
              },
            }}
          >
            {exporting ? (
              <CircularProgress size={16} thickness={5} sx={{ color: dash.primaryGreen }} />
            ) : (
              "PDF"
            )}
          </Button>
        </Stack>
      </Stack>
      <Box ref={panelRef} sx={{ p: 2, bgcolor: "var(--kd-surface)" }}>
        {children}
      </Box>
    </Box>
  );
}

export function DashboardShell({
  title,
  subtitle,
  icon,
  role,
  error,
  onClearError,
  filters,
  filterControls,
  onExportAll,
  exportingAll,
  children,
  reportRef,
}) {
  const filterSummary = buildFilterSummary(filters || {});

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={
          <HeroActionButton
            variant="contained"
            startIcon={
              exportingAll ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />
            }
            onClick={onExportAll}
            disabled={exportingAll}
          >
            {exportingAll ? "Preparing PDF…" : "Export full report"}
          </HeroActionButton>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "14px" }} onClose={onClearError}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          ...cardSx,
          mb: 2.5,
          p: 2,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          alignItems: { md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: dash.fontDisplay,
              fontWeight: 700,
              color: dash.textPrimary,
              fontSize: "1rem",
            }}
          >
            {formatRoleTitle(role)} insights
          </Typography>
          <Typography sx={{ fontFamily: dash.fontBody, color: dash.textMuted, fontSize: "0.78rem" }}>
            {filterSummary}. Exported PDFs include the filters you select here.
          </Typography>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          sx={{ minWidth: { md: 420 }, width: { xs: "100%", md: "auto" } }}
        >
          {filterControls}
        </Stack>
      </Box>

      <Box ref={reportRef}>{children}</Box>
    </Box>
  );
}

export function ProgrammeFilter({ value, options, onChange }) {
  return (
    <FormControl fullWidth size="small" sx={inputSx}>
      <InputLabel>Programme</InputLabel>
      <Select
        label="Programme"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || "")}
      >
        <MenuItem value="">
          <em>All programmes</em>
        </MenuItem>
        {(options || []).map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
