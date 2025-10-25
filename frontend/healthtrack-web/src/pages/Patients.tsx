import BackButton from "../components/BackButton";
import PatientsList from "../components/PatientList";

export default function Patients() {
  return (
    <div className="space-y-4">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-white">Patients</h1>
        <p className="text-subtle">Manage your patient directory.</p>
      </div>

      <div className="card p-4">
        <PatientsList />
      </div>
    </div>
  );
}
