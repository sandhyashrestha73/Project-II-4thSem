import { useEffect, useState } from "react";
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">
          Manage Packages
        </h1>

        <button
          onClick={openCreate}
          className="btn-primary"
        >
          + Add Package
        </button>
      </div>

      <div className="mt-8">
        {loading && (
          <Loader label="Loading packages..." />
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
            <div className="card p-10 text-center text-slate-400">
              You haven't added any packages yet.
            </div>
          )}

        {!loading &&
          !error &&
          packages.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <div
                  key={p.package_id}
                  className="card overflow-hidden"
                >
                  <div className="h-36 w-full bg-base-surface">
                    {p.image ? (
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.package_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-600">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-white">
                      {p.package_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {p.duration}
                    </p>

                    <p className="mt-2 font-bold text-accent">
                      NPR{" "}
                      {Number(
                        p.price
                      ).toLocaleString()}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() =>
                          openEdit(p)
                        }
                        className="btn-secondary flex-1 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            p.package_id
                          )
                        }
                        className="btn-danger flex-1 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

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

          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Duration (e.g. 5 Days)"
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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Package Image
            </label>

            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-lg border border-base-border bg-base-surface p-2 text-sm text-slate-300"
            />

            {form.image && (
              <p className="mt-2 text-xs text-slate-400">
                Selected: {form.image.name}
              </p>
            )}

            {editingId && !form.image && (
              <p className="mt-2 text-xs text-slate-500">
                Leave empty to keep the current image.
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
              : "Add Package"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}