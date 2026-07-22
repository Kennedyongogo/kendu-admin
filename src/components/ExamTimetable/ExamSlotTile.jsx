import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import {
  accentGold,
  fontBody,
  fontDisplay,
  navy,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { formatSlotTimeRange, slotDateParts } from "./examTimetableShared";

export default function ExamSlotTile({ slot, actions }) {
  const parts = slotDateParts(slot.starts_at);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        p: 1.25,
        borderRadius: "16px",
        bgcolor: warmCream,
        border: "1px solid rgba(0,96,80,0.1)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: "rgba(0,96,80,0.28)",
          boxShadow: "0 8px 22px -10px rgba(0,96,80,0.35)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {parts ? (
        <Box
          sx={{
            flexShrink: 0,
            width: 52,
            borderRadius: "12px",
            overflow: "hidden",
            textAlign: "center",
            border: "1px solid rgba(0,96,80,0.15)",
            boxShadow: "0 4px 12px -6px rgba(0,96,80,0.3)",
          }}
        >
          <Box
            sx={{
              bgcolor: primaryGreen,
              color: "#fff",
              fontFamily: fontBody,
              fontSize: "0.58rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              py: 0.35,
            }}
          >
            {parts.month}
          </Box>
          <Box
            sx={{
              bgcolor: "#fff",
              color: navy,
              fontFamily: fontDisplay,
              fontSize: "1.2rem",
              fontWeight: 700,
              lineHeight: 1.2,
              py: 0.45,
            }}
          >
            {parts.day}
          </Box>
          <Box
            sx={{
              bgcolor: "rgba(0,96,80,0.06)",
              color: textMuted,
              fontFamily: fontBody,
              fontSize: "0.58rem",
              fontWeight: 700,
              py: 0.3,
            }}
          >
            {parts.weekday}
          </Box>
        </Box>
      ) : null}

      <Box sx={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography
          sx={{
            fontFamily: fontBody,
            fontWeight: 700,
            fontSize: "0.84rem",
            color: textPrimary,
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          {slot.title}
        </Typography>
        {slot.unit_code ? (
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.68rem", color: textMuted, mb: 0.35 }}>
            {slot.unit_code}
            {slot.unit_name ? ` · ${slot.unit_name}` : ""}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: slot.venue ? 0.35 : 0 }}>
          <ScheduleRoundedIcon sx={{ fontSize: 13, color: primaryGreen }} />
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", fontWeight: 600, color: textSecondary }}>
            {formatSlotTimeRange(slot.starts_at, slot.ends_at)}
          </Typography>
        </Stack>
        {slot.venue ? (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PlaceOutlinedIcon sx={{ fontSize: 13, color: accentGold }} />
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.7rem",
                color: textMuted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {slot.venue}
            </Typography>
          </Stack>
        ) : null}
      </Box>

      {actions ? (
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, alignSelf: "center" }}>
          {actions}
        </Stack>
      ) : null}
    </Box>
  );
}
