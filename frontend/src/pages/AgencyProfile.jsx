import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  Star,
  ArrowLeft,
} from "lucide-react";

import {
  getAgencyProfile,
  getAgencyReviews,
} from "../services/agencyService";
import { getPackages } from "../services/packageService";

import Loader from "../components/Loader";
import { getImageUrl } from "../utils/imageUrl";

export default function AgencyProfile() {
  const { agency_id } = useParams();

  const [agency, setAgency] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAgency() {
      try {
        setLoading(true);
        setError("");

        // =========================
        // LOAD AGENCY PROFILE
        // =========================
        const agencyData = await getAgencyProfile(agency_id);
        setAgency(agencyData);

        // =========================
        // LOAD AGENCY PACKAGES
        // =========================
        try {
          const packageData = await getPackages();

          const agencyPackages = packageData.filter(
            (pkg) =>
              String(pkg.agency_id) === String(agency_id)
          );

          setPackages(agencyPackages);
        } catch (packageError) {
          console.error(
            "Agency packages loading failed:",
            packageError
          );

          setPackages([]);
        } finally {
          setPackagesLoading(false);
        }

        // =========================
        // LOAD AGENCY REVIEWS
        // =========================
        try {
          const reviewData = await getAgencyReviews(agency_id);

          setReviews(reviewData?.reviews || []);
        } catch (reviewError) {
          console.error(
            "Agency reviews loading failed:",
            reviewError
          );

          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load agency profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAgency();
  }, [agency_id]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <Loader label="Loading agency profile..." />;
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>

        <Link
          to="/agencies"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-secondary hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Agencies
        </Link>
      </div>
    );
  }

  if (!agency) {
    return null;
  }

  const averageRating = Number(
    agency.average_rating || 0
  );

  const totalReviews = Number(
    agency.total_reviews || 0
  );

  return (
    <div className="min-h-screen bg-base-bg">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">

        {/* ================= BACK TO AGENCIES ================= */}

        <Link
          to="/agencies"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-accent-secondary"
        >
          <ArrowLeft size={17} />
          Back to Agencies
        </Link>


        {/* ================= PROFILE HERO ================= */}

        <section className="card overflow-hidden">

          {/* Compact Top Background */}

          <div className="relative h-20 bg-base-surface md:h-24">
            <div className="absolute inset-0 bg-gradient-to-r from-base-bg/80 via-base-bg/30 to-transparent" />
          </div>


          {/* Profile Information */}

          <div className="relative px-5 pb-7 md:px-8 md:pb-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-end">

              {/* ================= PROFILE IMAGE ================= */}

              <div className="-mt-10 h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-base-card bg-base-surface shadow-lg md:-mt-12 md:h-32 md:w-32">

                {agency.profile_image ? (
                  <img
                    src={getImageUrl(agency.profile_image)}
                    alt={`${agency.agency_name} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-base-surface text-3xl font-bold text-accent">
                    {agency.agency_name
                      ?.charAt(0)
                      ?.toUpperCase() || "A"}
                  </div>
                )}

              </div>


              {/* ================= AGENCY NAME + DETAILS ================= */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl font-bold text-text-main md:text-3xl">
                    {agency.agency_name}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    <ShieldCheck size={14} />
                    Verified
                  </span>

                </div>


                {/* Location */}

                <div className="mt-2 flex items-center gap-2 text-sm text-text-muted">

                  <MapPin
                    size={16}
                    className="shrink-0 text-accent"
                  />

                  <span>
                    {agency.address || "Nepal"}
                  </span>

                </div>


                {/* Rating */}

                <div className="mt-3 flex flex-wrap items-center gap-2">

                  <div className="flex items-center gap-1">

                    <Star
                      size={17}
                      className={
                        totalReviews > 0
                          ? "fill-accent text-accent"
                          : "text-text-subtle"
                      }
                    />

                    <span className="font-semibold text-text-main">
                      {totalReviews > 0
                        ? averageRating.toFixed(1)
                        : "No rating"}
                    </span>

                  </div>

                  <span className="text-text-subtle">
                    •
                  </span>

                  <span className="text-sm text-text-muted">
                    {totalReviews}{" "}
                    {totalReviews === 1
                      ? "rating"
                      : "ratings"}
                  </span>

                </div>

              </div>

            </div>


            {/* ================= QUICK INFO ================= */}

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Phone */}

              <div className="rounded-xl border border-base-border bg-base-surface p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-card text-accent">
                    <Phone size={18} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                      Phone
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-text-main">
                      {agency.phone || "Not provided"}
                    </p>

                  </div>

                </div>

              </div>


              {/* Email */}

              <div className="rounded-xl border border-base-border bg-base-surface p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-card text-accent">
                    <Mail size={18} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                      Email
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-text-main">
                      {agency.email || "Not provided"}
                    </p>

                  </div>

                </div>

              </div>


              {/* License */}

              <div className="rounded-xl border border-base-border bg-base-surface p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-card text-accent">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                      License
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-text-main">
                      {agency.license_no || "Not provided"}
                    </p>

                  </div>

                </div>

              </div>


              {/* Verification */}

              <div className="rounded-xl border border-base-border bg-base-surface p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                    <ShieldCheck size={18} />
                  </div>

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-green-700">
                      Verified & Approved
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= ABOUT + RATING ================= */}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* About */}

          <section className="card p-6 md:p-8 lg:col-span-2">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-surface text-accent">
                <ShieldCheck size={19} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-text-main">
                  About the Agency
                </h2>

                <p className="text-sm text-text-muted">
                  Information provided by the agency
                </p>

              </div>

            </div>

            <p className="mt-6 whitespace-pre-line leading-7 text-text-muted">
              {agency.description ||
                "No description has been provided by this agency."}
            </p>

          </section>


          {/* Rating Summary */}

          <section className="card flex flex-col items-center justify-center p-6 text-center">

            <p className="text-sm font-medium text-text-muted">
              Agency Rating
            </p>

            <div className="mt-3 flex items-center gap-2">

              <Star
                size={28}
                className={
                  totalReviews > 0
                    ? "fill-accent text-accent"
                    : "text-text-subtle"
                }
              />

              <span className="text-4xl font-bold text-text-main">
                {totalReviews > 0
                  ? averageRating.toFixed(1)
                  : "—"}
              </span>

            </div>

            <p className="mt-2 text-sm text-text-muted">
              Based on {totalReviews}{" "}
              {totalReviews === 1
                ? "tourist rating"
                : "tourist ratings"}
            </p>

          </section>

        </div>


        {/* ===================================================== */}
        {/* ================= AGENCY PACKAGES =================== */}
        {/* ===================================================== */}

        <section className="card mt-8 p-6 md:p-8">

          <div>
            <h2 className="text-xl font-bold text-text-main">
              Packages by {agency.agency_name}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Explore tour packages offered by this agency.
            </p>
          </div>


          {/* Package Loading */}

          {packagesLoading ? (

            <div className="mt-8 py-8 text-center text-sm text-text-muted">
              Loading packages...
            </div>

          ) : packages.length === 0 ? (

            /* No Packages */

            <div className="mt-8 rounded-xl border border-dashed border-base-border bg-base-surface px-5 py-10 text-center">

              <p className="font-medium text-text-main">
                No packages available
              </p>

              <p className="mt-1 text-sm text-text-muted">
                This agency has not added any packages yet.
              </p>

            </div>

          ) : (

            /* Package Cards */

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {packages.map((pkg) => (

                <Link
                  key={pkg.package_id}
                  to={`/packages/${pkg.package_id}`}
                  className="group overflow-hidden rounded-xl border border-base-border bg-base-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent-secondary/50 hover:shadow-lg"
                >

                  {/* Package Image */}

                  <div className="h-40 w-full overflow-hidden bg-base-card">

                    {pkg.image ? (

                      <img
                        src={getImageUrl(pkg.image)}
                        alt={pkg.package_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center text-sm text-text-subtle">
                        No image
                      </div>

                    )}

                  </div>


                  {/* Package Information */}

                  <div className="p-4">

                    <h3 className="font-semibold text-text-main">
                      {pkg.package_name}
                    </h3>

                    <p className="mt-1 text-sm text-text-muted">
                      {pkg.duration}
                    </p>

                    <p className="mt-2 font-bold text-accent-secondary">
                      NPR{" "}
                      {Number(pkg.price).toLocaleString()}
                    </p>

                    <p className="mt-3 text-sm font-semibold text-accent-secondary">
                      View Package →
                    </p>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </section>


        {/* ================= REVIEWS ================= */}

        <section className="card mt-8 p-6 md:p-8">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

            <div>

              <h2 className="text-xl font-bold text-text-main">
                Tourist Reviews
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Reviews from tourists who completed bookings with this agency.
              </p>

            </div>

            {totalReviews > 0 && (

              <div className="flex items-center gap-1 text-sm">

                <Star
                  size={17}
                  className="fill-accent text-accent"
                />

                <span className="font-semibold text-text-main">
                  {averageRating.toFixed(1)}
                </span>

                <span className="text-text-muted">
                  ({totalReviews})
                </span>

              </div>

            )}

          </div>


          {/* Review Loading */}

          {reviewsLoading ? (

            <div className="mt-8 py-8 text-center text-sm text-text-muted">
              Loading reviews...
            </div>

          ) : reviews.length === 0 ? (

            <div className="mt-8 rounded-xl border border-dashed border-base-border bg-base-surface px-5 py-10 text-center">

              <Star
                size={30}
                className="mx-auto text-text-subtle"
              />

              <p className="mt-3 font-medium text-text-main">
                No reviews yet
              </p>

              <p className="mt-1 text-sm text-text-muted">
                Tourist reviews will appear here after completed bookings are rated.
              </p>

            </div>

          ) : (

            <div className="mt-8 space-y-5">

              {reviews.map((review) => (

                <div
                  key={review.review_id}
                  className="rounded-xl border border-base-border bg-base-surface p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-card font-semibold text-accent">
                        {review.tourist_name
                          ?.charAt(0)
                          ?.toUpperCase() || "T"}
                      </div>

                      <div>

                        <p className="font-semibold text-text-main">
                          {review.tourist_name ||
                            `Tourist #${review.tourist_id}`}
                        </p>

                        {review.created_at && (

                          <p className="text-xs text-text-subtle">
                            {new Date(
                              review.created_at
                            ).toLocaleDateString()}
                          </p>

                        )}

                      </div>

                    </div>


                    {/* Rating Stars */}

                    <div className="flex items-center gap-0.5">

                      {[1, 2, 3, 4, 5].map((star) => (

                        <Star
                          key={star}
                          size={15}
                          className={
                            star <= Number(review.rating)
                              ? "fill-accent text-accent"
                              : "text-text-subtle"
                          }
                        />

                      ))}

                    </div>

                  </div>


                  {review.review && (

                    <p className="mt-4 leading-6 text-text-muted">
                      “{review.review}”
                    </p>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>

      </div>
    </div>
  );
}