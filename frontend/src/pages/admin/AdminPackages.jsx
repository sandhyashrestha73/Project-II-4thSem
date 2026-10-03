import { useEffect, useState } from "react";
import {
  Package,
  Clock3,
  Building2,
  Wallet,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";

import {
  getPackages,
  deletePackage,
} from "../../services/packageService";

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");

    getPackages()
      .then(setPackages)
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load packages."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Delete this package? This affects the listing agency."
      )
    ) {
      return;
    }

    try {
      await deletePackage(id);

      setPackages((prev) =>
        prev.filter((p) => p.package_id !== id)
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not delete this package."
        )
      );
    }
  }

  return (
    <DashboardLayout
      portalLabel="ADMIN PORTAL"
      navItems={adminNavItems}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Package size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              All Packages
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage all travel packages listed on
              TourEase Nepal.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mt-8">
        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading packages..." />
          </div>
        )}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        )}

        {!loading &&
          !error &&
          packages.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <Package size={27} />
              </div>

              <p className="mt-4 font-semibold text-white">
                No packages yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                No packages have been added to the
                platform yet.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          packages.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg">
              {/* TABLE HEADER */}

              <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Package
                    size={18}
                    className="text-[#d4af37]"
                  />

                  <h2 className="font-semibold text-white">
                    Platform Packages
                  </h2>
                </div>

                <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                  {packages.length} Packages
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-[#1e293b]">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-slate-300">
                        <span className="flex items-center gap-2">
                          <Package size={15} />
                          Package
                        </span>
                      </th>

                      <th className="px-5 py-4 font-semibold text-slate-300">
                        <span className="flex items-center gap-2">
                          <Building2 size={15} />
                          Agency
                        </span>
                      </th>

                      <th className="px-5 py-4 font-semibold text-slate-300">
                        <span className="flex items-center gap-2">
                          <Clock3 size={15} />
                          Duration
                        </span>
                      </th>

                      <th className="px-5 py-4 font-semibold text-slate-300">
                        <span className="flex items-center gap-2">
                          <Wallet size={15} />
                          Price
                        </span>
                      </th>

                      <th className="px-5 py-4 text-right font-semibold text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {packages.map((p) => (
                      <tr
                        key={p.package_id}
                        className="border-t border-slate-700 bg-[#0f172a] transition hover:bg-[#1e293b]"
                      >
                        {/* PACKAGE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/10 text-[#d4af37]">
                              <Package size={17} />
                            </div>

                            <div>
                              <p className="font-semibold text-white">
                                {p.package_name}
                              </p>

                              
                            </div>
                          </div>
                        </td>

                        {/* AGENCY */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Building2
                              size={16}
                              className="text-slate-500"
                            />

                            {p.agency_name ||
                              `Agency #${p.agency_id}`}
                          </div>
                        </td>

                        {/* DURATION */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock3
                              size={16}
                              className="text-slate-500"
                            />

                            {p.duration}
                          </div>
                        </td>

                        {/* PRICE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 font-semibold text-[#d4af37]">
                            <Wallet size={16} />

                            NPR{" "}
                            {Number(
                              p.price
                            ).toLocaleString()}
                          </div>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              handleDelete(
                                p.package_id
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FOOTER NOTE */}

              <div className="flex items-center gap-2 border-t border-slate-700 bg-[#1e293b]/50 px-5 py-3 text-xs text-slate-500">
                <AlertTriangle size={14} />

                Deleting a package affects the listing
                agency and its package listing.
              </div>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}