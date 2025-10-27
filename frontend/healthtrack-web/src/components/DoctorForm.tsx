import React, { useState } from "react";
import { UserPlus } from "lucide-react";

export default function DoctorForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFullName("");
    setEmail("");
    setSpecialty("");
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label text-white">Full Name</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="label text-white">Specialty</label>
          <input
            className="input"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Cardiology"
            autoComplete="organization-title"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label text-white">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@clinic.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <button type="submit" className="btn-primary w-full sm:w-auto inline-flex items-center gap-2">
        <UserPlus size={16} />
        Add
      </button>
    </form>
  );
}
