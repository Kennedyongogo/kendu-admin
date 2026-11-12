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
  Snackbar,
  Alert,
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
import { homeForRole } from "../auth/roleAccess";
import { applyThemeMode, getStoredThemeMode } from "../theme/themeMode";

const BRAND = {
  navy: "#1e2858",
  navyDeep: "#0c1228",
  green: "#1B5EA8",
  greenDark: "#0E3D73",
  gold: "#c8a840",
  goldSoft: "#e8d9a0",
  goldMuted: "#d4c078",
  name: "Kendu Adventist School of Medical Sciences",
  shortName: "Kendu Adventist School",
  mark: "Kendu",
};

const LIGHT = {
  panel: "rgba(255, 255, 255, 0.92)",
  panelBorder: "rgba(255, 255, 255, 0.55)",
  paper: "#ffffff",
  ink: BRAND.navy,
  inkSoft: "rgba(30, 40, 88, 0.72)",
  inkMute: "rgba(30, 40, 88, 0.52)",
  border: "rgba(30, 40, 88, 0.22)",
  accent: BRAND.green,
  accentStrong: BRAND.greenDark,
  accentWash: "rgba(27, 94, 168, 0.1)",
  danger: "#b42318",
  dangerWash: "rgba(180, 35, 24, 0.07)",
  dangerLine: "rgba(180, 35, 24, 0.22)",
  warn: "#b45309",
  warnWash: "rgba(180, 83, 9, 0.08)",
  warnLine: "rgba(180, 83, 9, 0.25)",
  logoShadow: "0 12px 32px -12px rgba(8, 24, 40, 0.45)",
  panelShadow: "0 32px 80px -24px rgba(8, 16, 40, 0.55), 0 0 0 1px rgba(255,255,255,0.4) inset",
};

const DARK = {
  panel: "rgba(18, 24, 40, 0.88)",
  panelBorder: "rgba(233, 237, 248, 0.12)",
  paper: "#1b2232",
  ink: "#e9edf8",
  inkSoft: "rgba(233, 237, 248, 0.74)",
  inkMute: "rgba(233, 237, 248, 0.52)",
  border: "rgba(233, 237, 248, 0.28)",
  accent: "#7cb3f0",
  accentStrong: "#a9cdf6",
  accentWash: "rgba(124, 179, 240, 0.16)",
  danger: "#fca5a5",
  dangerWash: "rgba(248, 113, 113, 0.1)",
  dangerLine: "rgba(248, 113, 113, 0.3)",
  warn: "#fcd34d",
  warnWash: "rgba(252, 211, 77, 0.08)",
  warnLine: "rgba(252, 211, 77, 0.28)",
  logoShadow: "0 12px 32px -12px rgba(0, 0, 0, 0.7)",
  panelShadow: "0 32px 80px -20px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.06) inset",
};

const fontDisplay = '"Fraunces", "Georgia", serif';
const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';

const ADMIN_PORTAL_LOGIN_BLOCKED_ROLES = ["student"];
const LAST_EMAIL_KEY = "kendu-admin-last-email";
const SUCCESS_PAUSE_MS = 450;

const HERO_IMAGES = [
  { file: "kendu 1.jpg", caption: "Where future clinicians learn, grow, and celebrate together" },
  { file: "kendu 2.jpg", caption: "Hands-on training that turns calling into care" },
  { file: "kendu 3.jpg", caption: "Classrooms filled with curiosity and purpose" },
  { file: "kendu 4.jpg", caption: "A campus rooted in faith, service, and community" },
];

const SLIDE_INTERVAL_MS = 7500;
const SLIDE_CROSSFADE_MS = 1800;
const ICON_GUTTER = 46;

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

function fieldSx(t) {
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
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

/** Full-bleed campus slideshow — the visual plane of the whole page. */
function HeroBackdrop({ activeSlide }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        bgcolor: BRAND.navyDeep,
      }}
    >
      {HERO_IMAGES.map((img, index) => (
        <Box
          key={img.file}
          component={motion.img}
          src={heroImageSrc(img.file)}
          alt=""
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          animate={{
            opacity: index === activeSlide ? 1 : 0,
            scale: index === activeSlide ? 1.1 : 1.03,
          }}
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
            filter: "saturate(1.12) contrast(1.06) brightness(1.02)",
          }}
        />
      ))}

      {/* Lighter wash so campus life stays visible, while type and the panel stay readable. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            linear-gradient(108deg, rgba(10, 18, 42, 0.72) 0%, rgba(10, 18, 42, 0.42) 42%, rgba(10, 18, 42, 0.18) 68%, rgba(10, 18, 42, 0.4) 100%),
            linear-gradient(180deg, rgba(10, 18, 42, 0.28) 0%, transparent 32%, transparent 62%, rgba(10, 18, 42, 0.5) 100%)
          `,
        }}
      />

      {/* Warm gold + sky wash — makes the campus feel inviting rather than clinical */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 55% at 18% 88%, rgba(200, 168, 64, 0.28) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 88% 12%, rgba(27, 94, 168, 0.22) 0%, transparent 60%)
          `,
        }}
      />
    </Box>
  );
}

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
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

  useEffect(() => {
    const id = setTimeout(() => setActiveSlide((i) => (i + 1) % HERO_IMAGES.length), SLIDE_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [activeSlide]);

  useEffect(() => {
    const id = setTimeout(() => (rememberedEmail ? rfPassword : rfEmail).current?.focus(), 520);
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
    setFormError(message || "Something went wrong. Try again.");
    formControls.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.42, ease: "easeOut" } });
  };

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
        const { armAdminIdleTimer } = await import("../auth/sessionSecurity");
        armAdminIdleTimer();
      } catch {
        /* idle arm is best-effort */
      }
      try {
        localStorage.setItem(LAST_EMAIL_KEY, email);
      } catch {
        /* remembering the email is a convenience only */
      }
      setSuccess(true);
      setTimeout(() => navigate(homeForRole(authed.role), { replace: true }), SUCCESS_PAUSE_MS);
    } catch (err) {
      const msg = String(err?.message || "");
      if (!navigator.onLine) {
        fail("You're offline. Reconnect and try again.");
      } else if (/invalid admin portal role/i.test(msg)) {
        fail("This account can't sign in to the admin portal.");
      } else if (/failed to fetch|networkerror|load failed/i.test(msg)) {
        fail("Can't reach the server. Check your connection and try again.");
      } else {
        fail(msg || "Can't reach the server. Check your connection and try again.");
      }
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
    borderRadius: "14px",
    textTransform: "none",
    boxShadow: "0 12px 30px -10px rgba(160, 128, 40, 0.55)",
    transition: "box-shadow 0.25s ease, transform 0.2s ease, background 0.3s ease",
    "&:hover": {
      background: `linear-gradient(135deg, ${BRAND.goldMuted} 0%, ${BRAND.gold} 100%)`,
      boxShadow: "0 16px 36px -10px rgba(160, 128, 40, 0.6)",
      transform: "translateY(-1px)",
    },
    "&:focus-visible": { outline: `3px solid ${t.accent}`, outlineOffset: 2 },
    "&.Mui-disabled": {
      background: `linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldMuted} 100%)`,
      color: BRAND.navyDeep,
      opacity: 0.75,
      transform: "none",
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
          position: "relative",
          height: "100dvh",
          maxHeight: "100dvh",
          width: "100%",
          overflow: "hidden",
          fontFamily: fontBody,
          bgcolor: BRAND.navyDeep,
        }}
      >
        <HeroBackdrop activeSlide={activeSlide} />

        {/* Top chrome */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            py: { xs: 1.75, md: 2.25 },
            pointerEvents: "none",
            "& > *": { pointerEvents: "auto" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              component="img"
              src="/images/logo.png"
              alt=""
              sx={{
                width: { xs: 40, md: 46 },
                height: { xs: 40, md: 46 },
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                boxShadow: t.logoShadow,
                bgcolor: "#fff",
              }}
            />
            <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.88)",
                  lineHeight: 1.2,
                }}
              >
                Admin portal
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                  mt: 0.35,
                  letterSpacing: "0.01em",
                }}
              >
                Kendu Adventist School
              </Typography>
            </Box>
          </Box>

          <Tooltip title={themeMode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton
              onClick={toggleTheme}
              aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.22)",
                bgcolor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.4)" },
              }}
            >
              {themeMode === "dark" ? <LightModeRounded sx={{ fontSize: 20 }} /> : <DarkModeRounded sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main composition: brand + sign-in */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "grid",
            gridTemplateColumns: isDesktop ? "minmax(0, 1.15fr) minmax(340px, 440px)" : "1fr",
            alignItems: isDesktop ? "center" : "stretch",
            gap: { xs: 0, md: 4 },
            px: { xs: 2, sm: 3, md: 5, lg: 7 },
            py: { xs: 9, md: 4 },
            pb: { xs: 5, md: 4 },
            overflow: "auto",
          }}
        >
          {/* Brand column — hero-level identity */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              display: isDesktop ? "flex" : "none",
              flexDirection: "column",
              justifyContent: "center",
              pr: { md: 2, lg: 6 },
              minWidth: 0,
              color: "#fff",
            }}
          >
            <Box
              component={motion.div}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              sx={{
                width: 64,
                height: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${BRAND.gold} 0%, ${BRAND.goldSoft} 100%)`,
                mb: 3,
                transformOrigin: "left",
                boxShadow: "0 0 24px rgba(200,168,64,0.45)",
              }}
            />
            <Typography
              component="p"
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 800,
                fontSize: "clamp(3.6rem, 7.5vw, 5.8rem)",
                letterSpacing: "-0.045em",
                lineHeight: 0.9,
                color: "#fff",
                textShadow: "0 18px 50px rgba(0,0,0,0.35)",
                mb: 1.75,
              }}
            >
              {BRAND.mark}
            </Typography>
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 600,
                fontSize: "clamp(1.2rem, 2.1vw, 1.65rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                color: "rgba(255,255,255,0.95)",
                maxWidth: 480,
                mb: 2.25,
              }}
            >
              {BRAND.name}
            </Typography>
            {/* Fixed slot so longer captions never nudge Kendu, the school name, or the motto. */}
            <Box
              sx={{
                position: "relative",
                maxWidth: 420,
                height: "3.5em",
                mb: 3,
                fontFamily: fontBody,
                fontSize: "1.12rem",
                lineHeight: 1.55,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <Typography
                  key={activeSlide}
                  component={motion.p}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  aria-live="polite"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    m: 0,
                    fontFamily: fontBody,
                    fontSize: "inherit",
                    fontWeight: 500,
                    lineHeight: "inherit",
                    color: "rgba(255,255,255,0.78)",
                  }}
                >
                  {HERO_IMAGES[activeSlide].caption}
                </Typography>
              </AnimatePresence>
            </Box>
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: BRAND.goldSoft,
              }}
            >
              Faith · Service · Excellence
            </Typography>
          </Box>

          {/* Sign-in panel — the interaction surface */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 36, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              width: "100%",
              maxWidth: 440,
              mx: isDesktop ? 0 : "auto",
              my: isDesktop ? 0 : "auto",
              alignSelf: isDesktop ? "center" : "auto",
              borderRadius: { xs: "24px", md: "28px" },
              bgcolor: t.panel,
              border: `1px solid ${t.panelBorder}`,
              boxShadow: t.panelShadow,
              backdropFilter: "blur(24px) saturate(1.25)",
              WebkitBackdropFilter: "blur(24px) saturate(1.25)",
              overflow: "hidden",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${BRAND.gold} 0%, ${BRAND.green} 55%, ${BRAND.goldMuted} 100%)`,
              },
            }}
          >
            <Box sx={{ px: { xs: 2.5, sm: 3.4 }, pt: { xs: 3.25, sm: 3.75 }, pb: { xs: 2.75, sm: 3.25 } }}>
              {/* Mobile brand mark inside the panel */}
              {!isDesktop ? (
                <Box sx={{ mb: 2.75, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    component="img"
                    src="/images/logo.png"
                    alt=""
                    sx={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", boxShadow: t.logoShadow, bgcolor: "#fff" }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: fontDisplay,
                        fontWeight: 800,
                        fontSize: "1.65rem",
                        letterSpacing: "-0.04em",
                        color: t.ink,
                        lineHeight: 1,
                        mb: 0.35,
                      }}
                    >
                      {BRAND.mark}
                    </Typography>
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", fontWeight: 600, color: t.inkSoft, lineHeight: 1.3 }}>
                      {BRAND.shortName}
                    </Typography>
                  </Box>
                </Box>
              ) : null}

              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: t.inkMute,
                  mb: 0.85,
                }}
              >
                {dateLine}
              </Typography>
              <Typography
                component="h1"
                sx={{
                  fontFamily: fontDisplay,
                  fontSize: "clamp(1.7rem, 3vw, 2.1rem)",
                  fontWeight: 700,
                  color: t.ink,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                  mb: 0.9,
                }}
              >
                {greeting(now)}
              </Typography>
              <Typography sx={{ fontFamily: fontBody, color: t.inkSoft, fontSize: "0.94rem", fontWeight: 500, lineHeight: 1.55, mb: 3.1, maxWidth: 360 }}>
                {rememberedEmail
                  ? "Welcome back to campus. Enter your password to continue."
                  : "Welcome. Sign in to support teaching, care, and campus life at KASMS."}
              </Typography>

              <Box
                component={motion.form}
                animate={formControls}
                noValidate
                onSubmit={login}
                sx={{ display: "flex", flexDirection: "column", gap: 2.1 }}
              >
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
                  sx={{ ...goldBtnSx, ...(success ? successBtnSx : null), py: 1.7 }}
                >
                  {success ? "Signed in" : loading ? "Signing in…" : "Sign in"}
                </Button>
              </Box>

              <Typography
                sx={{
                  mt: 2.75,
                  fontFamily: fontBody,
                  fontSize: "0.74rem",
                  color: t.inkMute,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  textAlign: "center",
                  lineHeight: 1.45,
                }}
              >
                © {now.getFullYear()} {BRAND.name}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Reset dialog */}
        <Dialog
          open={openResetDialog}
          onClose={closeReset}
          maxWidth="xs"
          fullWidth
          slotProps={{
            backdrop: { sx: { bgcolor: "rgba(8, 12, 28, 0.55)", backdropFilter: "blur(8px)" } },
            paper: {
              component: motion.div,
              initial: { opacity: 0, scale: 0.97, y: 14 },
              animate: { opacity: 1, scale: 1, y: 0 },
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              sx: {
                borderRadius: "22px",
                overflow: "hidden",
                bgcolor: t.paper,
                backgroundImage: "none",
                border: themeMode === "dark" ? `1px solid ${t.border}` : "none",
                boxShadow: "0 32px 72px -16px rgba(8, 12, 28, 0.55)",
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

        <Snackbar
          open={Boolean(formError) || !online}
          autoHideDuration={online ? 7000 : null}
          onClose={(_, reason) => {
            if (reason === "clickaway") return;
            if (online) setFormError("");
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={online ? () => setFormError("") : undefined}
            severity={!online ? "warning" : "error"}
            variant="filled"
            icon={!online ? <WifiOff /> : <ErrorOutline />}
            sx={{
              width: "100%",
              maxWidth: 440,
              fontFamily: fontBody,
              fontWeight: 600,
              alignItems: "center",
              boxShadow: "0 12px 32px -12px rgba(8, 16, 40, 0.45)",
            }}
          >
            {!online
              ? "You're offline. You can sign in once your connection is back."
              : formError}
          </Alert>
        </Snackbar>
      </Box>
    </MotionConfig>
  );
}
