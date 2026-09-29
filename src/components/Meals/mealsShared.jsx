import React from "react";
import Swal from "sweetalert2";
import { Box, Chip, Stack, Typography } from "@mui/material";
import {
  authJsonHeaders,
  fontBody,
  fontDisplay,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";

export const MEAL_META = {
  B: { code: "B", name: "Breakfast", color: "#c2410c", soft: "rgba(194,65,12,0.1)" },
  L: { code: "L", name: "Lunch", color: "#1B5EA8", soft: "rgba(27,94,168,0.1)" },
  S: { code: "S", name: "Supper", color: "#6d28d9", soft: "rgba(109,40,217,0.1)" },
};
export const MEAL_CODES = ["B", "L", "S"];

export async function mealsApi(path, { method = "GET", body } = {}) {
  const res = await fetch(`/api/meals${path}`, {
    method,
    headers: authJsonHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function toastSuccess(title, text) {
  return Swal.fire({ icon: "success", title, text, timer: 1800, showConfirmButton: false });
}

export function alertError(title, err) {
  return Swal.fire({
    icon: "error",
    title,
    text: err?.message || String(err || "Something went wrong"),
    confirmButtonColor: primaryGreen,
  });
}

export function confirmAction({ title, text, confirmText = "Yes, continue", danger = false }) {
  return Swal.fire({
    icon: danger ? "warning" : "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    confirmButtonColor: danger ? "#b91c1c" : primaryGreen,
    cancelButtonColor: "#94a3b8",
    reverseButtons: true,
  }).then((r) => r.isConfirmed);
}

export function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function MealChip({ code, size = "small" }) {
  const meta = MEAL_META[code] || { name: code, color: textSecondary, soft: "rgba(0,0,0,0.06)" };
  return (
    <Chip
      size={size}
      label={meta.name}
      sx={{
        fontFamily: fontBody,
        fontWeight: 800,
        fontSize: "0.72rem",
        height: 24,
        bgcolor: meta.soft,
        color: meta.color,
        border: "none",
      }}
    />
  );
}

export function MethodChip({ method }) {
  const qr = method === "qr";
  return (
    <Chip
      size="small"
      label={qr ? "QR scan" : "Manual"}
      sx={{
        fontFamily: fontBody,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 22,
        bgcolor: qr ? "rgba(15,118,110,0.1)" : "rgba(200,168,64,0.18)",
        color: qr ? "#0f766e" : "#8a6d12",
      }}
    />
  );
}

export function Panel({ title, subtitle, action, children, sx }) {
  return (
    <Box
      sx={{
        borderRadius: "18px",
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(27,94,168,0.1)",
        boxShadow: "0 14px 36px -20px rgba(20,26,58,0.14)",
        overflow: "hidden",
        ...sx,
      }}
    >
      {title ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          sx={{ px: 2.25, py: 1.6, borderBottom: "1px solid rgba(27,94,168,0.08)" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.08rem", color: textPrimary }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary, mt: 0.2 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action || null}
        </Stack>
      ) : null}
      <Box sx={{ p: 2.25 }}>{children}</Box>
    </Box>
  );
}

export function EmptyNote({ children }) {
  return (
    <Typography
      sx={{
        fontFamily: fontBody,
        fontSize: "0.85rem",
        color: textMuted,
        textAlign: "center",
        py: 3,
      }}
    >
      {children}
    </Typography>
  );
}

export const tableHeadSx = {
  "& th": {
    fontFamily: fontBody,
    fontWeight: 800,
    fontSize: "0.7rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: textMuted,
    borderBottom: "1px solid rgba(27,94,168,0.1)",
    whiteSpace: "nowrap",
  },
};

export const tableBodySx = {
  "& td": {
    fontFamily: fontBody,
    fontSize: "0.84rem",
    color: textPrimary,
    borderBottom: "1px solid rgba(27,94,168,0.06)",
  },
};
