import { Users, CalendarClock, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-10">
      <header className="relative text-center py-14">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_400px_at_20%_0%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(700px_460px_at_80%_0%,rgba(30,64,175,0.22),transparent_60%)]" />
        <h1 className="text-4xl font-bold text-white">Welcome to HealthTrack</h1>
        <p className="text-subtle max-w-2xl mx-auto mt-3">
          HealthTrack is a learning project designed as a mentorship experience for a junior developer. It simulates a real-world health management system, allowing you to manage patients, appointments and doctors while applying best practices in modern web development.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/patients" className="btn-primary">Get Started</Link>
          <Link to="/appointments" className="btn hover:bg-white/5">See Appointments</Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Doctors</h3>
          </div>
          <p className="text-subtle">
            Manage doctors, specialties and availability.
          </p>
        </div>
        
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Patients</h3>
          </div>
          <p className="text-subtle">
            Create, list, update and delete patient records.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Appointments</h3>
          </div>
          <p className="text-subtle">
            Schedule appointments between patients and doctors.
          </p>
        </div>
        
      </section>
    </div>
  );
}
