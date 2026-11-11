import React from "react";
import { Box, Typography } from "@mui/material";

const fontBody = '"Plus Jakarta Sans", system-ui, sans-serif';
const fontDisplay = '"Fraunces", "Georgia", serif';

/**
 * Inline data loader for page content.
 * Does not cover the navbar/header — only the route content area spins.
 * Pass `fullscreen` only for rare shell-level cases (e.g. missing session redirect).
 */
export default function BrandPageLoader({
  message,
  label,
  fullscreen = false,
}) {
  const text = message || label || "Loading…";

  const spinner = (
    <Box
      sx={{
        width: fullscreen ? 36 : 28,
        height: fullscreen ? 36 : 28,
        borderRadius: "50%",
        border: "3px solid rgba(27,94,168,0.15)",
        borderTopColor: "#c8a840",
        animation: "kenduSpin 0.85s linear infinite",
        "@keyframes kenduSpin": {
          to: { transform: "rotate(360deg)" },
        },
      }}
    />
  );

  if (fullscreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          px: 3,
          bgcolor: "var(--kd-page-b)",
          background: `
            radial-gradient(ellipse 70% 50% at 20% 0%, rgba(27,94,168,0.08), transparent 55%),
            var(--kd-page-b)
          `,
        }}
      >
        <Box
          component="img"
          src="/images/logo.png"
          alt=""
          sx={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 12px 32px -8px rgba(27, 94, 168, 0.35)",
          }}
        />
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 800,
            fontSize: { xs: "1.1rem", sm: "1.3rem" },
            color: "var(--kd-text-primary)",
            letterSpacing: "-0.02em",
            textAlign: "center",
            maxWidth: 420,
            lineHeight: 1.25,
          }}
        >
          Kendu Adventist School of Medical Sciences
        </Typography>
        {spinner}
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.86rem", color: "var(--kd-text-muted)" }}>
          {text}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        width: "100%",
        minHeight: 240,
        py: 6,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        bgcolor: "transparent",
      }}
    >
      {spinner}
      <Typography
        sx={{
          fontFamily: fontBody,
          fontSize: "0.88rem",
          fontWeight: 600,
          color: "var(--kd-text-muted)",
          textAlign: "center",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
