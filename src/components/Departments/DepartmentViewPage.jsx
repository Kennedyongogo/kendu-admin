import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccountTree as AccountTreeIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Groups as GroupsIcon,
  MenuBook as MenuBookIcon,
  Tag as TagIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, DetailField, fadeUp } from "../Users/usersUi";
import {
  authJsonHeaders,
  getPortalToken,
  fontBody,
  pageShellSx,
  primaryDark,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { formatCategory } from "../Programmes/programmesShared";

export default function DepartmentViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getPortalToken();
  const goBack = () => navigate("/departments");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/departments/${id}`, {
          headers: authJsonHeaders(token),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.message || "Could not load department");
        if (active) setDepartment(data.data);
      } catch (err) {
        if (active) setError(err.message || "Could not load department");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, token]);

  const openEditDialog = () => {
    navigate("/departments", { state: { editDepartment: department } });
  };

  if (loading) {
    return <BrandPageLoader message="Loading department…" />;
  }

  if (error || !department) {
    return (
      <Box sx={pageShellSx}>
        <Alert severity="error" sx={{ borderRadius: "14px" }}>
          {error || "Department not found"}
        </Alert>
        <Button
          onClick={goBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2, color: primaryGreen, fontWeight: 700, textTransform: "none" }}
        >
          Back to departments
        </Button>
      </Box>
    );
  }

  const active = department.is_active !== false;
  const programmes = Array.isArray(department.programmes) ? department.programmes : [];
  const staff = Array.isArray(department.staff) ? department.staff : [];

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={department.name}
        subtitle="Department overview"
        icon={<AccountTreeIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit department">
              <IconButton
                onClick={openEditDialog}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Back to departments">
              <IconButton
                onClick={goBack}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      <Stack spacing={2.5} component={motion.div} variants={fadeUp} custom={1} initial="hidden" animate="visible">
        <FormSection title="Overview">
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "stretch", md: "flex-start" }}>
            <Box
              sx={{
                width: { xs: "100%", sm: 220 },
                aspectRatio: "1",
                borderRadius: "20px",
                bgcolor: "rgba(0,96,80,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1.5px solid rgba(0,96,80,0.14)",
                boxShadow: "0 12px 32px rgba(20,26,58,0.08)",
              }}
            >
              <AccountTreeIcon sx={{ fontSize: 72, color: primaryGreen, opacity: 0.55 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                <Chip
                  label={active ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    bgcolor: active ? "rgba(0,96,80,0.1)" : "rgba(30,40,88,0.06)",
                    color: active ? primaryDark : textSecondary,
                  }}
                />
                {department.code ? (
                  <Chip
                    icon={<TagIcon sx={{ fontSize: 16 }} />}
                    label={department.code}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: "0.72rem" }}
                  />
                ) : null}
                <Chip
                  icon={<MenuBookIcon sx={{ fontSize: 16 }} />}
                  label={`${programmes.length} programme${programmes.length === 1 ? "" : "s"}`}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: "0.72rem" }}
                />
                <Chip
                  icon={<GroupsIcon sx={{ fontSize: 16 }} />}
                  label={`${staff.length} staff`}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: "0.72rem" }}
                />
              </Stack>
              <Stack spacing={1.5}>
                <DetailField icon={<TagIcon fontSize="small" />} label="Code" value={department.code || "—"} />
                <DetailField
                  icon={<DescriptionIcon fontSize="small" />}
                  label="Description"
                  value={department.description || "No description provided."}
                />
              </Stack>
            </Box>
          </Stack>
        </FormSection>

        <FormSection title={`Programmes (${programmes.length})`}>
          {programmes.length ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: warmCream }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: textMuted }}>No</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: textMuted }}>Programme</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: textMuted }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem", color: textMuted }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programmes.map((prog, idx) => (
                    <TableRow key={prog.id} hover>
                      <TableCell sx={{ color: textMuted, fontWeight: 700 }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary }}>
                        {prog.name}
                      </TableCell>
                      <TableCell sx={{ fontFamily: fontBody, color: textSecondary }}>
                        {formatCategory(prog.category)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => navigate(`/programmes/${prog.id}`)}
                          sx={{ textTransform: "none", fontWeight: 700, color: primaryGreen }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.85rem" }}>
              No programmes are linked to this department yet.
            </Typography>
          )}
        </FormSection>

        <FormSection title={`Staff (${staff.length})`}>
          {staff.length ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: warmCream }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: textMuted }}>No</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: textMuted }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: textMuted }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: textMuted }}>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staff.map((member, idx) => (
                    <TableRow key={member.id} hover>
                      <TableCell sx={{ color: textMuted, fontWeight: 700 }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary }}>
                        {member.full_name}
                      </TableCell>
                      <TableCell sx={{ fontFamily: fontBody, color: textSecondary }}>
                        {member.position || "—"}
                      </TableCell>
                      <TableCell sx={{ fontFamily: fontBody, color: textSecondary, textTransform: "capitalize" }}>
                        {member.role}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.85rem" }}>
              No staff are assigned to this department yet.
            </Typography>
          )}
        </FormSection>
      </Stack>
    </Box>
  );
}
