import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "../../services/blogService";

const emptyForm = { title: "", content: "", image: "" };

export default function AgencyBlog() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    getBlogs()
      .then((all) => setBlogs(all.filter((b) => String(b.agency_id) === String(user.id))))
      .catch((err) => setError(extractErrorMessage(err, "Could not load blog posts.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [user.id]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(b) {
    setEditingId(b.blog_id);
    setForm({ title: b.title, content: b.content, image: b.image || "" });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editingId) {
        await updateBlog(editingId, form);
      } else {
        // create_blog reads agency_id from the request body, not the JWT
        await createBlog({ ...form, agency_id: user.id });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(extractErrorMessage(err, "Could not save this post."));
    } finally {
      setSaving(false);
    }
  }

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
    <DashboardLayout portalLabel="AGENCY PORTAL" navItems={agencyNavItems}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Blog Posts</h1>
        <button onClick={openCreate} className="btn-primary">
          + New Post
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Posts publish immediately — there is no approval workflow in the backend yet.
      </p>

      <div className="mt-8">
        {loading && <Loader label="Loading posts..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && blogs.length === 0 && (
          <div className="card p-10 text-center text-slate-400">You haven't written any posts yet.</div>
        )}
        {!loading && !error && blogs.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b) => (
              <div key={b.blog_id} className="card overflow-hidden">
                <div className="h-32 w-full bg-base-surface">
                  {b.image ? (
                    <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-600">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white line-clamp-1">{b.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{b.content}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(b)} className="btn-secondary flex-1 text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(b.blog_id)} className="btn-danger flex-1 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Post" : "New Post"}>
        {formError && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {formError}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Title"
            className="input-field"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            required
            rows={6}
            placeholder="Write your story..."
            className="input-field resize-none"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
          <input
            placeholder="Cover image URL"
            className="input-field"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving..." : editingId ? "Save Changes" : "Publish Post"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
