import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPackages } from "../services/packageService";
import { getDestinations } from "../services/destinationService";
import Loader from "../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../components/ErrorMessage";

const PRICE_BANDS = [
  { label: "Under NPR 20,000", test: (p) => p < 20000 },
  { label: "NPR 20,000 - 50,000", test: (p) => p >= 20000 && p <= 50000 },
  { label: "NPR 50,000 - 100,000", test: (p) => p > 50000 && p <= 100000 },
  { label: "Above NPR 100,000", test: (p) => p > 100000 },
];

export default function Packages() {
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [priceBand, setPriceBand] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getPackages(), getDestinations()])
      .then(([pkgs, dests]) => {
        setPackages(pkgs);
        setDestinations(dests);
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load packages.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const destinationName = (id) =>
    destinations.find((d) => String(d.destination_id) === String(id))?.name || "Unknown";

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const matchesQuery =
        !query ||
        p.package_name.toLowerCase().includes(query.toLowerCase()) ||
        destinationName(p.destination_id).toLowerCase().includes(query.toLowerCase());
      const matchesDestination = !destinationFilter || String(p.destination_id) === destinationFilter;
      const band = PRICE_BANDS.find((b) => b.label === priceBand);
      const matchesPrice = !band || band.test(Number(p.price));
      return matchesQuery && matchesDestination && matchesPrice;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, destinations, query, destinationFilter, priceBand]);

  return (
    <div>
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">Tour Packages</h1>
          <p className="mt-2 text-text-muted">Browse packages listed by verified agencies.</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search package or destination..."
            className="input-field mt-6 max-w-lg"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[240px_1fr] md:px-8">
        <aside className="card h-fit p-5">
          <p className="mb-4 font-semibold text-text-main">Filters</p>

          <p className="mb-2 text-sm font-medium text-text-main">Destination</p>
          <div className="mb-6 space-y-2">
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="radio"
                name="destination"
                checked={destinationFilter === ""}
                onChange={() => setDestinationFilter("")}
              />
              All destinations
            </label>
            {destinations.map((d) => (
              <label key={d.destination_id} className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  type="radio"
                  name="destination"
                  checked={destinationFilter === String(d.destination_id)}
                  onChange={() => setDestinationFilter(String(d.destination_id))}
                />
                {d.name}
              </label>
            ))}
          </div>

          <p className="mb-2 text-sm font-medium text-text-main">Price</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input type="radio" name="price" checked={priceBand === ""} onChange={() => setPriceBand("")} />
              Any price
            </label>
            {PRICE_BANDS.map((b) => (
              <label key={b.label} className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  type="radio"
                  name="price"
                  checked={priceBand === b.label}
                  onChange={() => setPriceBand(b.label)}
                />
                {b.label}
              </label>
            ))}
          </div>
        </aside>

        <div>
          {loading && <Loader label="Loading packages..." />}
          {!loading && error && <ErrorMessage message={error} onRetry={load} />}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-text-muted">No packages match your filters.</p>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <Link
                  key={p.package_id}
                  to={`/packages/${p.package_id}`}
                  className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
                >
                  <div className="h-44 w-full overflow-hidden bg-base-surface">
                    {p.image ? (
                      <img src={p.image} alt={p.package_name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-subtle">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-text-main">{p.package_name}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {destinationName(p.destination_id)} · {p.duration}
                    </p>
                    <p className="mt-2 font-bold text-accent-secondary">NPR {Number(p.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}