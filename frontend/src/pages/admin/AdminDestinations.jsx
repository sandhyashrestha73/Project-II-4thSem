import { useEffect, useState } from "react";
import {
  MapPinned,
  Plus,
  MapPin,
  ImagePlus,
  Upload,
  CheckCircle2,
  Clock3,
  XCircle,
  Pencil,
  Trash2,
  FileText,
  UserRound,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import { getImageUrl } from "../../utils/imageUrl";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import Modal from "../../components/Modal";

import {
  getAdminDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  approveDestination,
  rejectDestination,
} from "../../services/destinationService";

const emptyForm = {
  name: "",
  district: "",
  description: "",
  image: null,
};

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  // =========================================================
  // LOAD DESTINATIONS
  // =========================================================

  function load() {
    setLoading(true);
    setError("");

    getAdminDestinations()
      .then(setDestinations)
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load destinations."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  // =========================================================
  // CREATE
  // =========================================================

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  // =========================================================
  // EDIT
  // =========================================================

  function openEdit(destination) {
    setEditingId(destination.destination_id);

    setForm({
      name: destination.name,
      district: destination.district,
      description: destination.description || "",
      image: null,
    });

    setFormError("");
    setModalOpen(true);
  }

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  function handleFileChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );
      return;
    }

    setForm((current) => ({
      ...current,
      image: file,
    }));

    setFormError("");
  }

  // =========================================================
  // SAVE DESTINATION
  // =========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("district", form.district);
      formData.append("description", form.description);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {
        await updateDestination(
          editingId,
          formData
        );
      } else {
        if (!form.image) {
          setFormError(
            "Please select a destination image."
          );

          setSaving(false);
          return;
        }

        await createDestination(formData);
      }

      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(
        extractErrorMessage(
          err,
          "Could not save this destination."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // DELETE
  // =========================================================

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Delete this destination?"
      )
    ) {
      return;
    }

    try {
      await deleteDestination(id);

      setDestinations((previous) =>
        previous.filter(
          (destination) =>
            destination.destination_id !== id
        )
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not delete this destination."
        )
      );
    }
  }

  // =========================================================
  // APPROVE
  // =========================================================

  async function handleApprove(id) {
    if (
      !window.confirm(
        "Approve this destination?"
      )
    ) {
      return;
    }

    setActionLoading(id);

    try {
      await approveDestination(id);

      setDestinations((previous) =>
        previous.map((destination) =>
          destination.destination_id === id
            ? {
                ...destination,
                status: "Approved",
              }
            : destination
        )
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not approve this destination."
        )
      );
    } finally {
      setActionLoading(null);
    }
  }

  // =========================================================
  // REJECT
  // =========================================================

  async function handleReject(id) {
    if (
      !window.confirm(
        "Reject this destination?"
      )
    ) {
      return;
    }

    setActionLoading(id);

    try {
      await rejectDestination(id);

      setDestinations((previous) =>
        previous.map((destination) =>
          destination.destination_id === id
            ? {
                ...destination,
                status: "Rejected",
              }
            : destination
        )
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not reject this destination."
        )
      );
    } finally {
      setActionLoading(null);
    }
  }

  // =========================================================
  // FILTER DESTINATIONS
  // =========================================================

  const filteredDestinations =
    activeFilter === "All"
      ? destinations
      : destinations.filter(
          (destination) =>
            destination.status === activeFilter
        );

  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const allCount = destinations.length;

  const pendingCount = destinations.filter(
    (destination) =>
      destination.status === "Pending"
  ).length;

  const approvedCount = destinations.filter(
    (destination) =>
      destination.status === "Approved"
  ).length;

  const rejectedCount = destinations.filter(
    (destination) =>
      destination.status === "Rejected"
  ).length;

  // =========================================================
  // STATUS BADGE
  // =========================================================

  function getStatusClass(status) {
    if (status === "Approved") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }

    if (status === "Rejected") {
      return "bg-red-500/10 text-red-400 border-red-500/30";
    }

    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }

  function getStatusIcon(status) {
    if (status === "Approved") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "Rejected") {
      return <XCircle size={14} />;
    }

    return <Clock3 size={14} />;
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                <MapPinned size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Destinations
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Manage destinations submitted by admin
                  and agencies.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
          >
            <Plus size={18} />
            Add Destination
          </button>
        </div>
      </div>

      {/* =====================================================
          FILTER BUTTONS
      ===================================================== */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "All",
            count: allCount,
            icon: MapPinned,
          },
          {
            label: "Pending",
            count: pendingCount,
            icon: Clock3,
          },
          {
            label: "Approved",
            count: approvedCount,
            icon: CheckCircle2,
          },
          {
            label: "Rejected",
            count: rejectedCount,
            icon: XCircle,
          },
        ].map((filter) => {
          const Icon = filter.icon;
          const isActive =
            activeFilter === filter.label;

          return (
            <button
              key={filter.label}
              onClick={() =>
                setActiveFilter(filter.label)
              }
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"
                  : "border-slate-700 bg-[#0f172a] text-slate-300 hover:border-[#d4af37]/30 hover:bg-[#1e293b]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={17} />
                {filter.label}
              </span>

              <span
                className={
                  isActive
                    ? "rounded-full bg-[#d4af37] px-2 py-0.5 text-xs font-bold text-[#0f172a]"
                    : "rounded-full bg-[#1e293b] px-2 py-0.5 text-xs text-slate-300"
                }
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =====================================================
          DESTINATIONS
      ===================================================== */}

      <div className="mt-8">
        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading destinations..." />
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
          filteredDestinations.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <MapPinned size={27} />
              </div>

              <p className="mt-4 font-semibold text-white">
                No {activeFilter.toLowerCase()} destinations
                found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Try selecting another filter or add a new
                destination.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredDestinations.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDestinations.map(
                (destination) => {
                  const isPending =
                    destination.status ===
                    "Pending";

                  const isProcessing =
                    actionLoading ===
                    destination.destination_id;

                  return (
                    <div
                      key={
                        destination.destination_id
                      }
                      className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/30"
                    >
                      {/* IMAGE */}

                      <div className="relative h-44 w-full bg-[#1e293b]">
                        {destination.image ? (
                          <img
                            src={getImageUrl(
                              destination.image
                            )}
                            alt={
                              destination.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                            <ImagePlus size={30} />
                            <span className="text-sm">
                              No image
                            </span>
                          </div>
                        )}

                        <div className="absolute right-3 top-3">
                          <span
                            className={`flex items-center gap-1.5 rounded-full border bg-[#0f172a]/90 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${getStatusClass(
                              destination.status
                            )}`}
                          >
                            {getStatusIcon(
                              destination.status
                            )}
                            {destination.status}
                          </span>
                        </div>
                      </div>

                      {/* CONTENT */}

                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                            <MapPin size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-white">
                              {destination.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                              <MapPin size={14} />
                              {destination.district}
                            </p>
                          </div>
                        </div>

                        {/* CREATED BY */}

                        <div className="mt-4 rounded-xl border border-slate-700 bg-[#1e293b] p-3">
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <UserRound size={13} />
                            Created by
                          </p>

                          <p className="mt-1 text-sm text-slate-200">
                            {destination.created_by_type ===
                            "agency"
                              ? destination.created_by_agency_name ||
                                `Agency #${destination.created_by_agency_id}`
                              : "Admin"}
                          </p>
                        </div>

                        {/* DESCRIPTION */}

                        {destination.description && (
                          <div className="mt-4 flex gap-2">
                            <FileText
                              size={16}
                              className="mt-0.5 shrink-0 text-slate-500"
                            />

                            <p className="line-clamp-2 text-sm leading-5 text-slate-400">
                              {
                                destination.description
                              }
                            </p>
                          </div>
                        )}

                        {/* ACTIONS */}

                        <div className="mt-5 flex flex-wrap gap-2">
                          {/* PENDING ACTIONS */}

                          {isPending && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(
                                    destination.destination_id
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#d4af37] px-3 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <CheckCircle2
                                  size={16}
                                />

                                {isProcessing
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                onClick={() =>
                                  handleReject(
                                    destination.destination_id
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </>
                          )}

                          {/* EDIT */}

                          <button
                            onClick={() =>
                              openEdit(
                                destination
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-600 bg-[#1e293b] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          {/* DELETE */}

                          <button
                            onClick={() =>
                              handleDelete(
                                destination.destination_id
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <Modal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title={
          editingId
            ? "Edit Destination"
            : "Add Destination"
        }
      >
        {formError && (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {formError}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-500">
              Destination Name
            </label>

            <input
              required
              placeholder="Destination name"
              className="input-field"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-500">
              District
            </label>

            <input
              required
              placeholder="District"
              className="input-field"
              value={form.district}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  district: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-500">
              Description
            </label>

            <textarea
              rows={3}
              placeholder="Description"
              className="input-field resize-none"
              value={form.description}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <ImagePlus
                size={16}
                className="text-[#d4af37]"
              />
              Destination Image
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="input-field"
              onChange={handleFileChange}
            />

            {form.image && (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Upload size={14} />
                Selected: {form.image.name}
              </p>
            )}

            {editingId &&
              !form.image && (
                <p className="mt-2 text-xs text-slate-500">
                  Leave empty to keep the existing image.
                </p>
              )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={17} />

            {saving
              ? "Uploading..."
              : editingId
              ? "Save Changes"
              : "Add Destination"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}