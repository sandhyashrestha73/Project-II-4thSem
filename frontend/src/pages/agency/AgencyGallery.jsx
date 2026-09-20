import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import {
  getGallery,
  createGalleryImage,
  deleteGalleryImage,
} from "../../services/galleryService";

const emptyForm = { title: "", image: "" };

export default function AgencyGallery() {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    getGallery()
      .then((all) => setImages(all.filter((img) => String(img.agency_id) === String(user.id))))
      .catch((err) => setError(extractErrorMessage(err, "Could not load your gallery.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [user.id]);

  function openCreate() {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      // create_gallery reads agency_id from the request body, not the JWT
      await createGalleryImage({ ...form, agency_id: user.id });
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(extractErrorMessage(err, "Could not upload this image."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this image?")) return;
    try {
      await deleteGalleryImage(id);
      setImages((prev) => prev.filter((img) => img.image_id !== id));
    } catch (err) {
      alert(extractErrorMessage(err, "Could not remove this image."));
    }
  }

  return (
    <DashboardLayout portalLabel="AGENCY PORTAL" navItems={agencyNavItems}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Gallery</h1>
        <button onClick={openCreate} className="btn-primary">
          + Add Image
        </button>
      </div>

      <div className="mt-8">
        {loading && <Loader label="Loading gallery..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && images.length === 0 && (
          <div className="card p-10 text-center text-slate-400">No images uploaded yet.</div>
        )}
        {!loading && !error && images.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
              <div key={img.image_id} className="card overflow-hidden">
                <div className="h-32 w-full bg-base-surface">
                  <img src={img.image} alt={img.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm text-white">{img.title}</p>
                  <button
                    onClick={() => handleDelete(img.image_id)}
                    className="mt-2 text-xs font-medium text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Gallery Image">
        {formError && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {formError}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Title"
            className="input-field"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            required
            placeholder="Image URL"
            className="input-field"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Uploading..." : "Add Image"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
