import React from "react";
import { Box, Typography } from "@mui/material";

const BRAND = {
  navy: "#1e2858",
  green: "#006050",
  gold: "#c8a840",
};

const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';
const fontDisplay = '"Fraunces", "Georgia", serif';

export default function BrandPageLoader({ message = "Loading…" }) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(165deg, #f7faf8 0%, #fff 45%, rgba(0,96,80,0.06) 100%)`,
        zIndex: 1300,
        gap: 2,
        px: 3,
      }}
    >
      <Box
        component="img"
        src="/images/logo.png"
        alt="Kendu Adventist School of Medical Sciences"
        sx={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0 12px 32px -8px rgba(0, 96, 80, 0.4)",
        }}
      />
      <Typography
        sx={{
          fontWeight: 800,
          color: BRAND.navy,
          fontFamily: fontDisplay,
          fontSize: { xs: "1.15rem", sm: "1.4rem" },
          letterSpacing: "-0.02em",
          textAlign: "center",
          lineHeight: 1.25,
          maxWidth: 420,
        }}
      >
        Kendu Adventist School of Medical Sciences
      </Typography>
      <Typography
        sx={{
          color: BRAND.green,
          fontWeight: 700,
          fontSize: "0.78rem",
          fontFamily: fontBody,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Admin Portal
      </Typography>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `3px solid rgba(0,96,80,0.15)`,
          borderTopColor: BRAND.gold,
          animation: "kenduSpin 0.85s linear infinite",
          mt: 1,
          "@keyframes kenduSpin": {
            to: { transform: "rotate(360deg)" },
          },
        }}
      />
      <Typography
        variant="body2"
        sx={{ color: "rgba(30,40,88,0.55)", mt: 0.5, fontFamily: fontBody }}
      >
        {message}
      </Typography>
    </Box>
  );
}
