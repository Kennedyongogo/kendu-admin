import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import {
  PremiumDialog,
  DetailField,
  UserAvatar,
  RoleBadge,
} from "../Users/usersUi";
import {
  textPrimary,
  textSecondary,
  warmCream,
  ghostBtnSx,
} from "../Users/usersShared";

export default function UserAccount({ open, onClose, currentUser }) {
  if (!currentUser) return null;

  return (
    <PremiumDialog
      open={open}
      onClose={onClose}
      title={currentUser.full_name || "Account details"}
      subtitle="Account overview"
      icon={<PersonIcon />}
      footer={
        <Button onClick={onClose} sx={ghostBtnSx}>
          Close
        </Button>
      }
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <UserAvatar
            name={currentUser.full_name}
            role={currentUser.role}
            src={currentUser}
            size={72}
          />
          <Box>
            <RoleBadge role={currentUser.role} />
            <Typography sx={{ fontSize: "0.8rem", color: textSecondary, mt: 0.75 }}>
              {currentUser.is_active !== false ? "Active account" : "Inactive account"}
            </Typography>
          </Box>
        </Stack>
        <DetailField icon={<PersonIcon fontSize="small" />} label="Full name" value={currentUser.full_name} />
        <DetailField icon={<EmailIcon fontSize="small" />} label="Email" value={currentUser.email} />
        <DetailField icon={<PhoneIcon fontSize="small" />} label="Phone" value={currentUser.phone} />
        {currentUser.role === "student" ? (
          <DetailField
            icon={<BadgeIcon fontSize="small" />}
            label="Admission number"
            value={currentUser.admission_number}
          />
        ) : null}
        <Box sx={{ p: 1.75, borderRadius: "14px", bgcolor: warmCream, border: "1px solid rgba(0,96,80,0.1)" }}>
          <Typography sx={{ fontSize: "0.75rem", color: textSecondary }}>
            Last login:{" "}
            <Box component="span" sx={{ fontWeight: 700, color: textPrimary }}>
              {currentUser.last_login
                ? new Date(currentUser.last_login).toLocaleString()
                : "Never"}
            </Box>
          </Typography>
        </Box>
      </Stack>
    </PremiumDialog>
  );
}
