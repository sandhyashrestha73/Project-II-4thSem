import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAgencyProfile } from "../services/agencyService";
import Loader from "../components/Loader";

export default function AgencyProfile() {
  const { agency_id } = useParams();

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAgencyProfile(agency_id)
      .then((data) => {
        setAgency(data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Unable to load agency profile."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [agency_id]);

  if (loading) {
    return <Loader label="Loading agency profile..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
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

  if (!agency) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      {/* Back */}
      <Link
        to="/"
        className="text-sm font-medium text-accent-secondary hover:underline"
      >
        ← Back to Home
      </Link>

      {/* Profile Card */}
      <section className="card mt-6 p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-text-main">
                {agency.agency_name}
              </h1>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✓ Verified
              </span>
            </div>

            <p className="mt-3 text-text-muted">
              📍 {agency.address}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-text-main">
            About the Agency
          </h2>

          <p className="mt-3 leading-7 text-text-muted">
            {agency.description ||
              "No description has been provided by this agency."}
          </p>
        </div>

        {/* Contact */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-base-surface p-4">
            <p className="text-xs font-medium uppercase text-text-subtle">
              Phone
            </p>

            <p className="mt-1 text-sm font-medium text-text-main">
              {agency.phone}
            </p>
          </div>

          <div className="rounded-xl bg-base-surface p-4">
            <p className="text-xs font-medium uppercase text-text-subtle">
              Email
            </p>

            <p className="mt-1 break-all text-sm font-medium text-text-main">
              {agency.email}
            </p>
          </div>

          <div className="rounded-xl bg-base-surface p-4">
            <p className="text-xs font-medium uppercase text-text-subtle">
              License Number
            </p>

            <p className="mt-1 text-sm font-medium text-text-main">
              {agency.license_no}
            </p>
          </div>

          <div className="rounded-xl bg-base-surface p-4">
            <p className="text-xs font-medium uppercase text-text-subtle">
              Status
            </p>

            <p className="mt-1 text-sm font-semibold text-green-700">
              Verified & Approved
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}