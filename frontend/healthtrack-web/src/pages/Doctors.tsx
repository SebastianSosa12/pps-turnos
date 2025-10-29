import React from "react";
import BackButton from "../components/BackButton";
import DoctorsManager from "../components/DoctorsManager";

export default function Doctors() {
  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-white">Doctors</h1>
        <p className="text-subtle">Manage your providers.</p>
      </div>
      <DoctorsManager />
    </div>
  );
}
