import React, { useEffect, useState } from "react";
import { getPatients, createPatient } from "../api";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import { Search, ListChecks, UserPlus } from "lucide-react";

function PatientsList() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDob, setNewDob] = useState("");

  async function load() {
    setLoading(true);
    try {
      setItems(await getPatients(q));
    } finally {
      setLoading(false);
    }
  }

  async function addPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newEmail || !newDob) return;
    await createPatient({
      fullName: newName,
      email: newEmail,
      dateOfBirth: new Date(newDob).toISOString(),
    });
    setNewName("");
    setNewEmail("");
    setNewDob("");
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle icon={ListChecks}>Results</SectionTitle>

          {loading && <p className="text-mute">Loading…</p>}
          {!loading && items.length === 0 && (
            <p className="text-white/80">No patients yet.</p>
          )}
          {!loading && items.length > 0 && (
            <ul className="space-y-2">
              {items.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-white/10 px-3 py-2 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.fullName}</div>
                    <div className="text-mute text-sm truncate">{p.email}</div>
                  </div>
                  <div className="text-sm text-white/70 ml-4 shrink-0">
                    {new Date(p.dateOfBirth).toLocaleDateString()}
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
              onSearch={load}
              placeholder="Filter by name"
              disabled={loading}
            />
          </div>

          <Divider label="Add new patient" />

          <div className="space-y-3">
            <SectionTitle icon={UserPlus}>Create</SectionTitle>
            <form onSubmit={addPatient} className="space-y-3">
              <div className="grid gap-3">
                <div>
                  <label className="label">Full name</label>
                  <input
                    className="input"
                    placeholder="John Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
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
              <button type="submit" className="btn-primary w-full">
                Create
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientsList;
