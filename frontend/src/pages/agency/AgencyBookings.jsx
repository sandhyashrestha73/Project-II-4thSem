import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import { useAuth } from "../../context/AuthContext";
import { getPackages } from "../../services/packageService";
import { getBookings, updateBooking } from "../../services/bookingService";

const STATUSES = ["Pending", "Confirmed", "Cancelled"];

export default function AgencyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getPackages(), getBookings()])
      .then(([pkgs, allBookings]) => {
        const myPackages = pkgs.filter((p) => String(p.agency_id) === String(user.id));
        setPackages(myPackages);
        const myPackageIds = new Set(myPackages.map((p) => p.package_id));
        setBookings(allBookings.filter((b) => myPackageIds.has(b.package_id)));
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load booking requests.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [user.id]);

  const packageFor = (id) => packages.find((p) => String(p.package_id) === String(id));

  async function handleStatusChange(bookingId, status) {
    setUpdatingId(bookingId);
    try {
      await updateBooking(bookingId, { status });
      setBookings((prev) => prev.map((b) => (b.booking_id === bookingId ? { ...b, status } : b)));
    } catch (err) {
      alert(extractErrorMessage(err, "Could not update this booking."));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <DashboardLayout portalLabel="AGENCY PORTAL" navItems={agencyNavItems}>
      <h1 className="section-title">Booking Requests</h1>

      <div className="mt-8">
        {loading && <Loader label="Loading bookings..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && bookings.length === 0 && (
          <div className="card p-10 text-center text-slate-400">No bookings for your packages yet.</div>
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
                      Tourist #{b.tourist_id} · {b.travel_date} · {b.persons} pax
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      NPR {Number(b.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <select
                    value={b.status}
                    disabled={updatingId === b.booking_id}
                    onChange={(e) => handleStatusChange(b.booking_id, e.target.value)}
                    className="input-field w-full md:w-44"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
