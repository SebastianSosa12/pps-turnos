import { useState } from "react";
import { login } from "../api";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Signing in…");
    try {
      await login(username, password);
      const redirect = (location.state as any)?.from ?? "/patients";
      navigate(redirect, { replace: true });
    } catch (err: any) {
      setStatus("Error: " + (err?.message ?? "Login failed"));
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="text-subtle">Access your HealthTrack workspace.</p>
        </div>

        <form onSubmit={onSubmit} className="card p-4 space-y-3">
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Username</label>
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button className="btn-primary w-full">Sign in</button>
          <div className="text-sm text-white/70">{status}</div>
          <div className="text-sm text-white/70">
            No account? <Link className="text-blue-400 hover:underline" to="/register">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
