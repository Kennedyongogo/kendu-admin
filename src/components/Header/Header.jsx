import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown,
  DarkModeRounded as DarkModeRoundedIcon,
  LightModeRounded as LightModeRoundedIcon,
} from "@mui/icons-material";
import { applyThemeMode, getStoredThemeMode } from "../../theme/themeMode";
import UserAccount from "./userAccount";
import EditUserDetails from "./editUserDetails";
import ChangePassword from "./changePassword";
import { useNavigate, useLocation } from "react-router-dom";
import BrandPageLoader from "../Util/BrandPageLoader";
import { RoleBadge } from "../Users/usersUi";
import {
  clearPortalSession,
  getPortalToken,
  getPortalUser,
  updatePortalUser,
} from "../../auth/portalAuth";

const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';
const fontDisplay = '"Fraunces", "Georgia", serif';

const BRAND = {
  navy: "#1e2858",
  green: "#006050",
  gold: "#c8a840",
};

const PAGE_TITLES = [
  { prefix: "/dashboard", title: "Dashboard", subtitle: "Overview & insights" },
  { prefix: "/units", title: "Units", subtitle: "Semester offerings & approval" },
  { prefix: "/registrations", title: "Registrations", subtitle: "Student unit enrollment by programme" },
  { prefix: "/access", title: "Access", subtitle: "Fee gates for student services" },
  { prefix: "/cohort-transfer/students", title: "Transcript", subtitle: "Student academic record" },
  { prefix: "/cohort-transfer", title: "Cohort transfer", subtitle: "Move students between years & semesters" },
  { prefix: "/departments", title: "Departments", subtitle: "Academic departments & staff ownership" },
  { prefix: "/programmes", title: "Programmes", subtitle: "Academic programmes & courses" },
  { prefix: "/admissions", title: "Admissions", subtitle: "Applications & enrolment" },
  { prefix: "/accounting", title: "Accounting", subtitle: "Fee collection & payment records" },
  { prefix: "/timetable", title: "Timetable", subtitle: "Classes, CATs & exam schedules" },
  { prefix: "/exam-timetables", title: "Exam Timetables", subtitle: "Exam plans & approval" },
  { prefix: "/users", title: "Users", subtitle: "Account management" },
  { prefix: "/music", title: "Music", subtitle: "Background audio tracks" },
  { prefix: "/settings", title: "Settings", subtitle: "Preferences & security" },
  { prefix: "/audit", title: "Audit Trail", subtitle: "Admin activity & system logs" },
];

const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http") || imageUrl.startsWith("blob:")) return imageUrl;
  if (imageUrl.startsWith("/uploads/")) return imageUrl;
  if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
  return `/uploads/profiles/${imageUrl}`;
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

function getPageContext(pathname) {
  const match = PAGE_TITLES.find(({ prefix }) => pathname.startsWith(prefix));
  return match || { title: "Admin Portal", subtitle: "Kendu Adventist School" };
}

function applyUser(userData, setCurrentUser, setUser) {
  if (!userData) return;
  setCurrentUser(userData);
  setUser?.(userData);
  updatePortalUser(userData);
}

export default function Header(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [toggleAccount, setToggleAccount] = useState(false);
  const [toggleEditDetails, setToggleEditDetails] = useState(false);
  const [toggleChangePass, setToggleChangePass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const navigate = useNavigate();
  const location = useLocation();
  const page = getPageContext(location.pathname);

  const toggleThemeMode = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    applyThemeMode(next);
  };

  const refreshMe = useCallback(async () => {
    const token = getPortalToken();
    if (!token) {
      window.location.href = "/";
      return;
    }
    try {
      const response = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user");
      const payload = await response.json();
      applyUser(payload.data, setCurrentUser, props.setUser);
    } catch {
      const savedUser = getPortalUser();
      if (savedUser) {
        applyUser(savedUser, setCurrentUser, props.setUser);
      } else {
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  }, [props.setUser]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    const onUserUpdated = (event) => {
      const next = event?.detail;
      if (next && typeof next === "object") {
        applyUser(next, setCurrentUser, props.setUser);
        return;
      }
      void refreshMe();
    };
    const onStorage = (e) => {
      if (!e.key || !e.key.startsWith("kendu_")) return;
      const savedUser = getPortalUser();
      if (savedUser) applyUser(savedUser, setCurrentUser, props.setUser);
    };
    window.addEventListener("kendu:user-updated", onUserUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("kendu:user-updated", onUserUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [props.setUser, refreshMe]);

  const logout = () => {
    clearPortalSession();
    navigate("/");
    fetch("/api/admin/logout", {
      method: "GET",
      credentials: "include",
    });
  };

  const avatarSrc = buildImageUrl(
    currentUser?.profile_image_url || currentUser?.profile_image || ""
  );

  return (
    <>
      {loading && <BrandPageLoader message="Loading your account..." />}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "white",
          width: "100%",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <IconButton
            aria-label="Open navigation"
            onClick={props.handleDrawerOpen}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              width: 40,
              height: 40,
              flexShrink: 0,
              ...(props.open && { display: "none" }),
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Box sx={{ minWidth: 0, display: { xs: props.open ? "none" : "block", sm: "block" } }}>
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.15rem" },
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {page.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.78)",
                fontWeight: 500,
                display: { xs: "none", md: "block" },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {page.subtitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 }, flexShrink: 0 }}>
          <IconButton
            aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleThemeMode}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              width: 40,
              height: 40,
              flexShrink: 0,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            {themeMode === "dark" ? (
              <LightModeRoundedIcon sx={{ fontSize: 20 }} />
            ) : (
              <DarkModeRoundedIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
          <Box
            component="button"
            type="button"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              border: "1px solid rgba(255,255,255,0.18)",
              bgcolor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "14px",
              pl: { xs: 0.75, sm: 1 },
              pr: { xs: 0.75, sm: 1.25 },
              py: 0.75,
              cursor: "pointer",
              color: "inherit",
              font: "inherit",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
                borderColor: "rgba(255,255,255,0.28)",
              },
            }}
          >
            {avatarSrc ? (
              <Avatar
                key={avatarSrc}
                src={avatarSrc}
                alt={currentUser?.full_name}
                sx={{
                  width: 36,
                  height: 36,
                  border: "2px solid rgba(255, 255, 255, 0.35)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "2px solid rgba(255, 255, 255, 0.35)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  fontFamily: fontBody,
                }}
              >
                {getInitials(currentUser?.full_name)}
              </Avatar>
            )}

            <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser?.full_name || "Admin"}
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 500,
                }}
              >
                {currentUser?.role
                  ? String(currentUser.role).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Staff"}
              </Typography>
            </Box>

            <KeyboardArrowDown
              sx={{
                fontSize: 20,
                color: "rgba(255,255,255,0.8)",
                display: { xs: "none", sm: "block" },
                transition: "transform 0.2s",
                transform: anchorEl ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 280,
                borderRadius: "18px",
                border: "1px solid rgba(0,96,80,0.1)",
                boxShadow: "0 16px 48px rgba(20,26,58,0.14)",
                overflow: "hidden",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 2, bgcolor: "#f7faf8" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {avatarSrc ? (
                <Avatar
                  key={avatarSrc}
                  src={avatarSrc}
                  alt={currentUser?.full_name}
                  sx={{ width: 52, height: 52 }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: BRAND.green,
                    fontFamily: fontDisplay,
                    fontWeight: 700,
                  }}
                >
                  {getInitials(currentUser?.full_name)}
                </Avatar>
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: fontDisplay,
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: BRAND.navy,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {currentUser?.full_name || "Admin"}
                </Typography>
                <Box sx={{ mt: 0.75, mb: 0.5 }}>
                  <RoleBadge role={currentUser?.role} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.75rem",
                    color: "rgba(30,40,88,0.55)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser?.email}
                </Typography>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: "rgba(30,40,88,0.5)", mt: 0.35 }}>
                  {currentUser?.is_active !== false ? "Active account" : "Inactive account"}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setToggleAccount(true);
              setAnchorEl(null);
            }}
            sx={{ py: 1.25, fontFamily: fontBody, fontSize: "0.9rem" }}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" sx={{ color: BRAND.green }} />
            </ListItemIcon>
            <ListItemText primary="My account" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate("/settings");
              setAnchorEl(null);
            }}
            sx={{ py: 1.25, fontFamily: fontBody, fontSize: "0.9rem" }}
          >
            <ListItemIcon>
              <LockIcon fontSize="small" sx={{ color: BRAND.green }} />
            </ListItemIcon>
            <ListItemText primary="Change password" />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              logout();
              setAnchorEl(null);
            }}
            sx={{
              py: 1.25,
              fontFamily: fontBody,
              fontSize: "0.9rem",
              color: BRAND.green,
              "&:hover": { bgcolor: "rgba(0,96,80,0.08)" },
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: BRAND.green }} />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </MenuItem>
        </Menu>

        {currentUser && (
          <UserAccount
            onClose={() => setToggleAccount(false)}
            open={toggleAccount}
            currentUser={currentUser}
          />
        )}
        {currentUser && (
          <EditUserDetails
            open={toggleEditDetails}
            onClose={() => setToggleEditDetails(false)}
            currentUser={currentUser}
          />
        )}
        {currentUser && (
          <ChangePassword
            open={toggleChangePass}
            onClose={() => setToggleChangePass(false)}
            currentUser={currentUser}
          />
        )}
      </Box>
    </>
  );
}
