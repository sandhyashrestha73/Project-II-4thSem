import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../services/blogService";
import Loader from "../components/Loader";
import { getImageUrl } from "../utils/imageUrl";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");

    getBlogs()
      .then((data) => setBlogs(data.slice().reverse()))
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load blog posts."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">
            Travel Blogs and Stories
          </h1>

          <p className="mt-2 text-text-muted">
            Written by agencies on TourEase Nepal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {loading && (
          <Loader label="Loading blog posts..." />
        )}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        )}

        {!loading &&
          !error &&
          blogs.length === 0 && (
            <p className="text-text-muted">
              No blog posts yet.
            </p>
          )}

        {!loading &&
          !error &&
          blogs.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {blogs.map((b) => (
                <Link
                  key={b.blog_id}
                  to={`/blog/${b.blog_id}`}
                  className="card group overflow-hidden hover:-translate-y-1 hover:border-accent/50"
                >
                  <div className="h-48 w-full overflow-hidden bg-base-surface">
                    {b.image ? (
                      <img
                        src={getImageUrl(b.image)}
                        alt={b.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-subtle">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-text-main line-clamp-2">
                      {b.title}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                      {b.content}
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