import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../components/ErrorMessage";
import { Eye, EyeOff } from "lucide-react";

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
      await login("admin", form.email, form.password);

      const redirectTo =
        location.state?.from?.pathname || "/admin/dashboard";

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
    <div className="relative min-h-screen overflow-hidden">

      {/* ================= BACKGROUND IMAGE ================= */}
      <img
          src="http://localhost:5000/uploads/admin2.png"
          alt="TourEase Nepal"
          className="absolute inset-0 h-full w-full object-fill"
        />
      {/* Soft Navy Overlay */}
      <div className="absolute inset-0 bg-[#0f172a]/25" />

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* ================= BRAND ================= */}
          <div className="mb-6 text-center">

            <p className="text-3xl font-extrabold text-white drop-shadow-lg">
              Tour<span className="text-[#d4af37]">Ease</span> Nepal
            </p>

            <p className="mt-2 text-sm font-medium text-white/90 drop-shadow">
              Administration Portal
            </p>

          </div>

          {/* ================= TRANSPARENT LOGIN FORM ================= */}
          <div className="rounded-2xl border border-white/20 bg-[#0f172a]/20 p-6 shadow-xl shadow-black/20 sm:p-8">

            {/* Heading */}
            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-wider text-[#f0d77a]">
                Secure Access
              </p>

              <h1 className="mt-2 text-2xl font-bold text-white drop-shadow-md">
                Admin Login
              </h1>

              <p className="mt-2 text-sm leading-6 text-white/90">
                Sign in to access the TourEase administration portal.
              </p>

            </div>

            {/* ================= ERROR ================= */}
            {error && (
              <p className="mt-6 rounded-lg border border-red-300/40 bg-red-50/90 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* ================= FORM ================= */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
              autoComplete="off"
            >

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                  Email
                </label>

                <input
                  type="email"
                  required
                  name="admin-login-email"
                  autoComplete="off"
                  className="input-field border border-white/25 bg-[#0f172a]/25 text-white placeholder:text-white/55 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  value={form.email}
                  onChange={(e) =>
                    update("email", e.target.value)
                  }
                  placeholder="Enter admin email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    name="admin-login-password"
                    autoComplete="new-password"
                    className="input-field border border-white/25 bg-[#0f172a]/25 pr-12 text-white placeholder:text-white/55 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-[#d4af37]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">

                <Link
                  to="/forgot-password?role=admin"
                  className="text-sm font-medium text-white/90 transition-colors hover:text-[#d4af37] hover:underline"
                >
                  Forgot password?
                </Link>

              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#d4af37] px-4 py-3 font-semibold text-[#0f172a] shadow-md transition-all hover:bg-[#c9a633] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Logging in..."
                  : "Admin Login"}
              </button>

            </form>

          </div>

          {/* ================= BOTTOM NOTE ================= */}
          <p className="mt-5 text-center text-xs leading-5 text-white/85 drop-shadow">
            This portal is restricted to authorized TourEase
            administrators.
          </p>

        </div>
      </div>
    </div>
  );
}

