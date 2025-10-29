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
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-white mb-1">Role</label>
              <div className="relative w-full">
                <select
                  className="ht-dark-select w-full appearance-none bg-[#0b1220] text-white text-center border border-white/20 rounded-md px-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-white/40"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "Admin" | "User")}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70">▾</span>
              </div>
            </div>
          </div>
          <button className="btn-primary w-full">Create account</button>
          <div className="text-sm text-white/70">{status}</div>
          <div className="text-sm text-white/70">
            Already have an account?{" "}
            <Link className="text-blue-400 hover:underline" to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        .ht-dark-select, .ht-dark-select option { background-color: #0b1220; color: #ffffff; }
        .ht-dark-select option { text-align: center; }
        .ht-dark-select:focus { outline: none; }
      `}</style>
    </div>
  );
}
