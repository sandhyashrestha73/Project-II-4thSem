import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
} from "lucide-react";

import { getVerifiedAgencies } from "../services/agencyService";
import Loader from "../components/Loader";
import { getImageUrl } from "../utils/imageUrl";

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filters
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    async function loadAgencies() {
      try {
        const data = await getVerifiedAgencies();
        setAgencies(data);
      } catch (err) {
        console.error("Failed to load agencies:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load agencies."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAgencies();
  }, []);

  // =========================================================
  // FORMAT DISTRICT / ADDRESS
  // Example:
  // "chitwan" -> "Chitwan"
  // "kathmandu, nepal" -> "Kathmandu"
  // =========================================================
  const formatDistrict = (address) => {
    if (!address) return "";

    const districtName = address.split(",")[0].trim();

    return (
      districtName.charAt(0).toUpperCase() +
      districtName.slice(1).toLowerCase()
    );
  };

  // =========================================================
  // GET DISTRICTS FROM ADDRESS
  // =========================================================
  const districts = useMemo(() => {
    const uniqueDistricts = agencies
      .map((agency) => formatDistrict(agency.address))
      .filter(Boolean);

    return [...new Set(uniqueDistricts)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [agencies]);

  // =========================================================
  // SEARCH + FILTER + SORT
  // =========================================================
  const filteredAgencies = useMemo(() => {
    let result = [...agencies];

    const searchValue = search.trim().toLowerCase();

    // Search by agency name OR address
    if (searchValue) {
      result = result.filter((agency) => {
        const agencyName =
          agency.agency_name?.toLowerCase() || "";

        const address =
          agency.address?.toLowerCase() || "";

        return (
          agencyName.includes(searchValue) ||
          address.includes(searchValue)
        );
      });
    }

    // District filter
    if (district !== "All Districts") {
      result = result.filter((agency) => {
        const agencyDistrict = formatDistrict(
          agency.address
        );

        return agencyDistrict === district;
      });
    }

    // Recently Added
    if (sortBy === "recent") {
      result.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
    }

    // Top Rated
    if (sortBy === "rating") {
      result.sort((a, b) => {
        const ratingA = Number(a.average_rating) || 0;
        const ratingB = Number(b.average_rating) || 0;

        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }

        const reviewsA = Number(a.total_reviews) || 0;
        const reviewsB = Number(b.total_reviews) || 0;

        return reviewsB - reviewsA;
      });
    }

    // Name A-Z
    if (sortBy === "name") {
      result.sort((a, b) =>
        (a.agency_name || "").localeCompare(
          b.agency_name || ""
        )
      );
    }

    return result;
  }, [agencies, search, district, sortBy]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================
  const clearFilters = () => {
    setSearch("");
    setDistrict("All Districts");
    setSortBy("recent");
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return <Loader label="Loading agencies..." />;
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8">
        <p className="text-red-500">{error}</p>

        <Link
          to="/"
          className="mt-5 inline-block text-sm font-semibold text-accent-secondary hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">

      {/* =====================================================
          BACK TO HOME
      ====================================================== */}

      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-accent-secondary"
      >
        ← Back to Home
      </Link>


      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-10 text-center">

        <span className="text-sm font-semibold uppercase tracking-wider text-accent-secondary">
          Trusted Partners
        </span>

        <h1 className="mt-2 text-3xl font-bold text-text-main md:text-4xl">
          Explore Travel Agencies
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-text-muted">
          Search and explore verified tourism agencies across
          Nepal. Find agencies by name, location, ratings, or
          recently added listings.
        </p>

      </div>


      {/* =====================================================
          SEARCH BAR
      ====================================================== */}

      <div className="mb-8">

        <div className="relative">

          <Search
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agencies by name or district..."
            className="w-full rounded-xl border border-base-border bg-base-surface py-3.5 pl-12 pr-4 text-sm text-text-main outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />

        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

        {/* ===================================================
            SIDEBAR FILTER
        ==================================================== */}

        <aside className="h-fit rounded-2xl border border-base-border bg-base-surface p-5">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="font-semibold text-text-main">
              Filters
            </h2>

            {(search ||
              district !== "All Districts" ||
              sortBy !== "recent") && (

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-accent-secondary hover:underline"
              >
                Clear
              </button>

            )}

          </div>


          {/* District */}

          <div>

            <label className="text-sm font-semibold text-text-main">
              District
            </label>

            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-3 w-full rounded-lg border border-base-border bg-base-bg px-3 py-2.5 text-sm text-text-main outline-none focus:border-accent"
            >

              <option value="All Districts">
                All Districts
              </option>

              {districts.map((item) => (

                <option key={item} value={item}>
                  {item}
                </option>

              ))}

            </select>

          </div>


          {/* Sort */}

          <div className="mt-7">

            <p className="text-sm font-semibold text-text-main">
              Sort By
            </p>

            <div className="mt-3 space-y-3">

              <label className="flex cursor-pointer items-center gap-3 text-sm text-text-muted">

                <input
                  type="radio"
                  name="sort"
                  value="recent"
                  checked={sortBy === "recent"}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  className="accent-accent"
                />

                Recently Added

              </label>


              <label className="flex cursor-pointer items-center gap-3 text-sm text-text-muted">

                <input
                  type="radio"
                  name="sort"
                  value="rating"
                  checked={sortBy === "rating"}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  className="accent-accent"
                />

                Top Rated

              </label>


              <label className="flex cursor-pointer items-center gap-3 text-sm text-text-muted">

                <input
                  type="radio"
                  name="sort"
                  value="name"
                  checked={sortBy === "name"}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  className="accent-accent"
                />

                Agency Name A–Z

              </label>

            </div>

          </div>

        </aside>


        {/* ===================================================
            AGENCY RESULTS
        ==================================================== */}

        <section>

          {/* Result Header */}

          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-semibold text-text-main">
                Travel Agencies
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {filteredAgencies.length}{" "}
                {filteredAgencies.length === 1
                  ? "agency"
                  : "agencies"}{" "}
                found
              </p>

            </div>

          </div>


          {/* Empty Result */}

          {filteredAgencies.length === 0 ? (

            <div className="rounded-2xl border border-base-border bg-base-surface p-10 text-center">

              <Search
                size={36}
                className="mx-auto text-text-subtle"
              />

              <h3 className="mt-4 text-lg font-semibold text-text-main">
                No agencies found
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                Try another agency name, district, or clear
                your filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="btn-primary mt-5"
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

              {filteredAgencies.map((agency) => (

                <div
                  key={agency.agency_id}
                  className="card flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
                >

                  {/* ================= AGENCY HEADER ================= */}

                  <div className="flex items-start gap-4">

                    {/* Profile Image */}

                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-accent/30 bg-base-surface">

                      {agency.profile_image ? (

                        <img
                          src={getImageUrl(
                            agency.profile_image
                          )}
                          alt={`${agency.agency_name} profile`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-accent">
                          {agency.agency_name
                            ?.charAt(0)
                            ?.toUpperCase() || "A"}
                        </div>

                      )}

                    </div>


                    {/* Agency Name + Location */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <h2 className="min-w-0 text-lg font-semibold leading-6 text-text-main">
                          {agency.agency_name}
                        </h2>

                        <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                          ✓ Verified
                        </span>

                      </div>


                      <p className="mt-2 flex items-start gap-2 text-sm text-text-muted">

                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0"
                        />

                        <span className="line-clamp-2">
                          {agency.address ||
                            "Location not provided"}
                        </span>

                      </p>

                    </div>

                  </div>


                  {/* ================= RATING ================= */}

                  <div className="mt-5 flex items-center gap-2">

                    {Number(agency.total_reviews) > 0 ? (

                      <>
                        <div className="flex items-center gap-1">

                          <Star
                            size={17}
                            className="fill-accent text-accent"
                          />

                          <span className="text-sm font-semibold text-text-main">
                            {Number(
                              agency.average_rating
                            ).toFixed(1)}
                          </span>

                        </div>

                        <span className="text-xs text-text-muted">
                          ({agency.total_reviews}{" "}
                          {agency.total_reviews === 1
                            ? "rating"
                            : "ratings"})
                        </span>
                      </>

                    ) : (

                      <>
                        <Star
                          size={17}
                          className="text-text-subtle"
                        />

                        <span className="text-sm text-text-muted">
                          No ratings yet
                        </span>
                      </>

                    )}

                  </div>


                  {/* ================= DESCRIPTION ================= */}

                  <p className="mt-5 line-clamp-4 flex-1 text-sm leading-6 text-text-muted">
                    {agency.description ||
                      "This agency has not provided a description yet."}
                  </p>


                  {/* ================= CONTACT ================= */}

                  <div className="mt-5 space-y-3 border-t border-base-border pt-5">

                    {agency.phone && (

                      <p className="flex items-center gap-2 text-sm text-text-muted">

                        <Phone
                          size={16}
                          className="shrink-0 text-accent"
                        />

                        <span>
                          {agency.phone}
                        </span>

                      </p>

                    )}


                    {agency.email && (

                      <p className="flex items-center gap-2 text-sm text-text-muted">

                        <Mail
                          size={16}
                          className="shrink-0 text-accent"
                        />

                        <span className="break-all">
                          {agency.email}
                        </span>

                      </p>

                    )}

                  </div>


                  {/* ================= PROFILE BUTTON ================= */}

                  <Link
                    to={`/agencies/${agency.agency_id}`}
                    className="btn-primary mt-6 w-full text-center"
                  >
                    View Profile
                  </Link>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

