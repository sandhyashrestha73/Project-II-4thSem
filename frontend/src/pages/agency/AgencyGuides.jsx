import { useEffect, useState } from "react";
import {
  UserRound,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Languages,
  BriefcaseBusiness,
  UsersRound,
  X,
  Save,
} from "lucide-react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import {
  getGuides,
  createGuide,
  updateGuide,
  deleteGuide,
} from "../../services/guideService";

const emptyForm = {
  guide_name: "",
  phone: "",
  language: "",
  experience: 0,
};

export default function AgencyGuides() {
  const { user } = useAuth();

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD GUIDES
  // =====================================================

  function load() {
    setLoading(true);
    setError("");

    getGuides()
      .then((all) =>
        setGuides(
          all.filter(
            (g) =>
              String(g.agency_id) === String(user.id)
          )
        )
      )
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load guides."
          )
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [user.id]);

  // =====================================================
  // CREATE
  // =====================================================

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  // =====================================================
  // EDIT
  // =====================================================

  function openEdit(g) {
    setEditingId(g.guide_id);

    setForm({
      guide_name: g.guide_name,
      phone: g.phone,
      language: g.language,
      experience: g.experience,
    });

    setFormError("");
    setModalOpen(true);
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setFormError("");
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
      };

      if (editingId) {
        await updateGuide(editingId, payload);
      } else {
        // create_guide reads agency_id from request body
        await createGuide({
          ...payload,
          agency_id: user.id,
        });
      }

      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(
        extractErrorMessage(
          err,
          "Could not save this guide."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(id) {
    if (!window.confirm("Remove this guide?")) return;

    try {
      await deleteGuide(id);

      setGuides((prev) =>
        prev.filter((g) => g.guide_id !== id)
      );
    } catch (err) {
      alert(
        extractErrorMessage(
          err,
          "Could not remove this guide."
        )
      );
    }
  }

  return (
    <DashboardLayout
      portalLabel="AGENCY PORTAL"
      navItems={agencyNavItems}
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f172a] text-[#d4af37] shadow-sm">
            <UsersRound size={21} />
          </div>

          <div>
            <h1 className="section-title">
              Guides
            </h1>

            <p className="mt-1 text-sm text-text-muted">
              Manage the guides working with your agency.
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#b9962f] hover:shadow-md"
        >
          <Plus size={18} />
          Add Guide
        </button>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mt-8">
        {/* LOADING */}

        {loading && (
          <Loader label="Loading guides..." />
        )}

        {/* ERROR */}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={load}
          />
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          !error &&
          guides.length === 0 && (
            <div className="rounded-2xl border border-base-border bg-base-card p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f172a] text-[#d4af37]">
                <UserRound size={30} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-text-main">
                No Guides Added
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                Add your agency's tour guides so they
                can be associated with your tourism
                services.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#b9962f] hover:shadow-md"
              >
                <Plus size={17} />
                Add Your First Guide
              </button>
            </div>
          )}

        {/* =================================================
            GUIDE TABLE
        ================================================= */}

        {!loading &&
          !error &&
          guides.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-base-border bg-base-card shadow-sm">
              {/* TABLE HEADER */}

              <div className="flex items-center justify-between border-b border-base-border bg-[#0f172a] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <UsersRound
                    size={19}
                    className="text-[#d4af37]"
                  />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Agency Guides
                    </p>

                    <p className="text-xs text-white/60">
                      {guides.length}{" "}
                      {guides.length === 1
                        ? "guide"
                        : "guides"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-base-surface">
                    <tr className="border-b border-base-border">
                      <th className="px-5 py-3.5 font-semibold text-text-main">
                        Guide
                      </th>

                      <th className="px-5 py-3.5 font-semibold text-text-main">
                        Phone
                      </th>

                      <th className="px-5 py-3.5 font-semibold text-text-main">
                        Language
                      </th>

                      <th className="px-5 py-3.5 font-semibold text-text-main">
                        Experience
                      </th>

                      <th className="px-5 py-3.5 text-right font-semibold text-text-main">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {guides.map((g) => (
                      <tr
                        key={g.guide_id}
                        className="border-b border-base-border bg-base-card transition-colors last:border-b-0 hover:bg-base-surface/70"
                      >
                        {/* GUIDE NAME */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-[#d4af37]">
                              <UserRound size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-text-main">
                                {g.guide_name}
                              </p>

                             
                            </div>
                          </div>
                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-text-muted">
                            <Phone
                              size={16}
                              className="text-[#d4af37]"
                            />

                            <span>
                              {g.phone}
                            </span>
                          </div>
                        </td>

                        {/* LANGUAGE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-text-muted">
                            <Languages
                              size={17}
                              className="text-[#d4af37]"
                            />

                            <span>
                              {g.language}
                            </span>
                          </div>
                        </td>

                        {/* EXPERIENCE */}

                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-[#d4af37]/10 px-3 py-1.5">
                            <BriefcaseBusiness
                              size={16}
                              className="text-[#b9962f]"
                            />

                            <span className="font-semibold text-[#8f7020]">
                              {g.experience}{" "}
                              {g.experience === 1
                                ? "year"
                                : "years"}
                            </span>
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                openEdit(g)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-2 text-xs font-semibold text-[#8f7020] transition hover:border-[#d4af37] hover:bg-[#d4af37]/20"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  g.guide_id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingId
            ? "Edit Guide"
            : "Add Guide"
        }
      >
        {/* MODAL INTRO */}

        <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#0f172a] px-4 py-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4af37] text-[#0f172a]">
            {editingId ? (
              <Pencil size={18} />
            ) : (
              <UserRound size={19} />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {editingId
                ? "Update Guide Information"
                : "Guide Information"}
            </p>

            <p className="mt-0.5 text-xs text-white/60">
              Enter the guide's details below.
            </p>
          </div>
        </div>

        {/* FORM ERROR */}

        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* GUIDE NAME */}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-main">
              Guide Name
            </label>

            <div className="relative">
              <UserRound
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]"
              />

              <input
                required
                placeholder="Guide name"
                className="input-field w-full pl-10"
                value={form.guide_name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    guide_name: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* PHONE */}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-main">
              Phone
            </label>

            <div className="relative">
              <Phone
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]"
              />

              <input
                required
                type="tel"
                placeholder="Phone number"
                className="input-field w-full pl-10"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phone: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* LANGUAGE */}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-main">
              Language(s) Spoken
            </label>

            <div className="relative">
              <Languages
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]"
              />

              <input
                required
                placeholder="e.g. Nepali, English, Hindi"
                className="input-field w-full pl-10"
                value={form.language}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    language: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* EXPERIENCE */}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-main">
              Years of Experience
            </label>

            <div className="relative">
              <BriefcaseBusiness
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]"
              />

              <input
                required
                type="number"
                min={0}
                placeholder="Years of experience"
                className="input-field w-full pl-10"
                value={form.experience}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    experience: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-[#b9962f] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f172a]/30 border-t-[#0f172a]" />
                Saving...
              </>
            ) : (
              <>
                {editingId ? (
                  <Save size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {editingId
                  ? "Save Changes"
                  : "Add Guide"}
              </>
            )}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
