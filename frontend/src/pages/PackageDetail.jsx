import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getPackage } from "../services/packageService";
import { getDestination } from "../services/destinationService";
import { createBooking } from "../services/bookingService";
import { getAgencyProfile } from "../services/agencyService";

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
  const [agency, setAgency] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [travelDate, setTravelDate] = useState("");
  const [persons, setPersons] = useState(1);

  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // =========================
  // LOAD PACKAGE
  // =========================

  function load() {
    setLoading(true);
    setError("");

    getPackage(id)
      .then((data) => {
        setPkg(data);

        // Load destination
        const destinationPromise = getDestination(
          data.destination_id
        ).catch(() => null);

        // Load agency
        const agencyPromise = data.agency_id
          ? getAgencyProfile(data.agency_id).catch(() => null)
          : Promise.resolve(null);

        return Promise.all([
          destinationPromise,
          agencyPromise,
        ]);
      })
      .then(([dest, agencyData]) => {
        setDestination(dest);
        setAgency(agencyData);
      })
      .catch((err) =>
        setError(
          extractErrorMessage(err, "Package not found.")
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  // =========================
  // BOOK PACKAGE
  // =========================

  async function handleBooking(e) {
    e.preventDefault();

    setBookingError("");
    setBookingSuccess("");

    // User is not logged in
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

    // Only tourists can book
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
        total_amount:
          Number(pkg.price) * Number(persons),
      });

      setBookingSuccess(
        "Booking request submitted! Track its status from My Bookings."
      );

      setTravelDate("");
      setPersons(1);
    } catch (err) {
      setBookingError(
        extractErrorMessage(
          err,
          "Could not create booking."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <Loader label="Loading package..." />;
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorMessage
          message={error}
          onRetry={load}
        />
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">

      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">

        {/* ================================================= */}
        {/* LEFT SIDE - PACKAGE INFORMATION                   */}
        {/* ================================================= */}

        <div>

          {/* ================= PACKAGE IMAGE ================= */}

          <div className="h-72 w-full overflow-hidden rounded-2xl bg-base-surface md:h-96">

            {pkg.image ? (
              <img
                src={getImageUrl(pkg.image)}
                alt={pkg.package_name}
                className="h-full w-full object-cover"
                onError={() => {
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


          {/* ================= PACKAGE NAME ================= */}

          <h1 className="mt-6 text-3xl font-extrabold text-text-main">
            {pkg.package_name}
          </h1>


          {/* ================= DESTINATION ================= */}

          {destination && (
            <Link
              to={`/destinations/${destination.destination_id}`}
              className="mt-1 inline-block text-accent-secondary hover:underline"
            >
              {destination.name}, {destination.district}
            </Link>
          )}


          {/* ================= PACKAGE INFO ================= */}

          <div className="mt-4 flex flex-wrap gap-3">

            <span className="badge">
              {pkg.duration}
            </span>

            <span className="badge">
              NPR{" "}
              {Number(pkg.price).toLocaleString()}{" "}
              / person
            </span>

          </div>


          {/* ================= DESCRIPTION ================= */}

          <p className="mt-6 leading-relaxed text-text-muted">
            {pkg.description}
          </p>


          {/* ================================================= */}
          {/* ================= OFFERED BY ==================== */}
          {/* ================================================= */}

          {agency && (
            <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-base-border bg-base-surface px-3 py-2">

              {/* Agency Image */}

              {agency.profile_image ? (
                <img
                  src={getImageUrl(
                    agency.profile_image
                  )}
                  alt={agency.agency_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-base-card text-xs font-bold text-accent">
                  {agency.agency_name
                    ?.charAt(0)
                    ?.toUpperCase() || "A"}
                </div>
              )}


              {/* Agency Name */}

              <span className="text-sm font-semibold text-text-main">
                {agency.agency_name}
              </span>


              {/* View Agency */}

              <Link
                to={`/agencies/${agency.agency_id}`}
                className="text-xs font-medium text-accent-secondary hover:underline"
              >
                View
              </Link>

            </div>
          )}

        </div>


        {/* ================================================= */}
        {/* RIGHT SIDE - BOOKING CARD                         */}
        {/* ================================================= */}

        <div className="card h-fit p-6">

          <p className="text-lg font-bold text-text-main">
            Book this package
          </p>

          <p className="mt-1 text-sm text-text-muted">
            NPR{" "}
            {Number(pkg.price).toLocaleString()}{" "}
            <span className="text-text-subtle">
              / person
            </span>
          </p>


          {/* ================= GUEST USER ================= */}

          {!user && (
            <div className="mt-5">

              <p className="text-sm leading-6 text-text-muted">
                Please log in as a tourist to book this package.
              </p>

              <Link
                to="/login"
                state={{
                  from: {
                    pathname: `/packages/${id}`,
                  },
                }}
                className="btn-primary mt-5 block w-full text-center"
              >
                Log in to Book
              </Link>

            </div>
          )}


          {/* ================= AGENCY / ADMIN ================= */}

          {user && role !== "tourist" && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-4">

              <p className="text-sm leading-6 text-amber-700">
                Only tourist accounts can make bookings.
              </p>

            </div>
          )}


          {/* ================= TOURIST BOOKING ================= */}

          {user && role === "tourist" && (
            <>

              {/* Booking Error */}

              {bookingError && (
                <p className="mt-4 rounded-lg border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
                  {bookingError}
                </p>
              )}


              {/* Booking Success */}

              {bookingSuccess && (
                <p className="mt-4 rounded-lg border border-success/30 bg-green-50 px-3 py-2 text-sm text-success">

                  {bookingSuccess}{" "}

                  <Link
                    to="/my-bookings"
                    className="underline"
                  >
                    View bookings
                  </Link>

                </p>
              )}


              {/* Booking Form */}

              <form
                onSubmit={handleBooking}
                className="mt-5 space-y-4"
              >

                {/* Travel Date */}

                <div>

                  <label className="mb-1.5 block text-sm text-text-muted">
                    Travel Date
                  </label>

                  <input
                    type="date"
                    required
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    className="input-field"
                    value={travelDate}
                    onChange={(e) =>
                      setTravelDate(e.target.value)
                    }
                  />

                </div>


                {/* Persons */}

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
                    onChange={(e) =>
                      setPersons(e.target.value)
                    }
                  />

                </div>


                {/* Total */}

                <div className="flex items-center justify-between border-t border-base-border pt-4 text-sm">

                  <span className="text-text-muted">
                    Total
                  </span>

                  <span className="text-lg font-bold text-accent-secondary">

                    NPR{" "}
                    {(
                      Number(pkg.price) *
                      Number(persons || 0)
                    ).toLocaleString()}

                  </span>

                </div>


                {/* Confirm Booking */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting
                    ? "Booking..."
                    : "Confirm Booking"}
                </button>

              </form>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

