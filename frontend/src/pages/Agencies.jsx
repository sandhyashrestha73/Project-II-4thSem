
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getVerifiedAgencies } from "../services/agencyService";
import Loader from "../components/Loader";

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAgencies() {
      try {
        const data = await getVerifiedAgencies();
        setAgencies(data);
      } catch (err) {
        console.error("Failed to load agencies:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load verified agencies."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAgencies();
  }, []);

  if (loading) {
    return <Loader label="Loading verified agencies..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8">
        <p className="text-red-500">{error}</p>

        <Link
          to="/"
          className="mt-5 inline-block text-sm font-semibold text-accent-secondary hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-accent-secondary">
          Trusted Partners
        </span>

        <h1 className="mt-2 text-3xl font-bold text-text-main md:text-4xl">
          Verified Travel Agencies
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-text-muted">
          Explore tourism agencies that have been reviewed and
          approved by TourEase Nepal.
        </p>
      </div>

      {/* Empty State */}
      {agencies.length === 0 ? (
        <div className="rounded-2xl border border-base-border bg-base-surface p-10 text-center">
          <p className="text-text-muted">
            No verified agencies are available yet.
          </p>

          <Link
            to="/"
            className="mt-5 inline-block text-sm font-semibold text-accent-secondary hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agencies.map((agency) => (
            <div
              key={agency.agency_id}
              className="card flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
            >
              {/* Agency Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-text-main">
                    {agency.agency_name}
                  </h2>

                  <p className="mt-2 text-sm text-text-muted">
                    📍 {agency.address}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  ✓ Verified
                </span>
              </div>

              {/* Description */}
              <p className="mt-5 line-clamp-4 flex-1 text-sm leading-6 text-text-muted">
                {agency.description ||
                  "This agency has not provided a description yet."}
              </p>

              {/* Contact */}
              <div className="mt-5 space-y-2 border-t border-base-border pt-5">
                {agency.phone && (
                  <p className="text-sm text-text-muted">
                    📞 {agency.phone}
                  </p>
                )}

                {agency.email && (
                  <p className="break-all text-sm text-text-muted">
                    ✉️ {agency.email}
                  </p>
                )}
              </div>

              {/* Profile Button */}
              <Link
                to={`/agencies/${agency.agency_id}`}
                className="btn-primary mt-6 w-full text-center"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

