import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import {
  getBookings,
  updateBooking,
  deleteBooking,
} from "../../services/bookingService";
import { getPackages } from "../../services/packageService";

const STATUSES = ["Pending", "Confirmed", "Cancelled"];

// Format booking date and time
// Backend stores booking_date as Nepal local time in MySQL DATETIME.
// We intentionally DO NOT use new Date() here because that can
// convert the time to another timezone.
function formatBookingDateTime(dateString) {
  if (!dateString) {
    return "Time not available";
  }

  const value = String(dateString).trim();

  // Handles:
  // 2026-09-30 14:31:06
  // 2026-09-30T14:31:06
  const match = value.match(
    /^(\d{4})[-/](\d{2})[-/](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (match) {
    const [, year, month, day, hour, minute] = match;

    let hourNumber = Number(hour);
    const minuteNumber = Number(minute);

    if (
      hourNumber >= 0 &&
      hourNumber <= 23 &&
      minuteNumber >= 0 &&
      minuteNumber <= 59
    ) {
      const period = hourNumber >= 12 ? "pm" : "am";

      hourNumber = hourNumber % 12;

      if (hourNumber === 0) {
        hourNumber = 12;
      }

      return `${day} ${new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      ).toLocaleDateString("en-GB", {
        month: "short",
      })} ${year}, ${String(hourNumber).padStart(
        2,
        "0"
      )}:${String(minuteNumber).padStart(
        2,
        "0"
      )} ${period}`;
    }
  }

  // Fallback for unexpected formats
  return value;
}

// Format travel date without GMT/time
function formatTravelDate(dateString) {
  if (!dateString) {
    return "Date not available";
  }

  // If backend sends YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const cleanDate = String(dateString).split("T")[0];

  const parts = cleanDate.split("-");

  if (parts.length === 3) {
    const [year, month, day] = parts;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  // Fallback if backend sends another date format
  const date = new Date(dateString);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return String(dateString);
}

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
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load bookings."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const packageFor = (id) =>
    packages.find(
      (p) => String(p.package_id) === String(id)
    );

  async function handleStatusChange(id, status) {
    setBusyId(id);

    try {
      await updateBooking(id, { status });

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === id
            ? { ...b, status }
            : b
        )
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not update this booking."
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Permanently delete this booking?"
      )
    ) {
      return;
    }

    setBusyId(id);

    try {
      await deleteBooking(id);

      setBookings((prev) =>
        prev.filter(
          (b) => b.booking_id !== id
        )
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not delete this booking."
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout
      portalLabel="ADMIN PORTAL"
      navItems={adminNavItems}
    >
      <h1 className="section-title">
        All Bookings
      </h1>

      <div className="mt-8">
        {/* Loading */}
        {loading && (
          <Loader label="Loading bookings..." />
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        )}

        {/* No bookings */}
        {!loading &&
          !error &&
          bookings.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              No bookings on the platform yet.
            </div>
          )}

        {/* Bookings */}
        {!loading &&
          !error &&
          bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((b) => {
                const pkg = packageFor(
                  b.package_id
                );

                return (
                  <div
                    key={b.booking_id}
                    className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      {/* Package name */}
                      <p className="font-semibold text-white">
                        {pkg
                          ? pkg.package_name
                          : `Package #${b.package_id}`}
                      </p>

                      {/* Tourist name */}
                      <p className="mt-1 text-sm font-medium text-slate-300">
                        {b.tourist_name ||
                          `Tourist #${b.tourist_id}`}
                      </p>

                      {/* Booking date and exact time */}
                      <p className="mt-1 text-sm text-slate-400">
                        Booked:{" "}
                        {formatBookingDateTime(
                          b.booking_date
                        )}
                      </p>

                      {/* Travel date, persons and amount */}
                      <p className="mt-1 text-sm text-slate-400">
                        Travel:{" "}
                        {formatTravelDate(
                          b.travel_date
                        )}{" "}
                        · {b.persons} pax · NPR{" "}
                        {Number(
                          b.total_amount
                        ).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <select
                        value={b.status}
                        disabled={
                          busyId === b.booking_id
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            b.booking_id,
                            e.target.value
                          )
                        }
                        className="input-field w-40"
                      >
                        {STATUSES.map((s) => (
                          <option
                            key={s}
                            value={s}
                          >
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() =>
                          handleDelete(
                            b.booking_id
                          )
                        }
                        disabled={
                          busyId === b.booking_id
                        }
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

