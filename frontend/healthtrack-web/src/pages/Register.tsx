import { useState } from "react";
import { register } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "User">("User");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating account…");
    try {
      await register({ username, email, password, role });
      navigate("/patients", { replace: true });
    } catch (err: any) {
      setStatus("Error: " + (err?.message ?? "Register failed"));
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-subtle">Start using HealthTrack in seconds.</p>
        </div>

        <form onSubmit={onSubmit} className="card p-4 space-y-3">
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Username</label>
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value as "Admin" | "User")}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <button className="btn-primary w-full">Create account</button>
          <div className="text-sm text-white/70">{status}</div>
          <div className="text-sm text-white/70">
            Already have an account? <Link className="text-blue-400 hover:underline" to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
