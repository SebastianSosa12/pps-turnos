import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-subtle hover:text-white transition"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
}
