import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDestinations } from "../services/destinationService";
import { getPackages } from "../services/packageService";
import { getBlogs } from "../services/blogService";
import Loader from "../components/Loader";

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.allSettled([getDestinations(), getPackages(), getBlogs()]).then(
      ([destRes, pkgRes, blogRes]) => {
        if (destRes.status === "fulfilled") setDestinations(destRes.value.slice(0, 3));
        if (pkgRes.status === "fulfilled") setPackages(pkgRes.value.slice(0, 3));
        if (blogRes.status === "fulfilled") setBlogs(blogRes.value.slice(0, 3));
        setLoading(false);
      }
    );
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    window.location.href = `/packages${search ? `?q=${encodeURIComponent(search)}` : ""}`;
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-base-surface to-base-bg py-24 md:py-32">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8">
          <span className="badge-hero">Discover Nepal</span>
          <h1 className="hero-heading mt-5 leading-tight">
            Plan your next journey across <span className="hero-heading-accent">Nepal</span>
          </h1>
          <p className="hero-subtext mx-auto mt-5 max-w-2xl">
            Browse tour packages, explore destinations and read real travel stories — all from
            agencies operating on TourEase Nepal.
          </p>
          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search packages by name or destination..."
              className="input-field-hero"
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </form>
        </div>
      </section>

      {loading ? (
        <Loader label="Loading TourEase Nepal..." />
      ) : (
        <>
          {/* Popular destinations */}
          <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="section-title">Popular Destinations</h2>
              <Link to="/destinations" className="text-sm font-medium text-accent-secondary hover:underline">
                View all →
              </Link>
            </div>
            {destinations.length === 0 ? (
              <p className="text-text-muted">No destinations available yet.</p>
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
                          src={d.image}
                          alt={d.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-text-subtle">No image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-text-main">{d.name}</p>
                      <p className="text-sm text-text-muted">{d.district}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Featured packages */}
          <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="section-title">Featured Tour Packages</h2>
              <Link to="/packages" className="text-sm font-medium text-accent-secondary hover:underline">
                View all →
              </Link>
            </div>
            {packages.length === 0 ? (
              <p className="text-text-muted">No packages available yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {packages.map((p) => (
                  <Link
                    key={p.package_id}
                    to={`/packages/${p.package_id}`}
                    className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
                  >
                    <div className="h-48 w-full overflow-hidden bg-base-surface">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.package_name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-text-subtle">No image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-text-main">{p.package_name}</p>
                      <p className="mt-1 text-sm text-text-muted">{p.duration}</p>
                      <p className="mt-2 font-bold text-accent-secondary">NPR {Number(p.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Blogs */}
          <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="section-title">Travel Blogs and Stories</h2>
              <Link to="/blog" className="text-sm font-medium text-accent-secondary hover:underline">
                View all →
              </Link>
            </div>
            {blogs.length === 0 ? (
              <p className="text-text-muted">No blog posts yet.</p>
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
                          src={b.image}
                          alt={b.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-text-subtle">No image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-text-main line-clamp-1">{b.title}</p>
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