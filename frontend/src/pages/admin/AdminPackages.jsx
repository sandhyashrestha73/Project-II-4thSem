import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import { getPackages, deletePackage } from "../../services/packageService";

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    getPackages()
      .then(setPackages)
      .catch((err) => setError(extractErrorMessage(err, "Could not load packages.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this package? This affects the listing agency.")) return;
    try {
      await deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.package_id !== id));
    } catch (err) {
      alert(extractErrorMessage(err, "Could not delete this package."));
    }
  }

  return (
    <DashboardLayout portalLabel="ADMIN PORTAL" navItems={adminNavItems}>
      <h1 className="section-title">All Packages</h1>

      <div className="mt-8">
        {loading && <Loader label="Loading packages..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && packages.length === 0 && (
          <div className="card p-10 text-center text-slate-400">No packages on the platform yet.</div>
        )}
        {!loading && !error && packages.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-base-border">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-base-surface text-slate-400">
                <tr>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Agency ID</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.package_id} className="border-t border-base-border bg-base-card">
                    <td className="px-4 py-3 text-white">{p.package_name}</td>
                    <td className="px-4 py-3 text-slate-300">#{p.agency_id}</td>
                    <td className="px-4 py-3 text-slate-300">{p.duration}</td>
                    <td className="px-4 py-3 text-slate-300">NPR {Number(p.price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(p.package_id)} className="text-red-400 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
