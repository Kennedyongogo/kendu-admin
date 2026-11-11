/** Admin-portal pages each office may open. Mirrors the requirements capture. */
const leadershipPaths = [
  "/dashboard",
  "/students",
  "/admissions",
  "/accounting",
  "/timetable",
  "/exam-timetables",
  "/library",
  "/church",
  "/announcements",
  "/brochures",
  "/assignments",
  "/programmes",
  "/departments",
  "/units",
  "/staff-chat",
  "/staff-commons",
  "/settings",
];

export const ROLE_HOME = {
  admin: "/dashboard",
  principal: "/dashboard",
  deputy_principal: "/dashboard",
  hod: "/dashboard",
  academic_registrar: "/dashboard",
  examinations: "/dashboard",
  library: "/dashboard",
  lecturer: "/dashboard",
  secretary: "/dashboard",
  dean: "/dashboard",
  finance: "/dashboard",
  catering: "/dashboard",
};

/** Non-admin roles only see these entries in the sidebar. */
const NAV_ONLY_PATHS = [
  "/dashboard",
  "/announcements",
  "/brochures",
  "/timetable",
  "/exam-timetables",
  "/staff-chat",
  "/settings",
];

const TIMETABLE_MANAGE_ROLES = new Set([
  "admin",
  "dean",
  "lecturer",
  "examinations",
  "academic_registrar",
  "hod",
]);

/** Extra sidebar links for specific offices (on top of Dashboard / News & Events / Chat / Settings). */
const NAV_EXTRA_BY_ROLE = {
  library: ["/library"],
  catering: ["/meals"],
  finance: ["/accounting", "/access"],
  principal: ["/programmes", "/departments", "/units", "/admissions"],
  deputy_principal: ["/programmes", "/departments", "/units", "/admissions"],
  hod: ["/programmes", "/departments", "/units"],
  lecturer: ["/programmes", "/departments", "/units"],
  secretary: ["/programmes", "/departments", "/units"],
  academic_registrar: [
    "/programmes",
    "/departments",
    "/students",
    "/cohort-transfer",
    "/units",
    "/admissions",
  ],
  examinations: ["/units"],
  dean: ["/programmes", "/departments", "/units"],
};

const ROLE_PATHS = {
  principal: leadershipPaths,
  deputy_principal: leadershipPaths,
  hod: [
    "/dashboard",
    "/students",
    "/accounting",
    "/timetable",
    "/exam-timetables",
    "/library",
    "/church",
    "/announcements",
    "/programmes",
    "/registrations",
    "/units",
    "/departments",
    "/assignments",
    "/cohort-transfer",
    "/staff-chat",
    "/staff-commons",
    "/settings",
  ],
  academic_registrar: [
    "/dashboard",
    "/students",
    "/admissions",
    "/accounting",
    "/timetable",
    "/exam-timetables",
    "/programmes",
    "/departments",
    "/units",
    "/cohort-transfer",
    "/announcements",
    "/staff-chat",
    "/staff-commons",
    "/settings",
  ],
  examinations: [
    "/dashboard",
    "/students",
    "/accounting",
    "/timetable",
    "/exam-timetables",
    "/assignments",
    "/programmes",
    "/units",
    "/cohort-transfer",
    "/announcements",
    "/staff-chat",
    "/staff-commons",
    "/settings",
  ],
  library: [
    "/dashboard",
    "/students",
    "/library",
    "/announcements",
    "/staff-chat",
    "/staff-commons",
    "/settings",
  ],
  lecturer: [
    "/dashboard",
    "/students",
    "/timetable",
    "/library",
    "/units",
    "/assignments",
    "/programmes",
    "/departments",
    "/staff-chat",
    "/staff-commons",
    "/announcements",
    "/settings",
  ],
  secretary: [
    "/dashboard",
    "/students",
    "/registrations",
    "/programmes",
    "/departments",
    "/units",
    "/cohort-transfer",
    "/announcements",
    "/staff-chat",
    "/staff-commons",
    "/settings",
  ],
  dean: [
    "/dashboard",
    "/students",
    "/meals",
    "/church",
    "/programmes",
    "/departments",
    "/units",
    "/announcements",
    "/staff-chat",
    "/staff-commons",
    "/settings",
  ],
  finance: [
    "/dashboard",
    "/accounting",
    "/access",
    "/announcements",
    "/staff-chat",
    "/staff-commons",
    "/settings",
  ],
  catering: [
    "/dashboard",
    "/meals",
    "/announcements",
    "/staff-chat",
    "/staff-commons",
    "/settings",
  ],
};

/** Paths outside the menu that a role still needs, such as creating a student. */
const EXTRA_PREFIXES = {
  secretary: ["/users/create"],
  hod: ["/users/create"],
  academic_registrar: ["/users/create"],
  finance: ["/accounting/record-payment"],
};

/** Admin and academic registrar may create/edit programmes and departments. */
export function canManageProgrammesAndDepartments(role) {
  return role === "admin" || role === "academic_registrar";
}

/** Admin, secretary, and academic registrar may create/edit/delete students. */
export function canManageStudents(role) {
  return role === "admin" || role === "secretary" || role === "academic_registrar";
}

/** Roles that may create/edit/submit units (principal/deputy/secretary are view-only). */
export function canManageUnits(role) {
  return (
    role === "admin" ||
    role === "hod" ||
    role === "lecturer" ||
    role === "academic_registrar" ||
    role === "examinations" ||
    role === "dean"
  );
}

/** Admin and secretary may create/edit/delete news & events. */
export function canManageAnnouncements(role) {
  return role === "admin" || role === "secretary";
}

/** Admin and academic registrar may update/delete admissions; principal/deputy are view-only. */
export function canManageAdmissions(role) {
  return role === "admin" || role === "academic_registrar";
}

/** Admin and secretary may upload/edit/delete brochures; other roles are view-only. */
export function canManageBrochures(role) {
  return role === "admin" || role === "secretary";
}

/** Admin, dean, lecturer, examinations, academic registrar, and HOD may manage timetables. */
export function canManageTimetables(role) {
  return TIMETABLE_MANAGE_ROLES.has(role);
}

/** All portal roles except catering may view class and exam timetables. */
export function canViewTimetables(role) {
  if (!role || role === "catering") return false;
  return role === "admin" || Boolean(ROLE_HOME[role]);
}

function isTimetablePath(pathname) {
  const path = pathname || "/";
  return (
    path === "/timetable" ||
    path.startsWith("/timetable/") ||
    path === "/exam-timetables" ||
    path.startsWith("/exam-timetables/")
  );
}

function isTimetableWritePath(pathname) {
  const path = pathname || "/";
  if (path === "/timetable/create" || path.startsWith("/timetable/create/")) return true;
  if (/^\/timetable\/[^/]+\/edit\/?$/.test(path)) return true;
  if (path === "/exam-timetables/create" || path.startsWith("/exam-timetables/create/")) return true;
  return false;
}

function isProgrammeWritePath(pathname) {
  const path = pathname || "/";
  if (!path.startsWith("/programmes")) return false;
  if (path === "/programmes/create" || path.startsWith("/programmes/create/")) return true;
  if (path.includes("/create")) return true;
  if (/\/edit\/?$/.test(path) || path.includes("/edit/")) return true;
  return false;
}

export function homeForRole(role) {
  return ROLE_HOME[role] || "/dashboard";
}

export function canOpenPath(role, pathname) {
  if (!role || role === "admin") return true;
  const path = pathname || "/";
  if (isProgrammeWritePath(path) && !canManageProgrammesAndDepartments(role)) {
    return false;
  }
  if (isTimetablePath(path)) {
    if (isTimetableWritePath(path) && !canManageTimetables(role)) return false;
    return canViewTimetables(role);
  }
  // All portal offices may open brochures (write is gated separately).
  if ((path === "/brochures" || path.startsWith("/brochures/")) && ROLE_PATHS[role]) {
    return true;
  }
  const allowed = ROLE_PATHS[role] || [];
  const extras = EXTRA_PREFIXES[role] || [];
  return [...allowed, ...extras].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** Sidebar visibility: admin sees everything; other roles get base nav plus role extras. */
export function canShowNavPath(role, pathname) {
  if (!role || role === "admin") return true;
  const path = pathname || "/";
  if (path === "/staff-commons" || path.startsWith("/staff-commons/")) {
    return true;
  }
  if (isTimetablePath(path)) {
    return canViewTimetables(role);
  }
  const allowed = [...NAV_ONLY_PATHS, ...(NAV_EXTRA_BY_ROLE[role] || [])];
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
