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
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
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

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError("");

    getDestinations()
      .then(setDestinations)
      .catch((err) =>
        setError(
          extractErrorMessage(err, "Could not load destinations.")
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(d) {
    setEditingId(d.destination_id);

    setForm({
      name: d.name,
      district: d.district,
      description: d.description || "",
      image: null,
    });

    setFormError("");
    setModalOpen(true);
  }

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
      setFormError("Only JPG, JPEG, PNG and WEBP images are allowed.");
      return;
    }

    setForm((f) => ({
      ...f,
      image: file,
    }));

    setFormError("");
  }

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
        await updateDestination(editingId, formData);
      } else {
        if (!form.image) {
          setFormError("Please select a destination image.");
          setSaving(false);
          return;
        }

        await createDestination(formData);
      }

      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(
        extractErrorMessage(err, "Could not save this destination.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this destination?")) return;

    try {
      await deleteDestination(id);

      setDestinations((prev) =>
        prev.filter((d) => d.destination_id !== id)
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

  return (
    <DashboardLayout
      portalLabel="ADMIN PORTAL"
      navItems={adminNavItems}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Destinations</h1>

        <button onClick={openCreate} className="btn-primary">
          + Add Destination
        </button>
      </div>

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
          destinations.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              No destinations added yet.
            </div>
          )}

        {!loading &&
          !error &&
          destinations.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((d) => (
                <div
                  key={d.destination_id}
                  className="card overflow-hidden"
                >
                  <div className="h-32 w-full bg-base-surface">
                    {d.image ? (
                      <img
                        src={getImageUrl(d.image)}
                        alt={d.name}
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
                      {d.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {d.district}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEdit(d)}
                        className="btn-secondary flex-1 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(d.destination_id)
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
              setForm((f) => ({
                ...f,
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
              setForm((f) => ({
                ...f,
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
              setForm((f) => ({
                ...f,
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
                Selected: {form.image.name}
              </p>
            )}

            {editingId && !form.image && (
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