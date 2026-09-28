
/*import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPackages } from "../services/packageService";
import { getDestinations } from "../services/destinationService";
import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";
import { getImageUrl } from "../utils/imageUrl";

const PRICE_BANDS = [
  {
    label: "Under NPR 20,000",
    test: (p) => p < 20000,
  },
  {
    label: "NPR 20,000 - 50,000",
    test: (p) => p >= 20000 && p <= 50000,
  },
  {
    label: "NPR 50,000 - 100,000",
    test: (p) => p > 50000 && p <= 100000,
  },
  {
    label: "Above NPR 100,000",
    test: (p) => p > 100000,
  },
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
      .catch((err) =>
        setError(
          extractErrorMessage(err, "Could not load packages.")
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const destinationName = (id) =>
    destinations.find(
      (d) => String(d.destination_id) === String(id)
    )?.name || "Unknown";

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const matchesQuery =
        !query ||
        p.package_name
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        destinationName(p.destination_id)
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesDestination =
        !destinationFilter ||
        String(p.destination_id) === destinationFilter;

      const band = PRICE_BANDS.find(
        (b) => b.label === priceBand
      );

      const matchesPrice =
        !band || band.test(Number(p.price));

      return (
        matchesQuery &&
        matchesDestination &&
        matchesPrice
      );
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    packages,
    destinations,
    query,
    destinationFilter,
    priceBand,
  ]);

  return (
    <div>
      {/* Header }
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">Tour Packages</h1>

          <p className="mt-2 text-text-muted">
            Browse packages listed by verified agencies.
          </p>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search package or destination..."
            className="input-field mt-6 max-w-lg"
          />
        </div>
      </section>

      {/* Main Content }
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[240px_1fr] md:px-8">
        {/* Filters }
        <aside className="card h-fit p-5">
          <p className="mb-4 font-semibold text-text-main">
            Filters
          </p>

          <p className="mb-2 text-sm font-medium text-text-main">
            Destination
          </p>

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
              <label
                key={d.destination_id}
                className="flex items-center gap-2 text-sm text-text-muted"
              >
                <input
                  type="radio"
                  name="destination"
                  checked={
                    destinationFilter ===
                    String(d.destination_id)
                  }
                  onChange={() =>
                    setDestinationFilter(
                      String(d.destination_id)
                    )
                  }
                />

                {d.name}
              </label>
            ))}
          </div>

          <p className="mb-2 text-sm font-medium text-text-main">
            Price
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="radio"
                name="price"
                checked={priceBand === ""}
                onChange={() => setPriceBand("")}
              />
              Any price
            </label>

            {PRICE_BANDS.map((b) => (
              <label
                key={b.label}
                className="flex items-center gap-2 text-sm text-text-muted"
              >
                <input
                  type="radio"
                  name="price"
                  checked={priceBand === b.label}
                  onChange={() =>
                    setPriceBand(b.label)
                  }
                />

                {b.label}
              </label>
            ))}
          </div>
        </aside>

        {/* Packages }
        <div>
          {loading && (
            <Loader label="Loading packages..." />
          )}

          {!loading && error && (
            <ErrorMessage
              message={error}
              onRetry={load}
            />
          )}

          {!loading &&
            !error &&
            filtered.length === 0 && (
              <p className="text-text-muted">
                No packages match your filters.
              </p>
            )}

          {!loading &&
            !error &&
            filtered.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <Link
                    key={p.package_id}
                    to={`/packages/${p.package_id}`}
                    className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
                  >
                    <div className="h-44 w-full overflow-hidden bg-base-surface">
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
                        {destinationName(p.destination_id)} ·{" "}
                        {p.duration}
                      </p>

                      <p className="mt-2 font-bold text-accent-secondary">
                        NPR{" "}
                        {Number(p.price).toLocaleString()}
                      </p>
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
*/



import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import { getPackages } from "../services/packageService";
import { getDestinations } from "../services/destinationService";
import { getVerifiedAgencies } from "../services/agencyService";

import { useAuth } from "../context/AuthContext";

import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";

import { getImageUrl } from "../utils/imageUrl";

const PRICE_BANDS = [
  {
    label: "Under NPR 20,000",
    test: (p) => p < 20000,
  },
  {
    label: "NPR 20,000 - 50,000",
    test: (p) => p >= 20000 && p <= 50000,
  },
  {
    label: "NPR 50,000 - 100,000",
    test: (p) => p > 50000 && p <= 100000,
  },
  {
    label: "Above NPR 100,000",
    test: (p) => p > 100000,
  },
];

export default function Packages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  // Only tourist can compare packages
  const isTourist = user?.role === "tourist";

  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [agencies, setAgencies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState(
    searchParams.get("q") || ""
  );

  const [destinationFilter, setDestinationFilter] =
    useState("");

  const [priceBand, setPriceBand] = useState("");

  // Packages selected for comparison
  const [comparePackages, setComparePackages] = useState([]);

  function load() {
    setLoading(true);
    setError("");

    Promise.all([
      getPackages(),
      getDestinations(),
      getVerifiedAgencies(),
    ])
      .then(([pkgs, dests, agencyData]) => {
        setPackages(pkgs);
        setDestinations(dests);

        setAgencies(
          Array.isArray(agencyData)
            ? agencyData
            : agencyData?.agencies || []
        );
      })
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load packages."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const destinationName = (id) =>
    destinations.find(
      (d) =>
        String(d.destination_id) === String(id)
    )?.name || "Unknown";

  const agencyName = (id) =>
    agencies.find(
      (a) =>
        String(a.agency_id) === String(id)
    )?.agency_name || "Unknown Agency";

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const matchesQuery =
        !query ||
        p.package_name
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        destinationName(p.destination_id)
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesDestination =
        !destinationFilter ||
        String(p.destination_id) ===
          destinationFilter;

      const band = PRICE_BANDS.find(
        (b) => b.label === priceBand
      );

      const matchesPrice =
        !band || band.test(Number(p.price));

      return (
        matchesQuery &&
        matchesDestination &&
        matchesPrice
      );
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    packages,
    destinations,
    query,
    destinationFilter,
    priceBand,
  ]);

  // Check whether package can be compared
  function canCompare(packageItem) {
    // First package can always be selected
    if (comparePackages.length === 0) {
      return true;
    }

    const firstPackage = comparePackages[0];

    // Same destination required
    const sameDestination =
      String(firstPackage.destination_id) ===
      String(packageItem.destination_id);

    if (!sameDestination) {
      return false;
    }

    // Different agency required
    const sameAgency = comparePackages.some(
      (item) =>
        String(item.agency_id) ===
        String(packageItem.agency_id)
    );

    if (sameAgency) {
      return false;
    }

    return true;
  }

  // Add/remove package from comparison
  function toggleCompare(packageItem) {
    const alreadySelected = comparePackages.some(
      (item) =>
        String(item.package_id) ===
        String(packageItem.package_id)
    );

    // Remove package
    if (alreadySelected) {
      setComparePackages((current) =>
        current.filter(
          (item) =>
            String(item.package_id) !==
            String(packageItem.package_id)
        )
      );

      return;
    }

    // Maximum 3 packages
    if (comparePackages.length >= 3) {
      return;
    }

    // Same destination + different agency
    if (!canCompare(packageItem)) {
      alert(
        "You can compare packages from the same destination but different agencies only."
      );

      return;
    }

    setComparePackages((current) => [
      ...current,
      packageItem,
    ]);
  }

  function isSelected(packageId) {
    return comparePackages.some(
      (item) =>
        String(item.package_id) ===
        String(packageId)
    );
  }

  function openComparePage() {
    if (comparePackages.length < 2) {
      return;
    }

    navigate("/compare-packages", {
      state: {
        packages: comparePackages,
        destinations,
        agencies,
      },
    });
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">
            Tour Packages
          </h1>

          <p className="mt-2 text-text-muted">
            Browse packages listed by verified agencies
            and compare them before booking.
          </p>

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search package or destination..."
            className="input-field mt-6 max-w-lg"
          />
        </div>
      </section>

      {/* Compare Bar */}
      {isTourist && comparePackages.length > 0 && (
        <div className="sticky top-0 z-30 border-b border-base-border bg-base-bg/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div>
              <p className="font-semibold text-text-main">
                Compare Packages
              </p>

              <p className="text-sm text-text-muted">
                {comparePackages.length} of 3 packages
                selected
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {comparePackages.map((p) => (
                <button
                  key={p.package_id}
                  type="button"
                  onClick={() =>
                    toggleCompare(p)
                  }
                  className="rounded-full border border-base-border bg-base-surface px-3 py-1.5 text-sm text-text-main hover:border-accent"
                >
                  {p.package_name} ×
                </button>
              ))}

              <button
                type="button"
                onClick={openComparePage}
                disabled={
                  comparePackages.length < 2
                }
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Compare
              </button>

              <button
                type="button"
                onClick={() =>
                  setComparePackages([])
                }
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[240px_1fr] md:px-8">
        {/* Filters */}
        <aside className="card h-fit p-5">
          <p className="mb-4 font-semibold text-text-main">
            Filters
          </p>

          <p className="mb-2 text-sm font-medium text-text-main">
            Destination
          </p>

          <div className="mb-6 space-y-2">
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="radio"
                name="destination"
                checked={
                  destinationFilter === ""
                }
                onChange={() =>
                  setDestinationFilter("")
                }
              />
              All destinations
            </label>

            {destinations.map((d) => (
              <label
                key={d.destination_id}
                className="flex items-center gap-2 text-sm text-text-muted"
              >
                <input
                  type="radio"
                  name="destination"
                  checked={
                    destinationFilter ===
                    String(d.destination_id)
                  }
                  onChange={() =>
                    setDestinationFilter(
                      String(d.destination_id)
                    )
                  }
                />

                {d.name}
              </label>
            ))}
          </div>

          <p className="mb-2 text-sm font-medium text-text-main">
            Price
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="radio"
                name="price"
                checked={priceBand === ""}
                onChange={() =>
                  setPriceBand("")
                }
              />
              Any price
            </label>

            {PRICE_BANDS.map((b) => (
              <label
                key={b.label}
                className="flex items-center gap-2 text-sm text-text-muted"
              >
                <input
                  type="radio"
                  name="price"
                  checked={
                    priceBand === b.label
                  }
                  onChange={() =>
                    setPriceBand(b.label)
                  }
                />

                {b.label}
              </label>
            ))}
          </div>
        </aside>

        {/* Packages */}
        <div>
          {loading && (
            <Loader label="Loading packages..." />
          )}

          {!loading && error && (
            <ErrorMessage
              message={error}
              onRetry={load}
            />
          )}

          {!loading &&
            !error &&
            filtered.length === 0 && (
              <p className="text-text-muted">
                No packages match your filters.
              </p>
            )}

          {!loading &&
            !error &&
            filtered.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => {
                  const selected = isSelected(
                    p.package_id
                  );

                  const compareAllowed =
                    canCompare(p);

                  return (
                    <div
                      key={p.package_id}
                      className={`card group overflow-hidden transition ${
                        selected
                          ? "border-accent ring-2 ring-accent/20"
                          : "hover:-translate-y-1 hover:border-accent/50"
                      }`}
                    >
                      {/* Image */}
                      <Link
                        to={`/packages/${p.package_id}`}
                        className="block"
                      >
                        <div className="h-44 w-full overflow-hidden bg-base-surface">
                          {p.image ? (
                            <img
                              src={getImageUrl(
                                p.image
                              )}
                              alt={p.package_name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={() => {
                                console.log(
                                  "Package image failed:",
                                  getImageUrl(
                                    p.image
                                  )
                                );
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-text-subtle">
                              No image
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Package Info */}
                      <div className="p-4">
                        <Link
                          to={`/packages/${p.package_id}`}
                        >
                          <p className="font-semibold text-text-main hover:text-accent">
                            {p.package_name}
                          </p>

                          <p className="mt-1 text-sm text-text-muted">
                            {destinationName(
                              p.destination_id
                            )}{" "}
                            · {p.duration}
                          </p>

                          {/* Agency Name */}
                          <p className="mt-1 text-sm text-accent-secondary">
                            {agencyName(
                              p.agency_id
                            )}
                          </p>

                          <p className="mt-2 font-bold text-accent-secondary">
                            NPR{" "}
                            {Number(
                              p.price
                            ).toLocaleString()}
                          </p>
                        </Link>

                        {/* Compare Button - Tourist Only */}
                        {isTourist && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleCompare(p)
                            }
                            disabled={
                              !selected &&
                              (comparePackages.length >=
                                3 ||
                                !compareAllowed)
                            }
                            title={
                              !selected &&
                              comparePackages.length >
                                0 &&
                              !compareAllowed
                                ? "Choose a package from the same destination and a different agency."
                                : ""
                            }
                            className={`mt-4 w-full rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                              selected
                                ? "border-accent bg-accent text-white"
                                : compareAllowed
                                ? "border-base-border text-text-main hover:border-accent hover:text-accent"
                                : "cursor-not-allowed border-base-border text-text-subtle opacity-50"
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {selected
                              ? "✓ Added to Compare"
                              : "Add to Compare"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </section>
    </div>
  );
}