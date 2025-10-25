import BackButton from "../components/BackButton";
import AppointmentsManager from "../components/AppointmentsManager";

type Props = { notesEnabled: boolean };

export default function Appointments({ notesEnabled }: Props) {
  return (
    <div className="space-y-4">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-subtle">Schedule and track visits.</p>
      </div>
      <div className="card p-4">
        <AppointmentsManager notesEnabled={notesEnabled} />
      </div>
    </div>
  );
}
