import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { getFlags, isAuthenticated } from "./api";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import Register from "./pages/Register";

function LayoutWithOutlet() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const authed = isAuthenticated();
  const location = useLocation();
  if (!authed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default function App() {
  const [flags, setFlags] = useState<Record<string, any>>({});

  useEffect(() => {
    getFlags().then(setFlags).catch(() => setFlags({}));
  }, []);

  const notesEnabled = !!flags["appointments.notes.enabled"];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<LayoutWithOutlet />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/doctors"
            element={
              <RequireAuth>
                <Doctors />
              </RequireAuth>
            }
          />
          <Route
            path="/patients"
            element={
              <RequireAuth>
                <Patients />
              </RequireAuth>
            }
          />
          <Route
            path="/appointments"
            element={
              <RequireAuth>
                <Appointments notesEnabled={notesEnabled} />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <div className="text-mute">Reports coming soon</div>
              </RequireAuth>
            }
          />
          <Route path="*" element={<div className="text-mute">Not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
