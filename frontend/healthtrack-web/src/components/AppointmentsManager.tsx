import React, { useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import AppointmentForm from "./AppointmentForm";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import { Search, ListChecks, CalendarPlus, X, Pencil } from "lucide-react";
import {
  getAppointments,
  getDoctors,
  getPatients,
  updateAppointment,
  deleteAppointment,
  getAuthRole,
  type Appointment,
  type Doctor,
  type Patient,
} from "../api";

type Props = { notesEnabled: boolean };

export default function AppointmentsManager({ notesEnabled }: Props) {
  const [items, setItems] = useState<Appointment[]>([]);
  const [patientById, setPatientById] = useState<Record<string, Patient>>({});
  const [doctorById, setDoctorById] = useState<Record<string, Doctor>>({});
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const typingTimeout = useRef<number | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const role = getAuthRole();
  const isAdmin = role === "Admin";

  async function loadLookups() {
    const [patients, doctors] = await Promise.all([getPatients(), getDoctors()]);
    const pMap: Record<string, Patient> = {};
    const dMap: Record<string, Doctor> = {};
    for (const p of patients) pMap[p.id] = p;
    for (const d of doctors) dMap[d.id] = d;
    setPatientById(pMap);
    setDoctorById(dMap);
  }

  async function load(query: string) {
    const data = await getAppointments(query);
    setItems(data);
  }

  useEffect(() => {
    loadLookups();
    load("");
  }, []);

  useEffect(() => {
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => load(q), 400);
  }, [q]);

  function beginEdit(a: Appointment) {
    if (!isAdmin) return;
    setEditingId(a.id);
    const start = new Date(a.startsAtUtc);
    const dateStr = start.toISOString().slice(0, 10);
    const hh = String(start.getHours()).padStart(2, "0");
    const mm = String(start.getMinutes()).padStart(2, "0");
    setEditDate(dateStr);
    setEditTime(`${hh}:${mm}`);
    setEditNotes(a.notes ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDate("");
    setEditTime("");
    setEditNotes("");
    setStatus("");
  }

  async function saveEdit(a: Appointment) {
    if (!isAdmin) return;
    if (!editingId || !editDate || !editTime) return;
    setStatus("Submitting…");
    try {
      const startLocal = new Date(`${editDate}T${editTime}`);
      const endLocal = new Date(startLocal.getTime() + 30 * 60 * 1000);
      await updateAppointment(editingId, {
        patientId: a.patientId,
        providerId: a.providerId,
        startsAtUtc: startLocal.toISOString(),
        endsAtUtc: endLocal.toISOString(),
        notes: notesEnabled ? editNotes : undefined,
      });
      setStatus("Saved!");
      cancelEdit();
      await load(q);
    } catch (err: any) {
      setStatus("Error: " + (err?.message ?? "Update failed"));
    }
  }

  async function remove(id: string) {
    if (!isAdmin) return;
    setStatus("Submitting…");
    try {
      await deleteAppointment(id);
      setStatus("Deleted!");
      await load(q);
    } catch (err: any) {
      setStatus("Error: " + (err?.message ?? "Delete failed"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle icon={ListChecks}>Results</SectionTitle>

          {items.length === 0 ? (
            <p className="text-white/80">No appointments yet.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((a) => {
                const p = patientById[a.patientId];
                const d = doctorById[a.providerId];
                const start = new Date(a.startsAtUtc);
                const end = new Date(a.endsAtUtc);
                const title =
                  `Patient: ${p ? p.fullName : a.patientId} \u2014 ` +
                  `Doctor: ${d ? d.fullName : a.providerId}${d?.specialty ? `, ${d.specialty}` : ""}`;
                const dateLine = `Date: ${start.toLocaleDateString()} • Time: ${start.toLocaleTimeString()}–${end.toLocaleTimeString()}`;
                const isEditing = editingId === a.id;

                return (
                  <li key={a.id} className="rounded-xl border border-white/10 px-3 py-2">
                    {!isEditing ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium">{title}</div>
                          <div className="text-mute text-sm">{dateLine}</div>
                          {a.notes ? <div className="text-sm text-white/70 mt-1">{a.notes}</div> : null}
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              className="p-2 rounded-lg border border-white/10 hover:bg-white/10"
                              title="Edit"
                              onClick={() => beginEdit(a)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="p-2 rounded-lg border border-white/10 hover:bg-white/10"
                              title="Delete"
                              onClick={() => remove(a.id)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      isAdmin && (
                        <div className="space-y-2">
                          <div className="grid gap-2 md:grid-cols-3">
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">Date</label>
                              <DatePicker
                                value={editDate}
                                onChange={setEditDate}
                                placeholder="Select Date"
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">Time</label>
                              <TimePicker
                                value={editTime}
                                onChange={setEditTime}
                                minuteStep={5}
                                placeholder="Select Time"
                                className="input"
                              />
                            </div>
                            {notesEnabled && (
                              <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-white mb-1">Notes</label>
                                <input
                                  className="input"
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Notes"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => saveEdit(a)} className="btn-primary px-4 py-2">Save</button>
                            <button onClick={cancelEdit} className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10">Cancel</button>
                          </div>
                        </div>
                      )
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-end gap-3">
            <SectionTitle icon={Search}>Filter</SectionTitle>
            <div className="w-full max-w-[680px]">
              <SearchBar
                value={q}
                onChange={setQ}
                placeholder="Search by patient, doctor, specialty or notes"
              />
            </div>
          </div>

          {isAdmin && <Divider label="Create appointment" />}

          {isAdmin && (
            <div className="space-y-3">
              <SectionTitle icon={CalendarPlus}>Create</SectionTitle>
              <AppointmentForm notesEnabled={notesEnabled} onCreated={() => load(q)} />
              <div className="text-sm text-white/70">{status}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
