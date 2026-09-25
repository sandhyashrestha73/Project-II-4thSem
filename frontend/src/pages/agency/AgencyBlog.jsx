import { useEffect, useState } from "react";
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">
          Blog Posts
        </h1>

        <button
          onClick={openCreate}
          className="btn-primary"
        >
          + New Post
        </button>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        Posts publish immediately — there is no
        approval workflow in the backend yet.
      </p>

      <div className="mt-8">
        {loading && (
          <Loader label="Loading posts..." />
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
            <div className="card p-10 text-center text-slate-400">
              You haven't written any posts yet.
            </div>
          )}

        {!loading &&
          !error &&
          blogs.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <div
                  key={blog.blog_id}
                  className="card overflow-hidden"
                >
                  <div className="h-32 w-full bg-base-surface">
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
                      <div className="flex h-full items-center justify-center text-slate-600">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-white line-clamp-1">
                      {blog.title}
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                      {blog.content}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() =>
                          openEdit(blog)
                        }
                        className="btn-secondary flex-1 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            blog.blog_id
                          )
                        }
                        className="btn-danger flex-1 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

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
          <input
            required
            placeholder="Title"
            className="input-field"
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                title: e.target.value,
              }))
            }
          />

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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Cover Image
            </label>

            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-lg border border-base-border bg-base-surface p-2 text-sm text-slate-300"
            />

            {form.image && (
              <p className="mt-2 text-xs text-slate-400">
                Selected: {form.image.name}
              </p>
            )}

            {editingId && !form.image && (
              <p className="mt-2 text-xs text-slate-500">
                Leave empty to keep the current image.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
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