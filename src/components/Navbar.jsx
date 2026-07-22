import React, { cloneElement, useEffect, useState } from "react";
import {
  Logout,
  PeopleAlt,
  Settings,
  History,
  Dashboard,
  MenuBook,
  LibraryMusic,
  Campaign,
  AssignmentInd,
  AccountBalanceWallet,
  CalendarMonth,
  FactCheck,
  AccountTree,
  School,
  LockOpen,
  HowToReg,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled, useTheme, alpha } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Box, Typography } from "@mui/material";
import Header from "./Header/Header";
import { clearPortalSession } from "../auth/portalAuth";

const drawerWidth = 280;
const drawerCollapsedWidth = 100;

const BRAND = {
  navy: "#1e2858",
  navyDeep: "#141a3a",
  green: "#006050",
  greenDark: "#004840",
  gold: "#c8a840",
  goldMuted: "#d4c078",
};

const navAccent = BRAND.green;
const navAccentDark = BRAND.greenDark;
const navAccentLight = "rgba(0, 96, 80, 0.1)";
const navHoverBg = "rgba(0, 96, 80, 0.08)";
const navActiveBg = "rgba(0, 96, 80, 0.12)";
const textPrimary = "var(--kd-text-primary)";
const textMuted = "var(--kd-text-muted)";

const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';
const fontDisplay = '"Fraunces", "Georgia", serif';

const drawerPaperSx = (theme, open) => ({
  border: "none",
  borderRight: `1px solid ${alpha(navAccent, 0.1)}`,
  background: `linear-gradient(180deg, var(--kd-sidebar-a) 0%, var(--kd-sidebar-b) 55%, ${alpha(BRAND.gold, 0.08)} 100%)`,
  boxShadow: open ? "4px 0 32px rgba(20, 26, 58, 0.06)" : "2px 0 16px rgba(20, 26, 58, 0.04)",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: drawerCollapsedWidth,
});

const DrawerHeader = styled("div", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: open ? "space-between" : "center",
  padding: open ? theme.spacing(2, 2, 1.5, 2) : theme.spacing(1.5, 0.5),
  minHeight: open ? 80 : 72,
  flexShrink: 0,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.navyDeep} 100%)`,
  boxShadow: "0 4px 24px rgba(0, 96, 80, 0.28), inset 0 -1px 0 rgba(255,255,255,0.08)",
  marginLeft: open ? drawerWidth : drawerCollapsedWidth,
  width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${drawerCollapsedWidth}px)`,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: open
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  }),
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, rgba(200,168,64,0.18) 0%, transparent 42%)",
    pointerEvents: "none",
  },
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  ...(open && {
    whiteSpace: "nowrap",
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      ...drawerPaperSx(theme, true),
    },
  }),
  ...(!open && {
    whiteSpace: "normal",
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      ...drawerPaperSx(theme, false),
    },
  }),
}));

const MENU_SECTIONS = [
  {
    label: "Overview",
    items: [{ text: "Dashboard", icon: <Dashboard />, path: "/dashboard" }],
  },
  {
    label: "Operations",
    items: [
      { text: "Programmes", icon: <MenuBook />, path: "/programmes" },
      { text: "Departments", icon: <AccountTree />, path: "/departments" },
      { text: "Units", icon: <School />, path: "/units" },
      { text: "Registrations", icon: <HowToReg />, path: "/registrations" },
      { text: "Access", icon: <LockOpen />, path: "/access" },
      { text: "Admissions", icon: <AssignmentInd />, path: "/admissions" },
      { text: "Accounting", icon: <AccountBalanceWallet />, path: "/accounting" },
      { text: "Timetable", icon: <CalendarMonth />, path: "/timetable" },
      { text: "Exam Timetables", icon: <FactCheck />, path: "/exam-timetables" },
      { text: "News & Events", icon: <Campaign />, path: "/announcements" },
    ],
  },
  {
    label: "Administration",
    items: [{ text: "Users", icon: <PeopleAlt />, path: "/users" }],
  },
  {
    label: "System",
    items: [
      { text: "Music", icon: <LibraryMusic />, path: "/music" },
      { text: "Settings", icon: <Settings />, path: "/settings" },
      { text: "Audit Trail", icon: <History />, path: "/audit" },
    ],
  },
];

const flatMenuItems = MENU_SECTIONS.flatMap((s) => s.items);

function NavIconBox({ selected, children, compact }) {
  return (
    <Box
      sx={{
        width: compact ? 36 : 38,
        height: compact ? 36 : 38,
        borderRadius: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.22s ease",
        background: selected
          ? `linear-gradient(145deg, ${navAccent} 0%, ${navAccentDark} 100%)`
          : alpha(navAccent, 0.08),
        color: selected ? "#fff" : textMuted,
        boxShadow: selected ? "0 4px 12px rgba(0, 96, 80, 0.35)" : "none",
        "& .MuiSvgIcon-root": { fontSize: compact ? 20 : 21 },
      }}
    >
      {children}
    </Box>
  );
}

function NavItem({ item, open, selected, onNavigate }) {
  return (
    <ListItemButton
      onClick={() => onNavigate(item.path)}
      selected={selected}
      sx={{
        flexDirection: open ? "row" : "column",
        alignItems: "center",
        justifyContent: open ? "flex-start" : "center",
        gap: open ? 0.75 : 0.4,
        px: open ? 1.5 : 0.25,
        py: open ? 0.85 : 0.65,
        mx: open ? 1.5 : 0.25,
        mb: 0.5,
        borderRadius: "12px",
        minHeight: open ? 46 : "auto",
        whiteSpace: open ? "nowrap" : "normal",
        textAlign: "center",
        width: open ? "auto" : "100%",
        boxSizing: "border-box",
        transition: "all 0.2s ease",
        bgcolor: selected ? navActiveBg : "transparent",
        "&:hover": {
          bgcolor: selected ? navActiveBg : navHoverBg,
          transform: open ? "translateX(2px)" : "none",
        },
        "&.Mui-selected": {
          bgcolor: navActiveBg,
          "&:hover": { bgcolor: navActiveBg },
        },
      }}
    >
      {open ? (
        <>
          <NavIconBox selected={selected}>{cloneElement(item.icon)}</NavIconBox>
          <Typography
            component="span"
            sx={{
              fontFamily: fontBody,
              fontSize: "0.9rem",
              fontWeight: selected ? 700 : 500,
              color: selected ? navAccent : textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            {item.text}
          </Typography>
        </>
      ) : (
        <>
          <ListItemIcon sx={{ minWidth: 0, justifyContent: "center", mb: 0 }}>
            <NavIconBox selected={selected} compact>
              {cloneElement(item.icon)}
            </NavIconBox>
          </ListItemIcon>
          <Typography
            component="span"
            sx={{
              fontFamily: fontBody,
              fontSize: "0.65rem",
              fontWeight: selected ? 700 : 500,
              color: selected ? navAccent : textMuted,
              lineHeight: 1.25,
              letterSpacing: 0,
              width: "100%",
              px: 0.15,
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {item.text}
          </Typography>
        </>
      )}
    </ListItemButton>
  );
}

const Navbar = (props) => {
  const { user } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [open, setOpen] = useState(() => window.innerWidth >= theme.breakpoints.values.md);
  const [menuItems, setMenuItems] = useState([]);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const isNavPathSelected = (path) =>
    location.pathname === path ||
    (path === "/dashboard" && location.pathname.startsWith("/dashboard")) ||
    (path === "/programmes" && location.pathname.startsWith("/programmes")) ||
    (path === "/departments" && location.pathname.startsWith("/departments")) ||
    (path === "/units" && location.pathname.startsWith("/units")) ||
    (path === "/settings" && location.pathname.startsWith("/settings")) ||
    (path === "/audit" && location.pathname.startsWith("/audit")) ||
    (path === "/music" && location.pathname.startsWith("/music")) ||
    (path === "/admissions" && location.pathname.startsWith("/admissions")) ||
    (path === "/accounting" && location.pathname.startsWith("/accounting")) ||
    (path === "/timetable" && location.pathname.startsWith("/timetable")) ||
    (path === "/exam-timetables" && location.pathname.startsWith("/exam-timetables")) ||
    (path === "/announcements" && location.pathname.startsWith("/announcements")) ||
    (path === "/users" && location.pathname.startsWith("/users"));

  const logout = () => {
    clearPortalSession();
    navigate("/");
    fetch("/api/admin-users/logout", {
      method: "GET",
      credentials: "include",
    });
  };

  useEffect(() => {
    if (!user) {
      setMenuItems([]);
      return;
    }
    if (user.role === "staff") {
      setMenuItems(
        flatMenuItems.filter(
          (item) =>
            item.path === "/settings" ||
            item.path === "/units" ||
            item.path === "/registrations" ||
            item.path === "/timetable" ||
            item.path === "/exam-timetables" ||
            item.path === "/announcements"
        )
      );
      return;
    }
    setMenuItems(flatMenuItems);
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= theme.breakpoints.values.md);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [theme.breakpoints.values.md]);

  const sections =
    menuItems.length > 0
      ? MENU_SECTIONS.map((section) => ({
          ...section,
          items: section.items.filter((item) => menuItems.some((m) => m.path === item.path)),
        })).filter((s) => s.items.length > 0)
      : [];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} elevation={0}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 64, sm: 68 },
            px: { xs: 1.5, sm: 2.5 },
          }}
        >
          <Header setUser={props.setUser} handleDrawerOpen={handleDrawerOpen} open={open} />
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader open={open}>
          {open ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Box
                component="img"
                src="/images/logo.png"
                alt=""
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  boxShadow: "0 6px 16px rgba(0, 96, 80, 0.28)",
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: fontDisplay,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    color: textPrimary,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.25,
                  }}
                >
                  KASMS
                </Typography>
                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: navAccent,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    mt: 0.35,
                  }}
                >
                  Admin Portal
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.35 }}>
              <Box
                component="img"
                src="/images/logo.png"
                alt=""
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0, 96, 80, 0.28)",
                }}
              />
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: navAccent,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                  textAlign: "center",
                }}
              >
                Admin
              </Typography>
            </Box>
          )}
          {open && (
            <IconButton
              onClick={handleDrawerClose}
              size="small"
              aria-label="Collapse navigation"
              sx={{
                color: textMuted,
                bgcolor: navAccentLight,
                "&:hover": { bgcolor: alpha(navAccent, 0.16), color: navAccent },
              }}
            >
              {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          )}
        </DrawerHeader>

        <Divider sx={{ borderColor: alpha(navAccent, 0.1), mx: open ? 2 : 1 }} />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            py: 1.5,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: alpha(navAccent, 0.25),
              borderRadius: 4,
            },
          }}
        >
          {open ? (
            sections.map((section) => (
              <Box key={section.label} sx={{ mb: 1 }}>
                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: textMuted,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    px: 2.5,
                    pt: 1,
                    pb: 0.75,
                  }}
                >
                  {section.label}
                </Typography>
                <List disablePadding>
                  {section.items.map((item) => (
                    <NavItem
                      key={item.path}
                      item={item}
                      open={open}
                      selected={isNavPathSelected(item.path)}
                      onNavigate={navigate}
                    />
                  ))}
                </List>
              </Box>
            ))
          ) : (
            <List disablePadding sx={{ px: 0.5 }}>
              {menuItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  open={open}
                  selected={isNavPathSelected(item.path)}
                  onNavigate={navigate}
                />
              ))}
            </List>
          )}
        </Box>

        <Divider sx={{ borderColor: alpha(navAccent, 0.1), mx: open ? 2 : 1 }} />

        <Box sx={{ py: 1.5, flexShrink: 0 }}>
          <ListItemButton
            onClick={logout}
            sx={{
              flexDirection: open ? "row" : "column",
              alignItems: "center",
              justifyContent: open ? "flex-start" : "center",
              gap: open ? 0.75 : 0.4,
              px: open ? 1.5 : 0.25,
              py: open ? 1 : 0.65,
              mx: open ? 1.5 : 0.25,
              borderRadius: "12px",
              minHeight: open ? 46 : "auto",
              whiteSpace: open ? "nowrap" : "normal",
              textAlign: "center",
              width: open ? "auto" : "100%",
              boxSizing: "border-box",
              "&:hover": {
                bgcolor: navHoverBg,
                "& .logout-icon": {
                  bgcolor: alpha(navAccent, 0.15),
                  color: navAccent,
                },
              },
            }}
          >
            {open ? (
              <>
                <Box
                  className="logout-icon"
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    bgcolor: "rgba(128, 134, 158, 0.14)",
                    color: textMuted,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Logout sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  Sign out
                </Typography>
              </>
            ) : (
              <>
                <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                  <Box
                    className="logout-icon"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "11px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(128, 134, 158, 0.14)",
                      color: textMuted,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Logout sx={{ fontSize: 20 }} />
                  </Box>
                </ListItemIcon>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: textMuted,
                    lineHeight: 1.25,
                    width: "100%",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Sign out
                </Typography>
              </>
            )}
          </ListItemButton>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
