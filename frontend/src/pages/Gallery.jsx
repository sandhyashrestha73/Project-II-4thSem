import { useEffect, useState } from "react";
import { getGallery } from "../services/galleryService";
import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";
import { getImageUrl } from "../utils/imageUrl";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);

  function load() {
    setLoading(true);
    setError("");

    getGallery()
      .then((data) => {
        console.log("GALLERY FROM BACKEND:", data);
        setImages(data);
      })
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

  useEffect(() => {
    load();
  }, []);

  // Close modal with Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return (
    <div className="min-h-screen bg-base-bg">
      {/* =========================
          PAGE HEADER
      ========================== */}
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">
            Photo Gallery
          </h1>

          <p className="mt-2 text-text-muted">
            Moments shared by agencies across Nepal.
          </p>
        </div>
      </section>

      {/* =========================
          GALLERY
      ========================== */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
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
            <div className="py-16 text-center">
              <p className="text-text-muted">
                No images uploaded yet.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          images.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <button
                  key={img.image_id}
                  type="button"
                  onClick={() => setActive(img)}
                  className="group overflow-hidden rounded-2xl border border-base-border bg-base-surface text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {/* Fixed image size */}
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={getImageUrl(img.image)}
                      alt={img.title || "Gallery image"}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={() => {
                        console.log(
                          "Gallery image failed:",
                          getImageUrl(img.image)
                        );
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
      </section>

      {/* =========================
          IMAGE PREVIEW MODAL
      ========================== */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-2xl text-white transition hover:bg-black/80"
              aria-label="Close image"
            >
              ×
            </button>

            {/* Large image */}
            <div className="overflow-hidden rounded-2xl bg-black">
              <img
                src={getImageUrl(active.image)}
                alt={active.title || "Gallery image"}
                className="max-h-[78vh] w-full object-contain"
              />
            </div>

            {/* Title appears ONLY after clicking */}
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold text-white md:text-2xl">
                {active.title}
              </h2>
                {active.agency_name && (
                <p className="mt-1 text-sm text-gray-300">
                 Shared by{" "}
                  <span className="font-medium text-accent">
                  {active.agency_name}
                  </span>
                </p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}