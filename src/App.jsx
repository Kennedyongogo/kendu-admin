import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import PageRoutes from "./components/PageRoutes";
import { initAdminSessionSecurity } from "./auth/sessionSecurity";

function App() {
  useEffect(() => {
    initAdminSessionSecurity();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/*" element={<PageRoutes />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
