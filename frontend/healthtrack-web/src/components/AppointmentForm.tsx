import React, { useState } from 'react';
import { createAppointment } from '../api';

function AppointmentForm({ notesEnabled }: { notesEnabled: boolean }) {
  const [patientId, setPatientId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Submitting…');
    try {
      await createAppointment({
        patientId,
        providerId,
        startsAtUtc: new Date(startsAt).toISOString(),
        endsAtUtc: new Date(endsAt).toISOString(),
        notes: notesEnabled ? notes : undefined,
      });
      setStatus('Created!');
    } catch (e: any) {
      setStatus('Error: ' + e.message);
    }
  }

  return (
    <form onSubmit={submit} style={{ border: '1px solid #eee', padding: 16, borderRadius: 12 }}>
      <div>
        <label>Patient Id</label>
        <input value={patientId} onChange={(e) => setPatientId(e.target.value)} required />
      </div>
      <div>
        <label>Provider Id</label>
        <input value={providerId} onChange={(e) => setProviderId(e.target.value)} required />
      </div>
      <div>
        <label>Starts at (UTC)</label>
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      </div>
      <div>
        <label>Ends at (UTC)</label>
        <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
      </div>
      {notesEnabled && (
        <div>
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      )}
      <button type="submit">Create</button>
      <span style={{ marginLeft: 12 }}>{status}</span>
    </form>
  );
}

export default AppointmentForm;
