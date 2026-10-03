import { useEffect, useState } from "react";
import {
  Images,
  ImagePlus,
  Building2,
  Trash2,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import {
  getGallery,
  deleteGalleryImage,
} from "../../services/galleryService";
import { getImageUrl } from "../../utils/imageUrl";

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");

    getGallery()
      .then(setImages)
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load the gallery."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!window.confirm("Remove this image?")) return;

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

  return (
    <DashboardLayout
      portalLabel="ADMIN PORTAL"
      navItems={adminNavItems}
    >
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Images size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Gallery
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View and manage images uploaded to
              TourEase Nepal.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading gallery..." />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          images.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <ImagePlus size={28} />
              </div>

              <h2 className="mt-4 font-semibold text-white">
                No images yet
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Images uploaded by agencies will
                appear here.
              </p>
            </div>
          )}

        {/* Gallery Grid */}
        {!loading &&
          !error &&
          images.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => (
                <div
                  key={img.image_id}
                  className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg transition duration-200 hover:border-[#d4af37]/40 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-[#1e293b]">
                    <img
                      src={getImageUrl(img.image)}
                      alt={img.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />

                   
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <p
                      className="truncate text-sm font-semibold text-white"
                      title={img.title}
                    >
                      {img.title}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/10 text-[#d4af37]">
                        <Building2 size={15} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Uploaded By
                        </p>

                        <p className="truncate text-xs font-medium text-slate-300">
                          {img.agency_name ||
                            `Agency #${img.agency_id}`}
                        </p>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          img.image_id
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
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
    </DashboardLayout>
  );
}
