import React, { useEffect, useState } from 'react';
import { getFlags } from './api';
import PatientsList from './components/PatientList';
import AppointmentForm from './components/AppointmentForm';

export default function App() {
  const [flags, setFlags] = useState<Record<string, any>>({});

  useEffect(() => {
    getFlags().then(setFlags).catch(() => setFlags({}));
  }, []);

  const notesEnabled = !!flags['appointments.notes.enabled'];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>HealthTrack</h1>
      <p>Sample app for mentoring a junior developer.</p>

      <section>
        <h2>Patients</h2>
        <PatientsList />
      </section>

      <section>
        <h2>New Appointment</h2>
        <AppointmentForm notesEnabled={notesEnabled} />
      </section>
    </div>
  );
}
