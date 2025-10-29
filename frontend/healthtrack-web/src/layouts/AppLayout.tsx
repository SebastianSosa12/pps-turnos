import { PropsWithChildren, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, Home as HomeIcon, Users, CalendarClock, Stethoscope, FileBarChart2, LogOut } from "lucide-react";
import { getCurrentUser, isAuthenticated, logout } from "../api";

function NavItem({ to, children, icon: Icon }: { to: string; children: string; icon: any }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl px-4 py-3 text-lg transition-all duration-200",
          "border-l-4",
          isActive
            ? "bg-blue-600/20 text-white font-semibold border-blue-400 shadow-md shadow-blue-900/30"
            : "text-gray-400 hover:text-white hover:bg-white/5 hover:border-blue-400/40 hover:translate-x-0.5 border-transparent",
        ].join(" ")
      }
    >
      <Icon className="w-6 h-6" />
      <span>{children}</span>
    </NavLink>
  );
}

export default function AppLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(true);
  const sidebarWidth = open ? "220px 1fr" : "0 1fr";
  const authed = isAuthenticated();
  const user = getCurrentUser();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: sidebarWidth }}>
      <aside className={`sticky top-0 h-screen overflow-y-auto transition-all duration-300 ${open ? "border-r border-white/5 shadow-xl shadow-black/30" : ""}`}>
        <div className="h-16 flex items-center px-4 text-white font-semibold text-xl">HealthTrack</div>
        <nav className="px-2 space-y-1">
          <NavItem to="/" icon={HomeIcon}>Home</NavItem>
          <NavItem to="/doctors" icon={Stethoscope}>Doctors</NavItem>
          <NavItem to="/patients" icon={Users}>Patients</NavItem>
          <NavItem to="/appointments" icon={CalendarClock}>Appointments</NavItem>
          <NavItem to="/reports" icon={FileBarChart2}>Reports</NavItem>
        </nav>
      </aside>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-bg/70 backdrop-blur border-b border-white/5 h-16 flex items-center justify-between px-4">
          <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition" onClick={() => setOpen((v) => !v)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            {!authed ? (
              <>
                <Link to="/login" className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-300">{user?.username} • {user?.role}</div>
                <button onClick={onLogout} className="p-2 rounded-lg border border-white/10 hover:bg-white/10">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </header>

        <main className="p-6">
          <div className="container-page">{children}</div>
        </main>
      </div>
    </div>
  );
}
