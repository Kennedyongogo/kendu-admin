import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import {
  Check,
  Close,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Shield,
  PhotoCamera,
} from "@mui/icons-material";
import { RoleBadge, UserAvatar } from "../components/Users/usersUi";

const BRAND = {
  navy: "#1e2858",
  navyDeep: "#141a3a",
  green: "#006050",
  greenDark: "#004840",
  gold: "#c8a840",
  goldMuted: "#d4c078",
};

const warmCream = "#f7faf8";
const textPrimary = BRAND.navy;
const textSecondary = "rgba(30, 40, 88, 0.68)";
const textMuted = "rgba(30, 40, 88, 0.48)";
const successGreen = "#15803d";

const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';
const fontDisplay = '"Fraunces", "Georgia", serif';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

function profileSrc(userOrUrl) {
  if (!userOrUrl) return "";
  if (typeof userOrUrl === "string") {
    if (userOrUrl.startsWith("http") || userOrUrl.startsWith("blob:")) return userOrUrl;
    if (userOrUrl.startsWith("/uploads/")) return userOrUrl;
    if (userOrUrl.startsWith("uploads/")) return `/${userOrUrl}`;
    return `/uploads/profiles/${userOrUrl}`;
  }
  return profileSrc(userOrUrl.profile_image_url || userOrUrl.profile_image || "");
}

function SettingsSection({ icon, title, subtitle, children, delay = 0, footer }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      sx={{
        borderRadius: "20px",
        bgcolor: "#fff",
        border: "1px solid rgba(0,96,80,0.1)",
        boxShadow: "0 16px 40px -16px rgba(20,26,58,0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          borderBottom: "1px solid rgba(0,96,80,0.08)",
          background: `linear-gradient(135deg, ${warmCream} 0%, #fff 100%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(145deg, ${BRAND.gold} 0%, ${BRAND.green} 100%)`,
              color: "#fff",
              boxShadow: "0 6px 16px rgba(0,96,80,0.28)",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: "1.15rem",
                color: textPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </Typography>
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.82rem", color: textSecondary, mt: 0.15 }}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1 }}>{children}</Box>
      {footer ? (
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            borderTop: "1px solid rgba(0,96,80,0.08)",
            bgcolor: warmCream,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}

function PasswordCriterion({ met, label }) {
  return (
    <Chip
      size="small"
      icon={met ? <Check sx={{ fontSize: "14px !important" }} /> : <Close sx={{ fontSize: "14px !important" }} />}
      label={label}
      sx={{
        fontFamily: fontBody,
        fontSize: "0.72rem",
        fontWeight: 600,
        height: 28,
        bgcolor: met ? "rgba(21,128,61,0.1)" : "rgba(30,40,88,0.05)",
        color: met ? successGreen : textMuted,
        border: `1px solid ${met ? "rgba(21,128,61,0.22)" : "rgba(30,40,88,0.08)"}`,
        "& .MuiChip-icon": { color: met ? successGreen : textMuted },
      }}
    />
  );
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: "#fff",
    fontFamily: fontBody,
    transition: "all 0.22s ease",
    "& fieldset": { borderColor: "rgba(0,96,80,0.18)", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "rgba(0,96,80,0.4)" },
    "&.Mui-focused fieldset": {
      borderColor: BRAND.green,
      borderWidth: "2px",
      boxShadow: "0 0 0 3px rgba(0,96,80,0.1)",
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: fontBody,
    fontWeight: 500,
    color: textMuted,
    "&.Mui-focused": { color: BRAND.green, fontWeight: 600 },
  },
  "& .MuiInputBase-input": { fontWeight: 500, color: textPrimary },
};

const primaryBtnSx = {
  fontFamily: fontBody,
  fontWeight: 700,
  textTransform: "none",
  borderRadius: "12px",
  px: 3,
  py: 1.25,
  background: `linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldMuted} 100%)`,
  color: BRAND.navyDeep,
  boxShadow: "0 8px 24px -4px rgba(160,128,40,0.4)",
  "&:hover": {
    background: `linear-gradient(135deg, ${BRAND.goldMuted} 0%, ${BRAND.gold} 100%)`,
  },
};

export default function Settings({ user }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    admission_number: "",
  });
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dloading, setDLoading] = useState(false);
  const [ploading, setPLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false,
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const applyUserToForm = useCallback((u) => {
    if (!u) return;
    setForm({
      full_name: u.full_name ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      admission_number: u.admission_number ?? "",
    });
    setProfileFile(null);
    setProfilePreview(profileSrc(u));
  }, []);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFetching(false);
      return;
    }
    try {
      const response = await fetch("/api/users/me", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCurrentUser(data.data);
        applyUserToForm(data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
        window.dispatchEvent(new CustomEvent("kendu:user-updated", { detail: data.data }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setFetching(false);
    }
  }, [applyUserToForm]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user && !currentUser?.id) {
      setCurrentUser(user);
      applyUserToForm(user);
    }
  }, [user, currentUser?.id, applyUserToForm]);

  useEffect(() => {
    setPasswordCriteria({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      digit: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  const passwordStrength = useMemo(() => {
    const met = Object.values(passwordCriteria).filter(Boolean).length;
    return Math.round((met / 5) * 100);
  }, [passwordCriteria]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const effectiveId = currentUser?.id || user?.id;
  const isStudent = (currentUser?.role || user?.role) === "student";

  const logoutAndRedirect = () => {
    localStorage.clear();
    navigate("/");
    fetch("/api/admin/logout", { method: "GET", credentials: "include" }).catch(() => {});
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        text: "Please make sure your new password and confirmation are identical.",
        confirmButtonColor: BRAND.green,
      });
      return;
    }

    if (
      !passwordCriteria.digit ||
      !passwordCriteria.length ||
      !passwordCriteria.lowercase ||
      !passwordCriteria.special ||
      !passwordCriteria.uppercase
    ) {
      Swal.fire({
        icon: "error",
        title: "Weak password",
        text: "Enter a strong password matching all requirements.",
        confirmButtonColor: BRAND.green,
      });
      return;
    }

    setPLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || !effectiveId) {
        Swal.fire({
          icon: "error",
          title: "Not authenticated",
          text: "Please sign in again.",
          confirmButtonColor: BRAND.green,
        });
        setPLoading(false);
        return;
      }

      const response = await fetch(`/api/users/${effectiveId}/password`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        await Swal.fire({
          icon: "success",
          title: "Password updated",
          html: "Your password has been changed.<br/><br/>You will be signed out shortly — sign in again with your <strong>new password</strong>.",
          confirmButtonColor: BRAND.green,
          timer: 4000,
          timerProgressBar: true,
          allowOutsideClick: false,
        });
        logoutAndRedirect();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update failed",
          text: data.message || "Failed to update password.",
          confirmButtonColor: BRAND.green,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: BRAND.green,
      });
    }
    setPLoading(false);
  };

  const handleUserUpdate = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Full name and email are required.",
        confirmButtonColor: BRAND.green,
      });
      return;
    }
    if (isStudent && !form.admission_number.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Admission number required",
        text: "Students must have an admission number.",
        confirmButtonColor: BRAND.green,
      });
      return;
    }

    setDLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || !effectiveId) {
        Swal.fire({
          icon: "error",
          title: "Not authenticated",
          text: "Please sign in again.",
          confirmButtonColor: BRAND.green,
        });
        setDLoading(false);
        return;
      }

      const body = new FormData();
      body.append("full_name", form.full_name.trim());
      body.append("email", form.email.trim());
      body.append("phone", form.phone?.trim() || "");
      if (isStudent) body.append("admission_number", form.admission_number.trim());
      if (profileFile) body.append("profile_image", profileFile);

      const response = await fetch(`/api/users/${effectiveId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await response.json();

      if (data.success && data.data) {
        setCurrentUser(data.data);
        applyUserToForm(data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
        window.dispatchEvent(new CustomEvent("kendu:user-updated", { detail: data.data }));
        Swal.fire({
          icon: "success",
          title: "Profile saved",
          text: "Your profile has been updated successfully.",
          confirmButtonColor: BRAND.green,
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update failed",
          text: data.message || "Failed to update profile.",
          confirmButtonColor: BRAND.green,
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: "Failed to update profile. Please try again.",
        confirmButtonColor: BRAND.green,
      });
    }
    setDLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        background: `linear-gradient(180deg, ${warmCream} 0%, #FFFFFF 48%, rgba(0,96,80,0.04) 100%)`,
        mx: { xs: -1.5, sm: -2, md: -3 },
        mt: { xs: -1, sm: -1.5 },
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 },
        boxSizing: "border-box",
      }}
    >
      {fetching ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
          <CircularProgress sx={{ color: BRAND.green }} />
          <Typography sx={{ fontFamily: fontBody, color: textSecondary }}>Loading your settings…</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              borderRadius: "22px",
              p: { xs: 2.5, sm: 3 },
              background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.navyDeep} 100%)`,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 48px -16px rgba(0,96,80,0.4)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -40,
                right: -20,
                width: 200,
                height: 200,
                borderRadius: "50%",
                bgcolor: "rgba(200,168,64,0.18)",
              }}
            />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ position: "relative", zIndex: 1 }}
            >
              <UserAvatar
                name={form.full_name}
                role={currentUser?.role || "admin"}
                src={profilePreview || currentUser}
                size={76}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ mb: 1 }}>
                  <RoleBadge role={currentUser?.role} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: fontDisplay,
                    fontWeight: 700,
                    fontSize: { xs: "1.45rem", sm: "1.8rem" },
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                  }}
                >
                  {form.full_name || "Your account"}
                </Typography>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.9rem", opacity: 0.88, mt: 0.5 }}>
                  {form.email || "Manage your profile and security"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 2.5,
              alignItems: "start",
            }}
          >
            <SettingsSection
              icon={<PersonIcon />}
              title="Profile"
              subtitle="Photo, contact details, and account identity"
              delay={1}
              footer={
                <Button
                  variant="contained"
                  onClick={handleUserUpdate}
                  disabled={dloading}
                  startIcon={dloading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  sx={primaryBtnSx}
                >
                  {dloading ? "Saving…" : "Save profile"}
                </Button>
              }
            >
              <Stack spacing={2.25}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                  <UserAvatar
                    name={form.full_name}
                    role={currentUser?.role || "admin"}
                    src={profilePreview || currentUser}
                    size={80}
                  />
                  <Box>
                    <Button
                      component="label"
                      startIcon={<PhotoCamera />}
                      variant="outlined"
                      sx={{
                        fontFamily: fontBody,
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "12px",
                        borderColor: "rgba(0,96,80,0.3)",
                        color: BRAND.green,
                        "&:hover": { borderColor: BRAND.green, bgcolor: "rgba(0,96,80,0.06)" },
                      }}
                    >
                      {profilePreview ? "Change photo" : "Upload photo"}
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setProfileFile(file);
                          setProfilePreview(URL.createObjectURL(file));
                        }}
                      />
                    </Button>
                    <Typography sx={{ fontSize: "0.75rem", color: textSecondary, mt: 0.75 }}>
                      JPEG, PNG, or WebP · max 5MB
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  label="Full name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: BRAND.green, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />

                <TextField
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: BRAND.green, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />

                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: BRAND.green, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />

                {isStudent ? (
                  <TextField
                    label="Admission number"
                    value={form.admission_number}
                    onChange={(e) => setForm({ ...form, admission_number: e.target.value })}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: BRAND.green, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                ) : null}

                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: "14px",
                    bgcolor: warmCream,
                    border: "1px solid rgba(0,96,80,0.1)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: fontBody,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Role
                  </Typography>
                  <Box sx={{ mt: 0.75 }}>
                    <RoleBadge role={currentUser?.role} />
                  </Box>
                </Box>
              </Stack>
            </SettingsSection>

            <SettingsSection
              icon={<SecurityIcon />}
              title="Security"
              subtitle="Update your password to keep your account safe"
              delay={2}
              footer={
                <Button
                  type="submit"
                  form="password-form"
                  variant="contained"
                  disabled={ploading}
                  startIcon={ploading ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
                  sx={primaryBtnSx}
                >
                  {ploading ? "Updating…" : "Update password"}
                </Button>
              }
            >
              <Box component="form" id="password-form" onSubmit={handlePasswordUpdate}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      bgcolor: warmCream,
                      border: "1px solid rgba(0,96,80,0.1)",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: BRAND.greenDark,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <LockIcon sx={{ fontSize: 18 }} />
                        Password strength
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: fontBody,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: passwordStrength === 100 ? successGreen : textSecondary,
                        }}
                      >
                        {passwordStrength}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 1.5,
                        bgcolor: "rgba(30,40,88,0.06)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          background:
                            passwordStrength === 100
                              ? `linear-gradient(90deg, ${successGreen}, #22C55E)`
                              : `linear-gradient(90deg, ${BRAND.gold}, ${BRAND.green})`,
                        },
                      }}
                    />
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      <PasswordCriterion met={passwordCriteria.length} label="8+ chars" />
                      <PasswordCriterion met={passwordCriteria.uppercase} label="Uppercase" />
                      <PasswordCriterion met={passwordCriteria.lowercase} label="Lowercase" />
                      <PasswordCriterion met={passwordCriteria.digit} label="Digit" />
                      <PasswordCriterion met={passwordCriteria.special} label="Special" />
                    </Box>
                  </Box>

                  {[
                    { key: "oldPassword", label: "Current password", value: oldPassword, setter: setOldPassword },
                    { key: "newPassword", label: "New password", value: newPassword, setter: setNewPassword },
                    {
                      key: "confirmPassword",
                      label: "Confirm password",
                      value: confirmPassword,
                      setter: setConfirmPassword,
                    },
                  ].map((field) => (
                    <TextField
                      key={field.key}
                      label={field.label}
                      type={showPasswords[field.key] ? "text" : "password"}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: BRAND.green, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={showPasswords[field.key] ? "Hide" : "Show"}>
                              <IconButton
                                onClick={() => togglePasswordVisibility(field.key)}
                                edge="end"
                                sx={{ color: textMuted, "&:hover": { color: BRAND.green } }}
                              >
                                {showPasswords[field.key] ? (
                                  <VisibilityOff fontSize="small" />
                                ) : (
                                  <Visibility fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  ))}

                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: "14px",
                      bgcolor: "rgba(0,96,80,0.06)",
                      border: "1px solid rgba(0,96,80,0.12)",
                      display: "flex",
                      gap: 1.25,
                      alignItems: "flex-start",
                    }}
                  >
                    <Shield sx={{ fontSize: 20, color: BRAND.green, mt: 0.1, flexShrink: 0 }} />
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary, lineHeight: 1.55 }}>
                      Use a unique password you don&apos;t reuse elsewhere. After updating, you&apos;ll be signed out
                      and need to sign in again.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </SettingsSection>
          </Box>
        </Stack>
      )}
    </Box>
  );
}
