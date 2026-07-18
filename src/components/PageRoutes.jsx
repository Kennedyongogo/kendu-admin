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

function readStoredUser() {
  try {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) return JSON.parse(savedUser);
  } catch {
    /* ignore */
  }
  return null;
}

function PageRoutes() {
  const [user, setUser] = useState(() => readStoredUser());

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
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} setUser={setUser} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3, mt: 9, overflowX: "hidden" }}>
        <Routes>
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
          <Route path="users/create" element={<UsersCreate />} />
          <Route path="users" element={<UsersTable />} />
          <Route path="admissions/:id" element={<AdmissionViewPage />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="accounting/record-payment" element={<RecordPaymentPage />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="music" element={<Music />} />
          <Route path="audit" element={<Audit />} />
          <Route path="settings" element={<Settings user={user} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default PageRoutes;
