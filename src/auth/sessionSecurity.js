/**
 * Admin portal session security:
 * - Force logout on API 401 / expired token
 * - Idle timeout (no activity) → clear session and return to login
 */
import { clearPortalSession, getPortalToken } from "./portalAuth";

const IDLE_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS) || 35 * 60 * 1000; // 35 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

let idleTimer = null;
let installed = false;
let loggingOut = false;

function redirectToLogin() {
  const path = window.location.pathname || "/";
  if (path === "/" || path.startsWith("/login")) return;
  window.location.assign("/");
}

export function forcePortalLogout(reason = "session_ended") {
  if (loggingOut) return;
  loggingOut = true;
  try {
    clearPortalSession();
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem("kendu_logout_reason", reason);
  } catch {
    /* ignore */
  }
  redirectToLogin();
}

function resetIdleTimer() {
  if (!getPortalToken()) return;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => forcePortalLogout("idle_timeout"), IDLE_MS);
}

function shouldInspectResponse(url, headers) {
  if (!url) return false;
  const href = String(url);
  if (!href.includes("/api/")) return false;
  try {
    const auth =
      (headers && typeof headers.get === "function" && headers.get("Authorization")) ||
      (headers && headers.Authorization) ||
      "";
    return String(auth).toLowerCase().startsWith("bearer ");
  } catch {
    return Boolean(getPortalToken());
  }
}

function installFetchGuard() {
  if (typeof window === "undefined" || window.__kenduAdminFetchPatched) return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const response = await originalFetch(input, init);
    try {
      const url = typeof input === "string" ? input : input?.url;
      const headers = init.headers || (input && input.headers);
      if (shouldInspectResponse(url, headers) && response.status === 401) {
        forcePortalLogout("token_expired");
      }
    } catch {
      /* ignore */
    }
    return response;
  };
  window.__kenduAdminFetchPatched = true;
}

export function initAdminSessionSecurity() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  installFetchGuard();

  ACTIVITY_EVENTS.forEach((evt) => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resetIdleTimer();
  });

  if (getPortalToken()) resetIdleTimer();

  // Re-arm idle timer after login in same tab without full reload.
  window.addEventListener("storage", () => {
    /* sessionStorage is per-tab; no-op */
  });
}

export function armAdminIdleTimer() {
  resetIdleTimer();
}
