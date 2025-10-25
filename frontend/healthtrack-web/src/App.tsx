import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { getFlags } from "./api";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";

function LayoutWithOutlet() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
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
        <Route element={<LayoutWithOutlet />}>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments notesEnabled={notesEnabled} />} />
          <Route path="/reports" element={<div className="text-mute">Reports coming soon</div>} />
          <Route path="*" element={<div className="text-mute">Not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
