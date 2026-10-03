import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  MapPin,
  Clock3,
  IndianRupee,
  ImagePlus,
  Pencil,
  Trash2,
  Upload,
  CheckCircle2,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { getDestinations } from "../../services/destinationService";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../../services/packageService";
import { API_BASE_URL } from "../../api/axios";

const emptyForm = {
  destination_id: "",
  package_name: "",
  description: "",
  duration: "",
  price: "",
  image: null,
};

export default function AgencyPackages() {
  const { user } = useAuth();

  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError("");

    Promise.all([getPackages(), getDestinations()])
      .then(([pkgs, dests]) => {
        setPackages(
          pkgs.filter(
            (p) => String(p.agency_id) === String(user.id)
          )
        );

        setDestinations(dests);
      })
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

  useEffect(() => {
    load();
  }, [user.id]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(pkg) {
    setEditingId(pkg.package_id);

    setForm({
      destination_id: pkg.destination_id,
      package_name: pkg.package_name,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      image: null,
    });

    setFormError("");
    setModalOpen(true);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      setForm((f) => ({
        ...f,
        image: null,
      }));
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        "Only PNG, JPG, JPEG and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    setFormError("");

    setForm((f) => ({
      ...f,
      image: file,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");

    if (!editingId && !form.image) {
      setFormError("Please select a package image.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append(
        "destination_id",
        form.destination_id
      );

      formData.append(
        "package_name",
        form.package_name
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "duration",
        form.duration
      );

      formData.append(
        "price",
        Number(form.price)
      );

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {
        await updatePackage(
          editingId,
          formData
        );
      } else {
        await createPackage(formData);
      }

      setModalOpen(false);
      setForm(emptyForm);

      load();
    } catch (err) {
      setFormError(
        extractErrorMessage(
          err,
          "Could not save this package."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Delete this package? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deletePackage(id);

      setPackages((prev) =>
        prev.filter(
          (p) => p.package_id !== id
        )
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

  function getImageUrl(image) {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_BASE_URL}${image}`;
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
              <Package size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Manage Packages
              </h1>

              <p className="mt-1 text-sm text-slate-300">
                Create and manage the travel packages offered
                by your agency.
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
          >
            <Plus size={18} />
            Add Package
          </button>
        </div>
      </div>

      {/* =================================================
          PACKAGES
      ================================================= */}

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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <Package size={30} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                No Packages Yet
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                You haven't added any packages yet.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
              >
                <Plus size={18} />
                Add Package
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          packages.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <div
                  key={p.package_id}
                  className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/40"
                >
                  {/* IMAGE */}

                  <div className="relative h-40 w-full bg-[#1e293b]">
                    {p.image ? (
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.package_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">
                        <div className="text-center">
                          <ImagePlus
                            size={28}
                            className="mx-auto mb-2"
                          />

                          <span className="text-sm">
                            No image
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full border border-[#d4af37]/30 bg-[#0f172a]/85 px-3 py-1 text-xs font-semibold text-[#d4af37] backdrop-blur-sm">
                      Package
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-5">
                    <h3 className="font-bold text-white">
                      {p.package_name}
                    </h3>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock3
                          size={16}
                          className="text-[#d4af37]"
                        />

                        <span>{p.duration}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <IndianRupee
                          size={16}
                          className="text-[#d4af37]"
                        />

                        <span className="font-semibold text-[#d4af37]">
                          NPR{" "}
                          {Number(
                            p.price
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex gap-2 border-t border-slate-700 pt-4">
                      <button
                        onClick={() =>
                          openEdit(p)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-600 bg-[#1e293b] px-3 py-2.5 text-sm font-semibold text-white transition hover:border-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            p.package_id
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* =================================================
          PACKAGE MODAL
      ================================================= */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingId
            ? "Edit Package"
            : "Add Package"
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
          {/* DESTINATION */}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <MapPin
                size={16}
                className="text-[#d4af37]"
              />
              Destination
            </label>

            <select
              required
              className="input-field"
              value={form.destination_id}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  destination_id:
                    e.target.value,
                }))
              }
            >
              <option value="">
                Select destination
              </option>

              {destinations.map((d) => (
                <option
                  key={d.destination_id}
                  value={d.destination_id}
                >
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* PACKAGE NAME */}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Package
                size={16}
                className="text-[#d4af37]"
              />
              Package Name
            </label>

            <input
              required
              placeholder="Package name"
              className="input-field"
              value={form.package_name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  package_name:
                    e.target.value,
                }))
              }
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-500">
              Description
            </label>

            <textarea
              required
              rows={3}
              placeholder="Description"
              className="input-field resize-none"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  description:
                    e.target.value,
                }))
              }
            />
          </div>

          {/* DURATION + PRICE */}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Clock3
                  size={15}
                  className="text-[#d4af37]"
                />
                Duration
              </label>

              <input
                required
                placeholder="e.g. 5 Days"
                className="input-field"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    duration:
                      e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
                <IndianRupee
                  size={15}
                  className="text-[#d4af37]"
                />
                Price
              </label>

              <input
                required
                type="number"
                min={0}
                placeholder="Price (NPR)"
                className="input-field"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price:
                      e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* IMAGE */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <ImagePlus
                size={16}
                className="text-[#d4af37]"
              />
              Package Image
            </label>

            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-xl border border-slate-600 bg-[#1e293b] p-2.5 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#d4af37] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#0f172a]"
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

            {editingId && !form.image && (
              <p className="mt-2 text-xs text-slate-500">
                Leave empty to keep the current image.
              </p>
            )}
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={17} />

            {saving
              ? "Uploading..."
              : editingId
              ? "Save Changes"
              : "Add Package"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}