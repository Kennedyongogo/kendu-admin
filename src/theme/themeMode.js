const STORAGE_KEY = "kendu-admin-theme-mode";

export function getStoredThemeMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyThemeMode(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* storage unavailable — mode still applies for this session */
  }
}

export function initThemeMode() {
  applyThemeMode(getStoredThemeMode());
}
