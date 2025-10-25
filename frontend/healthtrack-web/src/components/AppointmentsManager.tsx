import React, { useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import AppointmentForm from "./AppointmentForm";
import { Search, ListChecks, CalendarPlus } from "lucide-react";

type Appointment = {
  id: string | number;
  patientId: string;
  providerId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

type Props = { notesEnabled: boolean };

export default function AppointmentsManager({ notesEnabled }: Props) {
  const [items] = useState<Appointment[]>([]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (a) =>
        a.patientId.toLowerCase().includes(s) ||
        a.providerId.toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <div className="space-y-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle icon={ListChecks}>Results</SectionTitle>

          {filtered.length === 0 ? (
            <p className="text-white/80">No appointments yet.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-white/10 px-3 py-2"
                >
                  <div className="font-medium">
                    Patient {a.patientId} • Doctor {a.providerId}
                  </div>
                  <div className="text-mute text-sm">
                    {new Date(a.startsAtUtc).toLocaleString()} —{" "}
                    {new Date(a.endsAtUtc).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <SectionTitle icon={Search}>Filter</SectionTitle>
            <SearchBar
              value={q}
              onChange={setQ}
              onSearch={() => {}}
              placeholder="Patient or doctor id"
            />
          </div>

          <Divider label="Create appointment" />

          <div className="space-y-3">
            <SectionTitle icon={CalendarPlus}>Create</SectionTitle>
            <AppointmentForm notesEnabled={notesEnabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
