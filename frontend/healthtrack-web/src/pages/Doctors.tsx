import BackButton from "../components/BackButton";
import DoctorList from "../components/DoctorList";

export default function Doctors() {
  return (
    <div className="space-y-4">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-white">Doctors</h1>
        <p className="text-subtle">Manage your providers.</p>
      </div>
      <div className="card p-4">
        <DoctorList />
      </div>
    </div>
  );
}
