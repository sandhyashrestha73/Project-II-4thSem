import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout({ portalLabel, navItems, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-base-border bg-base-surface md:w-64 md:border-b-0 md:border-r">
        <div className="px-6 py-6">
          <p className="text-lg font-extrabold tracking-wide text-white">{portalLabel}</p>
          {user && <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>}
        </div>
        <nav className="flex flex-row flex-wrap gap-1 px-3 pb-4 md:flex-col md:pb-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-base-bg"
                    : "text-slate-300 hover:bg-base-card hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-2 flex flex-col gap-1 border-t border-base-border px-3 py-4">
          <NavLink to="/" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-base-card hover:text-white">
            ← Back to site
          </NavLink>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-base-bg px-4 py-8 md:px-10">{children}</main>
    </div>
  );
}
