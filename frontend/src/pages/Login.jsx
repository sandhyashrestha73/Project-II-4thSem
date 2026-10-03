import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../components/ErrorMessage";
import { Eye, EyeOff } from "lucide-react";

const roles = [
  { key: "tourist", label: "Traveler" },
  { key: "agency", label: "Agency" },
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

    setForm({
      email: "",
      password: "",
    });

    setShowPassword(false);
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
    <div className="grid h-[calc(100vh-72px)] md:grid-cols-2">

      {/* Left Section */}
  <div className="relative hidden overflow-hidden bg-[#0f172a] md:block">

      <img
        src="http://localhost:5000/uploads/loging.png"
        alt="TourEase Nepal"
        className="absolute inset-0 h-full w-full object-cover"
      />

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-[#0f172a]/45" />

  {/* Text on image */}
  <div className="relative flex h-full items-center justify-center">
    <div className="max-w-sm px-10 text-center">

      <p className="text-3xl font-extrabold text-white">
        Tour<span className="text-[#d4af37]">Ease</span> Nepal
      </p>

      <p className="mt-4 text-slate-200">
        Sign in to book packages and manage your
        agency listings.
      </p>

    </div>
  </div>

</div>

      {/* Right Section */}
      <div className="flex h-full items-center justify-center px-4 py-8 md:px-10">
        <div className="w-full max-w-md">

          <p className="text-2xl font-bold text-black">
            Log in
          </p>

          <p className="mt-1 text-slate-600">
            Welcome back!
          </p>

          {/* Role Selection */}
          <div className="mt-8 grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => changeRole(r.key)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  role === r.key
                    ? "bg-[#0f172a] text-white"
                    : "border border-base-border bg-base-surface text-slate-500 hover:bg-slate-100"
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
              <label className="mb-1.5 block text-sm text-slate-600">
                Email
              </label>

              <input
                type="email"
                required
                name={`login-email-${role}`}
                autoComplete="off"
                className="input-field placeholder:text-slate-500"
                value={form.email}
                onChange={(e) =>
                  update("email", e.target.value)
                }
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm text-slate-600">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  name={`login-password-${role}`}
                  autoComplete="new-password"
                  className="input-field pr-12 placeholder:text-slate-500"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#d4af37]"
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
            <div className="flex justify-end ">
              <Link
                to={`/forgot-password?role=${role}`}
                className="text-sm font-medium hover:text-[#0f172a] text-gray-800 text-accent hover:underline"
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