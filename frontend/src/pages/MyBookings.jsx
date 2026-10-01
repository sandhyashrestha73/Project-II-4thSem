import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, X } from "lucide-react";

import { getBookings, cancelBooking } from "../services/bookingService";
import { getPackages } from "../services/packageService";
import { createReview } from "../services/reviewService";

import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-300",
  Confirmed: "bg-green-50 text-success border-success/30",
  Completed: "bg-blue-50 text-blue-700 border-blue-300",
  Cancelled: "bg-red-50 text-danger border-danger/30",
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
            (b) =>
              String(b.tourist_id) === String(user.id)
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
      (p) =>
        String(p.package_id) === String(id)
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

      // Mark this booking as reviewed immediately
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
    <>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <h1 className="section-title">
          My Bookings
        </h1>

        <p className="mt-2 text-text-muted">
          Track the status of packages you've booked.
        </p>

        <div className="mt-8">
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
              <div className="card p-10 text-center">
                <p className="text-text-muted">
                  You haven't booked any packages yet.
                </p>

                <Link
                  to="/packages"
                  className="btn-primary mt-4 inline-flex"
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
                      {/* ================================
                          BOOKING INFORMATION
                      ================================= */}

                      <div>
                        <p className="font-semibold text-text-main">
                          {pkg
                            ? pkg.package_name
                            : `Package #${b.package_id}`}
                        </p>

                        <p className="mt-1 text-sm text-text-muted">
                          Travel date:{" "}
                          {b.travel_date} ·{" "}
                          {b.persons}{" "}
                          {b.persons === 1
                            ? "person"
                            : "persons"}
                        </p>

                        <p className="mt-1 text-sm text-text-muted">
                          Total: NPR{" "}
                          {Number(
                            b.total_amount
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* ================================
                          STATUS + ACTIONS
                      ================================= */}

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[b.status] ||
                            ""
                          }`}
                        >
                          {b.status}
                        </span>

                        {/* CANCEL BUTTON */}

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
                            className="btn-danger text-xs"
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
                              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-base-bg transition hover:opacity-90"
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
                            <span className="inline-flex items-center gap-1 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
                              ✓ Reviewed
                            </span>
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-base-card p-6 shadow-2xl md:p-8">
            {/* CLOSE BUTTON */}

            <button
              type="button"
              onClick={handleCloseReview}
              disabled={submittingReview}
              className="absolute right-4 top-4 rounded-full p-2 text-text-muted transition hover:bg-base-surface hover:text-text-main"
              aria-label="Close review"
            >
              <X size={20} />
            </button>

            {/* TITLE */}

            <div className="pr-8">
              <h2 className="text-2xl font-bold text-text-main">
                Rate Your Experience
              </h2>

              <p className="mt-2 text-sm text-text-muted">
                How was your experience with this
                package?
              </p>

              <p className="mt-1 text-sm font-medium text-text-main">
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

                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(star)
                        }
                        className="rounded-md p-1 transition hover:scale-110"
                        aria-label={`Rate ${star} out of 5`}
                      >
                        <Star
                          size={30}
                          className={
                            star <= rating
                              ? "fill-accent text-accent"
                              : "text-text-subtle"
                          }
                        />
                      </button>
                    )
                  )}
                </div>

                {rating > 0 && (
                  <p className="mt-2 text-sm text-text-muted">
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
                    setReviewText(
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Share your experience with this agency..."
                  className="mt-2 w-full resize-none rounded-xl border border-base-border bg-base-surface px-4 py-3 text-sm text-text-main outline-none transition placeholder:text-text-subtle focus:border-accent"
                />
              </div>

              {/* ================================
                  ERROR
              ================================= */}

              {reviewError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {reviewError}
                </div>
              )}

              {/* ================================
                  BUTTONS
              ================================= */}

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
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {submittingReview
                    ? "Submitting..."
                    : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}