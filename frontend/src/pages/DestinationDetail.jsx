import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDestination } from "../services/destinationService";
import { getPackages } from "../services/packageService";
import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";
import { getImageUrl } from "../utils/imageUrl";

export default function DestinationDetail() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");

    Promise.all([getDestination(id), getPackages()])
      .then(([dest, allPackages]) => {
        setDestination(dest);

        setPackages(
          allPackages.filter(
            (p) => String(p.destination_id) === String(id)
          )
        );
      })
      .catch((err) =>
        setError(extractErrorMessage(err, "Destination not found."))
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  if (loading) {
    return <Loader label="Loading destination..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );
  }

  if (!destination) return null;

  return (
    <div>
      {/* Destination Image */}
      <div className="h-72 w-full overflow-hidden bg-base-surface md:h-96">
        {destination.image ? (
          <img
            src={getImageUrl(destination.image)}
            alt={destination.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              console.log(
                "Destination image failed:",
                getImageUrl(destination.image)
              );
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-subtle">
            No image
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <h1 className="text-3xl font-extrabold text-text-main md:text-4xl">
          {destination.name}
        </h1>

        <p className="mt-1 text-accent-secondary">
          {destination.district}
        </p>

        <p className="mt-6 leading-relaxed text-text-muted">
          {destination.description ||
            "No description provided for this destination yet."}
        </p>

        {/* Packages */}
        <h2 className="mt-12 text-2xl font-bold text-text-main">
          Packages for this destination
        </h2>

        {packages.length === 0 ? (
          <p className="mt-4 text-text-muted">
            No packages currently cover this destination.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {packages.map((p) => (
              <Link
                key={p.package_id}
                to={`/packages/${p.package_id}`}
                className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
              >
                <div className="h-40 w-full overflow-hidden bg-base-surface">
                  {p.image ? (
                    <img
                      src={getImageUrl(p.image)}
                      alt={p.package_name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.log(
                          "Package image failed:",
                          getImageUrl(p.image)
                        );
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-subtle">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-semibold text-text-main">
                    {p.package_name}
                  </p>

                  <p className="mt-1 text-sm text-text-muted">
                    {p.duration}
                  </p>

                  <p className="mt-2 font-bold text-accent-secondary">
                    NPR {Number(p.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/destinations"
          className="mt-10 inline-block text-sm font-medium text-accent-secondary hover:underline"
        >
          ← Back to all destinations
        </Link>
      </div>
    </div>
  );
}