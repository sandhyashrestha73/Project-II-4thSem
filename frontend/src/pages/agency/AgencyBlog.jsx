import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  FileText,
  Pencil,
  Trash2,
  Upload,
  ImagePlus,
  CheckCircle2,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import { getImageUrl } from "../../utils/imageUrl";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";

import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../../services/blogService";

const emptyForm = {
  title: "",
  content: "",
  image: null,
};

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
      .then((all) =>
        setBlogs(
          all.filter(
            (b) =>
              String(b.agency_id) ===
              String(user.id)
          )
        )
      )
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
  }, [user.id]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(blog) {
    setEditingId(blog.blog_id);

    setForm({
      title: blog.title,
      content: blog.content,
      image: null,
    });

    setFormError("");
    setModalOpen(true);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      setForm((f) => ({
        ...f,
        image: null,
      }));
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        "Only PNG, JPG, JPEG and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    setFormError("");

    setForm((f) => ({
      ...f,
      image: file,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");

    if (!editingId && !form.image) {
      setFormError(
        "Please select a cover image."
      );
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("content", form.content);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {
        await updateBlog(
          editingId,
          formData
        );
      } else {
        await createBlog(formData);
      }

      setModalOpen(false);
      setForm(emptyForm);

      load();
    } catch (err) {
      setFormError(
        extractErrorMessage(
          err,
          "Could not save this post."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Delete this blog post?"
      )
    ) {
      return;
    }

    try {
      await deleteBlog(id);

      setBlogs((prev) =>
        prev.filter(
          (b) => b.blog_id !== id
        )
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
      portalLabel="AGENCY PORTAL"
      navItems={agencyNavItems}
    >
      {/* HEADER */}
      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
              <BookOpen size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Blog Posts
              </h1>

              <p className="mt-1 text-sm text-slate-300">
                Create and manage travel stories for your agency.
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>
      </div>

      {/* INFO */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-slate-400">
        <FileText
          size={16}
          className="shrink-0 text-[#d4af37]"
        />

        <span>
          Posts publish immediately — there is no
          approval workflow in the backend yet.
        </span>
      </div>

      {/* BLOG POSTS */}
      <div className="mt-8">
        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-6">
            <Loader label="Loading posts..." />
          </div>
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
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <BookOpen size={30} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                No Blog Posts Yet
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                You haven't written any posts yet.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227]"
              >
                <Plus size={18} />
                New Post
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          blogs.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <div
                  key={blog.blog_id}
                  className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/40"
                >
                  {/* IMAGE */}
                  <div className="relative h-40 w-full bg-[#1e293b]">
                    {blog.image ? (
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
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <ImagePlus size={28} />
                          <span className="text-xs">
                            No image
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#0f172a]/85 px-2.5 py-1 text-xs font-semibold text-[#d4af37] backdrop-blur-sm">
                      <BookOpen size={13} />
                      Blog
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <div className="flex items-start gap-2">
                      <FileText
                        size={17}
                        className="mt-0.5 shrink-0 text-[#d4af37]"
                      />

                      <p className="line-clamp-1 font-semibold text-white">
                        {blog.title}
                      </p>
                    </div>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                      {blog.content}
                    </p>

                    {/* ACTIONS */}
                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() =>
                          openEdit(blog)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2.5 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37]/20"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            blog.blog_id
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingId
            ? "Edit Post"
            : "New Post"
        }
      >
        {formError && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {formError}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* TITLE */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <FileText
                size={16}
                className="text-[#d4af37]"
              />
              Title
            </label>

            <input
              required
              placeholder="Blog post title"
              className="input-field"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                }))
              }
            />
          </div>

          {/* CONTENT */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <BookOpen
                size={16}
                className="text-[#d4af37]"
              />
              Content
            </label>

            <textarea
              required
              rows={6}
              placeholder="Write your story..."
              className="input-field resize-none"
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  content: e.target.value,
                }))
              }
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <ImagePlus
                size={16}
                className="text-[#d4af37]"
              />
              Cover Image
            </label>

            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-xl border border-slate-600 bg-[#1e293b] p-2.5 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#d4af37] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#0f172a]"
            />

            {form.image && (
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2
                  size={14}
                  className="text-emerald-400"
                />
                Selected: {form.image.name}
              </p>
            )}

            {editingId && !form.image && (
              <p className="mt-2 text-xs text-slate-500">
                Leave empty to keep the current image.
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#c9a227] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={17} />

            {saving
              ? "Uploading..."
              : editingId
              ? "Save Changes"
              : "Publish Post"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}