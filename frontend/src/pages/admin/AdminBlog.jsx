import { useEffect, useState } from "react";
import {
  BookOpen,
  ImagePlus,
  Building2,
  Trash2,
  FileText,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNavItems } from "./AdminDashboard";
import Loader from "../../components/Loader";
import { getImageUrl } from "../../utils/imageUrl";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
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

  useEffect(load, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this blog post?")) return;

    try {
      await deleteBlog(id);

      setBlogs((prev) =>
        prev.filter((b) => b.blog_id !== id)
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not delete this post."
        )
      );
    }
  }

  return (
    <DashboardLayout
      portalLabel="ADMIN PORTAL"
      navItems={adminNavItems}
    >
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <BookOpen size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Blog Posts
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View and manage blog posts published on
              TourEase Nepal.
            </p>
          </div>
        </div>
      </div>

      {/* Backend information */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <FileText
          size={18}
          className="mt-0.5 shrink-0 text-[#d4af37]"
        />

        <p className="text-sm leading-6 text-slate-400">
          There is no approval or status field on the
          backend Blog model, so posts can only be
          removed here, not approved or rejected.
        </p>
      </div>

      <div className="mt-8">
        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading posts..." />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          blogs.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <BookOpen size={28} />
              </div>

              <h2 className="mt-4 font-semibold text-white">
                No blog posts yet
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Blog posts created by agencies will
                appear here.
              </p>
            </div>
          )}

        {/* Blog Cards */}
        {!loading &&
          !error &&
          blogs.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b) => (
                <div
                  key={b.blog_id}
                  className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg transition duration-200 hover:border-[#d4af37]/40 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative h-44 w-full bg-[#1e293b]">
                    {b.image ? (
                      <img
                        src={getImageUrl(b.image)}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                        <ImagePlus size={28} />
                        <span className="text-sm">
                          No image
                        </span>
                      </div>
                    )}

                    
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="line-clamp-1 text-base font-semibold text-white">
                      {b.title}
                    </h2>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/10 text-[#d4af37]">
                        <Building2 size={15} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Created By
                        </p>

                        <p className="truncate text-sm font-medium text-slate-300">
                          {b.agency_name ||
                            `Agency #${b.agency_id}`}
                        </p>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(b.blog_id)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                      Delete Post
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