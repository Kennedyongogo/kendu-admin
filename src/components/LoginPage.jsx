import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig, useAnimationControls } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  MailOutline as EmailIcon,
  LockOutlined as Lock,
  ArrowForward,
  Close,
  MarkEmailRead,
  ErrorOutline,
  KeyboardCapslock,
  CheckRounded,
  WifiOff,
  DarkModeRounded,
  LightModeRounded,
} from "@mui/icons-material";
import { savePortalSession } from "../auth/portalAuth";
import { applyThemeMode, getStoredThemeMode } from "../theme/themeMode";

const BRAND = {
  navy: "#1e2858",
  navyDeep: "#141a3a",
  green: "#1B5EA8",
  greenDark: "#0E3D73",
  gold: "#c8a840",
  goldSoft: "#e8d9a0",
  goldMuted: "#d4c078",
  name: "Kendu Adventist School of Medical Sciences",
  shortName: "Kendu Adventist School",
};

// Field outlines keep at least 3:1 contrast against the page in both modes.
const LIGHT = {
  page: `
    radial-gradient(ellipse 90% 70% at 12% 88%, rgba(27, 94, 168, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 78% 8%, rgba(200, 168, 64, 0.14) 0%, transparent 50%),
    linear-gradient(165deg, #ffffff 0%, #f5f8fc 48%, #eef3fa 100%)`,
  base: "#fbfcfa",
  paper: "#ffffff",
  ink: BRAND.navy,
  inkSoft: "rgba(30, 40, 88, 0.7)",
  inkMute: "rgba(30, 40, 88, 0.55)",
  border: "rgba(30, 40, 88, 0.3)",
  accent: BRAND.green,
  accentStrong: BRAND.greenDark,
  accentWash: "rgba(27, 94, 168, 0.1)",
  danger: "#b42318",
  dangerWash: "rgba(180, 35, 24, 0.07)",
  dangerLine: "rgba(180, 35, 24, 0.22)",
  warn: "#b45309",
  warnWash: "rgba(180, 83, 9, 0.08)",
  warnLine: "rgba(180, 83, 9, 0.25)",
  logoShadow: "0 10px 28px -10px rgba(8, 24, 40, 0.35)",
};

const DARK = {
  page: `
    radial-gradient(ellipse 90% 70% at 12% 88%, rgba(74, 138, 212, 0.14) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 78% 8%, rgba(200, 168, 64, 0.1) 0%, transparent 50%),
    linear-gradient(165deg, #171e2f 0%, #121826 48%, #0f1420 100%)`,
  base: "#10151f",
  paper: "#1b2232",
  ink: "#e9edf8",
  inkSoft: "rgba(233, 237, 248, 0.74)",
  inkMute: "rgba(233, 237, 248, 0.56)",
  border: "rgba(233, 237, 248, 0.3)",
  accent: "#7cb3f0",
  accentStrong: "#a9cdf6",
  accentWash: "rgba(124, 179, 240, 0.16)",
  danger: "#fca5a5",
  dangerWash: "rgba(248, 113, 113, 0.1)",
  dangerLine: "rgba(248, 113, 113, 0.3)",
  warn: "#fcd34d",
  warnWash: "rgba(252, 211, 77, 0.08)",
  warnLine: "rgba(252, 211, 77, 0.28)",
  logoShadow: "0 10px 28px -10px rgba(0, 0, 0, 0.7)",
};

const fontDisplay = '"Fraunces", "Georgia", serif';
const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';

const ADMIN_PORTAL_LOGIN_BLOCKED_ROLES = ["student"];
const LAST_EMAIL_KEY = "kendu-admin-last-email";
// Long enough to register the success state, short enough not to feel like a wait.
const SUCCESS_PAUSE_MS = 450;

const HERO_IMAGES = [
  { file: "kendu 1.jpg", caption: "Celebrating excellence in medical education" },
  { file: "kendu 2.jpg", caption: "Hands-on clinical training that shapes careers" },
  { file: "kendu 3.jpg", caption: "Classrooms built for curious minds" },
  { file: "kendu 4.jpg", caption: "A campus rooted in service and community" },
];

const SLIDE_INTERVAL_MS = 7000;
const SLIDE_CROSSFADE_MS = 1600;

function heroImageSrc(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email));
}

function readLastEmail() {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

function greeting(now) {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

// The icon is drawn over the field rather than as an adornment, because an adornment would pin the
// label in the raised position; this way the label rests centred like a placeholder until focus or input.
const ICON_GUTTER = 46;

function fieldSx(t) {
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: t.paper,
      fontFamily: fontBody,
      fontSize: "0.95rem",
      transition: "box-shadow 0.2s ease, background-color 0.3s ease",
      "& fieldset": { borderColor: t.border, borderWidth: "1.5px", transition: "border-color 0.2s ease" },
      "&:hover fieldset": { borderColor: t.accent },
      "&.Mui-focused": { boxShadow: `0 0 0 4px ${t.accentWash}` },
      "&.Mui-focused fieldset": { borderColor: t.accent, borderWidth: "2px" },
      "&.Mui-error fieldset": { borderColor: t.danger },
      "&.Mui-error.Mui-focused": { boxShadow: `0 0 0 4px ${t.dangerWash}` },
    },
    "& .MuiInputBase-input": {
      py: "15px",
      pl: `${ICON_GUTTER}px`,
      fontWeight: 500,
      color: t.ink,
      letterSpacing: "0.01em",
      // Browser autofill paints its own pale background; keep the field on-theme instead.
      "&:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 100px ${t.paper} inset`,
        WebkitTextFillColor: t.ink,
        caretColor: t.ink,
        borderRadius: "inherit",
      },
    },
    "& .MuiInputLabel-root": {
      fontFamily: fontBody,
      fontSize: "0.95rem",
      color: t.inkSoft,
      fontWeight: 500,
      transition: "transform 180ms cubic-bezier(0.2, 0, 0, 1), color 180ms ease",
      "&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": { transform: `translate(${ICON_GUTTER}px, 15px) scale(1)` },
      "&.MuiInputLabel-shrink": { transform: "translate(14px, -9px) scale(0.75)" },
      "&.Mui-focused": { color: t.accent, fontWeight: 600 },
      "&.Mui-error": { color: t.danger },
    },
    "& .MuiFormHelperText-root": {
      fontFamily: fontBody,
      fontSize: "0.78rem",
      fontWeight: 500,
      mx: 0.5,
      mt: 0.75,
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      "&.Mui-error": { color: t.danger },
    },
  };
}

function IconField({ t, icon, error, hint, endAdornment, inputRef, ...props }) {
  return (
    <Box sx={{ position: "relative", "&:focus-within .login-field-icon": { color: error ? t.danger : t.accent } }}>
      <Box
        className="login-field-icon"
        aria-hidden
        sx={{
          position: "absolute",
          left: 15,
          top: 16,
          zIndex: 1,
          display: "flex",
          color: error ? t.danger : t.inkMute,
          pointerEvents: "none",
          transition: "color 0.2s",
          "& svg": { fontSize: 21 },
        }}
      >
        {icon}
      </Box>
      <TextField
        {...props}
        inputRef={inputRef}
        fullWidth
        error={!!error}
        helperText={
          error ? (
            <>
              <ErrorOutline sx={{ fontSize: 15 }} />
              {error}
            </>
          ) : (
            hint || null
          )
        }
        slotProps={{ input: endAdornment ? { endAdornment } : undefined }}
        sx={fieldSx(t)}
      />
    </Box>
  );
}

function Notice({ t, message, tone = "error", icon }) {
  const color = tone === "warn" ? t.warn : t.danger;
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <Box
          component={motion.div}
          key={tone}
          role={tone === "warn" ? "status" : "alert"}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
          sx={{ overflow: "hidden" }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1.25,
              alignItems: "flex-start",
              px: 1.75,
              py: 1.4,
              borderRadius: "12px",
              bgcolor: tone === "warn" ? t.warnWash : t.dangerWash,
              border: `1px solid ${tone === "warn" ? t.warnLine : t.dangerLine}`,
              color,
              "& svg": { fontSize: 20, mt: "1px", flexShrink: 0 },
            }}
          >
            {icon || <ErrorOutline />}
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.86rem", fontWeight: 600, lineHeight: 1.45 }}>{message}</Typography>
          </Box>
        </Box>
      ) : null}
    </AnimatePresence>
  );
}

function HeroImagePanel({ activeSlide, compact = false, onSelectSlide }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: "relative",
        overflow: "hidden",
        height: compact ? "clamp(160px, 26vh, 240px)" : "100%",
        minHeight: compact ? undefined : "100dvh",
        flex: compact ? "0 0 auto" : "1 1 auto",
        minWidth: 0,
        bgcolor: BRAND.greenDark,
        // Slides under the form's slanted edge so the photo meets it along one clean diagonal.
        ml: compact ? 0 : { lg: "-10%" },
      }}
    >
      {HERO_IMAGES.map((img, index) => (
        <Box
          key={img.file}
          component={motion.img}
          src={heroImageSrc(img.file)}
          alt={index === activeSlide ? img.caption : ""}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          animate={{ opacity: index === activeSlide ? 1 : 0, scale: index === activeSlide ? 1.05 : 1 }}
          transition={{
            opacity: { duration: SLIDE_CROSSFADE_MS / 1000, ease: "easeInOut" },
            scale: { duration: SLIDE_INTERVAL_MS / 1000, ease: "linear" },
          }}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "saturate(1.08) contrast(1.05)",
          }}
        />
      ))}

      {/* Brand tint keeps photos of varying quality looking like one set, and keeps the caption readable. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            linear-gradient(180deg, rgba(14, 30, 58, 0.25) 0%, rgba(14, 30, 58, 0) 30%, rgba(14, 30, 58, 0) 50%, rgba(14, 30, 58, 0.85) 100%),
            linear-gradient(90deg, rgba(14, 61, 115, 0.35) 0%, rgba(14, 61, 115, 0) 45%)
          `,
        }}
      />

      {!compact && (
        <Box
          sx={{
            position: "absolute",
            left: { lg: "22%" },
            right: { lg: "7%" },
            bottom: { lg: "7%" },
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
            alignItems: "flex-start",
          }}
        >
          <Typography
            sx={{ fontFamily: fontBody, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: BRAND.goldSoft }}
          >
            Life at KASMS
          </Typography>
          <AnimatePresence mode="wait">
            <Typography
              key={activeSlide}
              component={motion.p}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
              aria-live="polite"
              sx={{
                fontFamily: fontDisplay,
                color: "#fff",
                fontSize: "clamp(1.3rem, 2vw, 1.75rem)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                maxWidth: 440,
                textShadow: "0 8px 24px rgba(0,0,0,0.35)",
                mt: -0.75,
              }}
            >
              {HERO_IMAGES[activeSlide].caption}
            </Typography>
          </AnimatePresence>
          {/* Each bar fills over the slide's lifetime, so it doubles as a countdown to the next photo. */}
          <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
            {HERO_IMAGES.map((_, i) => (
              <Box
                key={i}
                component="button"
                type="button"
                aria-label={`Show campus image ${i + 1}`}
                aria-current={i === activeSlide ? "true" : undefined}
                onClick={() => onSelectSlide?.(i)}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  border: "none",
                  p: 0,
                  cursor: "pointer",
                  height: 4,
                  width: i === activeSlide ? 36 : 12,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.4)",
                  transition: "width 0.35s ease, background-color 0.35s ease",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.65)" },
                  "&:focus-visible": { outline: "2px solid #fff", outlineOffset: 3 },
                }}
              >
                {i === activeSlide ? (
                  <Box
                    component={motion.span}
                    key={activeSlide}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: "linear" }}
                    sx={{ position: "absolute", left: 0, top: 0, bottom: 0, bgcolor: BRAND.gold, borderRadius: 2 }}
                  />
                ) : null}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const formControls = useAnimationControls();

  const rfEmail = useRef();
  const rfPassword = useRef();
  const rsEmail = useRef();

  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const t = themeMode === "dark" ? DARK : LIGHT;
  const [rememberedEmail] = useState(readLastEmail);
  const [now] = useState(() => new Date());

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [capsOn, setCapsOn] = useState(false);
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [activeSlide, setActiveSlide] = useState(0);

  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetPrefill, setResetPrefill] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSentTo, setResetSentTo] = useState("");

  // A timeout per slide (rather than one interval) restarts the clock when someone picks a slide.
  useEffect(() => {
    const id = setTimeout(() => setActiveSlide((i) => (i + 1) % HERO_IMAGES.length), SLIDE_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [activeSlide]);

  useEffect(() => {
    const id = setTimeout(() => (rememberedEmail ? rfPassword : rfEmail).current?.focus(), 450);
    return () => clearTimeout(id);
  }, [rememberedEmail]);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  useEffect(() => {
    if (!openResetDialog) return undefined;
    const id = setTimeout(() => rsEmail.current?.focus(), 150);
    return () => clearTimeout(id);
  }, [openResetDialog]);

  const toggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    applyThemeMode(next);
  };

  const clearError = (field) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
    if (formError) setFormError("");
  };

  const trackCaps = (e) => setCapsOn(!!e.getModifierState?.("CapsLock"));

  const fail = (message) => {
    setFormError(message);
    formControls.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.42, ease: "easeOut" } });
  };

  // Enter in the email field moves on to the password instead of flagging the empty password.
  const onEmailKeyDown = (e) => {
    if (e.key !== "Enter" || rfPassword.current?.value) return;
    e.preventDefault();
    const email = rfEmail.current?.value?.trim() ?? "";
    if (validateEmail(email)) rfPassword.current?.focus();
    else setErrors({ email: email ? "That doesn't look like an email address" : "Enter your email address" });
  };

  const login = async (e) => {
    e?.preventDefault();
    if (loading || success) return;
    const email = rfEmail.current?.value?.toLowerCase().trim() ?? "";
    const password = rfPassword.current?.value ?? "";

    const next = {};
    if (!email) next.email = "Enter your email address";
    else if (!validateEmail(email)) next.email = "That doesn't look like an email address";
    if (!password) next.password = "Enter your password";
    setErrors(next);
    setFormError("");
    if (next.email) return rfEmail.current?.focus();
    if (next.password) return rfPassword.current?.focus();

    setLoading(true);
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password, portal: "admin" }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !(data.success && data.data?.user && data.data?.token)) {
        fail(
          data.message ||
            data.error ||
            (response.status >= 500 ? "The server isn't responding right now. Try again in a moment." : "Incorrect email or password.")
        );
        rfPassword.current?.select();
        return;
      }
      const authed = data.data.user;
      if (ADMIN_PORTAL_LOGIN_BLOCKED_ROLES.includes(authed.role)) {
        fail("This portal is for school admin and staff. Students should sign in on the student portal.");
        return;
      }
      savePortalSession(authed, data.data.token);
      try {
        localStorage.setItem(LAST_EMAIL_KEY, email);
      } catch {
        /* remembering the email is a convenience only */
      }
      setSuccess(true);
      setTimeout(() => navigate(authed.role === "staff" ? "/units" : "/dashboard", { replace: true }), SUCCESS_PAUSE_MS);
    } catch {
      fail(navigator.onLine ? "Can't reach the server. Check your connection and try again." : "You're offline. Reconnect and try again.");
    } finally {
      setLoading(false);
    }
  };

  const openReset = () => {
    const typed = rfEmail.current?.value?.trim() ?? "";
    setResetPrefill(validateEmail(typed) ? typed : "");
    setResetError("");
    setResetSentTo("");
    setOpenResetDialog(true);
  };

  const closeReset = () => {
    if (!resetLoading) setOpenResetDialog(false);
  };

  const reset = async (e) => {
    e?.preventDefault();
    const email = rsEmail.current?.value?.toLowerCase().trim() ?? "";
    if (!validateEmail(email)) {
      setResetError(email ? "That doesn't look like an email address" : "Enter your email address");
      rsEmail.current?.focus();
      return;
    }
    setResetError("");
    setResetLoading(true);
    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ Email: email }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) setResetSentTo(email);
      else setResetError(data.error || data.message || "We couldn't send the link. Try again.");
    } catch {
      setResetError("Can't reach the server. Check your connection and try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const goldBtnSx = {
    fontFamily: fontBody,
    background: `linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldMuted} 100%)`,
    color: BRAND.navyDeep,
    fontWeight: 700,
    fontSize: "0.95rem",
    letterSpacing: "0.01em",
    borderRadius: "12px",
    textTransform: "none",
    boxShadow: "0 10px 28px -8px rgba(160, 128, 40, 0.45)",
    transition: "box-shadow 0.25s ease, background 0.3s ease, color 0.3s ease",
    "&:hover": {
      background: `linear-gradient(135deg, ${BRAND.goldMuted} 0%, ${BRAND.gold} 100%)`,
      boxShadow: "0 14px 32px -8px rgba(160, 128, 40, 0.5)",
    },
    "&:focus-visible": { outline: `3px solid ${t.accent}`, outlineOffset: 2 },
    "&.Mui-disabled": {
      background: `linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldMuted} 100%)`,
      color: BRAND.navyDeep,
      opacity: 0.75,
    },
  };

  const successBtnSx = {
    "&.Mui-disabled": {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#fff",
      opacity: 1,
      boxShadow: "0 10px 28px -8px rgba(21, 128, 61, 0.5)",
    },
  };

  const linkBtnSx = {
    fontFamily: fontBody,
    fontSize: "0.82rem",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: t.accent,
    fontWeight: 600,
    px: 0.75,
    py: 0.4,
    borderRadius: "8px",
    transition: "background-color 0.2s, color 0.2s",
    "&:hover": { bgcolor: t.accentWash, color: t.accentStrong },
    "&:focus-visible": { outline: `2px solid ${t.accent}`, outlineOffset: 1 },
  };

  const dateLine = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(now);

  return (
    <MotionConfig reducedMotion="user">
      <Box
        sx={{
          display: "flex",
          flexDirection: isDesktop ? "row" : "column",
          height: "100dvh",
          maxHeight: "100dvh",
          width: "100%",
          overflow: "hidden",
          fontFamily: fontBody,
          bgcolor: t.base,
          transition: "background-color 0.3s ease",
        }}
      >
        {/* Form panel */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: isDesktop ? -28 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            flex: isDesktop ? "0 0 44%" : "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 2,
            order: isDesktop ? 0 : 1,
            clipPath: isDesktop ? "polygon(0 0, 100% 0, 82% 100%, 0 100%)" : "none",
            background: t.page,
            overflow: "hidden",
          }}
        >
          <Tooltip title={themeMode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton
              onClick={toggleTheme}
              aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              sx={{
                position: "absolute",
                top: 18,
                right: isDesktop ? 26 : 16,
                zIndex: 3,
                width: 40,
                height: 40,
                borderRadius: "12px",
                color: t.inkSoft,
                border: `1px solid ${t.border}`,
                bgcolor: t.paper,
                "&:hover": { color: t.accent, bgcolor: t.accentWash, borderColor: t.accent },
              }}
            >
              {themeMode === "dark" ? <LightModeRounded sx={{ fontSize: 20 }} /> : <DarkModeRounded sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: isDesktop ? "clamp(36px, 5.5vw, 64px)" : "clamp(22px, 6vw, 40px)",
              pr: isDesktop ? "clamp(56px, 11%, 110px)" : "clamp(22px, 6vw, 40px)",
              py: "clamp(18px, 3vh, 36px)",
              overflow: "auto",
            }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              sx={{ width: "100%", maxWidth: 400, mx: isDesktop ? 0 : "auto" }}
            >
              {/* Brand mark */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
                <Box
                  component="img"
                  src="/images/logo.png"
                  alt=""
                  sx={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0, boxShadow: t.logoShadow, bgcolor: "#fff" }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: fontDisplay,
                      fontWeight: 700,
                      fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                      color: t.ink,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    {BRAND.shortName}
                  </Typography>
                  <Typography
                    sx={{ fontFamily: fontBody, fontSize: "0.7rem", fontWeight: 700, color: t.accent, letterSpacing: "0.08em", textTransform: "uppercase", mt: 0.35 }}
                  >
                    Admin portal
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.inkMute, mb: 0.75 }}>
                {dateLine}
              </Typography>
              <Typography
                component="h1"
                sx={{
                  fontFamily: fontDisplay,
                  fontSize: "clamp(1.85rem, 3.2vw, 2.4rem)",
                  fontWeight: 700,
                  color: t.ink,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.1,
                  mb: 1,
                }}
              >
                {greeting(now)}
              </Typography>
              <Typography sx={{ fontFamily: fontBody, color: t.inkSoft, fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.55, mb: 3.5, maxWidth: 340 }}>
                {rememberedEmail ? "Welcome back. Enter your password to continue." : "Sign in to manage campus operations, staff, and student records."}
              </Typography>

              <Box
                component={motion.form}
                animate={formControls}
                noValidate
                onSubmit={login}
                sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
              >
                <Notice t={t} tone="warn" icon={<WifiOff />} message={online ? "" : "You're offline. You can sign in once your connection is back."} />

                <IconField
                  t={t}
                  inputRef={rfEmail}
                  type="email"
                  name="email"
                  label="Email address"
                  autoComplete="username"
                  defaultValue={rememberedEmail}
                  icon={<EmailIcon />}
                  error={errors.email}
                  onChange={() => clearError("email")}
                  onKeyDown={onEmailKeyDown}
                />

                <Box>
                  <IconField
                    t={t}
                    inputRef={rfPassword}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    label="Password"
                    autoComplete="current-password"
                    icon={<Lock />}
                    error={errors.password}
                    hint={
                      capsOn ? (
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: t.warn, fontWeight: 700 }}>
                          <KeyboardCapslock sx={{ fontSize: 16 }} />
                          Caps Lock is on
                        </Box>
                      ) : null
                    }
                    onChange={() => clearError("password")}
                    onKeyDown={trackCaps}
                    onKeyUp={trackCaps}
                    onBlur={() => setCapsOn(false)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          sx={{ color: t.inkMute, mr: 0.25, "&:hover": { color: t.accent, bgcolor: t.accentWash } }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.75 }}>
                    <Typography component="button" type="button" onClick={openReset} sx={linkBtnSx}>
                      Forgot password?
                    </Typography>
                  </Box>
                </Box>

                <Notice t={t} message={formError} />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || success}
                  endIcon={
                    success ? (
                      <CheckRounded sx={{ fontSize: 20 }} />
                    ) : loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <ArrowForward sx={{ fontSize: 20 }} />
                    )
                  }
                  sx={{ ...goldBtnSx, ...(success ? successBtnSx : null), py: 1.65 }}
                >
                  {success ? "Signed in" : loading ? "Signing in…" : "Sign in"}
                </Button>
              </Box>

              <Typography
                sx={{ mt: 3, fontFamily: fontBody, fontSize: "0.74rem", color: t.inkMute, fontWeight: 500, letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 0.75 }}
              >
                <Lock sx={{ fontSize: 14 }} />
                Encrypted session · Admin &amp; staff access only
              </Typography>
            </Box>

            <Typography
              sx={{
                position: isDesktop ? "absolute" : "relative",
                bottom: isDesktop ? 28 : undefined,
                left: isDesktop ? "clamp(36px, 5.5vw, 64px)" : undefined,
                mt: isDesktop ? 0 : 3,
                textAlign: isDesktop ? "left" : "center",
                fontFamily: fontBody,
                fontSize: "0.7rem",
                color: t.inkMute,
                fontWeight: 500,
              }}
            >
              © {now.getFullYear()} {BRAND.name}
            </Typography>
          </Box>
        </Box>

        {isDesktop ? (
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}>
            <HeroImagePanel activeSlide={activeSlide} onSelectSlide={setActiveSlide} />
          </Box>
        ) : (
          <HeroImagePanel activeSlide={activeSlide} compact />
        )}

        {/* Reset dialog */}
        <Dialog
          open={openResetDialog}
          onClose={closeReset}
          maxWidth="xs"
          fullWidth
          slotProps={{
            backdrop: { sx: { bgcolor: "rgba(10, 14, 30, 0.4)", backdropFilter: "blur(6px)" } },
            paper: {
              component: motion.div,
              initial: { opacity: 0, scale: 0.97, y: 14 },
              animate: { opacity: 1, scale: 1, y: 0 },
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              sx: {
                borderRadius: "20px",
                overflow: "hidden",
                bgcolor: t.paper,
                backgroundImage: "none",
                border: themeMode === "dark" ? `1px solid ${t.border}` : "none",
                boxShadow: "0 28px 64px -16px rgba(10, 14, 30, 0.45)",
                m: 2,
              },
            },
          }}
        >
          <Box sx={{ position: "relative", px: 3, pt: 3, pb: 0.5 }}>
            <IconButton
              onClick={closeReset}
              disabled={resetLoading}
              aria-label="Close"
              sx={{ position: "absolute", top: 12, right: 12, color: t.inkMute, "&:hover": { bgcolor: t.accentWash, color: t.accent } }}
            >
              <Close fontSize="small" />
            </IconButton>

            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                background: `linear-gradient(145deg, ${BRAND.gold} 0%, ${BRAND.green} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              {resetSentTo ? <MarkEmailRead sx={{ color: "white", fontSize: 22 }} /> : <Lock sx={{ color: "white", fontSize: 22 }} />}
            </Box>

            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: t.ink, fontSize: "1.35rem", letterSpacing: "-0.02em", lineHeight: 1.25, pr: 4 }}>
              {resetSentTo ? "Check your inbox" : "Reset your password"}
            </Typography>
            <Typography sx={{ fontFamily: fontBody, color: t.inkSoft, fontSize: "0.9rem", lineHeight: 1.6, mt: 1 }}>
              {resetSentTo ? (
                <>
                  We sent a reset link to <b style={{ color: t.ink }}>{resetSentTo}</b>. It may take a minute to arrive; check spam if you can&apos;t see it.
                </>
              ) : (
                "Enter your registered email and we'll send a secure link to reset your password."
              )}
            </Typography>
          </Box>

          <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
            {resetSentTo ? (
              <Box sx={{ pt: 1, pb: 2 }}>
                <Button fullWidth variant="contained" onClick={closeReset} sx={{ ...goldBtnSx, py: 1.4 }}>
                  Back to sign in
                </Button>
              </Box>
            ) : (
              <Box component="form" noValidate onSubmit={reset} sx={{ pt: 0.75 }}>
                <IconField
                  t={t}
                  inputRef={rsEmail}
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  defaultValue={resetPrefill}
                  icon={<EmailIcon />}
                  error={resetError}
                  onChange={() => resetError && setResetError("")}
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1, pt: 3, pb: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={resetLoading}
                    startIcon={resetLoading ? <CircularProgress size={18} color="inherit" /> : <MarkEmailRead sx={{ fontSize: 20 }} />}
                    sx={{ ...goldBtnSx, py: 1.4 }}
                  >
                    {resetLoading ? "Sending…" : "Send reset link"}
                  </Button>
                  <Button
                    variant="text"
                    onClick={closeReset}
                    disabled={resetLoading}
                    fullWidth
                    sx={{
                      fontFamily: fontBody,
                      borderRadius: "10px",
                      textTransform: "none",
                      color: t.inkSoft,
                      fontWeight: 600,
                      py: 1,
                      "&:hover": { bgcolor: t.accentWash, color: t.ink },
                    }}
                  >
                    Back to sign in
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </MotionConfig>
  );
}
