import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  authJsonHeaders,
  pageShellSx,
  primaryGreen,
  navy,
  textPrimary,
  textMuted,
  accentGold,
} from "../components/Users/usersShared";
import { UsersHero } from "../components/Users/usersUi";

const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';
const fontDisplay = '"Fraunces", "Georgia", serif';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const CARDS = [
  {
    key: "total_users",
    label: "Total users",
    icon: <PeopleIcon />,
    path: "/users",
    accent: primaryGreen,
    tint: "rgba(0,96,80,0.1)",
  },
  {
    key: "admin",
    label: "Admins",
    icon: <AdminPanelSettingsIcon />,
    path: "/users",
    accent: primaryGreen,
    tint: "rgba(0,96,80,0.1)",
  },
  {
    key: "staff",
    label: "Staff",
    icon: <BadgeIcon />,
    path: "/users",
    accent: navy,
    tint: "rgba(30,40,88,0.1)",
  },
  {
    key: "student",
    label: "Students",
    icon: <SchoolIcon />,
    path: "/users",
    accent: accentGold,
    tint: "rgba(200,168,64,0.18)",
  },
  {
    key: "programmes",
    label: "Programmes",
    icon: <MenuBookIcon />,
    path: "/programmes",
    accent: primaryGreen,
    tint: "rgba(0,96,80,0.1)",
  },
];

function StatCard({ icon, label, value, accent, tint, onClick, delay = 0 }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      sx={{
        flex: "1 1 180px",
        minWidth: 160,
        maxWidth: { xs: "100%", sm: 280 },
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: "20px",
        bgcolor: "#fff",
        border: "1px solid rgba(0,96,80,0.1)",
        boxShadow: "0 14px 36px -16px rgba(20,26,58,0.14)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              boxShadow: "0 20px 44px -14px rgba(20,26,58,0.2)",
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -28,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: tint,
        }}
      />
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          bgcolor: tint,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          position: "relative",
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily: fontBody,
          fontSize: "0.74rem",
          fontWeight: 700,
          color: textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          position: "relative",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: fontDisplay,
          fontWeight: 800,
          fontSize: { xs: "2rem", sm: "2.35rem" },
          color: textPrimary,
          lineHeight: 1.1,
          mt: 0.75,
          position: "relative",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_users: 0,
    admin: 0,
    staff: 0,
    student: 0,
    programmes: 0,
  });

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const loadStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/stats", {
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load dashboard stats.");
      }

      setStats({
        total_users: data.data?.total_users ?? 0,
        admin: data.data?.roles?.admin ?? 0,
        staff: data.data?.roles?.staff ?? 0,
        student: data.data?.roles?.student ?? 0,
        programmes: data.data?.programmes ?? 0,
      });
    } catch (err) {
      setError(err.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
        subtitle="Overview of users and programmes at Kendu Adventist School of Medical Sciences"
        icon={<DashboardIcon sx={{ fontSize: 28, color: "#fff" }} />}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <CircularProgress sx={{ color: primaryGreen }} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2.5,
          }}
        >
          {CARDS.map((card, i) => (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={Number(stats[card.key] || 0).toLocaleString()}
              accent={card.accent}
              tint={card.tint}
              onClick={() => navigate(card.path)}
              delay={i}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
