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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HotelIcon from "@mui/icons-material/Hotel";
import PaymentsIcon from "@mui/icons-material/Payments";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { dash } from "./dashboardTheme";

/**
 * Role dashboards aligned to roleAccess / requirements capture.
 * Each role sees metrics for the modules they actually operate.
 */
export const ROLE_DASHBOARD = {
  principal: {
    title: "Leadership overview",
    subtitle:
      "School-wide enrolment, admissions, academics, finance visibility, and campus services.",
    cards: [
      { key: "students", label: "Students", hint: "Enrolled learners", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active students", hint: "Active accounts", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "students_boarders", label: "Boarders", hint: "Boarding students", icon: <HotelIcon />, path: "/students", accent: "#0f766e" },
      { key: "admissions_total", label: "Admissions", hint: "All applications", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.navy },
      { key: "admissions_pending", label: "In review", hint: "Pending / under review", icon: <HourglassTopIcon />, path: "/admissions", accent: dash.accentGold },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
      { key: "departments", label: "Departments", hint: "Academic departments", icon: <AccountTreeIcon />, path: "/departments", accent: dash.navy },
      { key: "units", label: "Units", hint: "Course offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: dash.primaryGreen },
      { key: "assignments_published", label: "Assignments", hint: "Published coursework", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "exam_periods", label: "Exam periods", hint: "Exam windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: "#8a6d1c" },
      { key: "timetable_entries", label: "Timetable", hint: "Teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: dash.primaryGreen },
      { key: "library_books", label: "Library stock", hint: "Catalogued titles", icon: <LocalLibraryIcon />, path: "/library", accent: dash.navy },
      { key: "fee_payments_confirmed", label: "Confirmed fees", hint: "Confirmed receipts", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: dash.primaryGreen },
      { key: "church_bookings_active", label: "Church bookings", hint: "Active seat bookings", icon: <ChurchIcon />, path: "/church", accent: "#0f766e" },
      { key: "announcements_published", label: "News & events", hint: "Published posts", icon: <CampaignIcon />, path: "/announcements", accent: dash.navy },
      { key: "brochures", label: "Brochures", hint: "Public prospectuses", icon: <PictureAsPdfIcon />, path: "/brochures", accent: "#8a6d1c" },
    ],
    charts: [
      "admissions_status",
      "admissions_programme",
      "students_programme",
      "students_boarding",
      "students_gender",
      "office_roles",
      "exam_status",
      "library_loans",
    ],
  },
  deputy_principal: {
    title: "Deputy Principal overview",
    subtitle:
      "Operations across admissions, academics, timetables, church, and campus communications.",
    cards: [
      { key: "students", label: "Students", hint: "Enrolled learners", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active", hint: "Active accounts", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "admissions_total", label: "Admissions", hint: "Applications", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.navy },
      { key: "admissions_pending", label: "Pipeline", hint: "Awaiting decision", icon: <HourglassTopIcon />, path: "/admissions", accent: dash.accentGold },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
      { key: "departments", label: "Departments", hint: "Academic departments", icon: <AccountTreeIcon />, path: "/departments", accent: dash.navy },
      { key: "units", label: "Units", hint: "Course offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: dash.primaryGreen },
      { key: "units_pending", label: "Pending units", hint: "Awaiting approval", icon: <HowToRegIcon />, path: "/units", accent: dash.accentGold },
      { key: "assignments", label: "Assignments", hint: "All coursework", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "assignments_published", label: "Published work", hint: "Visible to students", icon: <AssignmentIcon />, path: "/assignments", accent: dash.primaryGreen },
      { key: "timetable_entries", label: "Timetable", hint: "Teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: dash.navy },
      { key: "exam_periods", label: "Exam periods", hint: "Exam windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: "#8a6d1c" },
      { key: "library_books", label: "Library", hint: "Catalogued titles", icon: <LocalLibraryIcon />, path: "/library", accent: dash.primaryGreen },
      { key: "fee_payments", label: "Fee receipts", hint: "Payment records", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: dash.navy },
      { key: "church_bookings_active", label: "Church seats", hint: "Active bookings", icon: <ChurchIcon />, path: "/church", accent: "#0f766e" },
      { key: "announcements", label: "Announcements", hint: "News & events", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
    ],
    charts: [
      "admissions_status",
      "students_programme",
      "students_boarding",
      "registrations_status",
      "exam_status",
      "library_loans",
    ],
  },
  hod: {
    title: "Head of Department",
    subtitle:
      "Department-scoped students, units, registrations, assignments, and teaching schedule.",
    cards: [
      { key: "students", label: "Dept students", hint: "Linked programmes", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active", hint: "Active learners", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "departments", label: "Departments", hint: "School departments", icon: <AccountTreeIcon />, path: "/departments", accent: "#8a6d1c" },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
      { key: "units", label: "Units", hint: "Dept offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: dash.navy },
      { key: "units_pending", label: "Pending units", hint: "Awaiting approval", icon: <HourglassTopIcon />, path: "/units", accent: dash.accentGold },
      { key: "units_approved", label: "Approved units", hint: "Ready for registration", icon: <CheckCircleIcon />, path: "/units", accent: dash.primaryGreen },
      { key: "registrations", label: "Registrations", hint: "Unit registrations", icon: <HowToRegIcon />, path: "/registrations", accent: dash.navy },
      { key: "registrations_active", label: "Active regs", hint: "Currently registered", icon: <HowToRegIcon />, path: "/registrations", accent: dash.primaryGreen },
      { key: "assignments", label: "Assignments", hint: "Dept coursework", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "assignments_published", label: "Published", hint: "Visible to students", icon: <AssignmentIcon />, path: "/assignments", accent: dash.primaryGreen },
      { key: "staff_in_departments", label: "Dept staff", hint: "HOD & lecturers linked", icon: <BadgeIcon />, path: "/departments", accent: dash.navy },
      { key: "timetable_entries", label: "Timetable", hint: "Teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: dash.primaryGreen },
      { key: "exam_periods", label: "Exam periods", hint: "Assessment windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: "#8a6d1c" },
      { key: "library_books", label: "Library", hint: "Reference titles", icon: <LocalLibraryIcon />, path: "/library", accent: dash.navy },
      { key: "announcements", label: "Announcements", hint: "School notices", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
    ],
    charts: [
      "students_programme",
      "registrations_status",
      "admissions_status",
      "students_boarding",
      "exam_status",
    ],
  },
  academic_registrar: {
    title: "Academic Registrar",
    subtitle:
      "Enrolment integrity, admissions progression, programmes, units, and fee-linked records.",
    cards: [
      { key: "students", label: "Students", hint: "Enrolled students", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active", hint: "Active accounts", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "admissions_total", label: "Admissions", hint: "All applications", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.primaryGreen },
      { key: "admissions_pending", label: "In pipeline", hint: "Pending / under review", icon: <HourglassTopIcon />, path: "/admissions", accent: dash.accentGold },
      { key: "admissions_accepted", label: "Accepted", hint: "Accepted applicants", icon: <CheckCircleIcon />, path: "/admissions", accent: dash.navy },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
      { key: "departments", label: "Departments", hint: "Academic departments", icon: <AccountTreeIcon />, path: "/departments", accent: dash.navy },
      { key: "units", label: "Units", hint: "Course offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: dash.primaryGreen },
      { key: "units_pending", label: "Pending units", hint: "Awaiting approval", icon: <HowToRegIcon />, path: "/units", accent: dash.accentGold },
      { key: "units_approved", label: "Approved units", hint: "Live offerings", icon: <CheckCircleIcon />, path: "/units", accent: dash.navy },
      { key: "fee_payments", label: "Fee receipts", hint: "Payment records", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: "#8a6d1c" },
      { key: "fee_payments_confirmed", label: "Confirmed fees", hint: "Confirmed receipts", icon: <PaymentsIcon />, path: "/accounting", accent: dash.primaryGreen },
      { key: "timetable_entries", label: "Timetable", hint: "Teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: dash.navy },
      { key: "exam_periods", label: "Exam periods", hint: "Exam windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: "#8a6d1c" },
      { key: "announcements", label: "Announcements", hint: "News & events", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
      { key: "brochures", label: "Brochures", hint: "Public prospectuses", icon: <PictureAsPdfIcon />, path: "/brochures", accent: dash.navy },
    ],
    charts: [
      "admissions_status",
      "admissions_programme",
      "students_programme",
      "students_gender",
      "students_boarding",
      "exam_status",
    ],
  },
  examinations: {
    title: "Examinations office",
    subtitle:
      "Exam windows, slots, cohort readiness, assignments visibility, and related academics.",
    cards: [
      { key: "exam_periods", label: "Exam periods", hint: "Configured windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: dash.primaryGreen },
      { key: "exam_slots", label: "Exam slots", hint: "Scheduled papers", icon: <CalendarMonthIcon />, path: "/exam-timetables", accent: dash.navy },
      { key: "students", label: "Students", hint: "Assessment candidates", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active", hint: "Active candidates", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "units", label: "Units", hint: "Assessable offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: dash.primaryGreen },
      { key: "units_approved", label: "Approved units", hint: "Live units", icon: <CheckCircleIcon />, path: "/units", accent: dash.navy },
      { key: "assignments_published", label: "Published work", hint: "Visible assignments", icon: <AssignmentIcon />, path: "/assignments", accent: dash.primaryGreen },
      { key: "assignments", label: "All assignments", hint: "Coursework items", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
      { key: "timetable_entries", label: "Class timetable", hint: "Teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: "#8a6d1c" },
      { key: "fee_payments_confirmed", label: "Confirmed fees", hint: "Fee confirmation", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: dash.navy },
      { key: "admissions_accepted", label: "Accepted apps", hint: "Accepted admissions", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.primaryGreen },
      { key: "announcements", label: "Announcements", hint: "School notices", icon: <CampaignIcon />, path: "/announcements", accent: dash.navy },
      { key: "brochures", label: "Brochures", hint: "Public documents", icon: <PictureAsPdfIcon />, path: "/brochures", accent: "#8a6d1c" },
    ],
    charts: ["exam_status", "students_programme", "students_boarding", "admissions_status", "registrations_status"],
  },
  library: {
    title: "Library desk",
    subtitle: "Catalogue health, circulation, and learner reach for the library office.",
    cards: [
      { key: "library_books", label: "Titles", hint: "Books in catalogue", icon: <LocalLibraryIcon />, path: "/library", accent: dash.primaryGreen },
      { key: "library_loans_active", label: "Active loans", hint: "Books currently out", icon: <MenuBookIcon />, path: "/library", accent: dash.navy },
      { key: "library_loans_overdue", label: "Overdue", hint: "Past due returns", icon: <HourglassTopIcon />, path: "/library", accent: "#b91c1c" },
      { key: "students", label: "Students", hint: "Potential borrowers", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active students", hint: "Active accounts", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "programmes", label: "Programmes", hint: "Programme coverage", icon: <MenuBookOutlinedIcon />, path: "/programmes", accent: "#8a6d1c" },
      { key: "announcements", label: "Notices", hint: "School announcements", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
      { key: "announcements_published", label: "Published notices", hint: "Live posts", icon: <CampaignIcon />, path: "/announcements", accent: dash.navy },
      { key: "brochures", label: "Brochures", hint: "Public prospectuses", icon: <PictureAsPdfIcon />, path: "/brochures", accent: dash.primaryGreen },
    ],
    charts: ["library_loans", "students_programme", "students_boarding", "students_gender"],
  },
  lecturer: {
    title: "Lecturer workspace",
    subtitle:
      "Department teaching load: assignments, units, students, timetable, and learning support.",
    cards: [
      { key: "assignments", label: "Assignments", hint: "In your departments", icon: <AssignmentIcon />, path: "/assignments", accent: dash.primaryGreen },
      { key: "assignments_published", label: "Published", hint: "Visible to students", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
      { key: "students", label: "Students", hint: "Linked programmes", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active students", hint: "Active learners", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "units", label: "Units", hint: "Department offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: dash.primaryGreen },
      { key: "units_approved", label: "Approved units", hint: "Live offerings", icon: <CheckCircleIcon />, path: "/units", accent: dash.navy },
      { key: "units_pending", label: "Pending units", hint: "Awaiting approval", icon: <HourglassTopIcon />, path: "/units", accent: dash.accentGold },
      { key: "registrations_active", label: "Registrations", hint: "Active unit regs", icon: <HowToRegIcon />, path: "/units", accent: dash.primaryGreen },
      { key: "programmes", label: "Programmes", hint: "Linked programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.navy },
      { key: "departments", label: "Departments", hint: "Your departments", icon: <AccountTreeIcon />, path: "/departments", accent: "#8a6d1c" },
      { key: "timetable_entries", label: "Timetable", hint: "Teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: dash.primaryGreen },
      { key: "library_books", label: "Library", hint: "Reference titles", icon: <LocalLibraryIcon />, path: "/library", accent: dash.navy },
      { key: "announcements", label: "Announcements", hint: "School notices", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
      { key: "brochures", label: "Brochures", hint: "Public documents", icon: <PictureAsPdfIcon />, path: "/brochures", accent: dash.navy },
    ],
    charts: ["students_programme", "registrations_status", "students_boarding", "students_gender"],
  },
  secretary: {
    title: "Secretary desk",
    subtitle:
      "Student records, admissions intake, registrations, programmes, and campus communications.",
    cards: [
      { key: "students", label: "Students", hint: "Student accounts", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active students", hint: "Currently active", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "admissions_total", label: "Admissions", hint: "Applications", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.navy },
      { key: "admissions_pending", label: "Pipeline", hint: "Pending / under review", icon: <HourglassTopIcon />, path: "/admissions", accent: dash.accentGold },
      { key: "admissions_accepted", label: "Accepted", hint: "Accepted applicants", icon: <CheckCircleIcon />, path: "/admissions", accent: dash.primaryGreen },
      { key: "registrations", label: "Registrations", hint: "Unit registrations", icon: <HowToRegIcon />, path: "/registrations", accent: dash.navy },
      { key: "registrations_active", label: "Active regs", hint: "Currently registered", icon: <HowToRegIcon />, path: "/registrations", accent: dash.primaryGreen },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: "#8a6d1c" },
      { key: "departments", label: "Departments", hint: "Academic departments", icon: <AccountTreeIcon />, path: "/departments", accent: dash.navy },
      { key: "units", label: "Units", hint: "Course offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: dash.primaryGreen },
      { key: "announcements", label: "Announcements", hint: "News & events", icon: <CampaignIcon />, path: "/announcements", accent: dash.navy },
      { key: "announcements_published", label: "Published posts", hint: "Live announcements", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
      { key: "brochures", label: "Brochures", hint: "Public prospectuses", icon: <PictureAsPdfIcon />, path: "/brochures", accent: dash.navy },
      { key: "students_boarders", label: "Boarders", hint: "Boarding students", icon: <HotelIcon />, path: "/students", accent: "#0f766e" },
    ],
    charts: [
      "admissions_status",
      "admissions_programme",
      "students_boarding",
      "students_gender",
      "registrations_status",
      "students_programme",
    ],
  },
  dean: {
    title: "Dean of students",
    subtitle:
      "Boarding life, meals, church participation, and pastoral oversight of students.",
    cards: [
      { key: "students", label: "Students", hint: "All enrolled students", icon: <SchoolIcon />, path: "/students", accent: dash.primaryGreen },
      { key: "students_active", label: "Active", hint: "Active accounts", icon: <PeopleIcon />, path: "/students", accent: dash.navy },
      { key: "students_boarders", label: "Boarders", hint: "Boarding students", icon: <HotelIcon />, path: "/students", accent: "#0f766e" },
      { key: "students_non_boarders", label: "Day scholars", hint: "Non-boarders", icon: <SchoolIcon />, path: "/students", accent: dash.navy },
      { key: "meals_served_today", label: "Meals today", hint: "Servings logged today", icon: <RestaurantIcon />, path: "/meals", accent: dash.primaryGreen },
      { key: "meal_cards", label: "Meal cards", hint: "Issued meal cards", icon: <BadgeIcon />, path: "/meals", accent: dash.navy },
      { key: "church_services", label: "Church services", hint: "All services", icon: <ChurchIcon />, path: "/church", accent: "#0f766e" },
      { key: "church_services_upcoming", label: "Upcoming services", hint: "Approved & upcoming", icon: <EventSeatIcon />, path: "/church", accent: dash.primaryGreen },
      { key: "church_bookings_active", label: "Church seats", hint: "Active bookings", icon: <EventSeatIcon />, path: "/church", accent: dash.navy },
      { key: "programmes", label: "Programmes", hint: "Active programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
      { key: "departments", label: "Departments", hint: "Academic departments", icon: <AccountTreeIcon />, path: "/departments", accent: dash.navy },
      { key: "units", label: "Units", hint: "Course offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: "#8a6d1c" },
      { key: "announcements", label: "Announcements", hint: "School notices", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
      { key: "brochures", label: "Brochures", hint: "Public documents", icon: <PictureAsPdfIcon />, path: "/brochures", accent: dash.navy },
    ],
    charts: ["students_boarding", "students_gender", "students_programme", "admissions_status"],
  },
  catering: {
    title: "Catering desk",
    subtitle: "Meal service volume, meal cards, and boarding demand for the kitchen office.",
    cards: [
      { key: "meals_served_today", label: "Meals today", hint: "Servings logged today", icon: <RestaurantIcon />, path: "/meals", accent: dash.primaryGreen },
      { key: "meal_cards", label: "Meal cards", hint: "Issued cards", icon: <BadgeIcon />, path: "/meals", accent: dash.navy },
      { key: "students_boarders", label: "Boarders", hint: "Boarding students", icon: <HotelIcon />, path: "/meals", accent: "#0f766e" },
      { key: "students", label: "Students", hint: "Enrolled learners", icon: <SchoolIcon />, path: "/meals", accent: dash.primaryGreen },
      { key: "students_active", label: "Active students", hint: "Active meal-card holders", icon: <PeopleIcon />, path: "/meals", accent: dash.navy },
      { key: "students_non_boarders", label: "Day scholars", hint: "Non-boarders", icon: <SchoolIcon />, path: "/meals", accent: "#8a6d1c" },
      { key: "announcements", label: "Announcements", hint: "School notices", icon: <CampaignIcon />, path: "/announcements", accent: dash.primaryGreen },
      { key: "brochures", label: "Brochures", hint: "Public documents", icon: <PictureAsPdfIcon />, path: "/brochures", accent: dash.navy },
    ],
    charts: ["students_boarding", "students_gender", "students_programme"],
  },
  finance: {
    title: "Finance office",
    subtitle: "Fee collection, confirmed receipts, and student service access gates.",
    cards: [
      { key: "fee_payments", label: "Fee payments", hint: "All payment records", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: dash.primaryGreen },
      { key: "fee_payments_confirmed", label: "Confirmed", hint: "Confirmed receipts", icon: <CheckCircleIcon />, path: "/accounting", accent: dash.navy },
      { key: "fee_amount_confirmed", label: "Confirmed amount", hint: "KES confirmed total", icon: <PaymentsIcon />, path: "/accounting", accent: "#0f766e" },
      { key: "students", label: "Students", hint: "Fee account holders", icon: <SchoolIcon />, path: "/accounting", accent: dash.primaryGreen },
      { key: "students_active", label: "Active students", hint: "Currently enrolled", icon: <PeopleIcon />, path: "/accounting", accent: dash.navy },
      { key: "access_policies", label: "Access rules", hint: "Service access policies", icon: <LockOpenIcon />, path: "/access", accent: dash.primaryGreen },
      { key: "access_policies_enabled", label: "Enabled gates", hint: "Active access rules", icon: <LockOpenIcon />, path: "/access", accent: dash.navy },
      { key: "programmes", label: "Programmes", hint: "Fee structures by programme", icon: <MenuBookIcon />, path: "/accounting", accent: "#8a6d1c" },
      { key: "admissions_accepted", label: "Accepted apps", hint: "Accepted admissions", icon: <AssignmentIndIcon />, path: "/access", accent: dash.primaryGreen },
      { key: "announcements", label: "News & Events", hint: "School announcements", icon: <CampaignIcon />, path: "/announcements", accent: dash.navy },
      { key: "brochures", label: "Brochures", hint: "Public prospectuses", icon: <PictureAsPdfIcon />, path: "/brochures", accent: dash.primaryGreen },
      { key: "students_boarders", label: "Boarders", hint: "Boarding fee accounts", icon: <HotelIcon />, path: "/accounting", accent: "#0f766e" },
    ],
    charts: ["students_programme", "students_boarding", "admissions_status", "students_gender"],
  },
};

export const ADMIN_EXTRA_CARDS = [
  { key: "total_users", label: "Total users", hint: "Admins, offices and students", icon: <PeopleIcon />, path: "/users", accent: dash.primaryGreen },
  { key: "admins", label: "Admins", hint: "Administrator accounts", icon: <AdminPanelSettingsIcon />, path: "/users?role=admin", accent: dash.primaryGreen },
  { key: "offices", label: "Offices", hint: "Leadership & school offices", icon: <BadgeIcon />, path: "/users", accent: dash.navy },
  { key: "students", label: "Students", hint: "Enrolled students", icon: <SchoolIcon />, path: "/students", accent: "#8a6d1c" },
  { key: "students_active", label: "Active students", hint: "Active accounts", icon: <PeopleIcon />, path: "/students", accent: dash.primaryGreen },
  { key: "students_boarders", label: "Boarders", hint: "Boarding students", icon: <HotelIcon />, path: "/students", accent: "#0f766e" },
  { key: "programmes", label: "Programmes", hint: "Academic programmes", icon: <MenuBookIcon />, path: "/programmes", accent: dash.primaryGreen },
  { key: "departments", label: "Departments", hint: "Academic departments", icon: <AccountTreeIcon />, path: "/departments", accent: dash.navy },
  { key: "admissions_total", label: "Admissions", hint: "Applications received", icon: <AssignmentIndIcon />, path: "/admissions", accent: dash.primaryGreen },
  { key: "admissions_pending", label: "Admissions pipeline", hint: "Pending / under review", icon: <HourglassTopIcon />, path: "/admissions", accent: dash.accentGold },
  { key: "units", label: "Units", hint: "Course offerings", icon: <MenuBookOutlinedIcon />, path: "/units", accent: dash.navy },
  { key: "units_pending", label: "Pending units", hint: "Awaiting approval", icon: <HowToRegIcon />, path: "/units", accent: dash.accentGold },
  { key: "registrations", label: "Registrations", hint: "Unit registrations", icon: <HowToRegIcon />, path: "/registrations", accent: dash.primaryGreen },
  { key: "assignments_published", label: "Assignments", hint: "Published coursework", icon: <AssignmentIcon />, path: "/assignments", accent: dash.navy },
  { key: "exam_periods", label: "Exam periods", hint: "Exam windows", icon: <FactCheckIcon />, path: "/exam-timetables", accent: "#8a6d1c" },
  { key: "exam_slots", label: "Exam slots", hint: "Scheduled papers", icon: <CalendarMonthIcon />, path: "/exam-timetables", accent: dash.primaryGreen },
  { key: "timetable_entries", label: "Timetable", hint: "Teaching slots", icon: <CalendarMonthIcon />, path: "/timetable", accent: dash.navy },
  { key: "library_books", label: "Library", hint: "Catalogued titles", icon: <LocalLibraryIcon />, path: "/library", accent: dash.primaryGreen },
  { key: "library_loans_active", label: "Active loans", hint: "Books currently out", icon: <LocalLibraryIcon />, path: "/library", accent: dash.navy },
  { key: "fee_payments_confirmed", label: "Confirmed fees", hint: "Confirmed receipts", icon: <AccountBalanceWalletIcon />, path: "/accounting", accent: dash.primaryGreen },
  { key: "fee_amount_confirmed", label: "Fee amount", hint: "KES confirmed total", icon: <PaymentsIcon />, path: "/accounting", accent: "#0f766e" },
  { key: "access_policies_enabled", label: "Access gates", hint: "Enabled policies", icon: <LockOpenIcon />, path: "/access", accent: dash.navy },
  { key: "church_bookings_active", label: "Church bookings", hint: "Active seat bookings", icon: <ChurchIcon />, path: "/church", accent: "#0f766e" },
  { key: "meals_served_today", label: "Meals today", hint: "Servings logged today", icon: <RestaurantIcon />, path: "/meals", accent: dash.primaryGreen },
  { key: "announcements_published", label: "News & events", hint: "Published posts", icon: <CampaignIcon />, path: "/announcements", accent: dash.navy },
  { key: "brochures", label: "Brochures", hint: "Public prospectuses", icon: <PictureAsPdfIcon />, path: "/brochures", accent: "#8a6d1c" },
];
