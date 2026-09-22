import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import {
  getGallery,
  createGalleryImage,
  deleteGalleryImage,
} from "../../services/galleryService";
import { API_BASE_URL } from "../../api/axios";

const emptyForm = {
  title: "",
  image: null,
};

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
      .then((all) => {
        setImages(
          all.filter(
            (img) =>
              String(img.agency_id) === String(user.id)
          )
        );
      })
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load your gallery."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [user.id]);

  function openCreate() {
    setForm(emptyForm);
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

    if (!form.image) {
      setFormError("Please select an image.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("agency_id", user.id);
      formData.append("image", form.image);

      await createGalleryImage(formData);

      setModalOpen(false);
      setForm(emptyForm);

      load();
    } catch (err) {
      console.log("GALLERY SAVE STATUS:", err.response?.status);
      console.log("GALLERY SAVE DATA:", err.response?.data);

      setFormError(
        extractErrorMessage(
          err,
          "Could not upload this image."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this image?")) {
      return;
    }

    try {
      await deleteGalleryImage(id);

      setImages((prev) =>
        prev.filter(
          (img) => img.image_id !== id
        )
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not remove this image."
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
          Gallery
        </h1>

        <button
          onClick={openCreate}
          className="btn-primary"
        >
          + Add Image
        </button>
      </div>

      <div className="mt-8">
        {loading && (
          <Loader label="Loading gallery..." />
        )}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        )}

        {!loading &&
          !error &&
          images.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              No images uploaded yet.
            </div>
          )}

        {!loading &&
          !error &&
          images.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => (
                <div
                  key={img.image_id}
                  className="card overflow-hidden"
                >
                  <div className="h-40 w-full bg-base-surface">
                    <img
                      src={getImageUrl(img.image)}
                      alt={img.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-white">
                      {img.title}
                    </p>

                    <button
                      onClick={() =>
                        handleDelete(img.image_id)
                      }
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Gallery Image"
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
            placeholder="Image title"
            className="input-field"
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                title: e.target.value,
              }))
            }
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Select Image
            </label>

            <input
              required
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
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving
              ? "Uploading..."
              : "Add Image"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}