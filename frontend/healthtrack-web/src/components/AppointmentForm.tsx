import React, { useState } from "react";
import { createAppointment } from "../api";
import SectionTitle from "./SectionTitle";
import { CalendarClock } from "lucide-react";

function AppointmentForm({ notesEnabled }: { notesEnabled: boolean }) {
  const [patientId, setPatientId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Submitting…");
    try {
      await createAppointment({
        patientId,
        providerId,
        startsAtUtc: new Date(startsAt).toISOString(),
        endsAtUtc: new Date(endsAt).toISOString(),
        notes: notesEnabled ? notes : undefined,
      });
      setStatus("Created!");
    } catch (e: any) {
      setStatus("Error: " + e.message);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      
      <div className="grid gap-2 md:grid-cols-2">
      <div>
          <label className="label">Patient Id</label>
          <input
            className="input"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Doctor Id</label>
          <input
            className="input"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Starts at (UTC)</label>
          <input
            className="input"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Ends at (UTC)</label>
          <input
            className="input"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
          />
        </div>
        {notesEnabled && (
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg px-3 text-sm text-white/70">
            Confirm appointment
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary w-full sm:w-auto">
          Create
        </button>
        <span className="text-sm text-white/70">{status}</span>
      </div>
    </form>
  );
}

export default AppointmentForm;
