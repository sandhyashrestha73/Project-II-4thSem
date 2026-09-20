import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../components/ErrorMessage";

export default function Register() {
  const { registerAsTourist, registerAsAgency } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("tourist");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [touristForm, setTouristForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [agencyForm, setAgencyForm] = useState({
    agency_name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    license_no: "",
    description: "",
  });

  function updateTourist(field, value) {
    setTouristForm((f) => ({ ...f, [field]: value }));
  }
  function updateAgency(field, value) {
    setAgencyForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (accountType === "tourist") {
        await registerAsTourist(touristForm);
      } else {
        await registerAsAgency(agencyForm);
      }
      setSuccess("Account created successfully. You can now log in.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(extractErrorMessage(err, "Registration failed. Please check your details."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] md:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-base-surface via-base-card to-base-bg md:flex md:items-center md:justify-center">
        <div className="max-w-sm px-10 text-center">
          <p className="text-3xl font-extrabold text-text-main">
            Tour<span className="text-accent-secondary">Ease</span> Nepal
          </p>
          <p className="mt-4 text-text-muted">
            Join as a traveler to book trips, or register your agency to list packages.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 md:px-10">
        <div className="w-full max-w-md">
          <p className="text-2xl font-bold text-text-main">Create your account</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType("tourist")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                accountType === "tourist"
                  ? "bg-primary text-white"
                  : "border border-base-border bg-base-surface text-text-muted hover:border-primary/30"
              }`}
            >
              Traveler
            </button>
            <button
              type="button"
              onClick={() => setAccountType("agency")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                accountType === "agency"
                  ? "bg-primary text-white"
                  : "border border-base-border bg-base-surface text-text-muted hover:border-primary/30"
              }`}
            >
              Agency
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 rounded-lg border border-success/30 bg-green-50 px-3 py-2 text-sm text-success">
              {success}
            </p>
          )}

          {accountType === "tourist" ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                required
                placeholder="Full Name"
                className="input-field"
                value={touristForm.full_name}
                onChange={(e) => updateTourist("full_name", e.target.value)}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="input-field"
                value={touristForm.email}
                onChange={(e) => updateTourist("email", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="password"
                  placeholder="Password"
                  className="input-field"
                  value={touristForm.password}
                  onChange={(e) => updateTourist("password", e.target.value)}
                />
                <input
                  required
                  placeholder="Phone"
                  className="input-field"
                  value={touristForm.phone}
                  onChange={(e) => updateTourist("phone", e.target.value)}
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                required
                placeholder="Agency Name"
                className="input-field"
                value={agencyForm.agency_name}
                onChange={(e) => updateAgency("agency_name", e.target.value)}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="input-field"
                value={agencyForm.email}
                onChange={(e) => updateAgency("email", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="password"
                  placeholder="Password"
                  className="input-field"
                  value={agencyForm.password}
                  onChange={(e) => updateAgency("password", e.target.value)}
                />
                <input
                  required
                  placeholder="Phone"
                  className="input-field"
                  value={agencyForm.phone}
                  onChange={(e) => updateAgency("phone", e.target.value)}
                />
              </div>
              {/* Required by backend (Agency model) even though not in the low-fi wireframe */}
              <input
                required
                placeholder="Address"
                className="input-field"
                value={agencyForm.address}
                onChange={(e) => updateAgency("address", e.target.value)}
              />
              <input
                required
                placeholder="License Number"
                className="input-field"
                value={agencyForm.license_no}
                onChange={(e) => updateAgency("license_no", e.target.value)}
              />
              <textarea
                placeholder="Description (optional)"
                rows={3}
                className="input-field resize-none"
                value={agencyForm.description}
                onChange={(e) => updateAgency("description", e.target.value)}
              />
              <p className="text-xs text-text-subtle">
                New agencies start unverified until an admin verifies them.
              </p>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-accent-secondary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}