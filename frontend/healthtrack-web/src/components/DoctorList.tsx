import React, { useMemo, useState } from "react";

type Doctor = {
  id: string | number;
  fullName: string;
  email: string;
  specialty: string;
};

export default function DoctorList() {
  const [items, setItems] = useState<Doctor[]>([]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(d => d.fullName.toLowerCase().includes(s) || d.specialty.toLowerCase().includes(s));
  }, [items, q]);

  function remove(id: string | number) {
    setItems(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="label">Search</label>
          <input className="input" placeholder="Name or specialty" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button className="btn-primary">Search</button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-white/80">No doctors yet.</div>
      ) : (
        <ul className="space-y-2">
          {filtered.map(d => (
            <li key={d.id} className="rounded-xl border border-white/10 px-3 py-2 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{d.fullName}</div>
                <div className="text-mute text-sm truncate">{d.specialty} • {d.email}</div>
              </div>
              <button className="btn hover:bg-white/5" onClick={() => remove(d.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
