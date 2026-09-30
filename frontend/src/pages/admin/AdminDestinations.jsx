
import { useEffect, useState } from "react";
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
      return "bg-green-500/10 text-green-300 border-green-500/30";
    }

    if (status === "Rejected") {
      return "bg-red-500/10 text-red-300 border-red-500/30";
    }

    return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
  }

  return (
    <DashboardLayout
      portalLabel="ADMIN PORTAL"
      navItems={adminNavItems}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">
            Destinations
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage destinations submitted by admin
            and agencies.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="btn-primary"
        >
          + Add Destination
        </button>
      </div>

      {/* =====================================================
          FILTER BUTTONS
      ===================================================== */}

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          {
            label: "All",
            count: allCount,
          },
          {
            label: "Pending",
            count: pendingCount,
          },
          {
            label: "Approved",
            count: approvedCount,
          },
          {
            label: "Rejected",
            count: rejectedCount,
          },
        ].map((filter) => (
          <button
            key={filter.label}
            onClick={() =>
              setActiveFilter(filter.label)
            }
            className={
              activeFilter === filter.label
                ? "rounded-lg bg-base-accent px-4 py-2 text-sm font-semibold text-black"
                : "rounded-lg border border-base-border bg-base-card px-4 py-2 text-sm text-slate-300 hover:bg-base-surface"
            }
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* =====================================================
          DESTINATIONS
      ===================================================== */}

      <div className="mt-8">
        {loading && (
          <Loader label="Loading destinations..." />
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
            <div className="card p-10 text-center text-slate-400">
              No {activeFilter.toLowerCase()} destinations found.
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
                      className="card overflow-hidden"
                    >
                      {/* IMAGE */}

                      <div className="h-40 w-full bg-base-surface">
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
                          <div className="flex h-full items-center justify-center text-slate-600">
                            No image
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {destination.name}
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              {destination.district}
                            </p>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              destination.status
                            )}`}
                          >
                            {destination.status}
                          </span>
                        </div>

                        {/* CREATED BY */}

                        <div className="mt-4 rounded-lg bg-base-surface p-3">
                          <p className="text-xs text-slate-500">
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
                          <p className="mt-3 line-clamp-2 text-sm text-slate-400">
                            {
                              destination.description
                            }
                          </p>
                        )}

                        {/* ACTIONS */}

                        <div className="mt-4 flex flex-wrap gap-2">
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
                                className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
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
                                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
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
                            className="btn-secondary flex-1 text-sm"
                          >
                            Edit
                          </button>

                          {/* DELETE */}

                          <button
                            onClick={() =>
                              handleDelete(
                                destination.destination_id
                              )
                            }
                            className="btn-danger flex-1 text-sm"
                          >
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
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {formError}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
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

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Destination Image
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="input-field"
              onChange={handleFileChange}
            />

            {form.image && (
              <p className="mt-2 text-sm text-slate-400">
                Selected:{" "}
                {form.image.name}
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
            className="btn-primary w-full"
          >
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

