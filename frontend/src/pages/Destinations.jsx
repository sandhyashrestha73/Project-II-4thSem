import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDestinations } from "../services/destinationService";
import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";
import { getImageUrl } from "../utils/imageUrl";

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  function load() {
    setLoading(true);
    setError("");

    getDestinations()
      .then((data) => {
        console.log("DESTINATIONS FROM BACKEND:", data);
        setDestinations(data);
      })
      .catch((err) =>
        setError(
          extractErrorMessage(err, "Could not load destinations.")
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = destinations.filter((d) => {
    const q = query.toLowerCase();

    return (
      d.name.toLowerCase().includes(q) ||
      d.district.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">Destinations</h1>

          <p className="mt-2 text-text-muted">
            Explore places across Nepal covered by our agencies.
          </p>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or district..."
            className="input-field mt-6 max-w-md"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {loading && <Loader label="Loading destinations..." />}

        {!loading && error && (
          <ErrorMessage message={error} onRetry={load} />
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-text-muted">
            No destinations found.
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((d) => (
              <Link
                key={d.destination_id}
                to={`/destinations/${d.destination_id}`}
                className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
              >
                <div className="h-40 w-full overflow-hidden bg-base-surface">
                  {d.image ? (
                    <img
                      src={getImageUrl(d.image)}
                      alt={d.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => {
                        console.log(
                          "Destination image failed:",
                          getImageUrl(d.image)
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
                    {d.name}
                  </p>

                  <p className="text-sm text-text-muted">
                    {d.district}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}