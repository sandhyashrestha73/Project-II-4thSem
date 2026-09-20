import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/packages", label: "Packages" },
  { to: "/blog", label: "Blog" },
  { to: "/gallery", label: "Gallery" },
];

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const dashboardPath = role === "agency" ? "/agency/dashboard" : role === "admin" ? "/admin/dashboard" : null;

  return (
    <header className="sticky top-0 z-40 border-b border-base-border bg-base-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <NavLink to="/" className="text-xl font-extrabold tracking-tight text-text-main">
          Tour<span className="text-accent-secondary">Ease</span>
        </NavLink>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-accent-secondary" : "text-text-muted hover:text-text-main"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!user && (
            <>
              <NavLink to="/login" className="text-sm font-medium text-text-muted hover:text-text-main">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn-primary px-4 py-2 text-sm">
                Sign up
              </NavLink>
            </>
          )}
          {user && role === "tourist" && (
            <>
              <NavLink to="/my-bookings" className="text-sm font-medium text-text-muted hover:text-text-main">
                My Bookings
              </NavLink>
              <button onClick={handleLogout} className="btn-secondary px-4 py-2 text-sm">
                Log out
              </button>
            </>
          )}
          {user && dashboardPath && (
            <>
              <NavLink to={dashboardPath} className="text-sm font-medium text-text-muted hover:text-text-main">
                Dashboard
              </NavLink>
              <button onClick={handleLogout} className="btn-secondary px-4 py-2 text-sm">
                Log out
              </button>
            </>
          )}
        </div>

        <button
          className="text-2xl text-text-main md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-base-border bg-base-surface px-4 py-4 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-text-main hover:bg-base-card"
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-base-border pt-3">
            {!user && (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className="btn-secondary w-full">
                  Log in
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Sign up
                </NavLink>
              </>
            )}
            {user && (
              <>
                {role === "tourist" && (
                  <NavLink to="/my-bookings" onClick={() => setOpen(false)} className="btn-secondary w-full">
                    My Bookings
                  </NavLink>
                )}
                {dashboardPath && (
                  <NavLink to={dashboardPath} onClick={() => setOpen(false)} className="btn-secondary w-full">
                    Dashboard
                  </NavLink>
                )}
                <button onClick={handleLogout} className="btn-primary w-full">
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}