import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import { getBookings, updateBooking, deleteBooking } from "../../services/bookingService";
import { getPackages } from "../../services/packageService";

const STATUSES = ["Pending", "Confirmed", "Cancelled"];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getBookings(), getPackages()])
      .then(([b, p]) => {
        setBookings(b);
        setPackages(p);
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load bookings.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const packageFor = (id) => packages.find((p) => String(p.package_id) === String(id));

  async function handleStatusChange(id, status) {
    setBusyId(id);
    try {
      await updateBooking(id, { status });
      setBookings((prev) => prev.map((b) => (b.booking_id === id ? { ...b, status } : b)));
    } catch (err) {
      alert(extractErrorMessage(err, "Could not update this booking."));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this booking?")) return;
    setBusyId(id);
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.booking_id !== id));
    } catch (err) {
      alert(extractErrorMessage(err, "Could not delete this booking."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout portalLabel="ADMIN PORTAL" navItems={adminNavItems}>
      <h1 className="section-title">All Bookings</h1>

      <div className="mt-8">
        {loading && <Loader label="Loading bookings..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && bookings.length === 0 && (
          <div className="card p-10 text-center text-slate-400">No bookings on the platform yet.</div>
        )}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((b) => {
              const pkg = packageFor(b.package_id);
              return (
                <div key={b.booking_id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{pkg ? pkg.package_name : `Package #${b.package_id}`}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Tourist #{b.tourist_id} · {b.travel_date} · {b.persons} pax · NPR{" "}
                      {Number(b.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={b.status}
                      disabled={busyId === b.booking_id}
                      onChange={(e) => handleStatusChange(b.booking_id, e.target.value)}
                      className="input-field w-40"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(b.booking_id)}
                      disabled={busyId === b.booking_id}
                      className="btn-danger text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
