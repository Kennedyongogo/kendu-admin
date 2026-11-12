import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import BrandPageLoader from "./Util/BrandPageLoader";
import Navbar from "./Navbar";
import { readStoredPortalSession } from "../auth/portalAuth";
import { canOpenPath, homeForRole } from "../auth/roleAccess";

const Settings = lazy(() => import("../Pages/Settings"));
const Dashboard = lazy(() => import("../Pages/Dashboard"));
const UsersTable = lazy(() => import("./Users/UsersTable"));
const UsersCreate = lazy(() => import("./Users/UsersCreate"));
const Students = lazy(() => import("./Students/Students"));
const Audit = lazy(() => import("./Audit/Audit"));
const Programmes = lazy(() => import("./Programmes/Programmes"));
const ProgrammeFormPage = lazy(() => import("./Programmes/ProgrammeFormPage"));
const ProgrammeViewPage = lazy(() => import("./Programmes/ProgrammeViewPage"));
const FeeList = lazy(() => import("./Programmes/FeeList"));
const FeeFormPage = lazy(() => import("./Programmes/FeeFormPage"));
const FeeViewPage = lazy(() => import("./Programmes/FeeViewPage"));
const HourList = lazy(() => import("./Programmes/HourList"));
const HourFormPage = lazy(() => import("./Programmes/HourFormPage"));
const HourViewPage = lazy(() => import("./Programmes/HourViewPage"));
const ModuleList = lazy(() => import("./Programmes/ModuleList"));
const ModuleFormPage = lazy(() => import("./Programmes/ModuleFormPage"));
const ModuleViewPage = lazy(() => import("./Programmes/ModuleViewPage"));
const SubjectList = lazy(() => import("./Programmes/SubjectList"));
const SubjectFormPage = lazy(() => import("./Programmes/SubjectFormPage"));
const SubjectViewPage = lazy(() => import("./Programmes/SubjectViewPage"));
const Music = lazy(() => import("./Music/Music"));
const Brochures = lazy(() => import("./Brochures/Brochures"));
const UpcomingActivities = lazy(() => import("./UpcomingActivities/UpcomingActivities"));
const Admissions = lazy(() => import("./Admissions/Admissions"));
const AdmissionViewPage = lazy(() => import("./Admissions/AdmissionViewPage"));
const Accounting = lazy(() => import("./Accounting/Accounting"));
const RecordPaymentPage = lazy(() => import("./Accounting/RecordPaymentPage"));
const Library = lazy(() => import("./Library/Library"));
const IssueBookPage = lazy(() => import("./Library/IssueBookPage"));
const Timetable = lazy(() => import("./Timetable/Timetable"));
const TimetableDayPage = lazy(() => import("./Timetable/TimetableDayPage"));
const TimetableCreatePage = lazy(() => import("./Timetable/TimetableCreatePage"));
const Departments = lazy(() => import("./Departments/Departments"));
const DepartmentViewPage = lazy(() => import("./Departments/DepartmentViewPage"));
const Units = lazy(() => import("./Units/Units"));
const Registrations = lazy(() => import("./Units/Registrations"));
const Access = lazy(() => import("./Access/Access"));
const Meals = lazy(() => import("./Meals/Meals"));
const CohortTransferPage = lazy(() => import("./CohortTransfer/CohortTransferPage"));
const ClassTranscriptSummaryPage = lazy(() => import("./CohortTransfer/ClassTranscriptSummaryPage"));
const StudentTranscriptPage = lazy(() => import("./CohortTransfer/StudentTranscriptPage"));
const StudentTranscriptEditorPage = lazy(() => import("./CohortTransfer/StudentTranscriptEditorPage"));
const Announcements = lazy(() => import("./Announcements/Announcements"));
const StaffChat = lazy(() => import("./StaffCommons/StaffChat"));
const ExamTimetables = lazy(() => import("./ExamTimetable/ExamTimetables"));
const ExamTimetableCreate = lazy(() => import("./ExamTimetable/ExamTimetableCreate"));
const ExamTimetablePlan = lazy(() => import("./ExamTimetable/ExamTimetablePlan"));
const Church = lazy(() => import("./Church/Church"));
const ChurchDesigner = lazy(() => import("./Church/ChurchDesigner"));
const ChurchMonitor = lazy(() => import("./Church/ChurchMonitor"));
const Assignments = lazy(() => import("./Assignments/Assignments"));

const churchRoutes = (
  <>
    <Route path="church/new" element={<ChurchDesigner />} />
    <Route path="church/:id/design" element={<ChurchDesigner />} />
    <Route path="church/:id" element={<ChurchMonitor />} />
    <Route path="church" element={<Church />} />
  </>
);

function readStoredUser() {
  const session = readStoredPortalSession();
  return session?.user || null;
}

function PageFallback() {
  return <BrandPageLoader message="Loading page…" />;
}

function PageRoutes() {
  const location = useLocation();
  const [user, setUser] = useState(() => readStoredUser());
  const home = homeForRole(user?.role);

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);

  if (!user) {
    return <BrandPageLoader fullscreen message="Loading…" />;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "var(--kd-page-b)" }}>
      <Navbar user={user} setUser={setUser} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3, mt: 9, overflowX: "hidden" }}>
        {canOpenPath(user.role, location.pathname) ? (
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="home" element={<Navigate to={home} replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="programmes/create" element={<ProgrammeFormPage />} />
              <Route path="programmes/fees/create" element={<FeeFormPage />} />
              <Route path="programmes/fees/:id/edit" element={<FeeFormPage />} />
              <Route path="programmes/fees/:id" element={<FeeViewPage />} />
              <Route path="programmes/fees" element={<FeeList />} />
              <Route path="programmes/hours/create" element={<HourFormPage />} />
              <Route path="programmes/hours/:id/edit" element={<HourFormPage />} />
              <Route path="programmes/hours/:id" element={<HourViewPage />} />
              <Route path="programmes/hours" element={<HourList />} />
              <Route path="programmes/modules/create" element={<ModuleFormPage />} />
              <Route path="programmes/modules/:id/edit" element={<ModuleFormPage />} />
              <Route path="programmes/modules/:id" element={<ModuleViewPage />} />
              <Route path="programmes/modules" element={<ModuleList />} />
              <Route path="programmes/subjects/create" element={<SubjectFormPage />} />
              <Route path="programmes/subjects/:id/edit" element={<SubjectFormPage />} />
              <Route path="programmes/subjects/:id" element={<SubjectViewPage />} />
              <Route path="programmes/subjects" element={<SubjectList />} />
              <Route path="programmes/:id/edit" element={<ProgrammeFormPage />} />
              <Route path="programmes/:id" element={<ProgrammeViewPage />} />
              <Route path="programmes" element={<Programmes />} />
              <Route path="departments/:id" element={<DepartmentViewPage />} />
              <Route path="departments" element={<Departments />} />
              <Route path="units" element={<Units />} />
              <Route path="registrations" element={<Registrations />} />
              <Route path="access" element={<Access />} />
              <Route path="meals" element={<Meals />} />
              {churchRoutes}
              <Route
                path="cohort-transfer/students/:studentId/transcripts/new"
                element={<StudentTranscriptEditorPage />}
              />
              <Route
                path="cohort-transfer/students/:studentId/transcripts/:transcriptId"
                element={<StudentTranscriptEditorPage />}
              />
              <Route path="cohort-transfer/students/:studentId/transcript" element={<StudentTranscriptPage />} />
              <Route path="cohort-transfer/class-summary" element={<ClassTranscriptSummaryPage />} />
              <Route path="cohort-transfer" element={<CohortTransferPage />} />
              <Route path="users/create" element={<UsersCreate />} />
              <Route path="users" element={<UsersTable />} />
              <Route path="students" element={<Students />} />
              <Route path="admissions/:id" element={<AdmissionViewPage />} />
              <Route path="admissions" element={<Admissions />} />
              <Route path="accounting/record-payment" element={<RecordPaymentPage />} />
              <Route path="accounting" element={<Accounting />} />
              <Route path="library/issue" element={<IssueBookPage />} />
              <Route path="library" element={<Library />} />
              <Route path="timetable/create" element={<TimetableCreatePage />} />
              <Route path="timetable/:id/edit" element={<TimetableCreatePage />} />
              <Route path="timetable/day/:dateKey" element={<TimetableDayPage />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="exam-timetables/create" element={<ExamTimetableCreate />} />
              <Route path="exam-timetables/:id" element={<ExamTimetablePlan />} />
              <Route path="exam-timetables" element={<ExamTimetables />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="staff-chat" element={<StaffChat />} />
              <Route path="staff-commons" element={<StaffChat />} />
              <Route path="music" element={<Music />} />
              <Route path="brochures" element={<Brochures />} />
              <Route path="upcoming-activities" element={<UpcomingActivities />} />
              <Route path="audit" element={<Audit />} />
              <Route path="settings" element={<Settings user={user} />} />
              <Route path="*" element={<Navigate to={home} replace />} />
            </Routes>
          </Suspense>
        ) : (
          <Navigate to={home} replace />
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
