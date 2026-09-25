import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBlog } from "../services/blogService";
import Loader from "../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";
import { getImageUrl } from "../utils/imageUrl";

export default function BlogDetail() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");

    getBlog(id)
      .then(setBlog)
      .catch((err) =>
        setError(extractErrorMessage(err, "Blog post not found."))
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  if (loading) {
    return <Loader label="Loading post..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      {/* Blog Image */}
      {blog.image && (
        <div className="mb-8 h-72 w-full overflow-hidden rounded-2xl bg-base-surface">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              console.log(
                "Blog image failed:",
                getImageUrl(blog.image)
              );
            }}
          />
        </div>
      )}

      <h1 className="text-3xl font-extrabold text-text-main md:text-4xl">
        {blog.title}
      </h1>

      {blog.created_at && (
        <p className="mt-2 text-sm text-text-subtle">
          {new Date(blog.created_at).toLocaleDateString()}
        </p>
      )}

      <div className="mt-6 whitespace-pre-line leading-relaxed text-text-muted">
        {blog.content}
      </div>

      <Link
        to="/blog"
        className="mt-10 inline-block text-sm font-medium text-accent-secondary hover:underline"
      >
        ← Back to all posts
      </Link>
    </article>
  );
}