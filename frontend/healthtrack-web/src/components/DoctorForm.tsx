import React, { useState } from "react";

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
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" required />
        </div>
        <div>
          <label className="label">Specialty</label>
          <input className="input" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Cardiology" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@clinic.com" required />
        </div>
      </div>
      <button type="submit" className="btn-primary w-full sm:w-auto">Create</button>
    </form>
  );
}
