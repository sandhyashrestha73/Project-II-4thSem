import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  UserRound,
  Package,
  Users,
  Wallet,
  Trash2,
  CheckCircle2,
  CircleAlert,
  MapPin,
  ChevronDown,
} from "lucide-react";

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

// =========================================================
// BOOKING STATUSES
// =========================================================

const STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

// =========================================================
// FORMAT BOOKING DATE + TIME
// Backend stores booking_date as Nepal local time
// in MySQL DATETIME.
// DO NOT use new Date() for this value.
// =========================================================

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
      const period =
        hourNumber >= 12 ? "PM" : "AM";

      hourNumber = hourNumber % 12;

      if (hourNumber === 0) {
        hourNumber = 12;
      }

      const monthName = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      ).toLocaleDateString("en-GB", {
        month: "short",
      });

      return `${day} ${monthName} ${year}, ${String(
        hourNumber
      ).padStart(
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

// =========================================================
// FORMAT TRAVEL DATE
// =========================================================

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

// =========================================================
// STATUS STYLE
// =========================================================

function getStatusStyle(status) {
  if (status === "Confirmed") {
    return {
      wrapper:
        "border-emerald-500/30 bg-emerald-500/10",
      text: "text-emerald-400",
      icon: CheckCircle2,
    };
  }

  if (status === "Completed") {
    return {
      wrapper:
        "border-blue-500/30 bg-blue-500/10",
      text: "text-blue-400",
      icon: CheckCircle2,
    };
  }

  if (status === "Cancelled") {
    return {
      wrapper:
        "border-red-500/30 bg-red-500/10",
      text: "text-red-400",
      icon: CircleAlert,
    };
  }

  return {
    wrapper:
      "border-amber-500/30 bg-amber-500/10",
    text: "text-amber-400",
    icon: Clock3,
  };
}

// =========================================================
// ADMIN BOOKINGS
// =========================================================

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [busyId, setBusyId] = useState(null);

  // =======================================================
  // LOAD BOOKINGS + PACKAGES
  // =======================================================

  function load() {
    setLoading(true);
    setError("");

    Promise.all([
      getBookings(),
      getPackages(),
    ])
      .then(([bookingData, packageData]) => {
        setBookings(bookingData || []);
        setPackages(packageData || []);
      })
      .catch((err) => {
        setError(
          extractErrorMessage(
            err,
            "Could not load bookings."
          )
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  // =======================================================
  // FIND PACKAGE
  // =======================================================

  const packageFor = (id) => {
    return packages.find(
      (p) =>
        String(p.package_id) === String(id)
    );
  };

  // =======================================================
  // UPDATE STATUS
  // =======================================================

  async function handleStatusChange(id, status) {
    setBusyId(id);

    try {
      await updateBooking(id, { status });

      setBookings((previous) =>
        previous.map((booking) =>
          booking.booking_id === id
            ? {
                ...booking,
                status,
              }
            : booking
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

  // =======================================================
  // DELETE
  // =======================================================

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

      setBookings((previous) =>
        previous.filter(
          (booking) =>
            booking.booking_id !== id
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
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <CalendarCheck size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              All Bookings
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View and manage all TourEase Nepal
              bookings.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mt-8">
        {/* LOADING */}

        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading bookings..." />
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          bookings.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <CalendarCheck size={28} />
              </div>

              <h2 className="mt-4 font-semibold text-white">
                No bookings yet
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Bookings made by tourists will
                appear here.
              </p>
            </div>
          )}

        {/* BOOKINGS */}

        {!loading &&
          !error &&
          bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const pkg = packageFor(
                  booking.package_id
                );

                const isBusy =
                  busyId === booking.booking_id;

                const statusStyle =
                  getStatusStyle(
                    booking.status
                  );

                const StatusIcon =
                  statusStyle.icon;

                return (
                  <div
                    key={booking.booking_id}
                    className="rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-lg transition hover:border-[#d4af37]/30"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* =================================================
                          BOOKING INFORMATION
                      ================================================= */}

                      <div className="min-w-0 flex-1">
                        {/* PACKAGE */}

                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                            <Package size={20} />
                          </div>

                          <div className="min-w-0">
                            <h2 className="truncate font-semibold text-white">
                              {pkg
                                ? pkg.package_name
                                : `Package #${booking.package_id}`}
                            </h2>

                            
                          </div>
                        </div>

                        {/* DETAILS */}

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {/* TOURIST */}

                          <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-3">
                            <div className="flex items-center gap-2">
                              <UserRound
                                size={15}
                                className="text-[#d4af37]"
                              />

                              <span className="text-xs text-slate-500">
                                Tourist
                              </span>
                            </div>

                            <p className="mt-1 truncate text-sm font-medium text-slate-200">
                              {booking.tourist_name ||
                                `Tourist #${booking.tourist_id}`}
                            </p>
                          </div>

                          {/* TRAVEL DATE */}

                          <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-3">
                            <div className="flex items-center gap-2">
                              <MapPin
                                size={15}
                                className="text-[#d4af37]"
                              />

                              <span className="text-xs text-slate-500">
                                Travel Date
                              </span>
                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-200">
                              {formatTravelDate(
                                booking.travel_date
                              )}
                            </p>
                          </div>

                          {/* PERSONS */}

                          <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-3">
                            <div className="flex items-center gap-2">
                              <Users
                                size={15}
                                className="text-[#d4af37]"
                              />

                              <span className="text-xs text-slate-500">
                                Travellers
                              </span>
                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-200">
                              {booking.persons} pax
                            </p>
                          </div>

                          {/* AMOUNT */}

                          <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-3">
                            <div className="flex items-center gap-2">
                              <Wallet
                                size={15}
                                className="text-[#d4af37]"
                              />

                              <span className="text-xs text-slate-500">
                                Total Amount
                              </span>
                            </div>

                            <p className="mt-1 text-sm font-bold text-[#d4af37]">
                              NPR{" "}
                              {Number(
                                booking.total_amount
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* BOOKING TIME */}

                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-700 bg-[#1e293b] px-3 py-2.5">
                          <Clock3
                            size={16}
                            className="shrink-0 text-[#d4af37]"
                          />

                          <p className="text-sm text-slate-300">
                            <span className="text-slate-500">
                              Booked:
                            </span>{" "}
                            {formatBookingDateTime(
                              booking.booking_date
                            )}
                          </p>
                        </div>
                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[180px]">
                        {/* STATUS */}

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-500">
                            Booking Status
                          </label>

                          <div className="relative">
                            <select
                              value={
                                booking.status
                              }
                              disabled={isBusy}
                              onChange={(e) =>
                                handleStatusChange(
                                  booking.booking_id,
                                  e.target.value
                                )
                              }
                              className={`w-full appearance-none rounded-xl border px-4 py-2.5 pr-10 text-sm font-semibold outline-none transition ${statusStyle.wrapper} ${statusStyle.text} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {STATUSES.map(
                                (status) => (
                                  <option
                                    key={status}
                                    value={status}
                                    className="bg-[#0f172a] text-white"
                                  >
                                    {status}
                                  </option>
                                )
                              )}
                            </select>

                            <ChevronDown
                              size={16}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                          </div>
                        </div>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              booking.booking_id
                            )
                          }
                          disabled={isBusy}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />

                          {isBusy
                            ? "Processing..."
                            : "Delete Booking"}
                        </button>
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