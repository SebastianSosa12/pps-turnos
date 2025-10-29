const rawBase = (import.meta.env.VITE_API_BASE as string) || "http://localhost:5000";
const base = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

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

export type AuthResponse = {
  token: string;
  expiresAt: string;
  username: string;
  role: "Admin" | "User";
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role?: "Admin" | "User";
};

const TOKEN_KEY = "auth.token";
const USER_KEY = "auth.user";

function saveSession(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ username: auth.username, role: auth.role, expiresAt: auth.expiresAt })
  );
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): { username: string; role: "Admin" | "User"; expiresAt: string } | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  const exp = Date.parse(user.expiresAt);
  if (Number.isNaN(exp)) return true;
  return Date.now() < exp;
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return !!user && user.role === "Admin";
}

export function getAuthRole(): "Admin" | "User" | null {
  const u = getCurrentUser();
  return u ? u.role : null;
}

export function hasRole(role: "Admin" | "User"): boolean {
  const u = getCurrentUser();
  return !!u && u.role === role;
}

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v && v.trim() !== "") url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

async function request<T>(input: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const token = getToken();
    const headers = new Headers(init?.headers || {});
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(input, {
      ...init,
      headers,
      mode: "cors",
      signal: controller.signal
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (typeof body?.message === "string") message = body.message;
        if (typeof body?.error === "string") message = body.error;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }

    const text = await res.text();
    return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
  } finally {
    clearTimeout(timer);
  }
}

export async function getFlags(): Promise<FeatureFlags> {
  return request<FeatureFlags>(buildUrl("/api/feature-flags"));
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>(buildUrl("/api/auth/token"), {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  saveSession(data);
  return data;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const data = await request<AuthResponse>(buildUrl("/api/auth/register"), {
    method: "POST",
    body: JSON.stringify(payload)
  });
  saveSession(data);
  return data;
}

export async function getPatients(patientName?: string): Promise<Patient[]> {
  return request<Patient[]>(buildUrl("/api/patients", { patientName }));
}

export async function searchPatients(patientName: string, limit = 10): Promise<Option[]> {
  const data = await request<Patient[]>(buildUrl("/api/patients", { patientName, limit: String(limit) }));
  return data.map((p) => ({ id: p.id, fullName: p.fullName }));
}

export async function createPatient(payload: CreatePatientPayload): Promise<Patient> {
  return request<Patient>(buildUrl("/api/patients"), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updatePatient(id: string, payload: CreatePatientPayload): Promise<Patient> {
  return request<Patient>(buildUrl(`/api/patients/${id}`), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deletePatient(id: string): Promise<void> {
  return request<void>(buildUrl(`/api/patients/${id}`), { method: "DELETE" });
}

export async function getDoctors(doctorName?: string): Promise<Doctor[]> {
  return request<Doctor[]>(buildUrl("/api/doctors", { doctorName }));
}

export async function searchDoctors(doctorName: string, limit = 10): Promise<Option[]> {
  const data = await request<Doctor[]>(buildUrl("/api/doctors", { doctorName, limit: String(limit) }));
  return data.map((d) => ({ id: d.id, fullName: d.fullName }));
}

export async function createDoctor(payload: CreateDoctorPayload): Promise<Doctor> {
  return request<Doctor>(buildUrl("/api/doctors"), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateDoctor(id: string, payload: CreateDoctorPayload): Promise<Doctor> {
  return request<Doctor>(buildUrl(`/api/doctors/${id}`), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteDoctor(id: string): Promise<void> {
  return request<void>(buildUrl(`/api/doctors/${id}`), { method: "DELETE" });
}

export async function getAppointments(searchText?: string): Promise<Appointment[]> {
  return request<Appointment[]>(buildUrl("/api/appointments", { searchText }));
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  return request<Appointment>(buildUrl("/api/appointments"), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAppointment(id: string, payload: CreateAppointmentPayload): Promise<Appointment> {
  return request<Appointment>(buildUrl(`/api/appointments/${id}`), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteAppointment(id: string): Promise<void> {
  return request<void>(buildUrl(`/api/appointments/${id}`), { method: "DELETE" });
}
