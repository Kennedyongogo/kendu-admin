import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  MenuBook as MenuBookIcon,
  Restaurant as RestaurantIcon,
  FactCheck as FactCheckIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import BrandPageLoader from "../Util/BrandPageLoader";
import { fadeUp } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  fontBody,
  fontDisplay,
  primaryBtnSx,
  primaryGreen,
  primaryDark,
  navy,
  accentGold,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";

const PRESETS = [0, 25, 50, 75, 100];

const FEATURE_META = {
  units: {
    label: "Units",
    icon: MenuBookIcon,
    title: "Unit enrollment",
    blurb: "Gate semester unit registration behind a minimum fee payment share.",
  },
  meals: {
    label: "Meals",
    icon: RestaurantIcon,
    title: "Meal card",
    blurb: "Gate meal card preview and PDF download behind a minimum fee payment share.",
  },
  exams: {
    label: "Exams",
    icon: FactCheckIcon,
    title: "Exam card",
    blurb: "Gate exam card PDF download behind a minimum fee payment share.",
  },
};

function clampPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function GaugeRing({ percent, enabled, size = 200 }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * (enabled ? percent : 0)) / 100;

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        mx: "auto",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          display: "block",
          transform: "rotate(-90deg)",
          filter: enabled ? "drop-shadow(0 12px 28px rgba(0,96,80,0.28))" : "none",
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,96,80,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={enabled ? primaryGreen : "rgba(30,40,88,0.22)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.45s ease, stroke 0.25s ease" }}
        />
      </svg>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={0.25}
        sx={{
          position: "absolute",
          inset: 0,
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "2.6rem", sm: "3rem" },
            lineHeight: 1,
            color: enabled ? primaryDark : textMuted,
            letterSpacing: "-0.03em",
          }}
        >
          {enabled ? percent : "—"}
          {enabled ? (
            <Box component="span" sx={{ fontSize: "1.15rem", ml: 0.15, color: accentGold }}>
              %
            </Box>
          ) : null}
        </Typography>
        <Typography
          sx={{
            fontFamily: fontBody,
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: enabled ? primaryGreen : textMuted,
          }}
        >
          {enabled ? "required" : "open access"}
        </Typography>
      </Stack>
    </Box>
  );
}

function JourneyPreview({ percent, enabled }) {
  const steps = [
    { label: "Fees paid", value: `${percent}%`, active: true },
    { label: "Gate", value: enabled ? "On" : "Off", active: enabled },
    { label: "Enroll", value: enabled ? "Unlocks" : "Always", active: !enabled || percent === 0 },
  ];

  return (
    <Stack
      direction="row"
      spacing={0}
      alignItems="stretch"
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(0,96,80,0.12)",
        bgcolor: "rgba(0,96,80,0.03)",
      }}
    >
      {steps.map((step, i) => (
        <Box
          key={step.label}
          sx={{
            flex: 1,
            px: 1.5,
            py: 1.25,
            textAlign: "center",
            borderRight: i < steps.length - 1 ? "1px solid rgba(0,96,80,0.1)" : "none",
            bgcolor: step.active ? "rgba(0,96,80,0.06)" : "transparent",
          }}
        >
          <Typography
            sx={{
              fontFamily: fontBody,
              fontSize: "0.65rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: textMuted,
            }}
          >
            {step.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: "1.05rem",
              color: step.active ? primaryGreen : textSecondary,
              mt: 0.25,
            }}
          >
            {step.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

export default function Access() {
  const [tab, setTab] = useState("units");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState({
    min_fee_percent: 0,
    is_enabled: true,
    description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getPortalToken();
      const res = await fetch("/api/access", { headers: authJsonHeaders(token) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load access policies");
      setPolicies(Array.isArray(data.data) ? data.data : []);
      setDirty(false);
    } catch (err) {
      setError(err.message);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const row = policies.find((p) => p.feature === tab);
    if (row) {
      setForm({
        min_fee_percent: row.min_fee_percent ?? 0,
        is_enabled: row.is_enabled !== false,
        description: row.description || "",
      });
      setDirty(false);
    }
  }, [tab, policies]);

  const meta = FEATURE_META[tab] || FEATURE_META.units;
  const percent = clampPct(form.min_fee_percent);
  const Icon = meta.icon;

  const statusCopy = useMemo(() => {
    const unlockLabel =
      tab === "meals"
        ? "meal card download"
        : tab === "exams"
          ? "exam card download"
          : "unit enrollment";
    if (!form.is_enabled) {
      const openTitles = {
        meals: "Meal cards are open",
        exams: "Exam cards are open",
        units: "Enrollment is open",
      };
      const openBodies = {
        meals: "Any student can preview and download their meal card — fee progress is not checked.",
        exams: "Any student can download their exam card — fee progress is not checked.",
        units: "Any student in the cohort can enroll — fee progress is not checked.",
      };
      return {
        title: openTitles[tab] || "Feature is open",
        body: openBodies[tab] || "Fee progress is not checked for this feature.",
        tone: "open",
      };
    }
    if (percent === 0) {
      return {
        title: "Gate on · 0% threshold",
        body: `Rule is enforced but set to 0%, so students can unlock ${unlockLabel} immediately.`,
        tone: "soft",
      };
    }
    return {
      title: `Students need ${percent}% paid`,
      body: `Confirmed payments ÷ total charges must reach ${percent}% before ${unlockLabel} unlocks.`,
      tone: "strict",
    };
  }, [form.is_enabled, percent, tab]);

  const patchForm = (next) => {
    setForm((f) => ({ ...f, ...next }));
    setDirty(true);
  };

  const handleSave = async () => {
    const pct = clampPct(form.min_fee_percent);
    setSaving(true);
    try {
      const token = getPortalToken();
      const res = await fetch(`/api/access/${tab}`, {
        method: "PUT",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          min_fee_percent: pct,
          is_enabled: form.is_enabled,
          description: form.description,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      setPolicies((prev) => {
        const next = prev.filter((p) => p.feature !== tab);
        return [...next, data.data];
      });
      setDirty(false);
      Swal.fire({
        icon: "success",
        title: "Access rule saved",
        text: form.is_enabled
          ? `${meta.title} requires ${pct}% of fees paid.`
          : `Fee gate is off — ${meta.label.toLowerCase()} access is open.`,
        timer: 1700,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not save",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !policies.length) {
    return <BrandPageLoader message="Loading access rules…" />;
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 72px)",
        mx: { xs: -1.5, sm: -2, md: -3 },
        mt: { xs: -1, sm: -1.5 },
        mb: { xs: -1.5, sm: -2, md: -3 },
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--kd-page-b)",
        overflow: "hidden",
      }}
    >
      {/* Full-bleed hero */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55 }}
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 1.5, sm: 1.75 },
          pb: 0,
          background: `linear-gradient(125deg, ${navy} 0%, ${primaryDark} 42%, ${primaryGreen} 100%)`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(200,168,64,0.16)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                flexShrink: 0,
              }}
            >
              <LockOpenIcon sx={{ color: accentGold, fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.2,
                }}
              >
                Student services
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.35rem", sm: "1.5rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                Access
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.78)",
                  maxWidth: 480,
                  lineHeight: 1.35,
                  mt: 0.2,
                  display: { xs: "none", sm: "block" },
                }}
              >
                Decide how much of their fees students must clear before units, meals, and exams unlock.
              </Typography>
            </Box>
          </Stack>

          {dirty ? (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              sx={{
                px: 1.15,
                py: 0.45,
                borderRadius: "999px",
                bgcolor: "rgba(200,168,64,0.25)",
                border: "1px solid rgba(200,168,64,0.45)",
                fontFamily: fontBody,
                fontWeight: 700,
                fontSize: "0.7rem",
                flexShrink: 0,
              }}
            >
              Unsaved
            </Box>
          ) : null}
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mt: 1.25,
            position: "relative",
            zIndex: 1,
            minHeight: 38,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontFamily: fontBody,
              minHeight: 38,
              color: "rgba(255,255,255,0.62)",
              px: 1.5,
              fontSize: "0.88rem",
            },
            "& .Mui-selected": { color: "#fff !important" },
            "& .MuiTabs-indicator": {
              bgcolor: accentGold,
              height: 3,
              borderRadius: 2,
            },
          }}
        >
          <Tab
            value="units"
            icon={<MenuBookIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Units"
          />
          <Tab
            value="meals"
            icon={<RestaurantIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Meals"
          />
          <Tab
            value="exams"
            icon={<FactCheckIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Exams"
          />
        </Tabs>
      </Box>

      {/* Edge-to-edge body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, sm: 3 },
          background: `
            radial-gradient(ellipse 80% 50% at 100% 0%, rgba(0,96,80,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 0% 100%, rgba(200,168,64,0.08) 0%, transparent 50%),
            var(--kd-page-b)
          `,
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        ) : null}

        <AnimatePresence mode="wait">
          {meta.soon ? (
            <Box
              key="soon"
              component={motion.div}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              sx={{
                py: 8,
                textAlign: "center",
                borderRadius: "20px",
                border: "1px dashed rgba(0,96,80,0.22)",
                bgcolor: "rgba(255,255,255,0.55)",
              }}
            >
              <Icon sx={{ fontSize: 40, color: primaryGreen, opacity: 0.55, mb: 1 }} />
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.4rem", color: textPrimary }}>
                {meta.title}
              </Typography>
              <Typography sx={{ fontFamily: fontBody, color: textSecondary, mt: 0.75, maxWidth: 420, mx: "auto" }}>
                {meta.blurb}
              </Typography>
            </Box>
          ) : (
            <Box
              key={tab}
              component={motion.div}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1.05fr 0.95fr" },
                  gap: { xs: 2.5, lg: 3.5 },
                  alignItems: "start",
                  maxWidth: 1180,
                  mx: "auto",
                  width: "100%",
                }}
              >
                {/* Left — live control */}
                <Stack spacing={2.5}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Icon sx={{ color: primaryGreen, fontSize: 22 }} />
                      <Typography
                        sx={{
                          fontFamily: fontDisplay,
                          fontWeight: 700,
                          fontSize: { xs: "1.55rem", sm: "1.75rem" },
                          color: textPrimary,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.15,
                        }}
                      >
                        {meta.title}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: fontBody,
                        color: textSecondary,
                        fontSize: "0.95rem",
                        maxWidth: 480,
                        lineHeight: 1.55,
                      }}
                    >
                      {meta.blurb}
                    </Typography>
                  </Box>

                  <Box
                    component={motion.div}
                    animate={{ scale: form.is_enabled ? 1 : 0.97, opacity: form.is_enabled ? 1 : 0.72 }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    sx={{ py: 1 }}
                  >
                    <GaugeRing percent={percent} enabled={form.is_enabled} size={210} />
                  </Box>

                  <JourneyPreview percent={percent} enabled={form.is_enabled} />

                  <Box
                    sx={{
                      px: { xs: 0.5, sm: 1 },
                      opacity: form.is_enabled ? 1 : 0.45,
                      pointerEvents: form.is_enabled ? "auto" : "none",
                      transition: "opacity 0.25s ease",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: textMuted,
                        }}
                      >
                        Minimum fee paid
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          color: primaryGreen,
                        }}
                      >
                        {percent}%
                      </Typography>
                    </Stack>
                    <Slider
                      value={percent}
                      onChange={(_, v) => patchForm({ min_fee_percent: v })}
                      min={0}
                      max={100}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${v}%`}
                      sx={{
                        color: primaryGreen,
                        height: 8,
                        "& .MuiSlider-thumb": {
                          width: 22,
                          height: 22,
                          bgcolor: "#fff",
                          border: `3px solid ${primaryGreen}`,
                          boxShadow: "0 4px 14px rgba(0,96,80,0.35)",
                          "&:hover, &.Mui-focusVisible": {
                            boxShadow: "0 0 0 8px rgba(0,96,80,0.16)",
                          },
                        },
                        "& .MuiSlider-rail": { opacity: 0.25 },
                        "& .MuiSlider-track": {
                          border: "none",
                          background: `linear-gradient(90deg, ${primaryGreen}, ${accentGold})`,
                        },
                      }}
                    />
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                      {PRESETS.map((p) => {
                        const active = percent === p;
                        return (
                          <Button
                            key={p}
                            size="small"
                            onClick={() => patchForm({ min_fee_percent: p })}
                            sx={{
                              textTransform: "none",
                              fontFamily: fontBody,
                              fontWeight: 800,
                              fontSize: "0.78rem",
                              minWidth: 52,
                              borderRadius: "10px",
                              px: 1.25,
                              py: 0.55,
                              color: active ? "#fff" : primaryGreen,
                              bgcolor: active ? primaryGreen : "rgba(0,96,80,0.06)",
                              border: `1px solid ${active ? primaryGreen : "rgba(0,96,80,0.14)"}`,
                              "&:hover": {
                                bgcolor: active ? primaryDark : "rgba(0,96,80,0.12)",
                              },
                            }}
                          >
                            {p}%
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>
                </Stack>

                {/* Right — enforce + notes + save */}
                <Stack spacing={2}>
                  <Box
                    onClick={() => patchForm({ is_enabled: !form.is_enabled })}
                    sx={{
                      cursor: "pointer",
                      borderRadius: "20px",
                      p: { xs: 2, sm: 2.25 },
                      background: form.is_enabled
                        ? `linear-gradient(145deg, ${primaryGreen} 0%, ${primaryDark} 100%)`
                        : "rgba(30,40,88,0.04)",
                      color: form.is_enabled ? "#fff" : textPrimary,
                      border: form.is_enabled
                        ? "1px solid transparent"
                        : "1px solid rgba(30,40,88,0.12)",
                      boxShadow: form.is_enabled
                        ? "0 18px 40px -16px rgba(0,96,80,0.55)"
                        : "none",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": { transform: "translateY(-2px)" },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "13px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: form.is_enabled
                              ? "rgba(255,255,255,0.14)"
                              : "rgba(0,96,80,0.1)",
                            color: form.is_enabled ? accentGold : primaryGreen,
                          }}
                        >
                          {form.is_enabled ? <LockIcon /> : <LockOpenIcon />}
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontFamily: fontBody,
                              fontWeight: 800,
                              fontSize: "1rem",
                            }}
                          >
                            Enforce fee requirement
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: fontBody,
                              fontSize: "0.78rem",
                              opacity: form.is_enabled ? 0.85 : 0.7,
                              mt: 0.2,
                            }}
                          >
                            {form.is_enabled ? "Gate is active" : "Gate is off — access open"}
                          </Typography>
                        </Box>
                      </Stack>
                      <Switch
                        checked={form.is_enabled}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => patchForm({ is_enabled: e.target.checked })}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": { color: accentGold },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            bgcolor: "rgba(200,168,64,0.55)",
                          },
                        }}
                      />
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      borderRadius: "20px",
                      p: { xs: 2, sm: 2.25 },
                      bgcolor: "var(--kd-surface)",
                      border: "1px solid rgba(0,96,80,0.1)",
                      boxShadow: "0 16px 40px -20px rgba(20,26,58,0.12)",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      {statusCopy.tone === "open" ? (
                        <LockOpenIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                      ) : statusCopy.tone === "strict" ? (
                        <TrendingUpIcon sx={{ color: accentGold, fontSize: 20 }} />
                      ) : (
                        <CheckCircleIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                      )}
                      <Typography
                        sx={{
                          fontFamily: fontDisplay,
                          fontWeight: 700,
                          fontSize: "1.15rem",
                          color: textPrimary,
                        }}
                      >
                        {statusCopy.title}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: fontBody,
                        color: textSecondary,
                        fontSize: "0.88rem",
                        lineHeight: 1.55,
                      }}
                    >
                      {statusCopy.body}
                    </Typography>

                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: "14px",
                        bgcolor: "rgba(0,96,80,0.04)",
                        border: "1px solid rgba(0,96,80,0.08)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: textMuted,
                          mb: 0.75,
                        }}
                      >
                        How it is calculated
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontSize: "0.82rem",
                          color: textSecondary,
                          lineHeight: 1.5,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 800, color: primaryGreen }}>
                          Confirmed payments
                        </Box>
                        {" ÷ "}
                        <Box component="span" sx={{ fontWeight: 800, color: navy }}>
                          total fee charges
                        </Box>
                        {" on the student ledger."}
                      </Typography>
                    </Box>
                  </Box>

                  <TextField
                    label="Internal notes (optional)"
                    placeholder="e.g. Require half fees before mid-semester enrollment"
                    multiline
                    minRows={2}
                    value={form.description}
                    onChange={(e) => patchForm({ description: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        bgcolor: "var(--kd-surface)",
                        fontFamily: fontBody,
                        "& fieldset": { borderColor: "rgba(0,96,80,0.16)" },
                        "&:hover fieldset": { borderColor: "rgba(0,96,80,0.35)" },
                        "&.Mui-focused fieldset": { borderColor: primaryGreen },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: primaryGreen },
                    }}
                  />

                  <Box sx={{ pt: 0.5 }}>
                    <Typography
                      sx={{
                        fontFamily: fontBody,
                        fontSize: "0.78rem",
                        color: textMuted,
                        mb: 1.25,
                        lineHeight: 1.45,
                      }}
                    >
                      {dirty
                        ? "You have unsaved edits. Save to apply them for students right away."
                        : "This rule can be changed anytime — adjust the threshold or toggle, then save."}
                    </Typography>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.25}
                      justifyContent="flex-end"
                    >
                      <Button
                        onClick={load}
                        disabled={saving || !dirty}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontFamily: fontBody,
                          borderRadius: "12px",
                          px: 2.25,
                          color: textSecondary,
                          border: "1px solid rgba(0,96,80,0.16)",
                          "&:hover": { bgcolor: "rgba(0,96,80,0.05)" },
                        }}
                      >
                        Discard changes
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving || !dirty}
                        startIcon={
                          saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                        }
                        sx={{
                          ...primaryBtnSx,
                          px: 2.75,
                          py: 1.15,
                          borderRadius: "12px",
                          boxShadow: dirty
                            ? "0 12px 28px -10px rgba(0,96,80,0.55)"
                            : "none",
                          opacity: dirty ? 1 : 0.55,
                        }}
                      >
                        {saving ? "Saving…" : dirty ? "Update rule" : "Saved"}
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
