import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBookings, cancelBooking } from "../services/bookingService";
import { getPackages } from "../services/packageService";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../components/ErrorMessage";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-300",
  Confirmed: "bg-green-50 text-success border-success/30",
  Cancelled: "bg-red-50 text-danger border-danger/30",
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getBookings(), getPackages()])
      .then(([allBookings, allPackages]) => {
        setBookings(allBookings.filter((b) => String(b.tourist_id) === String(user.id)));
        setPackages(allPackages);
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load your bookings.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [user.id]);

  const packageFor = (id) => packages.find((p) => String(p.package_id) === String(id));

  async function handleCancel(bookingId) {
    if (!window.confirm("Cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.booking_id === bookingId ? { ...b, status: "Cancelled" } : b))
      );
    } catch (err) {
      alert(extractErrorMessage(err, "Could not cancel this booking."));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <h1 className="section-title">My Bookings</h1>
      <p className="mt-2 text-text-muted">Track the status of packages you've booked.</p>

      <div className="mt-8">
        {loading && <Loader label="Loading your bookings..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && bookings.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-text-muted">You haven't booked any packages yet.</p>
            <Link to="/packages" className="btn-primary mt-4 inline-flex">
              Browse Packages
            </Link>
          </div>
        )}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((b) => {
              const pkg = packageFor(b.package_id);
              return (
                <div key={b.booking_id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-text-main">{pkg ? pkg.package_name : `Package #${b.package_id}`}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Travel date: {b.travel_date} · {b.persons} {b.persons === 1 ? "person" : "persons"}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      Total: NPR {Number(b.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[b.status] || ""}`}>
                      {b.status}
                    </span>
                    {b.status !== "Cancelled" && (
                      <button
                        onClick={() => handleCancel(b.booking_id)}
                        disabled={cancellingId === b.booking_id}
                        className="btn-danger text-xs"
                      >
                        {cancellingId === b.booking_id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}