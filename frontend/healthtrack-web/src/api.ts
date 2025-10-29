const base = import.meta.env.VITE_API_BASE || "http://localhost:8080";

type FeatureFlags = Record<string, unknown>;

export type Option = { id: string; fullName: string };

export type Patient = {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
};

export type Doctor = {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  providerId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  notes?: string;
};

export type CreatePatientPayload = {
  fullName: string;
  email: string;
  dateOfBirth: string;
};

export type CreateDoctorPayload = {
  fullName: string;
  email: string;
  specialty: string;
};

export type CreateAppointmentPayload = {
  patientId: string;
  providerId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  notes?: string;
};

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(base + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v && v.trim() !== "") url.searchParams.set(k, v);
    });
  }
  return url;
}

async function request<T>(input: RequestInfo, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal });
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body && typeof body.message === "string") message = body.message;
      } catch {}
      throw new Error(message);
    }
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
  } finally {
    clearTimeout(id);
  }
}

export async function getFlags(): Promise<FeatureFlags> {
  return request<FeatureFlags>(base + "/api/feature-flags");
}

/* -------------------- Patients -------------------- */

export async function getPatients(patientName?: string): Promise<Patient[]> {
  const url = buildUrl("/api/patients", { patientName });
  return request<Patient[]>(url.toString());
}

export async function searchPatients(patientName: string, limit = 10): Promise<Option[]> {
  const url = buildUrl("/api/patients", { patientName, limit: String(limit) });
  const data = await request<Patient[]>(url.toString());
  return data.map((p) => ({ id: p.id, fullName: p.fullName }));
}

export async function createPatient(payload: CreatePatientPayload): Promise<Patient> {
  return request<Patient>(base + "/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
export async function updatePatient(id: string, payload: CreatePatientPayload): Promise<Patient> {
  return request<Patient>(base + `/api/patients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deletePatient(id: string): Promise<void> {
  return request<void>(base + `/api/patients/${id}`, {
    method: "DELETE",
  });
}

/* -------------------- Doctors -------------------- */

export async function getDoctors(doctorName?: string): Promise<Doctor[]> {
  const url = buildUrl("/api/doctors", { doctorName });
  return request<Doctor[]>(url.toString());
}

export async function searchDoctors(doctorName: string, limit = 10): Promise<Option[]> {
  const url = buildUrl("/api/doctors", { doctorName, limit: String(limit) });
  const data = await request<Doctor[]>(url.toString());
  return data.map((d) => ({ id: d.id, fullName: d.fullName }));
}

export async function createDoctor(payload: CreateDoctorPayload): Promise<Doctor> {
  return request<Doctor>(base + "/api/doctors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateDoctor(id: string, payload: CreateDoctorPayload): Promise<Doctor> {
  return request<Doctor>(base + `/api/doctors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteDoctor(id: string): Promise<void> {
  return request<void>(base + `/api/doctors/${id}`, {
    method: "DELETE",
  });
}


/* -------------------- Appointments -------------------- */

export async function getAppointments(searchText?: string): Promise<Appointment[]> {
  const url = buildUrl("/api/appointments", { searchText });
  return request<Appointment[]>(url.toString());
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  return request<Appointment>(base + "/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAppointment(id: string, payload: CreateAppointmentPayload): Promise<Appointment> {
  return request<Appointment>(base + `/api/appointments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteAppointment(id: string): Promise<void> {
  return request<void>(base + `/api/appointments/${id}`, {
    method: "DELETE",
  });
}

