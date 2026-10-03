import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  UserRound,
  MapPin,
  Users,
  Wallet,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import { useAuth } from "../../context/AuthContext";
import { getPackages } from "../../services/packageService";
import {
  getBookings,
  updateBooking,
} from "../../services/bookingService";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

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

  function getStatusStyle(status) {
    switch (status) {
      case "Confirmed":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

      case "Completed":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";

      case "Cancelled":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      default:
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "Confirmed":
      case "Completed":
        return <CheckCircle2 size={15} />;

      case "Cancelled":
        return <AlertCircle size={15} />;

      default:
        return <Clock3 size={15} />;
    }
  }

  return (
    <DashboardLayout
      portalLabel="AGENCY PORTAL"
      navItems={agencyNavItems}
    >
      {/* HEADER */}
      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
            <CalendarCheck size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Booking Requests
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              View and manage booking requests for your packages.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading bookings..." />
          </div>
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
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <CalendarCheck size={30} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                No Booking Requests
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                No bookings for your packages yet.
              </p>
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
                    className="rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-lg transition hover:border-[#d4af37]/40"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      {/* BOOKING INFORMATION */}
                      <div className="min-w-0 flex-1">
                        {/* Package name */}
                        <div className="flex items-center gap-2">
                          <Package
                            size={18}
                            className="shrink-0 text-[#d4af37]"
                          />

                          <p className="truncate font-semibold text-white">
                            {pkg
                              ? pkg.package_name
                              : `Package #${b.package_id}`}
                          </p>
                        </div>

                        {/* Tourist */}
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                          <UserRound
                            size={16}
                            className="shrink-0 text-[#d4af37]"
                          />

                          <span>
                            {b.tourist_name ||
                              `Tourist #${b.tourist_id}`}
                          </span>
                        </div>

                        {/* Booking date and time */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                          <Clock3
                            size={15}
                            className="shrink-0 text-slate-500"
                          />

                          <span>
                            Booked:{" "}
                            {formatBookingDateTime(
                              b.booking_date
                            )}
                          </span>
                        </div>

                        {/* Travel date */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
                          <span className="flex items-center gap-2">
                            <MapPin
                              size={15}
                              className="text-slate-500"
                            />

                            Travel:{" "}
                            {formatTravelDate(
                              b.travel_date
                            )}
                          </span>

                          {/* Persons */}
                          <span className="flex items-center gap-2">
                            <Users
                              size={15}
                              className="text-slate-500"
                            />

                            {b.persons} pax
                          </span>

                          {/* Amount */}
                          <span className="flex items-center gap-2">
                            <Wallet
                              size={15}
                              className="text-slate-500"
                            />

                            NPR{" "}
                            {Number(
                              b.total_amount
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* STATUS */}
                      <div className="flex w-full flex-col gap-2 md:w-44">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Booking Status
                        </label>

                        <div
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${getStatusStyle(
                            b.status
                          )}`}
                        >
                          {getStatusIcon(b.status)}

                          <select
                            value={b.status}
                            disabled={
                              updatingId ===
                              b.booking_id
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                b.booking_id,
                                e.target.value
                              )
                            }
                            className="w-full cursor-pointer bg-transparent text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {STATUSES.map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="bg-[#0f172a] text-white"
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
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