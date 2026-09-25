/*
import { useEffect, useState } from "react";
import { getGallery } from "../services/galleryService";
import Loader from "../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../components/ErrorMessage";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    getGallery()
      .then(setImages)
      .catch((err) => setError(extractErrorMessage(err, "Could not load the gallery.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">Photo Gallery</h1>
          <p className="mt-2 text-text-muted">Moments shared by agencies across Nepal.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {loading && <Loader label="Loading gallery..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && images.length === 0 && <p className="text-text-muted">No images uploaded yet.</p>}
        {!loading && !error && images.length > 0 && (
          <div className="columns-2 gap-4 sm:columns-3 md:columns-4 [&>*]:mb-4">
            {images.map((img) => (
              <button
                key={img.image_id}
                onClick={() => setActive(img)}
                className="block w-full overflow-hidden rounded-xl border border-base-border bg-base-surface"
              >
                <img src={img.image} alt={img.title} className="w-full object-cover transition-transform duration-300 hover:scale-105" />
              </button>
            ))}
          </div>
        )}
      </section>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <div className="max-w-3xl">
            <img src={active.image} alt={active.title} className="max-h-[80vh] w-full rounded-xl object-contain" />
            <p className="mt-3 text-center text-white">{active.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}


*/


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

  useEffect(load, []);

  return (
    <div>
      {/* Header */}
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">Photo Gallery</h1>

          <p className="mt-2 text-text-muted">
            Moments shared by agencies across Nepal.
          </p>
        </div>
      </section>

      {/* Gallery */}
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
            <p className="text-text-muted">
              No images uploaded yet.
            </p>
          )}

        {!loading &&
          !error &&
          images.length > 0 && (
            <div className="columns-2 gap-4 sm:columns-3 md:columns-4 [&>*]:mb-4">
              {images.map((img) => (
                <button
                  key={img.image_id}
                  onClick={() => setActive(img)}
                  className="block w-full overflow-hidden rounded-xl border border-base-border bg-base-surface"
                >
                  <img
                    src={getImageUrl(img.image)}
                    alt={img.title}
                    className="w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => {
                      console.log(
                        "Gallery image failed:",
                        getImageUrl(img.image)
                      );
                    }}
                  />
                </button>
              ))}
            </div>
          )}
      </section>

      {/* Image Preview Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(active.image)}
              alt={active.title}
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />

            <p className="mt-3 text-center text-white">
              {active.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}