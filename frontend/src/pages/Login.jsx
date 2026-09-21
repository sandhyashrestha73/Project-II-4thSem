import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../components/ErrorMessage";

const roles = [
  { key: "tourist", label: "Traveler" },
  { key: "agency", label: "Agency" },
  { key: "admin", label: "Admin" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("tourist");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));
  }

  // Change role and clear previous login information
  function changeRole(newRole) {
    setRole(newRole);

    // Clear email and password
    setForm({
      email: "",
      password: "",
    });

    // Hide password again
    setShowPassword(false);

    // Clear previous error
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const sessionUser = await login(
        role,
        form.email,
        form.password
      );

      const redirectTo =
        location.state?.from?.pathname ||
        (sessionUser.role === "agency"
          ? "/agency/dashboard"
          : sessionUser.role === "admin"
          ? "/admin/dashboard"
          : "/");

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          "Invalid email or password."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] md:grid-cols-2">

      {/* Left Section */}
      <div className="hidden bg-gradient-to-br from-base-surface via-base-card to-base-bg md:flex md:items-center md:justify-center">
        <div className="max-w-sm px-10 text-center">
          <p className="text-3xl font-extrabold text-white">
            Tour<span className="text-accent">Ease</span> Nepal
          </p>

          <p className="mt-4 text-slate-400">
            Sign in to book packages, manage your agency listings,
            or moderate the platform.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center px-4 py-16 md:px-10">
        <div className="w-full max-w-md">

          <p className="text-2xl font-bold text-white">
            Log in
          </p>

          <p className="mt-1 text-slate-400">
            Welcome back
          </p>

          {/* Role Selection */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => changeRole(r.key)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  role === r.key
                    ? "bg-accent text-base-bg"
                    : "border border-base-border bg-base-surface text-slate-300 hover:border-accent/50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
            autoComplete="off"
          >

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                required
                name={`login-email-${role}`}
                autoComplete="off"
                className="input-field"
                value={form.email}
                onChange={(e) =>
                  update("email", e.target.value)
                }
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">
                Password
              </label>

              {/* Password input + eye button */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  name={`login-password-${role}`}
                  autoComplete="new-password"
                  className="input-field pr-12"
                  value={form.password}
                  onChange={(e) =>
                    update("password", e.target.value)
                  }
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-white"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to={`/forgot-password?role=${role}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting
                ? "Logging in..."
                : "Log in"}
            </button>
          </form>

          {/* Register */}
          <p className="mt-6 text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-accent hover:underline"
            >
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}