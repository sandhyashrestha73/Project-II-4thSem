import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import { getGallery, deleteGalleryImage } from "../../services/galleryService";
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
      .catch((err) => setError(extractErrorMessage(err, "Could not load the gallery.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

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
    <DashboardLayout portalLabel="ADMIN PORTAL" navItems={adminNavItems}>
      <h1 className="section-title">Gallery</h1>

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
                  <img src={getImageUrl(img.image)} alt={img.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm text-white">{img.title}</p>
                  <p className="text-xs text-slate-500">Agency #{img.agency_id}</p>
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
    </DashboardLayout>
  );
}
