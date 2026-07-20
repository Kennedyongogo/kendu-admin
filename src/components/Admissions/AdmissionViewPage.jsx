import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AssignmentInd as AssignmentIndIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Grade as GradeIcon,
  History as HistoryIcon,
  MenuBook as MenuBookIcon,
  Phone as PhoneIcon,
  Place as PlaceIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import BrandPageLoader from "../Util/BrandPageLoader";
import { UsersHero, FormSection, DetailField, fadeUp, HeroActionButton, PremiumDialog } from "../Users/usersUi";
import {
  fontBody,
  getPortalToken,
  fontDisplay,
  ghostBtnSx,
  pageShellSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  warmCream,
  navy,
} from "../Users/usersShared";
import {
  admissionStatusChipSx,
  formatAdmissionStatus,
  formatDateTime,
} from "./admissionsShared";
import StatusUpdateDialog from "./StatusUpdateDialog";

const DOC_LABELS = [
  { key: "kcse_certificate_url", label: "KCSE certificate" },
  { key: "result_slip_url", label: "Result slip" },
  { key: "birth_certificate_url", label: "Birth certificate" },
  { key: "id_document_url", label: "ID document" },
];

function isPdfUrl(url) {
  return /\.pdf($|\?)/i.test(String(url || ""));
}

function DocumentViewDialog({ open, doc, onClose }) {
  if (!doc?.url) return null;
  const pdf = isPdfUrl(doc.url);

  return (
    <PremiumDialog
      open={open}
      onClose={onClose}
      title={doc.label}
      subtitle="Preview and download"
      icon={<DescriptionIcon />}
      maxWidth="md"
      footer={
        <>
          <Button onClick={onClose} sx={ghostBtnSx}>
            Close
          </Button>
          <Button
            component="a"
            href={doc.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<DownloadIcon />}
            sx={primaryBtnSx}
          >
            Download
          </Button>
        </>
      }
    >
      <Box
        sx={{
          width: "100%",
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid rgba(0,96,80,0.12)",
          bgcolor: warmCream,
          minHeight: { xs: 280, sm: 420 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {pdf ? (
          <Box
            component="iframe"
            title={doc.label}
            src={doc.url}
            sx={{
              width: "100%",
              height: { xs: 320, sm: 480 },
              border: "none",
              bgcolor: "var(--kd-surface)",
            }}
          />
        ) : (
          <Box
            component="img"
            src={doc.url}
            alt={doc.label}
            sx={{
              display: "block",
              maxWidth: "100%",
              maxHeight: { xs: 360, sm: 520 },
              objectFit: "contain",
              p: 1.5,
            }}
          />
        )}
      </Box>
    </PremiumDialog>
  );
}

export default function AdmissionViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);

  const token = getPortalToken();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Not found");
      setApp(data.data);
    } catch (err) {
      setError(err.message || "Could not load application");
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <BrandPageLoader message="Loading application…" />;

  if (error || !app) {
    return (
      <Box sx={pageShellSx}>
        <Alert severity="error" sx={{ borderRadius: "14px", mb: 2 }}>
          {error || "Application not found"}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admissions")} sx={ghostBtnSx}>
          Back to admissions
        </Button>
      </Box>
    );
  }

  const history = Array.isArray(app.status_notes) ? [...app.status_notes].reverse() : [];

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title={app.full_name}
        subtitle={`${app.programme?.name || "Programme"} · submitted ${formatDateTime(app.created_at)}`}
        leading={
          <Tooltip title="Back to admissions" arrow>
            <IconButton
              onClick={() => navigate("/admissions")}
              aria-label="Back to admissions"
              sx={{
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.28)",
                bgcolor: "rgba(255,255,255,0.1)",
                width: 42,
                height: 42,
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "rgba(200,168,64,0.28)",
                  borderColor: "rgba(200,168,64,0.55)",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        }
        icon={<AssignmentIndIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip
              label={formatAdmissionStatus(app.status)}
              sx={{
                fontWeight: 800,
                bgcolor: "rgba(255,255,255,0.16)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: "10px",
                height: 34,
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
            <HeroActionButton variant="contained" startIcon={<EditIcon />} onClick={() => setStatusOpen(true)}>
              Update status
            </HeroActionButton>
          </Stack>
        }
      />

      <Box
        component={motion.div}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}
      >
        <FormSection title="Applicant details">
          <Stack spacing={1.25}>
            <DetailField icon={<BadgeIcon />} label="Full name" value={app.full_name} />
            <DetailField icon={<EmailIcon />} label="Email" value={app.email} />
            <DetailField icon={<PhoneIcon />} label="Phone" value={app.phone} />
            <DetailField icon={<BadgeIcon />} label="National ID" value={app.national_id} />
            <DetailField icon={<PlaceIcon />} label="Address" value={app.address || "—"} />
            <DetailField icon={<GradeIcon />} label="KCSE grade" value={app.kcse_grade} />
          </Stack>
        </FormSection>

        <FormSection title="Programme">
          <Stack spacing={1.25}>
            <DetailField icon={<MenuBookIcon />} label="Programme" value={app.programme?.name || "—"} />
            <DetailField
              icon={<MenuBookIcon />}
              label="Category / award"
              value={[app.programme?.category, app.programme?.award].filter(Boolean).join(" · ") || "—"}
            />
            <DetailField
              icon={<GradeIcon />}
              label="Programme min. KCSE"
              value={app.programme?.minimum_kcse_grade || "—"}
            />
            <DetailField
              icon={<MenuBookIcon />}
              label="Mode / duration"
              value={
                [app.programme?.mode, app.programme?.duration_years ? `${app.programme.duration_years} yrs` : null]
                  .filter(Boolean)
                  .join(" · ") || "—"
              }
            />
          </Stack>
        </FormSection>

        <FormSection title="Documents">
          <Stack spacing={1.25}>
            {DOC_LABELS.map((doc) => {
              const url = app[doc.key];
              return (
                <Box
                  key={doc.key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: "14px",
                    bgcolor: warmCream,
                    border: "1px solid rgba(0,96,80,0.1)",
                  }}
                >
                  <DescriptionIcon sx={{ color: primaryGreen }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, fontSize: "0.9rem" }}>
                      {doc.label}
                    </Typography>
                    {!url ? (
                      <Typography sx={{ fontSize: "0.8rem", color: textMuted }}>Not uploaded</Typography>
                    ) : null}
                  </Box>
                  {url ? (
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setViewDoc({ label: doc.label, url })}
                      sx={{
                        ...ghostBtnSx,
                        py: 0.65,
                        px: 1.35,
                        fontSize: "0.78rem",
                        flexShrink: 0,
                      }}
                    >
                      View
                    </Button>
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        </FormSection>

        <FormSection title="Status history">
          {history.length === 0 ? (
            <Typography sx={{ color: textMuted, fontFamily: fontBody }}>No status notes yet.</Typography>
          ) : (
            <Stack spacing={0} sx={{ position: "relative", pl: 0.5 }}>
              {history.map((entry, i) => {
                const entryChip = admissionStatusChipSx(entry.status);
                return (
                  <Box
                    key={`${entry.changed_at}-${i}`}
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      pb: i === history.length - 1 ? 0 : 2.25,
                      position: "relative",
                      "&::before":
                        i === history.length - 1
                          ? undefined
                          : {
                              content: '""',
                              position: "absolute",
                              left: 15,
                              top: 32,
                              bottom: 0,
                              width: 2,
                              bgcolor: "rgba(0,96,80,0.15)",
                            },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "10px",
                        bgcolor: navy,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        zIndex: 1,
                      }}
                    >
                      <HistoryIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={formatAdmissionStatus(entry.status)}
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            bgcolor: entryChip.bg,
                            color: entryChip.color,
                            borderRadius: "8px",
                          }}
                        />
                        <Typography sx={{ fontSize: "0.75rem", color: textMuted }}>
                          {formatDateTime(entry.changed_at)}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          fontFamily: fontDisplay,
                          fontWeight: 700,
                          color: textPrimary,
                          mt: 0.75,
                          fontSize: "0.95rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {entry.note || "—"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: textMuted, mt: 0.35 }}>
                        by {entry.changed_by_name || "Admin"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </FormSection>
      </Box>

      <StatusUpdateDialog
        open={statusOpen}
        application={app}
        onClose={() => setStatusOpen(false)}
        onSaved={(updated) => setApp(updated)}
      />

      <DocumentViewDialog open={Boolean(viewDoc)} doc={viewDoc} onClose={() => setViewDoc(null)} />
    </Box>
  );
}
