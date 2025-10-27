import React, { useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import AppointmentForm from "./AppointmentForm";
import { Search, ListChecks, CalendarPlus } from "lucide-react";
import { getAppointments, getDoctors, getPatients, type Appointment, type Doctor, type Patient } from "../api";

type Props = { notesEnabled: boolean };

export default function AppointmentsManager({ notesEnabled }: Props) {
  const [items, setItems] = useState<Appointment[]>([]);
  const [patientById, setPatientById] = useState<Record<string, Patient>>({});
  const [doctorById, setDoctorById] = useState<Record<string, Doctor>>({});
  const [q, setQ] = useState("");
  const typingTimeout = useRef<number | null>(null);

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
                const p = patientById[a.patientId] as Patient | undefined;
                const d = doctorById[a.providerId] as Doctor | undefined;
                const start = new Date(a.startsAtUtc);
                const end = new Date(a.endsAtUtc);
                const title =
                  `Patient: ${p ? p.fullName : a.patientId} \u2014 ` +
                  `Doctor: ${d ? d.fullName : a.providerId}${d?.specialty ? `, ${d.specialty}` : ""}`;
                const dateLine = `Date: ${start.toLocaleDateString()} • Time: ${start.toLocaleTimeString()}–${end.toLocaleTimeString()}`;
                return (
                  <li key={a.id} className="rounded-xl border border-white/10 px-3 py-2">
                    <div className="font-medium">{title}</div>
                    <div className="text-mute text-sm">{dateLine}</div>
                    {a.notes ? <div className="text-sm text-white/70 mt-1">{a.notes}</div> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <SectionTitle icon={Search}>Filter</SectionTitle>
            <SearchBar
              value={q}
              onChange={setQ}
              placeholder="Search by patient, doctor or notes"
            />
          </div>

          <Divider label="Create appointment" />

          <div className="space-y-3">
            <SectionTitle icon={CalendarPlus}>Create</SectionTitle>
            <AppointmentForm notesEnabled={notesEnabled} onCreated={() => load(q)} />
          </div>
        </div>
      </div>
    </div>
  );
}
