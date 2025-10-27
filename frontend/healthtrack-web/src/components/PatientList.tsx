import React, { useEffect, useState, useRef } from "react";
import { getPatients, createPatient } from "../api";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import { Search, ListChecks, UserPlus } from "lucide-react";

function PatientsList() {
  const [patientName, setPatientName] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [status, setStatus] = useState("");
  const typingTimeout = useRef<number | null>(null);

  async function load(query: string) {
    const data = await getPatients(query);
    setItems(data);
  }

  async function addPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !dateOfBirth) {
      setStatus("Please complete all required fields before adding a patient.");
      return;
    }
    setStatus("Submitting…");
    try {
      await createPatient({
        fullName,
        email,
        dateOfBirth: new Date(dateOfBirth).toISOString(),
      });
      setStatus("Added!");
      setFullName("");
      setEmail("");
      setDateOfBirth("");
      await load(patientName);
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  }

  useEffect(() => {
    load("");
  }, []);

  useEffect(() => {
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      load(patientName);
    }, 400);
  }, [patientName]);

  const canAdd = !!fullName && !!email && !!dateOfBirth;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle icon={ListChecks}>Results</SectionTitle>
        <div className="flex items-end gap-3 flex-1 justify-end min-w-[280px]">
          <SectionTitle icon={Search}>Filter</SectionTitle>
          <div className="w-full max-w-sm">
            <SearchBar
              value={patientName}
              onChange={setPatientName}
              placeholder="Search by name or email"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-white/80">No patients yet.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((p) => {
                const d = new Date(p.dateOfBirth);
                const dob = isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
                return (
                  <li
                    key={p.id}
                    className="rounded-xl border border-white/10 px-3 py-2 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.fullName}</div>
                      <div className="text-mute text-sm truncate">{p.email}</div>
                    </div>
                    <div className="text-sm text-white/70 ml-4 shrink-0">
                      {dob}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <Divider label="Add a Patient" />
          <div className="space-y-3">
            <SectionTitle icon={UserPlus}>Add</SectionTitle>
            <form onSubmit={addPatient} className="space-y-3">
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Full name</label>
                  <input
                    className="input"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Email</label>
                  <input
                    className="input"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Date of Birth</label>
                  <input
                    className="input"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type={canAdd ? "submit" : "button"}
                  onClick={
                    !canAdd
                      ? () =>
                        setStatus(
                          "Please complete all required fields before adding a patient."
                        )
                      : undefined
                  }
                  className={`btn-primary w-full flex justify-center ${
                    !canAdd ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Add
                </button>
                <span className="text-sm text-white/70">{status}</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientsList;
