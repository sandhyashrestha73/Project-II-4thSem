import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../components/ErrorMessage";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const sessionUser = await login(
        "admin",
        form.email,
        form.password
      );

      const redirectTo =
        location.state?.from?.pathname ||
        "/admin/dashboard";

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          "Invalid admin email or password."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-bg px-4 py-12">

      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="mb-8 text-center">

          <p className="text-3xl font-extrabold text-white">
            Tour<span className="text-accent">Ease</span> Nepal
          </p>

          <p className="mt-3 text-sm text-slate-400">
            Administration Portal
          </p>

        </div>

        {/* Admin Login Card */}
        <div className="card p-6 md:p-8">

          <div className="text-center">

            <h1 className="text-2xl font-bold text-white">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Sign in to access the TourEase administration portal.
            </p>

          </div>

          {/* Error */}
          {error && (
            <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
            autoComplete="off"
          >

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">
                Admin Email
              </label>

              <input
                type="email"
                required
                name="admin-login-email"
                autoComplete="off"
                className="input-field"
                value={form.email}
                onChange={(e) =>
                  update("email", e.target.value)
                }
                placeholder="Enter admin email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  name="admin-login-password"
                  autoComplete="new-password"
                  className="input-field pr-12"
                  value={form.password}
                  onChange={(e) =>
                    update("password", e.target.value)
                  }
                  placeholder="Enter admin password"
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
                to="/forgot-password?role=admin"
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
                : "Admin Login"}
            </button>

          </form>

        </div>

        {/* Small note */}
        <p className="mt-5 text-center text-xs text-slate-500">
          This portal is restricted to authorized TourEase administrators.
        </p>

      </div>

    </div>
  );
}