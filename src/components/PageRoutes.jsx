import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import BrandPageLoader from "./Util/BrandPageLoader";
import Navbar from "./Navbar";
import Settings from "../Pages/Settings";
import NotFound from "../Pages/NotFound";
import Dashboard from "../Pages/Dashboard";
import UsersTable from "./Users/UsersTable";
import UsersCreate from "./Users/UsersCreate";
import Audit from "./Audit/Audit";
import Programmes from "./Programmes/Programmes";
import ProgrammeFormPage from "./Programmes/ProgrammeFormPage";
import ProgrammeViewPage from "./Programmes/ProgrammeViewPage";
import FeeList from "./Programmes/FeeList";
import FeeFormPage from "./Programmes/FeeFormPage";
import FeeViewPage from "./Programmes/FeeViewPage";
import HourList from "./Programmes/HourList";
import HourFormPage from "./Programmes/HourFormPage";
import HourViewPage from "./Programmes/HourViewPage";
import ModuleList from "./Programmes/ModuleList";
import ModuleFormPage from "./Programmes/ModuleFormPage";
import ModuleViewPage from "./Programmes/ModuleViewPage";
import SubjectList from "./Programmes/SubjectList";
import SubjectFormPage from "./Programmes/SubjectFormPage";
import SubjectViewPage from "./Programmes/SubjectViewPage";
import Music from "./Music/Music";
import Admissions from "./Admissions/Admissions";
import AdmissionViewPage from "./Admissions/AdmissionViewPage";
import Accounting from "./Accounting/Accounting";
import RecordPaymentPage from "./Accounting/RecordPaymentPage";
import Timetable from "./Timetable/Timetable";
import TimetableDayPage from "./Timetable/TimetableDayPage";
import TimetableCreatePage from "./Timetable/TimetableCreatePage";
import Departments from "./Departments/Departments";
import DepartmentViewPage from "./Departments/DepartmentViewPage";
import Units from "./Units/Units";
import Registrations from "./Units/Registrations";
import Access from "./Access/Access";
import { readStoredPortalSession } from "../auth/portalAuth";

function readStoredUser() {
  const session = readStoredPortalSession();
  return session?.user || null;
}

function PageRoutes() {
  const [user, setUser] = useState(() => readStoredUser());
  const isStaff = user?.role === "staff";

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);

  // No session yet → single brand loader (redirecting). Do not flash a second page spinner.
  if (!user) {
    return <BrandPageLoader message="Loading…" />;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "var(--kd-page-b)" }}>
      <Navbar user={user} setUser={setUser} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3, mt: 9, overflowX: "hidden" }}>
        <Routes>
          {isStaff ? (
            <>
              <Route path="units" element={<Units />} />
              <Route path="registrations" element={<Registrations />} />
              <Route path="settings" element={<Settings user={user} />} />
              <Route path="*" element={<Navigate to="/units" replace />} />
            </>
          ) : (
            <>
              <Route path="home" element={<Navigate to="/dashboard" replace />} />
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
              <Route path="users/create" element={<UsersCreate />} />
              <Route path="users" element={<UsersTable />} />
              <Route path="admissions/:id" element={<AdmissionViewPage />} />
              <Route path="admissions" element={<Admissions />} />
              <Route path="accounting/record-payment" element={<RecordPaymentPage />} />
              <Route path="accounting" element={<Accounting />} />
              <Route path="timetable/create" element={<TimetableCreatePage />} />
              <Route path="timetable/:id/edit" element={<TimetableCreatePage />} />
              <Route path="timetable/day/:dateKey" element={<TimetableDayPage />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="music" element={<Music />} />
              <Route path="audit" element={<Audit />} />
              <Route path="settings" element={<Settings user={user} />} />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </Box>
    </Box>
  );
}

export default PageRoutes;
