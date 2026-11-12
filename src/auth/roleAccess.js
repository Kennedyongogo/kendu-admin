/** Admin-portal pages each office may open. Mirrors the LMS requirements capture. */
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
  "/cohort-transfer",
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

/** Class timetable write: admin, dean, HOD only (lecturer/exams/AR view-only). */
const CLASS_TIMETABLE_MANAGE_ROLES = new Set(["admin", "dean", "hod"]);

/** Exam timetable write / approve UI: admin + examinations. */
const EXAM_TIMETABLE_MANAGE_ROLES = new Set(["admin", "examinations"]);

/** Extra sidebar links for specific offices (on top of Dashboard / News & Events / Chat / Settings). */
const NAV_EXTRA_BY_ROLE = {
  library: ["/library"],
  catering: ["/meals"],
  finance: ["/accounting", "/access"],
  principal: [
    "/programmes",
    "/departments",
    "/units",
    "/admissions",
    "/assignments",
    "/church",
    "/students",
    "/accounting",
    "/library",
    "/cohort-transfer",
  ],
  deputy_principal: [
    "/programmes",
    "/departments",
    "/units",
    "/admissions",
    "/assignments",
    "/church",
    "/students",
    "/accounting",
    "/library",
    "/cohort-transfer",
  ],
  hod: [
    "/programmes",
    "/departments",
    "/units",
    "/assignments",
    "/church",
    "/registrations",
    "/students",
    "/accounting",
    "/library",
  ],
  lecturer: ["/assignments", "/programmes", "/departments", "/students", "/library"],
  secretary: ["/students", "/admissions", "/registrations", "/programmes", "/departments", "/units", "/cohort-transfer"],
  academic_registrar: [
    "/programmes",
    "/departments",
    "/students",
    "/units",
    "/admissions",
    "/accounting",
    "/cohort-transfer",
  ],
  examinations: ["/students", "/accounting", "/units", "/assignments", "/cohort-transfer", "/programmes"],
  dean: ["/students", "/meals", "/church", "/programmes", "/departments", "/units"],
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
  /** Academic registrar: capture sheet = read-only on listed modules. */
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
    "/exam-timetables",
    "/library",
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
    "/admissions",
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
  finance: ["/accounting/record-payment"],
};

/** Admin only — academic registrar is read-only per capture sheet. */
export function canManageProgrammesAndDepartments(role) {
  return role === "admin";
}

/** Admin and secretary may create/edit/delete students. */
export function canManageStudents(role) {
  return role === "admin" || role === "secretary";
}

/** Admin and HOD maintain the units catalogue (lecturer is view-only). */
export function canManageUnits(role) {
  return role === "admin" || role === "hod";
}

/** Admin and secretary may create/edit/delete news & events. */
export function canManageAnnouncements(role) {
  return role === "admin" || role === "secretary";
}

/** Admin and secretary may update admissions; leadership/AR view-only. */
export function canManageAdmissions(role) {
  return role === "admin" || role === "secretary";
}

/** Admin and secretary may upload/edit/delete brochures; other roles are view-only. */
export function canManageBrochures(role) {
  return role === "admin" || role === "secretary";
}

/** Admin and lecturer may create/edit/delete assignments (and upload documents). */
export function canManageAssignments(role) {
  return role === "admin" || role === "lecturer";
}

/** Leadership, HOD, examinations, lecturer, and admin may view assignments. */
export function canViewAssignments(role) {
  return (
    role === "admin" ||
    role === "principal" ||
    role === "deputy_principal" ||
    role === "hod" ||
    role === "examinations" ||
    role === "lecturer"
  );
}

/** Admin and dean may create/edit church services, seating, and attendance. */
export function canManageChurch(role) {
  return role === "admin" || role === "dean";
}

/** Admin, dean, school leadership, and HOD may view church services and bookings. */
export function canViewChurch(role) {
  return (
    role === "admin" ||
    role === "dean" ||
    role === "principal" ||
    role === "deputy_principal" ||
    role === "hod"
  );
}

/** Class timetable write (not exam periods). */
export function canManageTimetables(role) {
  return CLASS_TIMETABLE_MANAGE_ROLES.has(role);
}

/** Exam timetable create/edit/approve. */
export function canManageExamTimetables(role) {
  return EXAM_TIMETABLE_MANAGE_ROLES.has(role);
}

/** Transcripts: examinations + admin write; secretary and others with exam read may view. */
export function canManageTranscripts(role) {
  return role === "admin" || role === "examinations";
}

export function canViewTranscripts(role) {
  return (
    role === "admin" ||
    role === "examinations" ||
    role === "principal" ||
    role === "deputy_principal" ||
    role === "hod" ||
    role === "academic_registrar" ||
    role === "secretary"
  );
}

/** Library catalogue/loans write: admin + library office. Leadership is summary/view only. */
export function canManageLibrary(role) {
  return role === "admin" || role === "library";
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

function isClassTimetableWritePath(pathname) {
  const path = pathname || "/";
  if (path === "/timetable/create" || path.startsWith("/timetable/create/")) return true;
  if (/^\/timetable\/[^/]+\/edit\/?$/.test(path)) return true;
  return false;
}

function isExamTimetableWritePath(pathname) {
  const path = pathname || "/";
  if (path === "/exam-timetables/create" || path.startsWith("/exam-timetables/create/")) return true;
  if (/^\/exam-timetables\/[^/]+\/edit\/?$/.test(path)) return true;
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

function isChurchPath(pathname) {
  const path = pathname || "/";
  return path === "/church" || path.startsWith("/church/");
}

/** Designer / new service — write-only for admin and dean. */
function isChurchWritePath(pathname) {
  const path = pathname || "/";
  if (path === "/church/new" || path.startsWith("/church/new/")) return true;
  return /^\/church\/[^/]+\/design\/?$/.test(path);
}

function isTranscriptWritePath(pathname) {
  const path = pathname || "/";
  if (path.includes("/transcripts/new")) return true;
  // Edit existing transcript (not the list page …/transcript)
  if (/\/transcripts\/[^/]+\/?$/.test(path)) return true;
  return false;
}

function isClassTranscriptSummaryPath(pathname) {
  const path = pathname || "/";
  return path === "/cohort-transfer/class-summary" || path.startsWith("/cohort-transfer/class-summary/");
}

function isLibraryWritePath(pathname) {
  const path = pathname || "/";
  return path === "/library/issue" || path.startsWith("/library/issue/");
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
    if (isClassTimetableWritePath(path) && !canManageTimetables(role)) return false;
    if (isExamTimetableWritePath(path) && !canManageExamTimetables(role)) return false;
    return canViewTimetables(role);
  }
  if (isChurchPath(path)) {
    if (isChurchWritePath(path) && !canManageChurch(role)) return false;
    return canViewChurch(role);
  }
  if (isTranscriptWritePath(path) && !canManageTranscripts(role)) {
    return false;
  }
  if (isClassTranscriptSummaryPath(path) && !canViewTranscripts(role)) {
    return false;
  }
  if (isLibraryWritePath(path) && !canManageLibrary(role)) {
    return false;
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
