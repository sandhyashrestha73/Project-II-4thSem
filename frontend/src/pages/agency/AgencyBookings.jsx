import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import { useAuth } from "../../context/AuthContext";
import { getPackages } from "../../services/packageService";
import { getBookings, updateBooking } from "../../services/bookingService";

const STATUSES = ["Pending", "Confirmed", "Cancelled"];

// Format booking date and exact time
function formatBookingDateTime(dateString) {
  if (!dateString) {
    return "Time not available";
  }

  const value = String(dateString).trim();

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

  return value;
}

// Format travel date
function formatTravelDate(dateString) {
  if (!dateString) {
    return "Date not available";
  }

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
        // Only packages belonging to this agency
        const myPackages = pkgs.filter(
          (p) =>
            String(p.agency_id) === String(user.id)
        );

        setPackages(myPackages);

        const myPackageIds = new Set(
          myPackages.map((p) => p.package_id)
        );

        // Only bookings for this agency's packages
        setBookings(
          allBookings.filter((b) =>
            myPackageIds.has(b.package_id)
          )
        );
      })
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load booking requests."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [user.id]);

  const packageFor = (id) =>
    packages.find(
      (p) =>
        String(p.package_id) === String(id)
    );

  async function handleStatusChange(
    bookingId,
    status
  ) {
    setUpdatingId(bookingId);

    try {
      await updateBooking(bookingId, { status });

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
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
      setUpdatingId(null);
    }
  }

  return (
    <DashboardLayout
      portalLabel="AGENCY PORTAL"
      navItems={agencyNavItems}
    >
      <h1 className="section-title">
        Booking Requests
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
              No bookings for your packages yet.
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

                      {/* Booking date and time */}
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

                    {/* Status */}
                    <select
                      value={b.status}
                      disabled={
                        updatingId === b.booking_id
                      }
                      onChange={(e) =>
                        handleStatusChange(
                          b.booking_id,
                          e.target.value
                        )
                      }
                      className="input-field w-full md:w-44"
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
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}