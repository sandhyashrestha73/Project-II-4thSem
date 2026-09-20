import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import { getPackages } from "../../services/packageService";
import { getBookings } from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";

export const agencyNavItems = [
  { to: "/agency/dashboard", label: "Overview & Analytics", end: true },
  { to: "/agency/packages", label: "Manage Packages" },
  { to: "/agency/guides", label: "Guides" },
  { to: "/agency/bookings", label: "Booking Requests" },
  { to: "/agency/blog", label: "Blog Posts" },
  { to: "/agency/gallery", label: "Gallery" },
];

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getPackages(), getBookings()])
      .then(([pkgs, allBookings]) => {
        const myPackages = pkgs.filter((p) => String(p.agency_id) === String(user.id));
        setPackages(myPackages);
        const myPackageIds = new Set(myPackages.map((p) => p.package_id));
        setBookings(allBookings.filter((b) => myPackageIds.has(b.package_id)));
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load dashboard data.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [user.id]);

  const pendingCount = bookings.filter((b) => b.status === "Pending").length;

  return (
    <DashboardLayout portalLabel="AGENCY PORTAL" navItems={agencyNavItems}>
      <h1 className="section-title">Overview & Analytics</h1>
      <p className="mt-2 text-slate-400">Welcome back, {user.agency_name}.</p>

      {loading && <Loader label="Loading overview..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Bookings" value={bookings.length} />
          <StatCard label="Pending Requests" value={pendingCount} />
          <StatCard label="Active Packages" value={packages.length} />
          <StatCard
            label="Ratings"
            value="—"
            hint="Not available — the backend has no reviews/ratings API yet."
          />
        </div>
      )}
    </DashboardLayout>
  );
}
