import React, { useEffect, useRef, useState } from "react";
import { getDoctors, createDoctor, updateDoctor, deleteDoctor, type Doctor } from "../api";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import { Search, ListChecks, UserPlus, X, Pencil } from "lucide-react";

export default function DoctorsManager() {
  const [items, setItems] = useState<Doctor[]>([]);
  const [q, setQ] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [status, setStatus] = useState("");
  const typingTimeout = useRef<number | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");

  async function load(query: string) {
    const data = await getDoctors(query);
    setItems(data);
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

  async function addDoctor(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !specialty) {
      setStatus("Please complete all required fields before adding a doctor.");
      return;
    }
    setStatus("Submitting…");
    try {
      await createDoctor({ fullName, email, specialty });
      setStatus("Added!");
      setFullName("");
      setEmail("");
      setSpecialty("");
      await load(q);
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  }

  function startEdit(d: Doctor) {
    setEditingId(d.id);
    setEditFullName(d.fullName ?? "");
    setEditEmail(d.email ?? "");
    setEditSpecialty(d.specialty ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFullName("");
    setEditEmail("");
    setEditSpecialty("");
  }

  async function saveEdit() {
    if (!editingId || !editFullName || !editEmail || !editSpecialty) {
      setStatus("Please complete all required fields before saving.");
      return;
    }
    setStatus("Submitting…");
    try {
      await updateDoctor(editingId, {
        fullName: editFullName,
        email: editEmail,
        specialty: editSpecialty,
      });
      setStatus("Saved!");
      cancelEdit();
      await load(q);
    } catch (err: any) {
      setStatus("Error: " + (err?.message ?? "Update failed"));
    }
  }

  async function onDelete(id: string) {
    setStatus("Submitting…");
    try {
      await deleteDoctor(id);
      setStatus("Deleted!");
      await load(q);
    } catch (err: any) {
      setStatus("Error: " + (err?.message ?? "Delete failed"));
    }
  }

  const canAdd = !!fullName && !!email && !!specialty;

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
              placeholder="Search by name, specialty, or email"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-white/80">No doctors yet.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((d) => {
                const isEditing = editingId === d.id;
                return (
                  <li key={d.id} className="rounded-xl border border-white/10 px-3 py-2">
                    {!isEditing ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{d.fullName}</div>
                          <div className="text-mute text-sm truncate">{d.email}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-sm text-white/70 mr-1 min-w-[110px] text-right">
                            {d.specialty || "—"}
                          </div>
                          <button
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/10"
                            title="Edit"
                            onClick={() => startEdit(d)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/10"
                            title="Delete"
                            onClick={() => onDelete(d.id)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid gap-2 md:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">Full name</label>
                            <input
                              className="input"
                              value={editFullName}
                              onChange={(e) => setEditFullName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">Email</label>
                            <input
                              className="input"
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">Specialty</label>
                            <input
                              className="input"
                              value={editSpecialty}
                              onChange={(e) => setEditSpecialty(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={saveEdit} className="btn-primary px-4 py-2">Save</button>
                          <button onClick={cancelEdit} className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10">Cancel</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="text-sm text-white/70">{status}</div>
        </div>

        <div className="space-y-6">
          <Divider label="Add a Doctor" />
          <div className="space-y-3">
            <SectionTitle icon={UserPlus}>Add</SectionTitle>
            <form onSubmit={addDoctor} className="space-y-3">
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Full name</label>
                  <input
                    className="input"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Email</label>
                  <input
                    className="input"
                    placeholder="jane@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Specialty</label>
                  <input
                    className="input"
                    placeholder="Cardiology"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    autoComplete="organization-title"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type={canAdd ? "submit" : "button"}
                  onClick={
                    !canAdd
                      ? () => setStatus("Please complete all required fields before adding a doctor.")
                      : undefined
                  }
                  className={`btn-primary w-full flex justify-center ${!canAdd ? "opacity-50 cursor-not-allowed" : ""}`}
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
