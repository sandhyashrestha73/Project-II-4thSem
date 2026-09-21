import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function PasswordInput({
  value,
  onChange,
  placeholder,
  name,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-base-border bg-base-surface px-4 py-3 pr-12 text-white outline-none focus:border-accent"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
      >
        {showPassword ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/reset-password", {
        token,
        password,
      });

      setSuccess(true);

      setMessage(
        response.data.message ||
          "Password reset successfully. You can now login."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "The reset link is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-base-border bg-base-card p-8 shadow-xl">
        {!success ? (
          <>
            <h1 className="text-center text-3xl font-bold text-white">
              Reset Password
            </h1>

            <p className="mt-3 text-center text-gray-400">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  New Password
                </label>

                <PasswordInput
                  name="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>

                <PasswordInput
                  name="confirm-new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent px-4 py-3 font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4 text-5xl">✅</div>

            <h1 className="text-2xl font-bold text-white">
              Password Reset Successful
            </h1>

            <p className="mt-3 text-gray-400">{message}</p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-lg bg-accent px-4 py-3 font-bold text-black transition hover:opacity-90"
            >
              Go to Login
            </button>
          </div>
        )}

        {!success && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-accent hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}