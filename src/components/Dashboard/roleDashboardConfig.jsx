import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChurchIcon from "@mui/icons-material/Church";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CampaignIcon from "@mui/icons-material/Campaign";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { dash } from "./dashboardTheme";

/**
 * Role dashboards aligned to roleAccess / requirements capture.
 * Each role sees metrics for the modules they actually operate.
 */
export const ROLE_DASHBOARD = {
  principal: {
    title: "Leadership overview",
    subtitle:
      "School-wide enrolment, admissions pipeline, academics, and campus services for the Principal.",
    cards: [
      { key: "students", label: "Students", hint: "Enrolled learners", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "admissions_total", label: "Admissions", hint: "Applications received", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.navy },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
      { key: "assignments_published", label: "Assignments", hint: "Published coursework", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "exam_periods", label: "Exam periods", hint: "Scheduled exam windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: "#8a6d1c" },
      { key: "library_books", label: "Library stock", hint: "Catalogued titles", icon: <LocalLibraryIcon />, path: "/library", accent: dash.primaryGreen },
      { key: "fee_payments", label: "Fee payments", hint: "Recorded receipts", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: dash.navy },
      { key: "church_bookings_active", label: "Church bookings", hint: "Active seat bookings", icon: <ChurchIcon />, path: "/church", accent: "#0f766e" },
    ],
    charts: ["admissions_status", "admissions_programme", "students_programme", "students_boarding", "students_gender", "office_roles"],
  },
  deputy_principal: {
    title: "Deputy Principal overview",
    subtitle:
      "Operational snapshot across admissions, students, timetables, and academic delivery.",
    cards: [
      { key: "students", label: "Students", hint: "Enrolled learners", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "admissions_total", label: "Admissions", hint: "Applications in pipeline", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.navy },
      { key: "timetable_entries", label: "Timetable slots", hint: "Scheduled teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: dash.primaryGreen },
      { key: "assignments", label: "Assignments", hint: "All coursework items", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "exam_periods", label: "Exam periods", hint: "Exam windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: "#8a6d1c" },
      { key: "announcements", label: "Announcements", hint: "News & events posts", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
    ],
    charts: ["admissions_status", "students_programme", "students_boarding", "registrations_status"],
  },
  hod: {
    title: "Head of Department",
    subtitle:
      "Department-scoped view of students, units, registrations, and lecturer assignments for your departments.",
    cards: [
      { key: "students", label: "Dept students", hint: "Learners in linked programmes", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "units", label: "Units", hint: "Offerings in your departments", icon: <MenuBookIcon />, path: "/units", accent: dash.navy },
      { key: "units_pending", label: "Pending units", hint: "Awaiting approval", icon: <HowToRegIcon />, path: "/units", accent: dash.accentGold },
      { key: "registrations", label: "Registrations", hint: "Unit registration records", icon: <HowToRegIcon />, path: "/registrations", accent: dash.primaryGreen },
      { key: "assignments", label: "Assignments", hint: "Department coursework", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "staff_in_departments", label: "Dept staff", hint: "Linked HOD & lecturers", icon: <BadgeIcon />, path: "/departments", accent: dash.primaryGreen },
      { key: "admissions_total", label: "Applications", hint: "Linked programme applicants", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.navy },
      { key: "departments", label: "Departments", hint: "Active departments (school)", icon: <AccountTreeIcon />, path: "/departments", accent: "#8a6d1c" },
    ],
    charts: ["students_programme", "registrations_status", "admissions_status", "students_boarding"],
  },
  academic_registrar: {
    title: "Academic Registrar",
    subtitle:
      "Enrolment integrity, admissions progression, programmes, and fee-related student records.",
    cards: [
      { key: "students", label: "Students", hint: "Enrolled students", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active", hint: "Active student accounts", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "admissions_total", label: "Admissions", hint: "Applications", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.primaryGreen },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.navy },
      { key: "fee_payments", label: "Payments", hint: "Fee receipts logged", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: "#8a6d1c" },
      { key: "timetable_entries", label: "Timetable", hint: "Teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: dash.primaryGreen },
    ],
    charts: ["admissions_status", "admissions_programme", "students_programme", "students_gender", "students_boarding"],
  },
  examinations: {
    title: "Examinations office",
    subtitle:
      "Exam periods, cohort movement, assignments visibility, and student readiness for assessment.",
    cards: [
      { key: "exam_periods", label: "Exam periods", hint: "Configured windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: dash.primaryGreen },
      { key: "students", label: "Students", hint: "Assessment candidates", icon: <SchoolIcon />, path: "/students", accent: dash.navy },
      { key: "assignments_published", label: "Published work", hint: "Visible assignments", icon: <AssignmentIcon />, path: "/assignments", accent: dash.primaryGreen },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.navy },
      { key: "timetable_entries", label: "Timetable", hint: "Teaching schedule slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: "#8a6d1c" },
      { key: "fee_payments", label: "Payments", hint: "Fee activity", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: dash.primaryGreen },
    ],
    charts: ["exam_status", "students_programme", "students_boarding", "admissions_status"],
  },
  library: {
    title: "Library desk",
    subtitle: "Collection health and loan circulation for the library office.",
    cards: [
      { key: "library_books", label: "Titles", hint: "Books in catalogue", icon: <LocalLibraryIcon />, path: "/library", accent: dash.primaryGreen },
      { key: "students", label: "Students", hint: "Potential borrowers", icon: <SchoolIcon />, path: "/students", accent: dash.navy },
      { key: "announcements", label: "Notices", hint: "School announcements", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
    ],
    charts: ["library_loans", "students_programme", "students_boarding"],
  },
  lecturer: {
    title: "Lecturer workspace",
    subtitle:
      "Your department teaching load: assignments, students in linked programmes, and learning support.",
    cards: [
      { key: "assignments", label: "Assignments", hint: "In your departments", icon: <AssignmentIcon />, path: "/assignments", accent: dash.primaryGreen },
      { key: "assignments_published", label: "Published", hint: "Visible to students", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "students", label: "Students", hint: "Linked programmes", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "units", label: "Units", hint: "Department offerings", icon: <MenuBookIcon />, path: "/units", accent: dash.navy },
      { key: "timetable_entries", label: "Timetable", hint: "School schedule slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: "#8a6d1c" },
      { key: "library_books", label: "Library", hint: "Reference titles", icon: <LocalLibraryIcon />, path: "/library", accent: dash.primaryGreen },
    ],
    charts: ["students_programme", "registrations_status", "students_boarding"],
  },
  secretary: {
    title: "Secretary desk",
    subtitle:
      "Student records, admissions intake, registrations, and cohort administration.",
    cards: [
      { key: "students", label: "Students", hint: "Student accounts", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "admissions_total", label: "Admissions", hint: "Applications to process", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.navy },
      { key: "registrations", label: "Registrations", hint: "Unit registrations", icon: <HowToRegIcon />, path: "/registrations", accent: dash.primaryGreen },
      { key: "students_active", label: "Active students", hint: "Currently active", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: "#8a6d1c" },
    ],
    charts: ["admissions_status", "admissions_programme", "students_boarding", "students_gender", "registrations_status"],
  },
  dean: {
    title: "Dean of students",
    subtitle:
      "Boarding life, meals, and church participation for pastoral care of students.",
    cards: [
      { key: "students", label: "Students", hint: "All enrolled students", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "meals_served_today", label: "Meals today", hint: "Servings logged today", icon: <RestaurantIcon />, path: "/meals", accent: dash.navy },
      { key: "church_bookings_active", label: "Church seats", hint: "Active bookings", icon: <ChurchIcon />, path: "/church", accent: "#0f766e" },
      { key: "students_active", label: "Active", hint: "Active accounts", icon: <PeopleIcon />, path: "/students", accent: dash.primaryGreen },
    ],
    charts: ["students_boarding", "students_gender", "students_programme"],
  },
  catering: {
    title: "Catering desk",
    subtitle: "",
    cards: [
      { key: "meals_served_today", label: "Meals today", hint: "Servings logged today", icon: <RestaurantIcon />, path: "/meals", accent: dash.primaryGreen },
      { key: "students", label: "Students", hint: "Enrolled learners", icon: <SchoolIcon />, path: "/meals", accent: dash.navy },
      { key: "students_active", label: "Active students", hint: "Active meal-card holders", icon: <PeopleIcon />, path: "/meals", accent: dash.primaryGreen },
    ],
    charts: ["students_boarding", "students_gender", "students_programme"],
  },
  finance: {
    title: "Finance office",
    subtitle: "Fee collection, payment records, and student service access gates.",
    cards: [
      { key: "fee_payments", label: "Fee payments", hint: "Recorded receipts", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: dash.primaryGreen },
      { key: "students", label: "Students", hint: "Fee account holders", icon: <SchoolIcon />, path: "/accounting", accent: dash.navy },
      { key: "students_active", label: "Active students", hint: "Currently enrolled", icon: <PeopleIcon />, path: "/accounting", accent: dash.primaryGreen },
      { key: "announcements", label: "News & Events", hint: "School announcements", icon: <CampaignIcon />, path: "/announcements", accent: dash.navy },
      { key: "programmes", label: "Programmes", hint: "Fee structures by programme", icon: <MenuBookIcon />, path: "/accounting", accent: "#8a6d1c" },
      { key: "admissions_total", label: "Access gates", hint: "Service access rules", icon: <LockOpenIcon />, path: "/access", accent: dash.primaryGreen },
    ],
    charts: ["students_programme", "students_boarding", "admissions_status"],
  },
};

export const ADMIN_EXTRA_CARDS = [
  { key: "total_users", label: "Total users", hint: "Admins, offices and students", icon: <PeopleIcon />, path: "/users", accent: dash.primaryGreen },
  { key: "admins", label: "Admins", hint: "Administrator accounts", icon: <AdminPanelSettingsIcon />, path: "/users?role=admin", accent: dash.primaryGreen },
  { key: "offices", label: "Offices", hint: "Leadership & school offices", icon: <BadgeIcon />, path: "/users", accent: dash.navy },
  { key: "students", label: "Students", hint: "Enrolled students", icon: <SchoolIcon />, path: "/students", accent: "#8a6d1c" },
  { key: "programmes", label: "Programmes", hint: "Academic programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
  { key: "departments", label: "Departments", hint: "Academic departments", icon: <AccountTreeIcon />, path: "/departments", accent: dash.navy },
  { key: "admissions_total", label: "Admissions", hint: "Applications received", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.primaryGreen },
  { key: "units", label: "Units", hint: "Course offerings", icon: <MenuBookIcon />, path: "/units", accent: dash.navy },
  { key: "registrations", label: "Registrations", hint: "Unit registrations", icon: <HowToRegIcon />, path: "/registrations", accent: dash.primaryGreen },
  { key: "assignments_published", label: "Assignments", hint: "Published coursework", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
  { key: "exam_periods", label: "Exam periods", hint: "Exam windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: "#8a6d1c" },
  { key: "library_books", label: "Library", hint: "Catalogued titles", icon: <LocalLibraryIcon />, path: "/library", accent: dash.primaryGreen },
];
