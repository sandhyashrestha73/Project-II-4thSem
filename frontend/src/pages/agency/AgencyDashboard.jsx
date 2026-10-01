import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import { getPackages } from "../../services/packageService";
import { getBookings } from "../../services/bookingService";
import { getAgencyReviews } from "../../services/reviewService";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";

export const agencyNavItems = [
  {
    to: "/agency/dashboard",
    label: "Overview & Analytics",
    end: true,
  },
  {
    to: "/agency/destinations",
    label: "Destinations",
  },
  {
    to: "/agency/packages",
    label: "Manage Packages",
  },
  {
    to: "/agency/guides",
    label: "Guides",
  },
  {
    to: "/agency/bookings",
    label: "Booking Requests",
  },
  {
    to: "/agency/blog",
    label: "Blog Posts",
  },
  {
    to: "/agency/gallery",
    label: "Gallery",
  },
];

export default function AgencyDashboard() {
  const { user } = useAuth();

  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Profile image
  const [profileImage, setProfileImage] = useState(
    user?.profile_image || ""
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMessage, setImageMessage] = useState("");
  const [imageError, setImageError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");

    Promise.all([
      getPackages(),
      getBookings(),
      getAgencyReviews(user.id),
    ])
      .then(([pkgs, allBookings, reviewData]) => {
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

        // Agency rating information
        setAverageRating(
          Number(reviewData?.average_rating || 0)
        );

        setTotalReviews(
          Number(reviewData?.total_reviews || 0)
        );
      })
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load dashboard data."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [user.id]);

  // Keep profile image updated if user information changes
  useEffect(() => {
    setProfileImage(user?.profile_image || "");
  }, [user?.profile_image]);

  const pendingCount = bookings.filter(
    (b) => b.status === "Pending"
  ).length;

  // =========================================================
  // PROFILE IMAGE SELECTION
  // =========================================================

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setImageMessage("");
    setImageError("");

    if (!file) {
      setSelectedImage(null);
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedImage(null);
      setImageError(
        "Only PNG, JPG, JPEG and WEBP images are allowed."
      );
      return;
    }

    setSelectedImage(file);
  }

  // =========================================================
  // UPLOAD PROFILE IMAGE
  // =========================================================

  async function handleUploadImage() {
    if (!selectedImage) {
      setImageError("Please select an image first.");
      return;
    }

    setUploadingImage(true);
    setImageMessage("");
    setImageError("");

    try {
      const formData = new FormData();

      formData.append("image", selectedImage);

      const response = await api.put(
        "/api/agency/profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newImage =
        response.data?.agency?.profile_image || "";

      setProfileImage(newImage);
      setSelectedImage(null);

      setImageMessage(
        "Profile picture updated successfully."
      );
    } catch (err) {
      setImageError(
        extractErrorMessage(
          err,
          "Could not upload profile picture."
        )
      );
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <DashboardLayout
      portalLabel="AGENCY PORTAL"
      navItems={agencyNavItems}
    >
      <h1 className="section-title">
        Overview & Analytics
      </h1>

      <p className="mt-2 text-slate-400">
        Welcome back, {user.agency_name}.
      </p>

      {/* =====================================================
          AGENCY PROFILE
          ===================================================== */}

      <section className="card mt-8 overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          {/* Profile information */}
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-accent/30 bg-base-surface">
              {profileImage ? (
                <img
                  src={getImageUrl(profileImage)}
                  alt={`${user.agency_name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-accent">
                  {user.agency_name
                    ?.charAt(0)
                    ?.toUpperCase() || "A"}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main">
                {user.agency_name}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Agency Profile
              </p>

              <p className="mt-2 text-xs text-text-subtle">
                Upload your agency logo or profile picture.
              </p>
            </div>
          </div>

          {/* Upload controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="cursor-pointer rounded-xl border border-base-border bg-base-surface px-4 py-2.5 text-center text-sm font-semibold text-text-main transition hover:border-accent hover:text-accent">
              {selectedImage
                ? "Change Selected Image"
                : profileImage
                ? "Change Picture"
                : "Choose Picture"}

              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {selectedImage && (
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={uploadingImage}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-base-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingImage
                  ? "Uploading..."
                  : "Upload Picture"}
              </button>
            )}
          </div>
        </div>

        {/* Selected file */}
        {selectedImage && (
          <div className="border-t border-base-border px-6 py-4">
            <p className="text-sm text-text-muted">
              Selected file:
              <span className="ml-2 font-semibold text-text-main">
                {selectedImage.name}
              </span>
            </p>
          </div>
        )}

        {/* Success message */}
        {imageMessage && (
          <div className="border-t border-base-border px-6 py-4">
            <p className="text-sm font-medium text-green-600">
              {imageMessage}
            </p>
          </div>
        )}

        {/* Error message */}
        {imageError && (
          <div className="border-t border-base-border px-6 py-4">
            <p className="text-sm font-medium text-red-500">
              {imageError}
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          DASHBOARD LOADING / ERROR
          ===================================================== */}

      {loading && (
        <Loader label="Loading overview..." />
      )}

      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={load}
        />
      )}

      {!loading && !error && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Bookings"
            value={bookings.length}
          />

          <StatCard
            label="Pending Requests"
            value={pendingCount}
          />

          <StatCard
            label="Active Packages"
            value={packages.length}
          />

          <StatCard
            label="Ratings"
            value={
              totalReviews > 0
                ? `⭐ ${averageRating.toFixed(1)}`
                : "No ratings yet"
            }
            hint={
              totalReviews > 0
                ? `${totalReviews} ${
                    totalReviews === 1
                      ? "review"
                      : "reviews"
                  }`
                : "Reviews will appear after tourists rate completed bookings."
            }
          />
        </div>
      )}
    </DashboardLayout>
  );
}
