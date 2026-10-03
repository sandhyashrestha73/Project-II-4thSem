import { useEffect, useState } from "react";
import {
  Images,
  Plus,
  ImagePlus,
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
      console.log(
        "GALLERY SAVE STATUS:",
        err.response?.status
      );
      console.log(
        "GALLERY SAVE DATA:",
        err.response?.data
      );

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
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
              <Images size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Gallery
              </h1>

              <p className="mt-1 text-sm text-slate-300">
                Upload and manage photos for your agency gallery.
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
          >
            <Plus size={18} />
            Add Image
          </button>
        </div>
      </div>

      {/* =================================================
          GALLERY
      ================================================= */}

      <div className="mt-8">
        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading gallery..." />
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
          images.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <Images size={30} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                No Images Yet
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                No images have been uploaded to your gallery yet.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
              >
                <Plus size={18} />
                Add Image
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          images.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => (
                <div
                  key={img.image_id}
                  className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/40"
                >
                  {/* IMAGE */}

                  <div className="relative h-44 w-full bg-[#1e293b]">
                    <img
                      src={getImageUrl(img.image)}
                      alt={img.title}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#0f172a]/85 px-2.5 py-1 text-xs font-semibold text-[#d4af37] backdrop-blur-sm">
                      <Images size={13} />
                      Gallery
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <ImagePlus
                        size={16}
                        className="shrink-0 text-[#d4af37]"
                      />

                      <p className="truncate text-sm font-semibold text-white">
                        {img.title}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleDelete(img.image_id)
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={15} />
                      Delete Image
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* =================================================
          ADD GALLERY IMAGE MODAL
      ================================================= */}

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
          {/* TITLE */}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <ImagePlus
                size={16}
                className="text-[#d4af37]"
              />
              Image Title
            </label>

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
          </div>

          {/* IMAGE */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Images
                size={16}
                className="text-[#d4af37]"
              />
              Select Image
            </label>

            <input
              required
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
              : "Add Image"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}