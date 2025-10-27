import React, { useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import { Search, ListChecks, UserPlus } from "lucide-react";

type Doctor = { id: string | number; fullName: string; email: string; specialty: string };

export default function DoctorsManager() {
  const [items, setItems] = useState<Doctor[]>([]);
  const [q, setQ] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (d) => d.fullName.toLowerCase().includes(s) || d.specialty.toLowerCase().includes(s)
    );
  }, [items, q]);

  function addDoctor(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !specialty) return;
    const next: Doctor = { id: Date.now(), fullName, email, specialty };
    setItems((prev) => [next, ...prev]);
    setFullName("");
    setEmail("");
    setSpecialty("");
  }

  function remove(id: string | number) {
    setItems((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2 md:grid-cols-2">
        
        <div className="space-y-4">
          <SectionTitle icon={ListChecks}>Results</SectionTitle>

          {filtered.length === 0 ? (
            <p className="text-white/80">No doctors yet.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((d) => (
                <li
                  key={d.id}
                  className="rounded-xl border border-white/10 px-3 py-2 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.fullName}</div>
                    <div className="text-mute text-sm truncate">
                      {d.specialty} • {d.email}
                    </div>
                  </div>
                  <button className="btn hover:bg-white/5" onClick={() => remove(d.id)}>
                    Remove
                  </button>
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
              placeholder="Name or specialty"
            />
          </div>

          <Divider label="Add new doctor" />

          <div className="space-y-3">
            <SectionTitle icon={UserPlus}>Create</SectionTitle>
            <form onSubmit={addDoctor} className="space-y-3">
              <div className="grid gap-3">
                <div>
                  <label className="label">Full name</label>
                  <input
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="label">Specialty</label>
                  <input
                    className="input"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@clinic.com"
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
