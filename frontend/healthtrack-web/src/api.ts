const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export async function getFlags() {
  const res = await fetch(base + '/api/feature-flags');
  if (!res.ok) return {};
  return res.json();
}

export async function getPatients(q?: string) {
  const url = new URL(base + '/api/patients');
  if (q) url.searchParams.set('q', q);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function createPatient(payload: { fullName: string; email: string; dateOfBirth: string }) {
  const res = await fetch(base + '/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create patient');
  return res.json();
}

export async function createAppointment(payload: {
  patientId: string;
  providerId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  notes?: string;
}) {
  const res = await fetch(base + '/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create appointment');
  return res.json();
}
