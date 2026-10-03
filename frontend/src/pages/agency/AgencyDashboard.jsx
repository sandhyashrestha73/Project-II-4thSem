import { useEffect, useState } from "react";
import {
  BarChart3,
  Camera,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Package,
  Star,
  Upload,
  UserRound,
  CalendarCheck,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
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

      // Do not manually set Content-Type.
      // Axios/browser will set multipart boundary automatically.
      const response = await api.put(
        "/api/agency/profile-image",
        formData
      );

      const newImage =
        response.data?.agency?.profile_image || "";

      if (!newImage) {
        throw new Error(
          "Profile image was not returned by the server."
        );
      }

      setProfileImage(newImage);
      setSelectedImage(null);

      setImageMessage(
        "Profile picture updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile image upload error:",
        err
      );

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
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
            <BarChart3 size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Overview & Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Welcome back, {user.agency_name}.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          AGENCY PROFILE
          ===================================================== */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          {/* Profile information */}

          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-[#d4af37]/40 bg-[#1e293b] shadow-md">
              {profileImage ? (
                <img
                  src={getImageUrl(profileImage)}
                  alt={`${user.agency_name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#d4af37]">
                  {user.agency_name
                    ?.charAt(0)
                    ?.toUpperCase() || "A"}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <UserRound
                  size={18}
                  className="text-[#d4af37]"
                />

                <h2 className="text-xl font-bold text-white">
                  {user.agency_name}
                </h2>
              </div>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Agency Profile
              </p>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-450">
                <Camera size={14} />
                Upload your agency logo or profile picture.
              </p>
            </div>
          </div>

          {/* Upload controls */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-600 bg-[#1e293b] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#d4af37]">
              <ImagePlus size={17} />

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
                className="flex items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={17} />

                {uploadingImage
                  ? "Uploading..."
                  : "Upload Picture"}
              </button>
            )}
          </div>
        </div>

        {/* Selected file */}

        {selectedImage && (
          <div className="border-t border-slate-700 bg-[#111c31] px-6 py-4">
            <p className="text-sm text-slate-400">
              Selected file:

              <span className="ml-2 font-semibold text-white">
                {selectedImage.name}
              </span>
            </p>
          </div>
        )}

        {/* Success message */}

        {imageMessage && (
          <div className="border-t border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
              <CheckCircle2 size={17} />
              {imageMessage}
            </p>
          </div>
        )}

        {/* Error message */}

        {imageError && (
          <div className="border-t border-red-500/20 bg-red-500/10 px-6 py-4">
            <p className="text-sm font-medium text-red-400">
              {imageError}
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          DASHBOARD LOADING / ERROR
          ===================================================== */}

      {loading && (
        <div className="mt-6">
          <Loader label="Loading overview..." />
        </div>
      )}

      {!loading && error && (
        <div className="mt-6">
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        </div>
      )}

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      {!loading && !error && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Bookings */}

          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Bookings
                </p>

                <p className="mt-3 text-3xl font-bold text-white">
                  {bookings.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <CalendarCheck size={22} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              All bookings for your packages
            </p>
          </div>

          {/* Pending Requests */}

          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Pending Requests
                </p>

                <p className="mt-3 text-3xl font-bold text-white">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Clock3 size={22} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Bookings waiting for your response
            </p>
          </div>

          {/* Active Packages */}

          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Active Packages
                </p>

                <p className="mt-3 text-3xl font-bold text-white">
                  {packages.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                <Package size={22} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Packages currently offered by your agency
            </p>
          </div>

          {/* Ratings */}

          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Ratings
                </p>

                <p className="mt-3 text-3xl font-bold text-white">
                  {totalReviews > 0
                    ? averageRating.toFixed(1)
                    : "—"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                <Star
                  size={22}
                  fill="currentColor"
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              {totalReviews > 0
                ? `${totalReviews} ${
                    totalReviews === 1
                      ? "review"
                      : "reviews"
                  }`
                : "Reviews will appear after tourists rate completed bookings."}
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}