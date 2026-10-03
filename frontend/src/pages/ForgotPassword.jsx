import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-[#fafaf8] p-8 shadow-xl">

        <h1 className="text-3xl font-bold text-[#0f172a] text-center">
          Forgot Password?
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Enter your registered email to receive a password reset link.
        </p>

        {/* ROLE SELECTION */}
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
                  ? "bg-[#0f172a] text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Registered Email
            </label>

            <input
              type="email"
              name="forgot-password-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none placeholder:text-slate-500 focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* SUCCESS */}
          {message && (
            <p className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600">
              {message}
            </p>
          )}

          {/* SEND BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d4af37] px-4 py-3 font-bold text-[#0f172a] transition hover:bg-[#c9a633] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* BACK TO LOGIN */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-[#475569] hover:text-[#0f172a] hover:underline"
          >
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}