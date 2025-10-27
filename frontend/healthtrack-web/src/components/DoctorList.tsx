import { useEffect, useState, useRef } from "react";
import { getDoctors, createDoctor } from "../api";
import SectionTitle from "./SectionTitle";
import SearchBar from "./SearchBar";
import Divider from "./Divider";
import { Search, ListChecks, UserPlus } from "lucide-react";

export default function DoctorList() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [status, setStatus] = useState("");
  const typingTimeout = useRef<number | null>(null);

  async function load(query: string) {
    const data = await getDoctors(query);
    setItems(data);
  }

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

  useEffect(() => {
    load("");
  }, []);

  useEffect(() => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      load(q);
    }, 400);
  }, [q]);

  const canAdd = !!fullName && !!email && !!specialty;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle icon={ListChecks}>Results</SectionTitle>
          {items.length === 0 ? (
            <p className="text-white/80">No doctors yet.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((d) => (
                <li
                  key={d.id}
                  className="rounded-xl border border-white/10 px-3 py-2 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.fullName}</div>
                    <div className="text-mute text-sm truncate">{d.email}</div>
                  </div>
                  <div className="text-sm text-white/70 ml-4 shrink-0">
                    {d.specialty || "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle icon={Search}>Filter</SectionTitle>
            <div className="flex-1 min-w-[250px] max-w-sm">
              <SearchBar
                value={q}
                onChange={setQ}
                placeholder="Search by name, specialty, or email"
              />
            </div>
          </div>

          <Divider label="Add a Doctor" />

          <div className="space-y-3">
            <SectionTitle icon={UserPlus}>Add</SectionTitle>
            <div className="card p-4 space-y-3">
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
                        ? () =>
                          setStatus(
                            "Please complete all required fields before adding a doctor."
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
    </div>
  );
}
