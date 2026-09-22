import { useEffect, useState } from "react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";

import { getDestinations } from "../../services/destinationService";
import { getPackages } from "../../services/packageService";
import { getBookings } from "../../services/bookingService";
import { getBlogs } from "../../services/blogService";

import {
  getPendingAgencies,
  approveAgency,
  rejectAgency,
} from "../../services/agencyService";


// ======================================================
// ADMIN NAVIGATION
// ======================================================

export const adminNavItems = [
  {
    to: "/admin/dashboard",
    label: "Platform Analytics",
    end: true,
  },
  {
    to: "/admin/destinations",
    label: "Destinations",
  },
  {
    to: "/admin/packages",
    label: "Packages",
  },
  {
    to: "/admin/bookings",
    label: "All Bookings",
  },
  {
    to: "/admin/blog",
    label: "Blog Posts",
  },
  {
    to: "/admin/gallery",
    label: "Gallery",
  },
];


// ======================================================
// ADMIN DASHBOARD
// ======================================================

export default function AdminDashboard() {

  // ----------------------------------------------------
  // PLATFORM ANALYTICS STATE
  // ----------------------------------------------------

  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ----------------------------------------------------
  // AGENCY VERIFICATION STATE
  // ----------------------------------------------------

  const [agencies, setAgencies] = useState([]);
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [agencyError, setAgencyError] = useState("");


  // ====================================================
  // LOAD PLATFORM ANALYTICS
  // ====================================================

  function load() {
    setLoading(true);
    setError("");

    Promise.all([
      getDestinations(),
      getPackages(),
      getBookings(),
      getBlogs(),
    ])
      .then(([destinations, packages, bookings, blogs]) => {
        setCounts({
          destinations: destinations.length,
          packages: packages.length,
          bookings: bookings.length,
          blogs: blogs.length,
        });
      })
      .catch((err) => {
        setError(
          extractErrorMessage(
            err,
            "Could not load platform analytics."
          )
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }


  // ====================================================
  // LOAD PENDING AGENCIES
  // ====================================================

  function loadPendingAgencies() {
    setAgencyLoading(true);
    setAgencyError("");

    getPendingAgencies()
      .then((data) => {
        setAgencies(data || []);
      })
      .catch((err) => {
        setAgencyError(
          extractErrorMessage(
            err,
            "Could not load pending agencies."
          )
        );
      })
      .finally(() => {
        setAgencyLoading(false);
      });
  }


  // ====================================================
  // LOAD DATA WHEN PAGE OPENS
  // ====================================================

  useEffect(() => {
    load();
    loadPendingAgencies();
  }, []);


  // ====================================================
  // APPROVE AGENCY
  // ====================================================

  function handleApprove(id) {
    approveAgency(id)
      .then(() => {
        setAgencies((currentAgencies) =>
          currentAgencies.filter(
            (agency) => agency.agency_id !== id
          )
        );
      })
      .catch((err) => {
        setAgencyError(
          extractErrorMessage(
            err,
            "Could not approve agency."
          )
        );
      });
  }


  // ====================================================
  // REJECT AGENCY
  // ====================================================

  function handleReject(id) {
    rejectAgency(id)
      .then(() => {
        setAgencies((currentAgencies) =>
          currentAgencies.filter(
            (agency) => agency.agency_id !== id
          )
        );
      })
      .catch((err) => {
        setAgencyError(
          extractErrorMessage(
            err,
            "Could not reject agency."
          )
        );
      });
  }


  // ====================================================
  // UI
  // ====================================================

  return (
    <DashboardLayout
      portalLabel="ADMIN PORTAL"
      navItems={adminNavItems}
    >

      {/* ==================================================
          PAGE TITLE
      ================================================== */}

      <h1 className="section-title">
        Platform Analytics
      </h1>


      {/* ==================================================
          PLATFORM ANALYTICS LOADING
      ================================================== */}

      {loading && (
        <Loader label="Loading analytics..." />
      )}


      {/* ==================================================
          PLATFORM ANALYTICS ERROR
      ================================================== */}

      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={load}
        />
      )}


      {/* ==================================================
          DASHBOARD CONTENT
      ================================================== */}

      {!loading && !error && counts && (
        <>

          {/* ==================================================
              ANALYTICS CARDS
          ================================================== */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              label="Total Destinations"
              value={counts.destinations}
            />

            <StatCard
              label="Total Packages"
              value={counts.packages}
            />

            <StatCard
              label="Total Bookings"
              value={counts.bookings}
            />

            <StatCard
              label="Total Blogs"
              value={counts.blogs}
            />

          </div>


          {/* ==================================================
              AGENCY VERIFICATION
          ================================================== */}

          <div className="card mt-10 p-6">

            {/* ------------------------------------------------
                SECTION HEADER
            ------------------------------------------------ */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-white">
                  Agency Verification
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Review agencies waiting for admin approval.
                </p>

              </div>


              {/* Pending Count */}

              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400">
                {agencies.length} Pending
              </span>

            </div>


            {/* ==================================================
                AGENCY LOADING
            ================================================== */}

            {agencyLoading && (
              <div className="mt-6">
                <Loader label="Loading agencies..." />
              </div>
            )}


            {/* ==================================================
                AGENCY ERROR
            ================================================== */}

            {!agencyLoading && agencyError && (
              <div className="mt-6">
                <ErrorMessage
                  message={agencyError}
                  onRetry={loadPendingAgencies}
                />
              </div>
            )}


            {/* ==================================================
                NO PENDING AGENCIES
            ================================================== */}

            {!agencyLoading &&
              !agencyError &&
              agencies.length === 0 && (
                <div className="mt-6 rounded-lg border border-slate-700 p-6 text-center">

                  <p className="font-medium text-slate-300">
                    No pending agencies
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    All registered agencies have been reviewed.
                  </p>

                </div>
              )}


            {/* ==================================================
                PENDING AGENCY LIST
            ================================================== */}

            {!agencyLoading &&
              !agencyError &&
              agencies.length > 0 && (

                <div className="mt-6 space-y-4">

                  {agencies.map((agency) => (

                    <div
                      key={agency.agency_id}
                      className="rounded-xl border border-slate-700 bg-slate-900/50 p-5"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">


                        {/* ====================================
                            AGENCY INFORMATION
                        ==================================== */}

                        <div>

                          <h3 className="text-base font-semibold text-white">
                            {agency.agency_name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            Email: {agency.email}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Phone: {agency.phone}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            License: {agency.license_no}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Address: {agency.address}
                          </p>

                        </div>


                        {/* ====================================
                            ACTION BUTTONS
                        ==================================== */}

                        <div className="flex gap-3">

                          {/* APPROVE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(
                                agency.agency_id
                              )
                            }
                            className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400"
                          >
                            Approve
                          </button>


                          {/* REJECT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleReject(
                                agency.agency_id
                              )
                            }
                            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                          >
                            Reject
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

          </div>

        </>

      )}

    </DashboardLayout>
  );
}