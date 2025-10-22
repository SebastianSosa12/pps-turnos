import React, { useEffect, useState } from 'react';
import { getPatients, createPatient } from '../api';

function PatientsList() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDob, setNewDob] = useState('');

  async function load() {
    setLoading(true);
    try {
      setItems(await getPatients(q));
    } finally {
      setLoading(false);
    }
  }

  async function addPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newEmail || !newDob) return;
    await createPatient({
      fullName: newName,
      email: newEmail,
      dateOfBirth: new Date(newDob).toISOString(),
    });
    setNewName('');
    setNewEmail('');
    setNewDob('');
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 12, marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Filter by name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load} disabled={loading}>Search</button>
      </div>

      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && <p>No patients yet.</p>}
      <ul>
        {items.map((p) => (
          <li key={p.id}>
            <strong>{p.fullName}</strong>{' '}
            — DOB: {new Date(p.dateOfBirth).toLocaleDateString()} — {p.email}
          </li>
        ))}
      </ul>

      <hr style={{ margin: '16px 0' }} />
      <form onSubmit={addPatient} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <h4>Add Patient</h4>
        <input placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <label>
          Date of Birth:
          <input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)} />
        </label>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default PatientsList;
