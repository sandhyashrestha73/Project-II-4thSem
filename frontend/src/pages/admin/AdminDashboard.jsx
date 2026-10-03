import { useEffect, useState } from "react";
import {
  BarChart3,
  MapPinned,
  Package,
  CalendarCheck,
  BookOpen,
  Building2,
  Mail,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
  Phone,
  FileCheck2,
  MapPin,
  MessageSquare,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
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

import { getContactMessages } from "../../services/contactService";

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

  // ----------------------------------------------------
  // CONTACT MESSAGE STATE
  // ----------------------------------------------------

  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");

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
      .then(
        ([
          destinations,
          packages,
          bookings,
          blogs,
        ]) => {
          setCounts({
            destinations: destinations.length,
            packages: packages.length,
            bookings: bookings.length,
            blogs: blogs.length,
          });
        }
      )
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
        // Newest registered agencies appear first.
        const sortedAgencies = [...(data || [])].sort(
          (a, b) => {
            const dateA = a.created_at
              ? new Date(a.created_at).getTime()
              : 0;

            const dateB = b.created_at
              ? new Date(b.created_at).getTime()
              : 0;

            if (dateB !== dateA) {
              return dateB - dateA;
            }

            return (
              Number(b.agency_id || 0) -
              Number(a.agency_id || 0)
            );
          }
        );

        setAgencies(sortedAgencies);
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
  // LOAD CONTACT MESSAGES
  // ====================================================

  function loadContactMessages() {
    setContactLoading(true);
    setContactError("");

    getContactMessages()
      .then((data) => {
        // Newest contact messages appear first.
        const sortedMessages = [...(data || [])].sort(
          (a, b) => {
            const dateA = a.created_at
              ? new Date(a.created_at).getTime()
              : 0;

            const dateB = b.created_at
              ? new Date(b.created_at).getTime()
              : 0;

            if (dateB !== dateA) {
              return dateB - dateA;
            }

            return (
              Number(b.message_id || 0) -
              Number(a.message_id || 0)
            );
          }
        );

        setContactMessages(sortedMessages);
      })
      .catch((err) => {
        setContactError(
          extractErrorMessage(
            err,
            "Could not load contact messages."
          )
        );
      })
      .finally(() => {
        setContactLoading(false);
      });
  }

  // ====================================================
  // LOAD DATA WHEN PAGE OPENS
  // ====================================================

  useEffect(() => {
    load();
    loadPendingAgencies();
    loadContactMessages();
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
  // ANALYTICS CARD DATA
  // ====================================================

  const analyticsCards = counts
    ? [
        {
          label: "Total Destinations",
          value: counts.destinations,
          icon: MapPinned,
        },
        {
          label: "Total Packages",
          value: counts.packages,
          icon: Package,
        },
        {
          label: "Total Bookings",
          value: counts.bookings,
          icon: CalendarCheck,
        },
        {
          label: "Total Blogs",
          value: counts.blogs,
          icon: BookOpen,
        },
      ]
    : [];

  // ====================================================
  // UI
  // ====================================================

  return (
    <DashboardLayout
      portalLabel="ADMIN PORTAL"
      navItems={adminNavItems}
    >
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
            <BarChart3 size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Platform Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Overview of your TourEase Nepal platform.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          PLATFORM ANALYTICS LOADING
      ================================================== */}

      {loading && (
        <div className="mt-8 rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
          <Loader label="Loading analytics..." />
        </div>
      )}

      {/* ==================================================
          PLATFORM ANALYTICS ERROR
      ================================================== */}

      {!loading && error && (
        <div className="mt-8">
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        </div>
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
            {analyticsCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/40"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        {item.label}
                      </p>

                      <p className="mt-3 text-3xl font-bold text-white">
                        {item.value}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                      <Icon size={23} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================================================
              AGENCY VERIFICATION
          ================================================== */}

          <div className="mt-10 rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2
                    size={20}
                    className="text-[#d4af37]"
                  />

                  <h2 className="text-lg font-bold text-white">
                    Agency Verification
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  Review agencies waiting for admin approval.
                </p>
              </div>

              {/* Pending Count */}

              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-400">
                <Clock3 size={14} />
                {agencies.length} Pending
              </span>
            </div>

            {/* AGENCY LOADING */}

            {agencyLoading && (
              <div className="mt-6">
                <Loader label="Loading agencies..." />
              </div>
            )}

            {/* AGENCY ERROR */}

            {!agencyLoading && agencyError && (
              <div className="mt-6">
                <ErrorMessage
                  message={agencyError}
                  onRetry={loadPendingAgencies}
                />
              </div>
            )}

            {/* NO PENDING AGENCIES */}

            {!agencyLoading &&
              !agencyError &&
              agencies.length === 0 && (
                <div className="mt-6 rounded-xl border border-slate-700 bg-[#1e293b] p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={27} />
                  </div>

                  <p className="mt-4 font-semibold text-white">
                    No pending agencies
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    All registered agencies have been reviewed.
                  </p>
                </div>
              )}

            {/* PENDING AGENCY LIST */}

            {!agencyLoading &&
              !agencyError &&
              agencies.length > 0 && (
                <div className="mt-6 space-y-4">
                  {agencies.map((agency) => (
                    <div
                      key={agency.agency_id}
                      className="rounded-xl border border-slate-700 bg-[#1e293b] p-5 transition hover:border-[#d4af37]/30"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        {/* AGENCY INFORMATION */}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Building2
                              size={18}
                              className="shrink-0 text-[#d4af37]"
                            />

                            <h3 className="text-base font-semibold text-white">
                              {agency.agency_name}
                            </h3>
                          </div>

                          <div className="mt-3 space-y-2">
                            <p className="flex items-center gap-2 text-sm text-slate-400">
                              <Mail
                                size={15}
                                className="text-slate-500"
                              />
                              {agency.email}
                            </p>

                            <p className="flex items-center gap-2 text-sm text-slate-400">
                              <Phone
                                size={15}
                                className="text-slate-500"
                              />
                              {agency.phone}
                            </p>

                            <p className="flex items-center gap-2 text-sm text-slate-400">
                              <FileCheck2
                                size={15}
                                className="text-slate-500"
                              />
                              License: {agency.license_no}
                            </p>

                            <p className="flex items-center gap-2 text-sm text-slate-400">
                              <MapPin
                                size={15}
                                className="text-slate-500"
                              />
                              {agency.address}
                            </p>
                          </div>
                        </div>

                        {/* ACTION BUTTONS */}

                        <div className="flex gap-3">
                          {/* APPROVE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(
                                agency.agency_id
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
                          >
                            <CheckCircle2 size={16} />
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
                            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* ==================================================
              CONTACT MESSAGES
          ================================================== */}

          <div className="mt-10 rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare
                    size={20}
                    className="text-[#d4af37]"
                  />

                  <h2 className="text-lg font-bold text-white">
                    Contact Messages
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  Messages received through the contact form.
                </p>
              </div>

              {/* Message Count */}

              <span className="flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1.5 text-sm font-semibold text-[#d4af37]">
                <Mail size={14} />
                {contactMessages.length} Messages
              </span>
            </div>

            {/* CONTACT LOADING */}

            {contactLoading && (
              <div className="mt-6">
                <Loader label="Loading contact messages..." />
              </div>
            )}

            {/* CONTACT ERROR */}

            {!contactLoading && contactError && (
              <div className="mt-6">
                <ErrorMessage
                  message={contactError}
                  onRetry={loadContactMessages}
                />
              </div>
            )}

            {/* NO MESSAGES */}

            {!contactLoading &&
              !contactError &&
              contactMessages.length === 0 && (
                <div className="mt-6 rounded-xl border border-slate-700 bg-[#1e293b] p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                    <Mail size={27} />
                  </div>

                  <p className="mt-4 font-semibold text-white">
                    No contact messages
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Messages submitted through the contact
                    form will appear here.
                  </p>
                </div>
              )}

            {/* CONTACT MESSAGE LIST */}

            {!contactLoading &&
              !contactError &&
              contactMessages.length > 0 && (
                <div className="mt-6 space-y-4">
                  {contactMessages.map((item) => (
                    <div
                      key={item.message_id}
                      className="rounded-xl border border-slate-700 bg-[#1e293b] p-5 transition hover:border-[#d4af37]/30"
                    >
                      {/* MESSAGE HEADER */}

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <MessageSquare
                              size={17}
                              className="shrink-0 text-[#d4af37]"
                            />

                            <h3 className="truncate text-base font-semibold text-white">
                              {item.subject}
                            </h3>
                          </div>

                          <div className="mt-3 space-y-1.5">
                            <p className="flex items-center gap-2 text-sm text-slate-400">
                              <UserRound
                                size={14}
                                className="text-slate-500"
                              />
                              From: {item.name}
                            </p>

                            <p className="flex items-center gap-2 text-sm text-slate-400">
                              <Mail
                                size={14}
                                className="text-slate-500"
                              />
                              {item.email}
                            </p>
                          </div>
                        </div>

                        {/* DATE */}

                        <p className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 size={13} />

                          {item.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleString()
                            : ""}
                        </p>
                      </div>

                      {/* MESSAGE */}

                      <div className="mt-4 rounded-xl border border-slate-600 bg-[#0f172a] p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {item.message}
                        </p>
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