import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsIcon from "@mui/icons-material/Groups";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import BrandPageLoader from "../Util/BrandPageLoader";
import {
  authJsonHeaders,
  getPortalToken,
  fontBody,
  fontDisplay,
  inputSx,
  primaryGreen,
  primaryDark,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";

const REG_META = {
  registered: { label: "Registered", color: primaryDark, bg: "rgba(0,96,80,0.12)" },
  dropped: { label: "Dropped", color: "#9b1c1c", bg: "rgba(155,28,28,0.1)" },
  not_registered: { label: "Not registered", color: textSecondary, bg: "rgba(30,40,88,0.06)" },
};

function RegChip({ status }) {
  const meta = REG_META[status] || REG_META.not_registered;
  return (
    <Chip
      size="small"
      label={meta.label}
      sx={{
        fontWeight: 700,
        fontSize: "0.68rem",
        bgcolor: meta.bg,
        color: meta.color,
      }}
    />
  );
}

function formatCategory(category) {
  if (!category) return null;
  return String(category).replace(/_/g, " ");
}

export default function DepartmentRegistrations({
  isAdmin,
  departments = [],
  defaultDepartmentId = "",
}) {
  const [departmentId, setDepartmentId] = useState(defaultDepartmentId || "");
  const [programmes, setProgrammes] = useState([]);
  const [department, setDepartment] = useState(null);
  // Staff loads immediately; admin waits until a department is chosen
  const [loading, setLoading] = useState(() => !isAdmin || Boolean(defaultDepartmentId));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved");
  const [expandedProgramme, setExpandedProgramme] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (defaultDepartmentId) setDepartmentId(defaultDepartmentId);
  }, [defaultDepartmentId]);

  useEffect(() => {
    hasLoadedRef.current = false;
  }, [departmentId]);

  const load = useCallback(async () => {
    if (isAdmin && !departmentId) {
      setLoading(false);
      setRefreshing(false);
      setProgrammes([]);
      setDepartment(null);
      return;
    }
    if (!hasLoadedRef.current) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const token = getPortalToken();
      const params = new URLSearchParams();
      if (departmentId) params.set("department_id", departmentId);
      // Always fetch all active units — status filter is client-side for instant UX
      const res = await fetch(`/api/units/department-roster?${params}`, {
        headers: authJsonHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load registrations");
      setProgrammes(Array.isArray(data.data?.programmes) ? data.data.programmes : []);
      setDepartment(data.meta?.department || null);
      setExpandedProgramme(false);
      setExpandedUnit(false);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err.message);
      if (!hasLoadedRef.current) setProgrammes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [departmentId, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programmes
      .map((programme) => {
        let units = programme.units || [];
        if (statusFilter && statusFilter !== "all") {
          units = units.filter((u) => u.status === statusFilter);
        }

        if (!q) {
          return {
            ...programme,
            units,
            unit_count: units.length,
          };
        }

        const programmeHit = programme.name?.toLowerCase().includes(q);
        const students = (programme.students || []).filter(
          (s) =>
            programmeHit ||
            s.full_name?.toLowerCase().includes(q) ||
            s.admission_number?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        );
        const filteredUnits = units
          .map((unit) => {
            const unitHit =
              programmeHit ||
              unit.code?.toLowerCase().includes(q) ||
              unit.name?.toLowerCase().includes(q);
            const unitStudents = (unit.students || []).filter(
              (s) =>
                unitHit ||
                s.full_name?.toLowerCase().includes(q) ||
                s.admission_number?.toLowerCase().includes(q)
            );
            if (!unitHit && !unitStudents.length) return null;
            return { ...unit, students: unitHit ? unit.students : unitStudents };
          })
          .filter(Boolean);

        if (!programmeHit && !students.length && !filteredUnits.length) return null;
        return {
          ...programme,
          students: programmeHit ? programme.students : students,
          units: filteredUnits,
          unit_count: filteredUnits.length,
        };
      })
      .filter(Boolean);
  }, [programmes, search, statusFilter]);

  // Stable overview — full payload (all unit statuses). Unchanged by filter/search.
  const totals = useMemo(() => {
    let students = 0;
    let units = 0;
    let registered = 0;
    let eligible = 0;
    const byStatus = { draft: 0, pending: 0, approved: 0, rejected: 0 };
    for (const p of programmes) {
      students += p.student_count || (p.students || []).length || 0;
      const list = p.units || [];
      units += list.length;
      for (const u of list) {
        eligible += u.eligible_count || 0;
        registered += u.registered_count || 0;
        if (byStatus[u.status] != null) byStatus[u.status] += 1;
      }
    }
    return {
      programmes: programmes.length,
      students,
      units,
      registered,
      eligible,
      byStatus,
    };
  }, [programmes]);

  if (loading) {
    return <BrandPageLoader message="Loading registrations…" />;
  }

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.25}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          {department ? (
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.88rem", color: textSecondary, fontWeight: 600 }}>
              {department.name}
              {department.code ? ` · ${department.code}` : ""}
            </Typography>
          ) : (
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.88rem", color: textSecondary }}>
              {isAdmin
                ? "Select a department to load programmes and enrollment status"
                : "Your department programmes and unit enrollment"}
            </Typography>
          )}
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
          {isAdmin ? (
            <FormControl size="small" sx={{ minWidth: 180, ...inputSx }}>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <MenuItem value="">Select…</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          <FormControl size="small" sx={{ minWidth: 140, ...inputSx }}>
            <InputLabel>Unit status</InputLabel>
            <Select
              label="Unit status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search student or unit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ...inputSx, minWidth: { sm: 200 } }}
          />
        </Stack>
      </Stack>

      {programmes.length ? (
        <Box
          sx={{
            mb: 2,
            borderRadius: "14px",
            border: "1px solid rgba(0,96,80,0.12)",
            bgcolor: "var(--kd-surface)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              overflowX: { xs: "auto", lg: "visible" },
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(0,96,80,0.25)",
                borderRadius: 4,
              },
            }}
          >
            {[
              {
                label: "Programmes",
                value: totals.programmes,
                accent: primaryGreen,
              },
              {
                label: "Students",
                value: totals.students,
                accent: primaryGreen,
              },
              {
                label: "Units",
                value: totals.units,
                accent: primaryGreen,
              },
              {
                label: "Registered",
                value: `${totals.registered}/${totals.eligible}`,
                accent: primaryGreen,
              },
              {
                label: "Approved",
                value: totals.byStatus.approved || 0,
                accent: primaryGreen,
              },
              {
                label: "Pending",
                value: totals.byStatus.pending || 0,
                accent: "#b8860b",
              },
              {
                label: "Draft",
                value: totals.byStatus.draft || 0,
                accent: "#5a6478",
              },
              {
                label: "Rejected",
                value: totals.byStatus.rejected || 0,
                accent: "#9b1c1c",
              },
            ].map((stat, index) => {
              const isFirstStatus = index === 4;
              return (
                <Box
                  key={stat.label}
                  sx={{
                    position: "relative",
                    flex: { xs: "0 0 118px", lg: "1 1 0" },
                    minWidth: 0,
                    px: { xs: 1.25, md: 1.5 },
                    py: 1.35,
                    borderLeft: isFirstStatus
                      ? "1px solid rgba(0,96,80,0.14)"
                      : index > 0
                        ? "1px solid rgba(0,96,80,0.08)"
                        : "none",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      bgcolor: stat.accent,
                      opacity: 0.85,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: fontBody,
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: textMuted,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      mb: 0.35,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: fontDisplay,
                      fontWeight: 700,
                      fontSize: { xs: "1.2rem", md: "1.35rem" },
                      color: stat.accent,
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      {refreshing ? (
        <LinearProgress
          sx={{
            mb: 1.5,
            height: 3,
            borderRadius: 2,
            bgcolor: "rgba(0,96,80,0.08)",
            "& .MuiLinearProgress-bar": { bgcolor: primaryGreen },
          }}
        />
      ) : null}

      {isAdmin && !departmentId ? (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            borderRadius: "16px",
            border: "1px dashed rgba(0,96,80,0.2)",
            bgcolor: warmCream,
          }}
        >
          <GroupsIcon sx={{ fontSize: 36, color: primaryGreen, opacity: 0.5, mb: 1 }} />
          <Typography sx={{ fontFamily: fontBody, color: textSecondary }}>
            Choose a department to load programmes, units, and student registrations.
          </Typography>
        </Box>
      ) : !filtered.length ? (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            borderRadius: "16px",
            border: "1px dashed rgba(0,96,80,0.2)",
            bgcolor: warmCream,
          }}
        >
          <MenuBookIcon sx={{ fontSize: 36, color: primaryGreen, opacity: 0.5, mb: 1 }} />
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary }}>
            No programmes found
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textSecondary, mt: 0.5, fontSize: "0.88rem" }}>
            Link programmes to this department, or adjust the unit status filter.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {filtered.map((programme) => (
            <Accordion
              key={programme.id}
              expanded={expandedProgramme === programme.id}
              onChange={(_, open) => setExpandedProgramme(open ? programme.id : false)}
              disableGutters
              elevation={0}
              sx={{
                borderRadius: "16px !important",
                border: "1px solid rgba(0,96,80,0.12)",
                bgcolor: "var(--kd-surface)",
                overflow: "hidden",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: primaryGreen }} />}
                sx={{
                  px: 2,
                  py: 0.5,
                  bgcolor: expandedProgramme === programme.id ? "rgba(0,96,80,0.04)" : "transparent",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  sx={{ width: "100%", pr: 1 }}
                >
                  <Box>
                    <Typography sx={{ fontFamily: fontBody, fontWeight: 800, color: textPrimary }}>
                      {programme.name}
                    </Typography>
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.75rem", color: textMuted }}>
                      {[formatCategory(programme.category), `${programme.student_count || 0} students`, `${programme.unit_count || 0} units`]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.75}>
                    <Chip
                      size="small"
                      icon={<PersonIcon sx={{ fontSize: "14px !important" }} />}
                      label={`${programme.student_count || 0}`}
                      sx={{ fontWeight: 700, bgcolor: "rgba(0,96,80,0.08)", color: primaryGreen }}
                    />
                    <Chip
                      size="small"
                      icon={<MenuBookIcon sx={{ fontSize: "14px !important" }} />}
                      label={`${programme.unit_count || 0}`}
                      sx={{ fontWeight: 700, bgcolor: "rgba(200,168,64,0.14)", color: primaryDark }}
                    />
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                {(programme.students || []).length ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      sx={{
                        fontFamily: fontBody,
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: textMuted,
                        mb: 1,
                      }}
                    >
                      Students in programme
                    </Typography>
                    <TableContainer
                      sx={{
                        borderRadius: "12px",
                        border: "1px solid rgba(0,96,80,0.08)",
                        maxHeight: 220,
                      }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {["Name", "Admission", "Year / Sem"].map((h) => (
                              <TableCell
                                key={h}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                  color: textMuted,
                                  textTransform: "uppercase",
                                  bgcolor: warmCream,
                                }}
                              >
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {programme.students.map((student) => (
                            <TableRow key={student.id} hover>
                              <TableCell sx={{ fontWeight: 700, color: textPrimary, fontSize: "0.84rem" }}>
                                {student.full_name}
                              </TableCell>
                              <TableCell sx={{ color: textSecondary, fontSize: "0.8rem" }}>
                                {student.admission_number || "—"}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: primaryGreen, fontSize: "0.8rem" }}>
                                Y{student.year_of_study} · Sem {student.semester}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.84rem", mb: 2 }}>
                    No active students enrolled in this programme yet.
                  </Typography>
                )}

                <Typography
                  sx={{
                    fontFamily: fontBody,
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: textMuted,
                    mb: 1,
                  }}
                >
                  Units & registration status
                </Typography>

                {(programme.units || []).length ? (
                  <Stack spacing={1}>
                    {programme.units.map((unit) => (
                      <Accordion
                        key={unit.id}
                        expanded={expandedUnit === unit.id}
                        onChange={(_, open) => setExpandedUnit(open ? unit.id : false)}
                        disableGutters
                        elevation={0}
                        sx={{
                          borderRadius: "12px !important",
                          border: "1px solid rgba(0,96,80,0.1)",
                          bgcolor: "rgba(0,96,80,0.02)",
                          "&:before": { display: "none" },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon sx={{ color: primaryGreen, fontSize: 20 }} />}
                          sx={{ px: 1.5, minHeight: 48 }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={0.75}
                            alignItems={{ sm: "center" }}
                            justifyContent="space-between"
                            sx={{ width: "100%", pr: 1 }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontFamily: fontBody,
                                  fontWeight: 800,
                                  fontSize: "0.78rem",
                                  color: primaryGreen,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {unit.code}
                              </Typography>
                              <Typography
                                sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.88rem", color: textPrimary }}
                              >
                                {unit.name}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                              <Chip
                                size="small"
                                label={`Y${unit.year_of_study} · Sem ${unit.semester}`}
                                sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                              />
                              <Chip
                                size="small"
                                label={`${unit.registered_count || 0}/${unit.eligible_count || 0} registered`}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                  bgcolor: "rgba(0,96,80,0.1)",
                                  color: primaryGreen,
                                }}
                              />
                              <Chip
                                size="small"
                                label={unit.status}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                  textTransform: "capitalize",
                                }}
                              />
                            </Stack>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
                          {(unit.students || []).length ? (
                            <TableContainer
                              sx={{
                                borderRadius: "10px",
                                border: "1px solid rgba(0,96,80,0.08)",
                                bgcolor: "#fff",
                              }}
                            >
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    {["Student", "Admission", "Cohort", "Status"].map((h) => (
                                      <TableCell
                                        key={h}
                                        sx={{
                                          fontWeight: 700,
                                          fontSize: "0.66rem",
                                          color: textMuted,
                                          textTransform: "uppercase",
                                          bgcolor: warmCream,
                                        }}
                                      >
                                        {h}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {unit.students.map((student) => (
                                    <TableRow key={`${unit.id}-${student.id}`} hover>
                                      <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", color: textPrimary }}>
                                        {student.full_name}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: "0.78rem", color: textSecondary }}>
                                        {student.admission_number || "—"}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: "0.78rem", fontWeight: 700, color: primaryGreen }}>
                                        Y{student.year_of_study} · Sem {student.semester}
                                      </TableCell>
                                      <TableCell>
                                        <RegChip status={student.registration_status} />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.82rem", py: 1 }}>
                              No students in Year {unit.year_of_study}, Semester {unit.semester} for this programme.
                            </Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.84rem" }}>
                    No units listed for this programme in the department yet.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Box>
  );
}
