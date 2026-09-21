import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialRole = searchParams.get("role") || "tourist";

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail("");
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/forgot-password", {
        email: email.trim(),
        role,
      });

      setMessage(
        response.data.message ||
          "If your account exists, a reset link has been sent to your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-base-border bg-base-card p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center">
          Forgot Password?
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Enter your registered email to receive a password reset link.
        </p>

        <div className="mt-6 flex gap-2">
          {[
            { value: "tourist", label: "Traveler" },
            { value: "agency", label: "Agency" },
            { value: "admin", label: "Admin" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleRoleChange(item.value)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                role === item.value
                  ? "bg-accent text-black"
                  : "bg-base-surface text-gray-300 hover:bg-base-border"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Registered Email
            </label>

            <input
              type="email"
              name="forgot-password-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full rounded-lg border border-base-border bg-base-surface px-4 py-3 text-white outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-3 font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-accent hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}