/**
 * Admin portal auth — separate session per browser tab.
 * Admin and staff use different sessionStorage keys so two accounts can stay
 * signed in on the same browser (different tabs) without clashing.
 */

const PORTAL_ROLE_KEY = "kendu_portal_role";
const LEGACY_KEYS = ["token", "user", "userRole"];

function isPortalRole(role) {
  return role === "admin" || role === "staff";
}

function roleKey(role, suffix) {
  return `kendu_${role}_${suffix}`;
}

function clearLegacyStorage() {
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
}

function ensureMigrated() {
  const role = sessionStorage.getItem(PORTAL_ROLE_KEY);
  if (role && isPortalRole(role) && sessionStorage.getItem(roleKey(role, "token"))) {
    return true;
  }

  const legacyToken = localStorage.getItem("token");
  const legacyUser = localStorage.getItem("user");
  if (!legacyToken || !legacyUser) return false;

  try {
    const user = JSON.parse(legacyUser);
    if (isPortalRole(user.role)) {
      savePortalSession(user, legacyToken);
      clearLegacyStorage();
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function savePortalSession(user, token) {
  if (!user?.role || !isPortalRole(user.role)) {
    throw new Error("Invalid admin portal role");
  }
  const role = user.role;
  sessionStorage.setItem(PORTAL_ROLE_KEY, role);
  sessionStorage.setItem(roleKey(role, "token"), token);
  sessionStorage.setItem(roleKey(role, "user"), JSON.stringify(user));
  clearLegacyStorage();
}

export function getActivePortalRole() {
  ensureMigrated();
  return sessionStorage.getItem(PORTAL_ROLE_KEY);
}

export function getPortalToken() {
  ensureMigrated();
  const role = getActivePortalRole();
  if (!role || !isPortalRole(role)) return null;
  return sessionStorage.getItem(roleKey(role, "token"));
}

export function getPortalUser() {
  ensureMigrated();
  const role = getActivePortalRole();
  if (!role || !isPortalRole(role)) return null;
  try {
    const raw = sessionStorage.getItem(roleKey(role, "user"));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readStoredPortalSession() {
  ensureMigrated();
  const token = getPortalToken();
  const user = getPortalUser();
  if (token && user) return { token, user };
  return null;
}

export function updatePortalUser(user) {
  if (!user) return;
  const role = getActivePortalRole() || user.role;
  if (!role || !isPortalRole(role)) return;
  sessionStorage.setItem(roleKey(role, "user"), JSON.stringify(user));
}

export function clearPortalSession() {
  const role = getActivePortalRole();
  if (role && isPortalRole(role)) {
    sessionStorage.removeItem(roleKey(role, "token"));
    sessionStorage.removeItem(roleKey(role, "user"));
  }
  sessionStorage.removeItem(PORTAL_ROLE_KEY);
  clearLegacyStorage();
}
