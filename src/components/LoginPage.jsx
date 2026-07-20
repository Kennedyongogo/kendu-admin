import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock,
  ArrowForward,
  Close,
  MarkEmailRead,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { savePortalSession } from "../auth/portalAuth";

const BRAND = {
  navy: "#1e2858",
  navyDeep: "#141a3a",
  green: "#006050",
  greenDark: "#004840",
  greenLight: "#3d9e78",
  gold: "#c8a840",
  goldSoft: "#e8d9a0",
  goldMuted: "#d4c078",
  name: "Kendu Adventist School of Medical Sciences",
  shortName: "Kendu Adventist School",
};

const C = {
  white: "#fbfcfa",
  paper: "#ffffff",
  ink: BRAND.navy,
  inkSoft: "rgba(30, 40, 88, 0.68)",
  inkMute: "rgba(30, 40, 88, 0.48)",
  line: "rgba(30, 40, 88, 0.1)",
  greenWash: "rgba(0, 96, 80, 0.08)",
  goldWash: "rgba(200, 168, 64, 0.14)",
};

const fontDisplay = '"Fraunces", "Georgia", serif';
const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';

const ADMIN_PORTAL_LOGIN_BLOCKED_ROLES = ["student"];

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

function GreenImagePanel({ activeSlide, compact = false, onSelectSlide }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: "relative",
        overflow: "hidden",
        height: compact ? "clamp(180px, 30vh, 260px)" : "100%",
        minHeight: compact ? undefined : "100dvh",
        flex: compact ? "0 0 auto" : "1 1 auto",
        minWidth: 0,
        bgcolor: BRAND.green,
        ml: compact ? 0 : { lg: "-10%" },
      }}
    >
      {/* Atmospheric planes */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(61, 158, 120, 0.55) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 90% 90%, rgba(20, 72, 64, 0.7) 0%, transparent 50%),
            linear-gradient(160deg, ${BRAND.green} 0%, ${BRAND.greenDark} 100%)
          `,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: { xs: "55%", lg: "48%" },
          height: { xs: "42%", lg: "46%" },
          bgcolor: "rgba(0, 72, 64, 0.55)",
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: { xs: "78%", lg: "70%" },
          height: { xs: "50%", lg: "54%" },
          bgcolor: "rgba(61, 158, 120, 0.35)",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Photo frame */}
      <Box
        sx={{
          position: "absolute",
          top: compact ? "8%" : { xs: "10%", lg: "12%" },
          right: compact ? "4%" : { xs: "3%", lg: "5%" },
          bottom: compact ? "14%" : { xs: "16%", lg: "14%" },
          width: compact ? "88%" : { xs: "88%", lg: "74%" },
          overflow: "hidden",
          clipPath: {
            xs: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)",
            lg: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)",
          },
          boxShadow: "0 32px 64px rgba(8, 20, 32, 0.4)",
          zIndex: 2,
        }}
      >
        {HERO_IMAGES.map((img, index) => (
          <Box
            key={img.file}
            component={motion.img}
            src={heroImageSrc(img.file)}
            alt={img.caption}
            loading={index === 0 ? "eager" : "lazy"}
            animate={{
              opacity: index === activeSlide ? 1 : 0,
              scale: index === activeSlide ? 1.04 : 1,
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
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 45%, rgba(10, 28, 24, 0.72) 100%)",
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* Caption + dots */}
      {!compact && (
        <Box
          sx={{
            position: "absolute",
            left: { lg: "18%" },
            right: { lg: "8%" },
            bottom: { lg: "5.5%" },
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <AnimatePresence mode="wait">
            <Typography
              key={activeSlide}
              component={motion.p}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
              sx={{
                fontFamily: fontDisplay,
                color: "rgba(255,255,255,0.95)",
                fontSize: "clamp(0.95rem, 1.2vw, 1.15rem)",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1.35,
                maxWidth: 360,
                textShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              {HERO_IMAGES[activeSlide].caption}
            </Typography>
          </AnimatePresence>
          <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
            {HERO_IMAGES.map((_, i) => (
              <Box
                key={i}
                component="button"
                type="button"
                aria-label={`Show campus image ${i + 1}`}
                onClick={() => onSelectSlide?.(i)}
                sx={{
                  border: "none",
                  p: 0,
                  cursor: "pointer",
                  height: 4,
                  width: i === activeSlide ? 28 : 10,
                  borderRadius: 2,
                  bgcolor: i === activeSlide ? BRAND.gold : "rgba(255,255,255,0.35)",
                  transition: "width 0.35s ease, background-color 0.35s ease",
                  "&:hover": {
                    bgcolor: i === activeSlide ? BRAND.goldMuted : "rgba(255,255,255,0.55)",
                  },
                }}
              />
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

  const rfEmail = useRef();
  const rfPassword = useRef();
  const rsEmail = useRef();

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [body, updateBody] = useState({ email: null });
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [resetEmailFocused, setResetEmailFocused] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => rfEmail.current?.focus(), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!openResetDialog) return undefined;
    const t = setTimeout(() => rsEmail.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [openResetDialog]);

  const login = async (e) => {
    if (e) e.preventDefault();

    const d = { ...body };
    d.email = rfEmail.current?.value?.toLowerCase?.()?.trim() ?? "";
    d.password = rfPassword.current?.value ?? "";
    updateBody(d);

    if (!validateEmail(d.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: BRAND.green,
      });
      return;
    }

    if (!validatePassword(d.password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be at least 6 characters",
        confirmButtonColor: BRAND.green,
      });
      return;
    }

    setLoading(true);
    Swal.fire({
      title: "Signing in...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ...d, portal: "admin" }),
      });
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || data.error || "Invalid credentials",
          confirmButtonColor: BRAND.green,
        });
      } else if (data.success && data.data?.user && data.data?.token) {
        const authed = data.data.user;
        if (ADMIN_PORTAL_LOGIN_BLOCKED_ROLES.includes(authed.role)) {
          Swal.fire({
            icon: "warning",
            title: "Access denied",
            text: "This portal is for school admin and staff only. Students should use the student portal.",
            confirmButtonColor: BRAND.green,
          });
          return;
        }
        Swal.fire({
          icon: "success",
          title: "Welcome back",
          text: data.message || `Signed in as ${authed.full_name || authed.email}`,
          timer: 1400,
          showConfirmButton: false,
        });
        savePortalSession(authed, data.data.token);
        const landingPath = authed.role === "staff" ? "/units" : "/dashboard";
        setTimeout(() => navigate(landingPath), 1400);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Login failed",
          confirmButtonColor: BRAND.green,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Login failed. Please try again.",
        confirmButtonColor: BRAND.green,
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    const d = { Email: rsEmail.current?.value?.toLowerCase?.()?.trim() ?? "" };

    if (!validateEmail(d.Email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: BRAND.green,
      });
      return;
    }

    setResetLoading(true);
    Swal.fire({
      title: "Processing...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(d),
      });
      const data = await response.json();

      if (response.ok) {
        setOpenResetDialog(false);
        Swal.fire({
          icon: "success",
          title: "Check your email",
          text: "We've sent you a password reset link",
          confirmButtonColor: BRAND.green,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || data.message || "Request failed",
          confirmButtonColor: BRAND.green,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: BRAND.green,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const validateEmail = (email) =>
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  const validatePassword = (password) => password && password.length >= 6;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: C.paper,
      fontFamily: fontBody,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "& fieldset": {
        borderColor: C.line,
        borderWidth: "1.5px",
      },
      "&:hover fieldset": { borderColor: "rgba(0, 96, 80, 0.45)" },
      "&.Mui-focused fieldset": {
        borderColor: BRAND.green,
        borderWidth: "2px",
        boxShadow: `0 0 0 3px ${C.greenWash}`,
      },
    },
    "& .MuiInputLabel-root": {
      fontFamily: fontBody,
      color: C.inkMute,
      fontWeight: 500,
      "&.Mui-focused": { color: BRAND.green, fontWeight: 600 },
    },
    "& .MuiInputBase-input": {
      py: "15px",
      fontSize: "0.95rem",
      fontWeight: 500,
      color: C.ink,
      letterSpacing: "0.01em",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isDesktop ? "row" : "column",
        height: "100dvh",
        maxHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        fontFamily: fontBody,
        bgcolor: C.white,
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
          clipPath: isDesktop ? "polygon(0 0, 100% 0, 82% 100%, 0 100%)" : "none",
          background: `
            radial-gradient(ellipse 90% 70% at 12% 88%, ${C.greenWash} 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 78% 8%, ${C.goldWash} 0%, transparent 50%),
            linear-gradient(165deg, #ffffff 0%, #f7faf8 48%, #f3f7f5 100%)
          `,
          overflow: "hidden",
        }}
      >
        {/* Soft ornament */}
        <Box
          component={motion.div}
          aria-hidden
          animate={{ rotate: [0, 4, 0], y: [0, -6, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            top: "-8%",
            left: "-6%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `1px solid rgba(200, 168, 64, 0.22)`,
            pointerEvents: "none",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: "12%",
            left: "8%",
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `1px solid rgba(0, 96, 80, 0.12)`,
            pointerEvents: "none",
          }}
        />

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3.5 }}>
              <Box
                component={motion.img}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.55 }}
                src="/images/logo.png"
                alt=""
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  boxShadow: "0 10px 28px -10px rgba(8, 24, 40, 0.35)",
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: fontDisplay,
                    fontWeight: 700,
                    fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                    color: C.ink,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {BRAND.shortName}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: BRAND.green,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    mt: 0.35,
                  }}
                >
                  Admin portal
                </Typography>
              </Box>
            </Box>

            {/* Headline */}
            <Typography
              component="h1"
              sx={{
                fontFamily: fontDisplay,
                fontSize: "clamp(1.85rem, 3.2vw, 2.35rem)",
                fontWeight: 700,
                color: C.ink,
                letterSpacing: "-0.035em",
                lineHeight: 1.12,
                mb: 1,
              }}
            >
              Welcome back
            </Typography>
            <Typography
              sx={{
                fontFamily: fontBody,
                color: C.inkSoft,
                fontSize: "0.95rem",
                fontWeight: 500,
                lineHeight: 1.55,
                mb: 3.25,
                maxWidth: 340,
              }}
            >
              Sign in to manage campus operations, staff, and student records.
            </Typography>

            {/* Form */}
            <Box
              component="form"
              onSubmit={login}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                inputRef={rfEmail}
                type="email"
                label="Email address"
                placeholder="you@kendu.ac.ke"
                fullWidth
                required
                autoComplete="email"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon
                        sx={{
                          color: emailFocused ? BRAND.green : C.inkMute,
                          fontSize: 20,
                          transition: "color 0.2s",
                          ml: 0.5,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <Box>
                <TextField
                  inputRef={rfPassword}
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  fullWidth
                  required
                  autoComplete="current-password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock
                          sx={{
                            color: passwordFocused ? BRAND.green : C.inkMute,
                            fontSize: 20,
                            transition: "color 0.2s",
                            ml: 0.5,
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          sx={{
                            color: C.inkMute,
                            mr: 0.25,
                            "&:hover": { color: BRAND.green, bgcolor: C.greenWash },
                          }}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Typography
                    component="button"
                    type="button"
                    onClick={() => setOpenResetDialog(true)}
                    sx={{
                      fontFamily: fontBody,
                      fontSize: "0.82rem",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: BRAND.green,
                      fontWeight: 600,
                      px: 0.75,
                      py: 0.4,
                      borderRadius: "8px",
                      transition: "background-color 0.2s, color 0.2s",
                      "&:hover": {
                        bgcolor: C.greenWash,
                        color: BRAND.greenDark,
                      },
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
              </Box>

              <Button
                component={motion.button}
                whileHover={{ y: loading ? 0 : -2 }}
                whileTap={{ scale: loading ? 1 : 0.985 }}
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArrowForward sx={{ fontSize: 20 }} />
                  )
                }
                sx={{
                  mt: 0.75,
                  py: 1.65,
                  fontFamily: fontBody,
                  background: `linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldMuted} 100%)`,
                  color: BRAND.navyDeep,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  letterSpacing: "0.01em",
                  borderRadius: "12px",
                  textTransform: "none",
                  boxShadow: "0 10px 28px -8px rgba(160, 128, 40, 0.45)",
                  transition: "box-shadow 0.25s ease, filter 0.25s ease",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${BRAND.goldMuted} 0%, ${BRAND.gold} 100%)`,
                    boxShadow: "0 14px 32px -8px rgba(160, 128, 40, 0.5)",
                    filter: "brightness(1.02)",
                  },
                  "&.Mui-disabled": {
                    background: `linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldMuted} 100%)`,
                    color: BRAND.navyDeep,
                    opacity: 0.72,
                  },
                }}
              >
                {loading ? "Signing in…" : "Access dashboard"}
              </Button>
            </Box>

            <Typography
              sx={{
                mt: 3,
                fontFamily: fontBody,
                fontSize: "0.72rem",
                color: C.inkMute,
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              Encrypted session · Admin &amp; staff access only
            </Typography>
          </Box>

          <Typography
            component={motion.p}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            sx={{
              position: isDesktop ? "absolute" : "relative",
              bottom: isDesktop ? 28 : undefined,
              left: isDesktop ? "clamp(36px, 5.5vw, 64px)" : undefined,
              mt: isDesktop ? 0 : 3,
              textAlign: isDesktop ? "left" : "center",
              fontFamily: fontBody,
              fontSize: "0.7rem",
              color: C.inkMute,
              fontWeight: 500,
            }}
          >
            <Box component="span" sx={{ color: BRAND.green, fontWeight: 700 }}>
              © 2026
            </Box>{" "}
            {BRAND.name}
          </Typography>
        </Box>
      </Box>

      {isDesktop ? (
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}>
          <GreenImagePanel
            activeSlide={activeSlide}
            onSelectSlide={setActiveSlide}
          />
        </Box>
      ) : (
        <GreenImagePanel activeSlide={activeSlide} compact />
      )}

      {/* Reset dialog */}
      <Dialog
        open={openResetDialog}
        onClose={() => !resetLoading && setOpenResetDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(20, 26, 58, 0.28)", backdropFilter: "blur(6px)" } },
        }}
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, scale: 0.97, y: 14 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            bgcolor: C.paper,
            boxShadow: "0 28px 64px -16px rgba(20, 26, 58, 0.28)",
            m: 2,
          },
        }}
      >
        <Box sx={{ position: "relative", px: 3, pt: 3, pb: 0.5 }}>
          <IconButton
            onClick={() => !resetLoading && setOpenResetDialog(false)}
            disabled={resetLoading}
            aria-label="Close"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: C.inkMute,
              "&:hover": { bgcolor: C.greenWash, color: BRAND.green },
            }}
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
            <Lock sx={{ color: "white", fontSize: 22 }} />
          </Box>

          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              color: C.ink,
              fontSize: "1.35rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              pr: 4,
            }}
          >
            Reset your password
          </Typography>
          <Typography
            sx={{
              fontFamily: fontBody,
              color: C.inkSoft,
              fontSize: "0.9rem",
              lineHeight: 1.6,
              mt: 1,
            }}
          >
            Enter your registered email and we&apos;ll send a secure link to reset your password.
          </Typography>
        </Box>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            <TextField
              inputRef={rsEmail}
              type="email"
              label="Email address"
              placeholder="you@kendu.ac.ke"
              fullWidth
              required
              onFocus={() => setResetEmailFocused(true)}
              onBlur={() => setResetEmailFocused(false)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon
                      sx={{
                        color: resetEmailFocused ? BRAND.green : C.inkMute,
                        fontSize: 20,
                        ml: 0.5,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1, pt: 3, pb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={resetLoading}
                startIcon={
                  resetLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <MarkEmailRead sx={{ fontSize: 20 }} />
                  )
                }
                sx={{
                  fontFamily: fontBody,
                  background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldMuted})`,
                  color: BRAND.navyDeep,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.4,
                  fontSize: "0.95rem",
                  boxShadow: "0 8px 24px -6px rgba(160, 128, 40, 0.4)",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${BRAND.goldMuted}, ${BRAND.gold})`,
                  },
                }}
              >
                {resetLoading ? "Sending…" : "Send reset link"}
              </Button>
              <Button
                variant="text"
                onClick={() => setOpenResetDialog(false)}
                disabled={resetLoading}
                fullWidth
                sx={{
                  fontFamily: fontBody,
                  borderRadius: "10px",
                  textTransform: "none",
                  color: C.inkSoft,
                  fontWeight: 600,
                  py: 1,
                  "&:hover": { bgcolor: C.greenWash, color: C.ink },
                }}
              >
                Back to sign in
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
