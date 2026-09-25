import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPackage } from "../services/packageService";
import { getDestination } from "../services/destinationService";
import { createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";
import { getImageUrl } from "../utils/imageUrl";

export default function PackageDetail() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [travelDate, setTravelDate] = useState("");
  const [persons, setPersons] = useState(1);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    setError("");

    getPackage(id)
      .then((data) => {
        setPkg(data);

        return getDestination(data.destination_id).catch(() => null);
      })
      .then(setDestination)
      .catch((err) =>
        setError(extractErrorMessage(err, "Package not found."))
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleBooking(e) {
    e.preventDefault();

    setBookingError("");
    setBookingSuccess("");

    if (!user) {
      navigate("/login", {
        state: {
          from: {
            pathname: `/packages/${id}`,
          },
        },
      });
      return;
    }

    if (role !== "tourist") {
      setBookingError(
        "Only traveler accounts can make bookings."
      );
      return;
    }

    setSubmitting(true);

    try {
      await createBooking({
        tourist_id: user.id,
        package_id: pkg.package_id,
        travel_date: travelDate,
        persons: Number(persons),
        total_amount: Number(pkg.price) * Number(persons),
      });

      setBookingSuccess(
        "Booking request submitted! Track its status from My Bookings."
      );

      setTravelDate("");
      setPersons(1);
    } catch (err) {
      setBookingError(
        extractErrorMessage(err, "Could not create booking.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Loader label="Loading package..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          {/* Package Image */}
          <div className="h-72 w-full overflow-hidden rounded-2xl bg-base-surface md:h-96">
            {pkg.image ? (
              <img
                src={getImageUrl(pkg.image)}
                alt={pkg.package_name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.log(
                    "Package detail image failed:",
                    getImageUrl(pkg.image)
                  );
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-subtle">
                No image
              </div>
            )}
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-text-main">
            {pkg.package_name}
          </h1>

          {destination && (
            <Link
              to={`/destinations/${destination.destination_id}`}
              className="mt-1 inline-block text-accent-secondary hover:underline"
            >
              {destination.name}, {destination.district}
            </Link>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="badge">{pkg.duration}</span>

            <span className="badge">
              NPR {Number(pkg.price).toLocaleString()} / person
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-text-muted">
            {pkg.description}
          </p>
        </div>

        {/* Booking Card */}
        <div className="card h-fit p-6">
          <p className="text-lg font-bold text-text-main">
            Book this package
          </p>

          <p className="mt-1 text-sm text-text-muted">
            NPR {Number(pkg.price).toLocaleString()}{" "}
            <span className="text-text-subtle">/ person</span>
          </p>

          {bookingError && (
            <p className="mt-4 rounded-lg border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
              {bookingError}
            </p>
          )}

          {bookingSuccess && (
            <p className="mt-4 rounded-lg border border-success/30 bg-green-50 px-3 py-2 text-sm text-success">
              {bookingSuccess}{" "}
              <Link to="/my-bookings" className="underline">
                View bookings
              </Link>
            </p>
          )}

          <form
            onSubmit={handleBooking}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm text-text-muted">
                Travel Date
              </label>

              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                className="input-field"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-text-muted">
                Persons
              </label>

              <input
                type="number"
                min={1}
                required
                className="input-field"
                value={persons}
                onChange={(e) => setPersons(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between border-t border-base-border pt-4 text-sm">
              <span className="text-text-muted">Total</span>

              <span className="text-lg font-bold text-accent-secondary">
                NPR{" "}
                {(
                  Number(pkg.price) * Number(persons || 0)
                ).toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting
                ? "Booking..."
                : user
                ? "Confirm Booking"
                : "Log in to Book"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}