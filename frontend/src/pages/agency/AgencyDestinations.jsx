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
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { getImageUrl } from "../../utils/imageUrl";

import {
  getAgencyDestinations,
  createDestination,
} from "../../services/destinationService";

import { agencyNavItems } from "./AgencyDashboard";

const emptyForm = {
  name: "",
  district: "",
  description: "",
  image: null,
};

export default function AgencyDestinations() {
  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [formError, setFormError] = useState("");

  const [saving, setSaving] = useState(false);

  // =======================================================
  // LOAD MY DESTINATIONS
  // =======================================================

  function load() {
    setLoading(true);
    setError("");

    getAgencyDestinations()
      .then(setDestinations)
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load your destinations."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  // =======================================================
  // OPEN CREATE MODAL
  // =======================================================

  function openCreate() {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  // =======================================================
  // IMAGE CHANGE
  // =======================================================

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

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setFormError("");
  }

  // =======================================================
  // SUBMIT DESTINATION
  // =======================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");

    if (!form.image) {
      setFormError(
        "Please select a destination image."
      );
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("district", form.district);
      formData.append(
        "description",
        form.description
      );
      formData.append("image", form.image);

      await createDestination(formData);

      setModalOpen(false);
      setForm(emptyForm);

      load();
    } catch (err) {
      setFormError(
        extractErrorMessage(
          err,
          "Could not submit destination."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  // =======================================================
  // STATUS STYLE
  // =======================================================

  function getStatusStyle(status) {
    if (status === "Approved") {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    if (status === "Rejected") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
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
      portalLabel="AGENCY PORTAL"
      navItems={agencyNavItems}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
              <MapPinned size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Manage Destinations
              </h1>

              <p className="mt-1 text-sm text-slate-300">
                Add destinations and submit them for admin approval.
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
          >
            <Plus size={18} />
            Add Destination
          </button>
        </div>
      </div>

      {/* =================================================
          DESTINATIONS
      ================================================= */}

      <div className="mt-8">
        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading your destinations..." />
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
          destinations.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <MapPinned size={30} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                No Destinations Yet
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                You have not submitted any destinations yet.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
              >
                <Plus size={18} />
                Add Destination
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          destinations.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                <div
                  key={destination.destination_id}
                  className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/40"
                >
                  {/* IMAGE */}

                  <div className="relative h-40 w-full bg-[#1e293b]">
                    {destination.image ? (
                      <img
                        src={getImageUrl(
                          destination.image
                        )}
                        alt={destination.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                        <ImagePlus size={28} />
                        <span className="text-xs">
                          No image
                        </span>
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#0f172a]/85 px-2.5 py-1 text-xs font-semibold text-[#d4af37] backdrop-blur-sm">
                      <MapPinned size={13} />
                      Destination
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={17}
                            className="shrink-0 text-[#d4af37]"
                          />

                          <p className="truncate font-semibold text-white">
                            {destination.name}
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {destination.district}
                        </p>
                      </div>

                      {/* STATUS */}

                      <span
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          destination.status
                        )}`}
                      >
                        {getStatusIcon(
                          destination.status
                        )}

                        {destination.status}
                      </span>
                    </div>

                    {/* DESCRIPTION */}

                    {destination.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                        {destination.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* =================================================
          ADD DESTINATION MODAL
      ================================================= */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Destination"
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
          {/* NAME */}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <MapPinned
                size={16}
                className="text-[#d4af37]"
              />
              Destination Name
            </label>

            <input
              required
              placeholder="Destination name"
              className="input-field"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          {/* DISTRICT */}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <MapPin
                size={16}
                className="text-[#d4af37]"
              />
              District
            </label>

            <input
              required
              placeholder="District"
              className="input-field"
              value={form.district}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  district: e.target.value,
                }))
              }
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <FileTextIcon />
              Description
            </label>

            <textarea
              required
              rows={4}
              placeholder="Destination description"
              className="input-field resize-none"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* IMAGE */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <ImagePlus
                size={16}
                className="text-[#d4af37]"
              />
              Destination Image
            </label>

            <input
              required
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="block w-full cursor-pointer rounded-xl border border-slate-600 bg-[#1e293b] p-2.5 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#d4af37] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#0f172a]"
              onChange={handleFileChange}
            />

            {form.image && (
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2
                  size={14}
                  className="text-emerald-400"
                />
                Selected: {form.image.name}
              </p>
            )}
          </div>

          {/* APPROVAL MESSAGE */}

          <div className="flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm leading-5 text-slate-400">
            <Clock3
              size={17}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <p>
              Your destination will be submitted to the
              admin for approval. It will become publicly
              visible only after approval.
            </p>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={17} />

            {saving
              ? "Submitting..."
              : "Submit Destination"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

// Small icon component for the description field
function FileTextIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#d4af37]"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}