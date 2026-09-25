import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import { getImageUrl } from "../../utils/imageUrl";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import { getBlogs, deleteBlog } from "../../services/blogService";

export default function AdminBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    getBlogs()
      .then(setBlogs)
      .catch((err) => setError(extractErrorMessage(err, "Could not load blog posts.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      await deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.blog_id !== id));
    } catch (err) {
      alert(extractErrorMessage(err, "Could not delete this post."));
    }
  }

  return (
    <DashboardLayout portalLabel="ADMIN PORTAL" navItems={adminNavItems}>
      <h1 className="section-title">Blog Posts</h1>
      <p className="mt-2 text-sm text-slate-500">
        There is no approval/status field on the backend Blog model, so posts can only be removed
        here, not approved or rejected.
      </p>

      <div className="mt-8">
        {loading && <Loader label="Loading posts..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && blogs.length === 0 && (
          <div className="card p-10 text-center text-slate-400">No blog posts yet.</div>
        )}
        {!loading && !error && blogs.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b) => (
              <div key={b.blog_id} className="card overflow-hidden">
                <div className="h-32 w-full bg-base-surface">
                  {b.image ? (
                    <img src={getImageUrl(b.image)}alt={b.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-600">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white line-clamp-1">{b.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Agency #{b.agency_id}</p>
                  <button
                    onClick={() => handleDelete(b.blog_id)}
                    className="btn-danger mt-3 w-full text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
