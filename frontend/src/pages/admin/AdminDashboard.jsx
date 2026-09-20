import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import { getDestinations } from "../../services/destinationService";
import { getPackages } from "../../services/packageService";
import { getBookings } from "../../services/bookingService";
import { getBlogs } from "../../services/blogService";

export const adminNavItems = [
  { to: "/admin/dashboard", label: "Platform Analytics", end: true },
  { to: "/admin/destinations", label: "Destinations" },
  { to: "/admin/packages", label: "Packages" },
  { to: "/admin/bookings", label: "All Bookings" },
  { to: "/admin/blog", label: "Blog Posts" },
  { to: "/admin/gallery", label: "Gallery" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getDestinations(), getPackages(), getBookings(), getBlogs()])
      .then(([destinations, packages, bookings, blogs]) => {
        setCounts({
          destinations: destinations.length,
          packages: packages.length,
          bookings: bookings.length,
          blogs: blogs.length,
        });
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load platform analytics.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <DashboardLayout portalLabel="ADMIN PORTAL" navItems={adminNavItems}>
      <h1 className="section-title">Platform Analytics</h1>

      {loading && <Loader label="Loading analytics..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && counts && (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Destinations" value={counts.destinations} />
            <StatCard label="Total Packages" value={counts.packages} />
            <StatCard label="Total Bookings" value={counts.bookings} />
            <StatCard label="Total Blogs" value={counts.blogs} />
          </div>

          <div className="mt-10 card p-6">
            <p className="font-semibold text-white">Not available yet</p>
            <p className="mt-1 text-sm text-slate-400">
              These require backend endpoints that don't exist in the current API, so they're left
              out rather than faked:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-500">
              <li>Total Agencies / Verified Agencies / Pending Verification — no agency listing API</li>
              <li>Travelers count — no tourist listing API</li>
              <li>Blogs Awaiting Approval — Blog has no approval/status field</li>
              <li>Top Rated Agency — no ratings/reviews API</li>
            </ul>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
