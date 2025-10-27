import React, { useEffect, useState, useRef } from "react";
import { getPatients, createPatient } from "../api";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import { Search, ListChecks, UserPlus } from "lucide-react";

function PatientsList() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDob, setNewDob] = useState("");
  const [status, setStatus] = useState("");
  const typingTimeout = useRef<number | null>(null);

  async function load(query: string) {
    const data = await getPatients(query);
    setItems(data);
  }

  async function addPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newEmail || !newDob) {
      setStatus("Please complete all required fields before adding a patient.");
      return;
    }
    setStatus("Submitting…");
    try {
      await createPatient({
        fullName: newName,
        email: newEmail,
        dateOfBirth: new Date(newDob).toISOString(),
      });
      setStatus("Added!");
      setNewName("");
      setNewEmail("");
      setNewDob("");
      await load(q);
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
      load(q);
    }, 400);
  }, [q]);

  const canAdd = !!newName && !!newEmail && !!newDob;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle icon={ListChecks}>Results</SectionTitle>
        <div className="flex items-end gap-3 flex-1 justify-end min-w-[280px]">
          <SectionTitle icon={Search}>Filter</SectionTitle>
          <div className="w-full max-w-sm">
            <SearchBar
              value={q}
              onChange={setQ}
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
                  <label className="label">Full name</label>
                  <input
                    className="input"
                    placeholder="John Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    placeholder="john@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input
                    className="input"
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
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
