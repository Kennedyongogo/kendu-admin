export const primaryGreen = "#1B5EA8";
export const primaryDark = "#0E3D73";
export const primaryLight = "rgba(27, 94, 168, 0.1)";
export const accentGold = "#c8a840";
export const accentGoldMuted = "#d4c078";
export const navy = "#1e2858";
/*
 * Theme-aware tokens: these resolve through CSS variables declared in
 * index.css so the admin can switch between light and dark mode at runtime.
 * `navy` above stays fixed because it doubles as an accent colour (gradients,
 * text on gold buttons) that must not flip in dark mode.
 */
export const warmCream = "var(--kd-surface-soft)";
export const surface = "var(--kd-surface)";
export const textPrimary = "var(--kd-text-primary)";
export const textSecondary = "var(--kd-text-secondary)";
export const textMuted = "var(--kd-text-muted)";

/** @deprecated use primaryGreen */
export const primaryRed = primaryGreen;

export const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';
export const fontDisplay = '"Fraunces", "Georgia", serif';

export const ALL_ROLES = ["admin", "staff", "student"];

import {
  getPortalToken,
  getPortalUser,
  updatePortalUser,
} from "../../auth/portalAuth";

export { getPortalToken, getPortalUser, updatePortalUser };

export function getActorFromStorage() {
  return getPortalUser();
}

/** Roles the signed-in user may assign when creating or editing users. */
export function assignableRoles(actorRole) {
  if (actorRole === "admin") return [...ALL_ROLES];
  if (actorRole === "staff") return ["staff", "student"];
  return [];
}

/**
 * Roles shown on create screens.
 * kind: "admin" → admin/staff only; "student" → student only.
 */
export function creatableRolesForKind(actorRole, kind = "admin") {
  const allowed = assignableRoles(actorRole);
  if (kind === "student") {
    return allowed.includes("student") ? ["student"] : [];
  }
  return allowed.filter((r) => r === "admin" || r === "staff");
}

export const ROLE_TABS = [
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
];

export const authJsonHeaders = (token) => {
  const resolved = token || getPortalToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${resolved}`,
  };
};

export function formatRole(role) {
  if (!role) return "—";
  return String(role).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function roleChipColor(role) {
  switch (role) {
    case "admin":
      return { bg: primaryGreen, color: "#fff" };
    case "staff":
      return { bg: navy, color: "#fff" };
    case "student":
      return { bg: accentGold, color: navy };
    default:
      return { bg: primaryLight, color: primaryDark };
  }
}

export function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function profileImageSrc(userOrUrl) {
  if (!userOrUrl) return "";
  if (typeof userOrUrl === "string") {
    if (userOrUrl.startsWith("http") || userOrUrl.startsWith("blob:")) return userOrUrl;
    if (userOrUrl.startsWith("/uploads/")) return userOrUrl;
    if (userOrUrl.startsWith("uploads/")) return `/${userOrUrl}`;
    return `/uploads/profiles/${userOrUrl}`;
  }
  if (userOrUrl.profile_image_url) return userOrUrl.profile_image_url;
  if (userOrUrl.profile_image) return profileImageSrc(userOrUrl.profile_image);
  return "";
}

export const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: "var(--kd-surface)",
    fontFamily: fontBody,
    transition: "all 0.22s ease",
    "& fieldset": { borderColor: "rgba(27, 94, 168, 0.18)", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "rgba(27, 94, 168, 0.4)" },
    "&.Mui-focused fieldset": {
      borderColor: primaryGreen,
      borderWidth: "2px",
      boxShadow: "0 0 0 3px rgba(27, 94, 168, 0.1)",
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: fontBody,
    fontWeight: 500,
    color: textMuted,
    "&.Mui-focused": { color: primaryGreen, fontWeight: 600 },
  },
  "& .MuiInputBase-input": { fontWeight: 500, color: textPrimary },
  "& .MuiSelect-select": { fontFamily: fontBody },
};

export const primaryBtnSx = {
  fontFamily: fontBody,
  fontWeight: 700,
  textTransform: "none",
  borderRadius: "12px",
  px: 3,
  py: 1.25,
  background: `linear-gradient(135deg, ${accentGold} 0%, ${accentGoldMuted} 100%)`,
  color: navy,
  boxShadow: "0 8px 24px -4px rgba(160, 128, 40, 0.4)",
  "&:hover": {
    background: `linear-gradient(135deg, ${accentGoldMuted} 0%, ${accentGold} 100%)`,
  },
};

export const ghostBtnSx = {
  fontFamily: fontBody,
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "12px",
  color: textSecondary,
  "&:hover": { bgcolor: warmCream, color: textPrimary },
};

export const pageShellSx = {
  minHeight: "100%",
  background: `linear-gradient(180deg, var(--kd-page-a) 0%, var(--kd-page-b) 48%, rgba(27,94,168,0.04) 100%)`,
  mx: { xs: -1.5, sm: -2, md: -3 },
  mt: { xs: -1, sm: -1.5 },
  px: { xs: 1.5, sm: 2, md: 3 },
  py: { xs: 2, sm: 3 },
  boxSizing: "border-box",
};
