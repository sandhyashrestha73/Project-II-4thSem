import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  X,
  CalendarDays,
  Users,
  Wallet,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
} from "lucide-react";

import { getBookings, cancelBooking } from "../services/bookingService";
import { getPackages } from "../services/packageService";
import { createReview } from "../services/reviewService";

import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";

const statusStyles = {
  Pending:
    "border-amber-200 bg-amber-50 text-amber-700",

  Confirmed:
    "border-green-200 bg-green-50 text-green-700",

  Completed:
    "border-blue-200 bg-blue-50 text-blue-700",

  Cancelled:
    "border-red-200 bg-red-50 text-red-700",
};

const statusIcons = {
  Pending: Clock3,
  Confirmed: CheckCircle2,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

export default function MyBookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] = useState(null);

  // =====================================================
  // REVIEW STATES
  // =====================================================

  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  function load() {
    setLoading(true);
    setError("");

    Promise.all([getBookings(), getPackages()])
      .then(([allBookings, allPackages]) => {
        setBookings(
          allBookings.filter(
            (b) => String(b.tourist_id) === String(user.id)
          )
        );

        setPackages(allPackages);
      })
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load your bookings."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [user.id]);

  // =====================================================
  // FIND PACKAGE
  // =====================================================

  const packageFor = (id) =>
    packages.find(
      (p) => String(p.package_id) === String(id)
    );

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  async function handleCancel(bookingId) {
    if (!window.confirm("Cancel this booking?")) return;

    setCancellingId(bookingId);

    try {
      await cancelBooking(bookingId);

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? {
                ...b,
                status: "Cancelled",
              }
            : b
        )
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not cancel this booking."
        )
      );
    } finally {
      setCancellingId(null);
    }
  }

  // =====================================================
  // OPEN REVIEW MODAL
  // =====================================================

  function handleOpenReview(booking) {
    setReviewBooking(booking);
    setRating(0);
    setReviewText("");
    setReviewError("");
  }

  // =====================================================
  // CLOSE REVIEW MODAL
  // =====================================================

  function handleCloseReview() {
    if (submittingReview) return;

    setReviewBooking(null);
    setRating(0);
    setReviewText("");
    setReviewError("");
  }

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  async function handleSubmitReview(e) {
    e.preventDefault();

    setReviewError("");

    if (rating === 0) {
      setReviewError("Please select a rating.");
      return;
    }

    if (!reviewBooking) {
      setReviewError("Booking not found.");
      return;
    }

    setSubmittingReview(true);

    try {
      await createReview({
        booking_id: reviewBooking.booking_id,
        rating: rating,
        review: reviewText.trim() || null,
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === reviewBooking.booking_id
            ? {
                ...b,
                has_review: true,
              }
            : b
        )
      );

      handleCloseReview();
    } catch (err) {
      setReviewError(
        extractErrorMessage(
          err,
          "Could not submit your review."
        )
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-bg">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

<section className="-mx- 4 border-b border-[#1e293b] bg-[#0f172a] md:-mx-10">
  <div className="mx-auto max-w-7xl px-3 py-13 md:px-8 border-[#1e293b] bg-[#0f172a]">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e293b] text-[#d4af37] shadow-sm">
        <CalendarDays size={23} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">
          My Bookings
        </h1>

        <p className="mt-1 text-sm text-slate-300">
          Track and manage your travel bookings.
        </p>
      </div>
    </div>
  </div>
</section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div>
          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <Loader label="Loading your bookings..." />
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <ErrorMessage
              message={error}
              onRetry={load}
            />
          )}

          {/* =================================================
              NO BOOKINGS
          ================================================= */}

          {!loading &&
            !error &&
            bookings.length === 0 && (
              <div className="rounded-2xl border border-base-border bg-base-card p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f172a] text-[#d4af37]">
                  <Package size={28} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-text-main">
                  No bookings yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                  You haven't booked any packages yet.
                  Explore our available packages and start
                  planning your next journey.
                </p>

                <Link
                  to="/packages"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#b9962f] hover:shadow-md"
                >
                  Browse Packages
                </Link>
              </div>
            )}

          {/* =================================================
              BOOKING LIST
          ================================================= */}

          {!loading &&
            !error &&
            bookings.length > 0 && (
              <div className="space-y-5">
                {bookings.map((b) => {
                  const pkg = packageFor(b.package_id);

                  const StatusIcon =
                    statusIcons[b.status] || AlertCircle;

                  return (
                    <div
                      key={b.booking_id}
                      className="group overflow-hidden rounded-2xl border border-base-border bg-base-card shadow-sm transition-all duration-200 hover:border-[#d4af37]/40 hover:shadow-md"
                    >
                      {/* TOP NAVY ACCENT */}
                      <div className="h-1 bg-[#0f172a]" />

                      <div className="p-5 md:p-6">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                          {/* ================================
                              BOOKING INFORMATION
                          ================================= */}

                          <div className="min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-[#d4af37]">
                                <Package size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                                  Booked Package
                                </p>

                                <p className="mt-1 truncate text-lg font-bold text-text-main">
                                  {pkg
                                    ? pkg.package_name
                                    : `Package #${b.package_id}`}
                                </p>
                              </div>
                            </div>

                            {/* DETAILS */}

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <div className="flex items-center gap-2.5 rounded-xl bg-base-surface px-3 py-2.5">
                                <CalendarDays
                                  size={17}
                                  className="shrink-0 text-[#d4af37]"
                                />

                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-subtle">
                                    Travel Date
                                  </p>

                                  <p className="mt-0.5 text-sm font-semibold text-text-main">
                                    {b.travel_date}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 rounded-xl bg-base-surface px-3 py-2.5">
                                <Users
                                  size={17}
                                  className="shrink-0 text-[#d4af37]"
                                />

                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-subtle">
                                    Travelers
                                  </p>

                                  <p className="mt-0.5 text-sm font-semibold text-text-main">
                                    {b.persons}{" "}
                                    {b.persons === 1
                                      ? "person"
                                      : "persons"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 rounded-xl bg-base-surface px-3 py-2.5">
                                <Wallet
                                  size={17}
                                  className="shrink-0 text-[#d4af37]"
                                />

                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-subtle">
                                    Total
                                  </p>

                                  <p className="mt-0.5 text-sm font-bold text-text-main">
                                    NPR{" "}
                                    {Number(
                                      b.total_amount
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ================================
                              STATUS + ACTIONS
                          ================================= */}

                          <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
                            {/* STATUS */}

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                                statusStyles[b.status] || ""
                              }`}
                            >
                              <StatusIcon size={14} />
                              {b.status}
                            </span>

                            {/* CANCEL */}

                            {b.status !== "Cancelled" && (
                              <button
                                onClick={() =>
                                  handleCancel(
                                    b.booking_id
                                  )
                                }
                                disabled={
                                  cancellingId ===
                                  b.booking_id
                                }
                                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {cancellingId ===
                                b.booking_id
                                  ? "Cancelling..."
                                  : "Cancel"}
                              </button>
                            )}

                            {/* RATE & REVIEW */}

                            {b.status === "Completed" &&
                              !b.has_review && (
                                <button
                                  onClick={() =>
                                    handleOpenReview(b)
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2 text-xs font-semibold text-[#0f172a] transition hover:bg-[#b9962f] hover:shadow-sm"
                                >
                                  <Star
                                    size={15}
                                    fill="currentColor"
                                  />
                                  Rate & Review
                                </button>
                              )}

                            {/* ALREADY REVIEWED */}

                            {b.status === "Completed" &&
                              b.has_review && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
                                  <CheckCircle2 size={14} />
                                  Reviewed
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-base-border bg-base-card shadow-2xl">
            {/* NAVY HEADER */}

            <div className="bg-[#0f172a] px-6 py-5 text-white md:px-8">
              <button
                type="button"
                onClick={handleCloseReview}
                disabled={submittingReview}
                className="absolute right-4 top-4 rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close review"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 pr-10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37] text-[#0f172a]">
                  <Star
                    size={21}
                    fill="currentColor"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Rate Your Experience
                  </h2>

                  <p className="mt-1 text-sm text-white/70">
                    Share your experience with this package.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* PACKAGE NAME */}

              <div className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#b9962f]">
                  Package
                </p>

                <p className="mt-1 font-semibold text-[#0f172a]">
                  {packageFor(
                    reviewBooking.package_id
                  )?.package_name ||
                    `Package #${reviewBooking.package_id}`}
                </p>
              </div>

              <form
                onSubmit={handleSubmitReview}
                className="mt-6"
              >
                {/* ================================
                    STAR RATING
                ================================= */}

                <div>
                  <p className="text-sm font-semibold text-text-main">
                    Your Rating
                  </p>

                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setRating(star)
                          }
                          className="rounded-lg p-1.5 transition hover:scale-110 hover:bg-[#d4af37]/10"
                          aria-label={`Rate ${star} out of 5`}
                        >
                          <Star
                            size={31}
                            className={
                              star <= rating
                                ? "fill-[#d4af37] text-[#d4af37]"
                                : "text-slate-300"
                            }
                          />
                        </button>
                      )
                    )}
                  </div>

                  {rating > 0 && (
                    <p className="mt-2 text-sm font-medium text-[#b9962f]">
                      {rating} out of 5
                    </p>
                  )}
                </div>

                {/* ================================
                    REVIEW TEXT
                ================================= */}

                <div className="mt-6">
                  <label
                    htmlFor="review"
                    className="text-sm font-semibold text-text-main"
                  >
                    Your Review{" "}
                    <span className="font-normal text-text-subtle">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="review"
                    value={reviewText}
                    onChange={(e) =>
                      setReviewText(e.target.value)
                    }
                    rows={5}
                    placeholder="Share your experience with this package..."
                    className="mt-2 w-full resize-none rounded-xl border border-base-border bg-base-surface px-4 py-3 text-sm text-text-main outline-none transition placeholder:text-text-subtle focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10"
                  />
                </div>

                {/* ERROR */}

                {reviewError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{reviewError}</span>
                  </div>
                )}

                {/* BUTTONS */}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseReview}
                    disabled={submittingReview}
                    className="rounded-lg border border-base-border px-5 py-2.5 text-sm font-semibold text-text-main transition hover:bg-base-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#b9962f] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Star
                      size={16}
                      fill="currentColor"
                    />

                    {submittingReview
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
