import React, { useState, useRef } from "react";
import { createAppointment, searchDoctors, searchPatients } from "../api";
import AutocompleteSelect from "../components/AutocompleteSelect";
import DatePicker from "../components/DatePicker";
import TimePicker from "../components/TimePicker";

function AppointmentForm({
                           notesEnabled,
                           onCreated,
                         }: {
  notesEnabled: boolean;
  onCreated?: () => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  const patientRef = useRef<{ reset?: () => void }>(null);
  const doctorRef = useRef<{ reset?: () => void }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !providerId || !dateStr || !timeStr) {
      setStatus("Please complete all required fields before creating an appointment.");
      return;
    }

    const startLocal = new Date(`${dateStr}T${timeStr}`);
    const endLocal = new Date(startLocal.getTime() + 30 * 60 * 1000);

    setStatus("Submitting…");
    try {
      await createAppointment({
        patientId,
        providerId,
        startsAtUtc: startLocal.toISOString(),
        endsAtUtc: endLocal.toISOString(),
        notes: notesEnabled ? notes : undefined,
      });

      setStatus("Created!");
      setPatientId("");
      setProviderId("");
      setDateStr("");
      setTimeStr("");
      setNotes("");

      patientRef.current?.reset?.();
      doctorRef.current?.reset?.();

      onCreated?.();
    } catch (e: any) {
      setStatus("Error: " + e.message);
    }
  }

  const canCreate = !!patientId && !!providerId && !!dateStr && !!timeStr;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <AutocompleteSelect
            ref={patientRef}
            label="Patient"
            placeholder="Search by first or last name"
            fetcher={(q) => searchPatients(q, 10)}
            onSelect={(opt) => setPatientId(opt.id)}
            className="input"
          />
        </div>

        <div>
          <AutocompleteSelect
            ref={doctorRef}
            label="Doctor"
            placeholder="Search by first or last name"
            fetcher={(q) => searchDoctors(q, 10)}
            onSelect={(opt) => setProviderId(opt.id)}
            className="input"
          />
        </div>

        <div>
          <label className="label">Date</label>
          <DatePicker
            value={dateStr}
            onChange={(v) => setDateStr(v)}
            placeholder="Select Date"
            className="input"
          />
        </div>

        <div>
          <label className="label">Time</label>
          <TimePicker
            value={timeStr}
            onChange={(v) => setTimeStr(v)}
            minuteStep={5}
            placeholder="Select Time"
            className="input"
          />
        </div>

        {notesEnabled && (
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this appointment"
            />
          </div>
        )}
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg px-3 text-sm text-white/70">Confirm appointment</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type={canCreate ? "submit" : "button"}
          onClick={
            !canCreate
              ? () =>
                setStatus(
                  "Please complete all required fields before creating an appointment."
                )
              : undefined
          }
          className={`btn-primary w-full sm:w-auto ${
            !canCreate ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Create
        </button>
        <span className="text-sm text-white/70">{status}</span>
      </div>
    </form>
  );
}

export default AppointmentForm;
