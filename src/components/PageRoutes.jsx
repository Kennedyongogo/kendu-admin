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

function PageRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} setUser={setUser} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3, mt: 9, overflowX: "hidden" }}>
        {loading ? (
          <BrandPageLoader message="Loading…" />
        ) : (
          <Routes>
            <Route path="home" element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="programmes" element={<Programmes />} />
            <Route path="users/create" element={<UsersCreate />} />
            <Route path="users" element={<UsersTable />} />
            <Route path="audit" element={<Audit />} />
            <Route path="settings" element={<Settings user={user} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
