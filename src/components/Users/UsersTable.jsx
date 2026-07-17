import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  InputAdornment,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as ViewIcon,
  ToggleOn as ToggleOnIcon,
  Badge as BadgeIcon,
  Groups as GroupsIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  ALL_ROLES,
  ROLE_TABS,
  authJsonHeaders,
  formatRole,
  getActorFromStorage,
  assignableRoles,
  profileImageSrc,
  primaryGreen,
  primaryDark,
  warmCream,
  textPrimary,
  textSecondary,
  textMuted,
  inputSx,
  primaryBtnSx,
  ghostBtnSx,
  pageShellSx,
} from "./usersShared";
import {
  UsersHero,
  RoleTabs,
  PremiumDialog,
  DetailField,
  UserAvatar,
  HeroActionButton,
  RoleBadge,
} from "./usersUi";

const emptyForm = () => ({
  email: "",
  password: "",
  full_name: "",
  phone: "",
  admission_number: "",
  role: "staff",
  position: "",
  is_public: false,
  profileFile: null,
  profilePreview: "",
  removeProfileImage: false,
});

export default function UsersTable() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const actor = getActorFromStorage();
  const editableRoles = assignableRoles(actor?.role);
  const canEditRole = editableRoles.length > 0;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    const role = ROLE_TABS[activeTab]?.value;
    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage),
    });
    if (role) params.set("role", role);

    try {
      const response = await fetch(`/api/users?${params.toString()}`, {
        method: "GET",
        headers: authJsonHeaders(token),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError(
          response.status === 404
            ? "API endpoint not found. Is the server running?"
            : "Invalid response from server."
        );
        setUsers([]);
        setTotalUsers(0);
        return;
      }

      if (!response.ok) {
        setError(data.message || `Request failed (${response.status})`);
        setUsers([]);
        setTotalUsers(0);
        return;
      }

      if (data.success) {
        setUsers(Array.isArray(data.data) ? data.data : []);
        setTotalUsers(data.pagination?.total ?? 0);
      } else {
        setError(data.message || "Failed to load users.");
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (e) {
      setError(e.message || "Network error.");
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const mapUserToForm = (u) => ({
    email: u.email ?? "",
    password: "",
    full_name: u.full_name ?? "",
    phone: u.phone ?? "",
    admission_number: u.admission_number ?? "",
    role: u.role ?? "staff",
    position: u.position ?? "",
    is_public: Boolean(u.is_public),
    profileFile: null,
    profilePreview: profileImageSrc(u),
    removeProfileImage: false,
  });

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setForm(mapUserToForm(user));
    setOpenEdit(true);
  };

  const handleViewOpen = (user) => {
    setSelectedUser(user);
    setOpenView(true);
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Delete user?",
      text: `Remove "${user.full_name}"? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryGreen,
      cancelButtonColor: "#78716C",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
        headers: authJsonHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }
      await fetchUsers();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "User removed successfully.",
        confirmButtonColor: primaryGreen,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message, confirmButtonColor: primaryGreen });
    }
  };

  const handleToggleActive = async (user) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/users/${user.id}/toggle-status`, {
        method: "PUT",
        headers: authJsonHeaders(token),
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not update status");
      }
      await fetchUsers();
      Swal.fire({
        icon: "success",
        title: user.is_active !== false ? "User deactivated" : "User activated",
        timer: 1400,
        showConfirmButton: false,
        confirmButtonColor: primaryGreen,
      });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message, confirmButtonColor: primaryGreen });
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    if (form.role === "student" && !String(form.admission_number || "").trim()) {
      Swal.fire({
        icon: "warning",
        title: "Admission number required",
        text: "Students must have an admission number.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("email", form.email.trim());
      body.append("full_name", form.full_name.trim());
      body.append("phone", form.phone?.trim() || "");
      body.append(
        "admission_number",
        form.role === "student" ? form.admission_number?.trim() || "" : ""
      );
      body.append("role", form.role);
      body.append(
        "is_public",
        form.role !== "student" && form.is_public ? "true" : "false"
      );
      if (form.role !== "student") {
        body.append("position", form.position?.trim() || "");
      } else {
        body.append("position", "");
      }
      if (form.profileFile) {
        body.append("profile_image", form.profileFile);
      } else if (form.removeProfileImage) {
        body.append("remove_profile_image", "true");
      }

      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Update failed");
      }
      setOpenEdit(false);
      setSelectedUser(null);
      await fetchUsers();

      try {
        const meRaw = localStorage.getItem("user");
        const me = meRaw ? JSON.parse(meRaw) : null;
        if (me?.id && data.data?.id && me.id === data.data.id) {
          localStorage.setItem("user", JSON.stringify(data.data));
          window.dispatchEvent(new CustomEvent("kendu:user-updated", { detail: data.data }));
        }
      } catch {
        // ignore
      }

      Swal.fire({
        icon: "success",
        title: "User updated",
        text: "Changes saved successfully.",
        confirmButtonColor: primaryGreen,
      });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message, confirmButtonColor: primaryGreen });
    } finally {
      setSaving(false);
    }
  };

  const closeDialogs = () => {
    setOpenView(false);
    setOpenEdit(false);
    setSelectedUser(null);
    setForm(emptyForm());
  };

  const showAdmissionColumn = ROLE_TABS[activeTab]?.value === "student";

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="User management"
        subtitle="Create and manage admin, staff, and student accounts"
        icon={<GroupsIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <HeroActionButton variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/users/create")}>
            Create user
          </HeroActionButton>
        }
      />

      <RoleTabs activeTab={activeTab} onChange={handleTabChange} tabs={ROLE_TABS} />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid rgba(0,96,80,0.1)",
          bgcolor: "#fff",
          boxShadow: "0 16px 40px -16px rgba(20,26,58,0.1)",
        }}
      >
        <TableContainer>
          <Table size="medium" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: warmCream,
                  "& .MuiTableCell-head": {
                    color: textSecondary,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderBottom: `1px solid rgba(0,96,80,0.1)`,
                    py: 1.75,
                  },
                }}
              >
                <TableCell width={56}>#</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                {showAdmissionColumn ? <TableCell>Admission no.</TableCell> : null}
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showAdmissionColumn ? 6 : 5} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: primaryGreen }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showAdmissionColumn ? 6 : 5} align="center" sx={{ py: 8 }}>
                    <Typography sx={{ color: textSecondary, fontWeight: 600 }}>No users in this tab.</Typography>
                    <Button
                      variant="text"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/users/create")}
                      sx={{ mt: 1, color: primaryGreen, fontWeight: 700, textTransform: "none" }}
                    >
                      Create first user
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((row, idx) => {
                  const active = row.is_active !== false;
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        transition: "background 0.15s ease",
                        "&:hover": { bgcolor: "rgba(0,96,80,0.04)" },
                        "& td": { borderColor: "rgba(0,96,80,0.06)" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: textMuted, fontSize: "0.85rem" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <UserAvatar name={row.full_name} role={row.role} src={row} size={42} />
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: textPrimary, lineHeight: 1.25 }}>
                              {row.full_name || "—"}
                            </Typography>
                            <Typography sx={{ fontSize: "0.78rem", color: textSecondary }}>{row.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={row.role} />
                      </TableCell>
                      {showAdmissionColumn ? (
                        <TableCell>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: textSecondary }}>
                            {row.admission_number || "—"}
                          </Typography>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <Chip
                          label={active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            bgcolor: active ? "rgba(0,96,80,0.1)" : "rgba(30,40,88,0.06)",
                            color: active ? primaryDark : textSecondary,
                            border: `1px solid ${active ? "rgba(0,96,80,0.2)" : "rgba(30,40,88,0.1)"}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                          {[
                            {
                              title: "View",
                              icon: <ViewIcon fontSize="small" />,
                              onClick: () => handleViewOpen(row),
                              color: textSecondary,
                            },
                            {
                              title: "Edit",
                              icon: <EditIcon fontSize="small" />,
                              onClick: () => handleEditOpen(row),
                              color: primaryGreen,
                            },
                            {
                              title: active ? "Deactivate" : "Activate",
                              icon: <ToggleOnIcon fontSize="small" />,
                              onClick: () => handleToggleActive(row),
                              color: "#c8a840",
                            },
                            {
                              title: "Delete",
                              icon: <DeleteIcon fontSize="small" />,
                              onClick: () => handleDelete(row),
                              color: primaryDark,
                            },
                          ].map((action) => (
                            <Tooltip key={action.title} title={action.title}>
                              <IconButton
                                size="small"
                                onClick={action.onClick}
                                sx={{
                                  color: action.color,
                                  bgcolor: "transparent",
                                  "&:hover": { bgcolor: warmCream },
                                }}
                              >
                                {action.icon}
                              </IconButton>
                            </Tooltip>
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: `1px solid rgba(0,96,80,0.1)`,
            "& .MuiTablePagination-toolbar": {
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 600,
            },
          }}
        />
      </Box>

      <PremiumDialog
        open={openView}
        onClose={closeDialogs}
        title={selectedUser?.full_name || "User details"}
        subtitle="Account overview"
        icon={<PersonIcon />}
        footer={
          <Button onClick={closeDialogs} sx={ghostBtnSx}>
            Close
          </Button>
        }
      >
        {selectedUser && (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <UserAvatar name={selectedUser.full_name} role={selectedUser.role} src={selectedUser} size={72} />
              <Box>
                <RoleBadge role={selectedUser.role} />
                <Typography sx={{ fontSize: "0.8rem", color: textSecondary, mt: 0.75 }}>
                  {selectedUser.is_active !== false ? "Active account" : "Inactive account"}
                </Typography>
              </Box>
            </Stack>
            <DetailField icon={<PersonIcon fontSize="small" />} label="Full name" value={selectedUser.full_name} />
            <DetailField icon={<EmailIcon fontSize="small" />} label="Email" value={selectedUser.email} />
            <DetailField icon={<PhoneIcon fontSize="small" />} label="Phone" value={selectedUser.phone} />
            {selectedUser.role === "student" ? (
              <DetailField
                icon={<BadgeIcon fontSize="small" />}
                label="Admission number"
                value={selectedUser.admission_number}
              />
            ) : (
              <>
                <DetailField
                  icon={<BadgeIcon fontSize="small" />}
                  label="Position"
                  value={selectedUser.position || "—"}
                />
                <DetailField
                  icon={<PublicIcon fontSize="small" />}
                  label="Public directory"
                  value={selectedUser.is_public ? "Visible on Meet our staff" : "Hidden from public site"}
                />
              </>
            )}
            <Box sx={{ p: 1.75, borderRadius: "14px", bgcolor: warmCream, border: `1px solid rgba(0,96,80,0.1)` }}>
              <Typography sx={{ fontSize: "0.75rem", color: textSecondary }}>
                Last login:{" "}
                <Box component="span" sx={{ fontWeight: 700, color: textPrimary }}>
                  {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "Never"}
                </Box>
              </Typography>
            </Box>
          </Stack>
        )}
      </PremiumDialog>

      <PremiumDialog
        open={openEdit}
        onClose={closeDialogs}
        title="Edit user"
        subtitle="Update account details and role"
        icon={<EditIcon />}
        footer={
          <>
            <Button onClick={closeDialogs} sx={ghostBtnSx}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={primaryBtnSx}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <UserAvatar
              name={form.full_name || selectedUser?.full_name}
              role={form.role}
              src={form.removeProfileImage ? "" : form.profilePreview || selectedUser}
              size={72}
            />
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  component="label"
                  variant="outlined"
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "12px",
                    borderColor: "rgba(0,96,80,0.3)",
                    color: primaryGreen,
                    "&:hover": { borderColor: primaryGreen, bgcolor: "rgba(0,96,80,0.06)" },
                  }}
                >
                  {form.profilePreview && !form.removeProfileImage ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setForm((prev) => ({
                        ...prev,
                        profileFile: file,
                        profilePreview: URL.createObjectURL(file),
                        removeProfileImage: false,
                      }));
                      e.target.value = "";
                    }}
                  />
                </Button>
                {(form.profilePreview || selectedUser?.profile_image || selectedUser?.profile_image_url) &&
                !form.removeProfileImage ? (
                  <Button
                    type="button"
                    variant="text"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        profileFile: null,
                        profilePreview: "",
                        removeProfileImage: true,
                      }))
                    }
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      textTransform: "none",
                      fontWeight: 600,
                      color: textSecondary,
                      "&:hover": { color: "#b42318", bgcolor: "rgba(180,35,24,0.06)" },
                    }}
                  >
                    Remove photo
                  </Button>
                ) : null}
              </Stack>
              <Typography sx={{ fontSize: "0.75rem", color: textSecondary, mt: 0.75 }}>
                JPEG, PNG, or WebP · max 5MB
              </Typography>
            </Box>
          </Box>
          <TextField
            label="Email address"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={inputSx}
          />
          <TextField
            label="Full name"
            fullWidth
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={inputSx}
          />
          <TextField
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={inputSx}
          />
          {form.role === "student" ? (
            <TextField
              label="Admission number"
              fullWidth
              required
              value={form.admission_number}
              onChange={(e) => setForm({ ...form, admission_number: e.target.value })}
              helperText="Required for students"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          ) : (
            <TextField
              label="Position / title"
              fullWidth
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              helperText="e.g. Principal, Clinical Instructor"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: primaryGreen, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          )}
          <FormControl fullWidth sx={inputSx} disabled={!canEditRole}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => {
                const role = e.target.value;
                setForm({
                  ...form,
                  role,
                  admission_number: role === "student" ? form.admission_number : "",
                  position: role === "student" ? "" : form.position,
                  is_public: role === "student" ? false : form.is_public,
                });
              }}
            >
              {(canEditRole ? editableRoles : ALL_ROLES).map((r) => (
                <MenuItem key={r} value={r}>
                  {formatRole(r)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!canEditRole ? (
            <Typography sx={{ fontSize: "0.78rem", color: textSecondary }}>
              Your account cannot change user roles.
            </Typography>
          ) : null}
          {form.role !== "student" ? (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.is_public)}
                  onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: primaryGreen },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: primaryGreen,
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontWeight: 600, color: textPrimary, fontSize: "0.9rem" }}>
                    Show on public site
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: textSecondary }}>
                    Visible on Meet our staff when enabled
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", ml: 0 }}
            />
          ) : null}
          <Typography sx={{ fontSize: "0.78rem", color: textSecondary }}>
            Password changes are managed in Settings.
          </Typography>
        </Stack>
      </PremiumDialog>
    </Box>
  );
}
