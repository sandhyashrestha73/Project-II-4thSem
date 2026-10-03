import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDestinations } from "../services/destinationService";
import { getPackages } from "../services/packageService";
import { getBlogs } from "../services/blogService";
import { getVerifiedAgencies } from "../services/agencyService";

import Loader from "../components/Loader";
import { getImageUrl } from "../utils/imageUrl";
import himalImage from "../assets/himal.png";

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [agencies, setAgencies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadHomeData() {
      const results = await Promise.allSettled([
        getDestinations(),
        getPackages(),
        getBlogs(),
      ]);

      const [destRes, pkgRes, blogRes] = results;

      // Destinations
      if (destRes.status === "fulfilled") {
        setDestinations(destRes.value.slice(0, 3));
      } else {
        console.error(
          "Destination loading failed:",
          destRes.reason
        );
      }

      // Packages
      if (pkgRes.status === "fulfilled") {
        setPackages(pkgRes.value.slice(0, 3));
      } else {
        console.error(
          "Package loading failed:",
          pkgRes.reason
        );
      }

      // Blogs
      if (blogRes.status === "fulfilled") {
        setBlogs(blogRes.value.slice(0, 3));
      } else {
        console.error(
          "Blog loading failed:",
          blogRes.reason
        );
      }

      // Stop main loading screen
      setLoading(false);

      // Load verified agencies separately
      try {
        const agencyData = await getVerifiedAgencies();

        setAgencies(agencyData.slice(0, 3));
      } catch (error) {
        console.error(
          "Verified agency loading failed:",
          error
        );

        setAgencies([]);
      }
    }

    loadHomeData();
  }, []);

  function handleSearch(e) {
    e.preventDefault();

    window.location.href = `/packages${
      search
        ? `?q=${encodeURIComponent(search)}`
        : ""
    }`;
  }

  return (
    <div>

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden py-24 md:py-32">

        {/* Animated Himalayan Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${himalImage})`,
            animation: "heroZoom 10s ease-in-out infinite",
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-8">

          <span className="badge-hero">
            Discover Nepal
          </span>

          <h1 className="hero-heading mt-5 leading-tight">
            Plan your next journey across{" "}
              <span className="text-[#d4af37]" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400 }}>
              Nepal
            </span>
          </h1>

          <p className="hero-subtext mx-auto mt-5 max-w-2xl">
            Browse tour packages, explore destinations
            and read real travel stories — all from
            agencies operating on TourEase Nepal.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-xl gap-2"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search packages by name or destination..."
              className="input-field-hero"
            />

            <button
              type="submit"
              className="btn-primary shrink-0"
            >
              Search
            </button>
          </form>

        </div>
      </section>


      {/* ================= MAIN LOADING ================= */}

      {loading ? (
        <Loader label="Loading TourEase Nepal..." />
      ) : (
        <>

          {/* ================= VERIFIED AGENCIES ================= */}

          <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

            <div className="mb-8 flex items-end justify-between">

              <div>
                <h2 className="section-title">
                  Verified Travel Agencies
                </h2>

                <p className="mt-2 text-sm text-text-muted">
                  Explore trusted tourism agencies registered
                  with TourEase Nepal.
                </p>
              </div>

              <Link
                to="/agencies"
                className="text-sm font-medium text-accent-secondary hover:underline"
              >
                View all →
              </Link>

            </div>


            {agencies.length === 0 ? (

              <p className="text-text-muted">
                No verified agencies available yet.
              </p>

            ) : (

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">

                {agencies.map((agency) => (

                  <div
                    key={agency.agency_id}
                    className="card group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
                  >

                    {/* Agency Header */}
                    <div className="flex items-start gap-4">

                      {/* Agency Profile Picture */}
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


                      {/* Agency Information */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <h3 className="text-lg font-semibold text-text-main">
                            {agency.agency_name}
                          </h3>

                          {/* Verified Badge */}
                          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            ✓ Verified
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-text-muted">
                          📍 {agency.address}
                        </p>

                      </div>

                    </div>


                    {/* Rating */}
                    <div className="mt-4 flex items-center gap-2 text-sm">

                      {Number(agency.total_reviews) > 0 ? (

                        <>
                          <span className="text-accent">
                            ★
                          </span>

                          <span className="font-semibold text-text-main">
                            {Number(
                              agency.average_rating
                            ).toFixed(1)}
                          </span>

                          <span className="text-text-muted">
                            ({agency.total_reviews}{" "}
                            {Number(agency.total_reviews) === 1
                              ? "rating"
                              : "ratings"})
                          </span>
                        </>

                      ) : (

                        <>
                          <span className="text-text-subtle">
                            ★
                          </span>

                          <span className="text-text-muted">
                            No ratings yet
                          </span>
                        </>

                      )}

                    </div>


                    {/* Description */}
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-text-muted">
                      {agency.description ||
                        "Trusted tourism agency on TourEase Nepal."}
                    </p>


                    {/* View Profile */}
                    <Link
                      to={`/agencies/${agency.agency_id}`}
                      className="mt-5 inline-flex items-center text-sm font-semibold text-accent-secondary hover:underline"
                    >
                      View Profile →
                    </Link>

                  </div>

                ))}

              </div>

            )}

          </section>


          {/* ================= POPULAR DESTINATIONS ================= */}

          <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

            <div className="mb-8 flex items-end justify-between">

              <h2 className="section-title">
                Popular Destinations
              </h2>

              <Link
                to="/destinations"
                className="text-sm font-medium text-accent-secondary hover:underline"
              >
                View all →
              </Link>

            </div>


            {destinations.length === 0 ? (

              <p className="text-text-muted">
                No destinations available yet.
              </p>

            ) : (

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">

                {destinations.map((d) => (

                  <Link
                    key={d.destination_id}
                    to={`/destinations/${d.destination_id}`}
                    className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
                  >

                    <div className="h-48 w-full overflow-hidden bg-base-surface">

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

            {/* ================= FEATURED TOUR PACKAGES ================= */}

          <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

            <div className="mb-8 flex items-end justify-between">

              <h2 className="section-title">
                Featured Tour Packages
              </h2>

            <Link
                to="/packages"
                className="text-sm font-medium text-accent-secondary hover:underline"
              >
              View all →
            </Link>

          </div>


          {packages.length === 0 ? (

            <p className="text-text-muted">
               No packages available yet.
            </p>

          ) : (

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">

              {packages.map((p) => {

              const totalReviews = Number(p.total_reviews || 0);
              const averageRating = Number(p.average_rating || 0);

        return (
          <div
            key={p.package_id}
            className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
          >

            {/* Package Image */}
            <Link to={`/packages/${p.package_id}`}>

              <div className="h-48 w-full overflow-hidden bg-base-surface">

                {p.image ? (

                  <img
                    src={getImageUrl(p.image)}
                    alt={p.package_name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                ) : (

                  <div className="flex h-full items-center justify-center text-text-subtle">
                    No image
                  </div>

                )}

              </div>

            </Link>


            {/* Package Information */}
            <div className="p-4">

              {/* Package Name */}
              <p className="font-semibold text-text-main">
                {p.package_name}
              </p>


              {/* Destination + Duration */}
              <p className="mt-1 text-sm text-text-muted">
                {p.destination_name || p.destination || "Nepal"} ·{" "}
                {p.duration}
              </p>


              {/* Package Rating */}
              <div className="mt-2 flex items-center gap-1 text-sm">

                <span className="text-yellow-500">
                  ⭐
                </span>

                {totalReviews > 0 ? (

                  <>
                    <span className="font-semibold text-text-main">
                      {averageRating.toFixed(1)}
                    </span>

                    <span className="text-text-muted">
                      ({totalReviews}{" "}
                      {totalReviews === 1
                        ? "review"
                        : "reviews"}
                      )
                    </span>
                  </>

                ) : (

                  <span className="text-text-muted">
                    No reviews yet
                  </span>

                )}

              </div>


              {/* Agency Name */}
              <p className="mt-2 text-sm font-medium text-text-main">
                {p.agency_name || "TourEase Agency"}
              </p>


              {/* Price */}
              <p className="mt-2 font-bold text-accent-secondary">
                NPR {Number(p.price).toLocaleString()}
              </p>


              {/* Book Now */}
              <div className="mt-4 flex justify-end">

                <Link
                  to={`/packages/${p.package_id}`}
                  className="rounded-lg bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
                >
                  Book Now
                </Link>

              </div>

            </div>

          </div>
        );

      })}

    </div>

  )}

</section>
          {/* ================= BLOGS ================= */}

          <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

            <div className="mb-8 flex items-end justify-between">

              <h2 className="section-title">
                Travel Blogs and Stories
              </h2>

              <Link
                to="/blog"
                className="text-sm font-medium text-accent-secondary hover:underline"
              >
                View all →
              </Link>

            </div>


            {blogs.length === 0 ? (

              <p className="text-text-muted">
                No blog posts yet.
              </p>

            ) : (

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">

                {blogs.map((b) => (

                  <Link
                    key={b.blog_id}
                    to={`/blog/${b.blog_id}`}
                    className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
                  >

                    <div className="h-40 w-full overflow-hidden bg-base-surface">

                      {b.image ? (

                        <img
                          src={getImageUrl(b.image)}
                          alt={b.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={() => {
                            console.log(
                              "Blog image failed:",
                              getImageUrl(b.image)
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

                      <p className="font-semibold text-text-main line-clamp-1">
                        {b.title}
                      </p>

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </section>

        </>
      )}

    </div>
  );
}

