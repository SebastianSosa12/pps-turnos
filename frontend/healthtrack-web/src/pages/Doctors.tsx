import BackButton from "../components/BackButton";
import DoctorsManager from "../components/DoctorsManager";

export default function Doctors() {
  return (
    <div className="space-y-4">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-white">Doctors</h1>
        <p className="text-subtle">Manage your doctors directory and specialties.</p>
      </div>
      <div className="card p-4">
        <DoctorsManager />
      </div>
    </div>
  );
}
