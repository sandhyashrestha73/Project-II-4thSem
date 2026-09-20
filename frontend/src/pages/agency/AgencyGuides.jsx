import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { agencyNavItems } from "./AgencyDashboard";
import Loader from "../../components/Loader";
import ErrorMessage, { extractErrorMessage } from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { getGuides, createGuide, updateGuide, deleteGuide } from "../../services/guideService";

const emptyForm = { guide_name: "", phone: "", language: "", experience: 0 };

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

  function load() {
    setLoading(true);
    setError("");
    getGuides()
      .then((all) => setGuides(all.filter((g) => String(g.agency_id) === String(user.id))))
      .catch((err) => setError(extractErrorMessage(err, "Could not load guides.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [user.id]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(g) {
    setEditingId(g.guide_id);
    setForm({ guide_name: g.guide_name, phone: g.phone, language: g.language, experience: g.experience });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = { ...form, experience: Number(form.experience) };
      if (editingId) {
        await updateGuide(editingId, payload);
      } else {
        // create_guide reads agency_id from the request body, not the JWT
        await createGuide({ ...payload, agency_id: user.id });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(extractErrorMessage(err, "Could not save this guide."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this guide?")) return;
    try {
      await deleteGuide(id);
      setGuides((prev) => prev.filter((g) => g.guide_id !== id));
    } catch (err) {
      alert(extractErrorMessage(err, "Could not remove this guide."));
    }
  }

  return (
    <DashboardLayout portalLabel="AGENCY PORTAL" navItems={agencyNavItems}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Guides</h1>
        <button onClick={openCreate} className="btn-primary">
          + Add Guide
        </button>
      </div>

      <div className="mt-8">
        {loading && <Loader label="Loading guides..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}
        {!loading && !error && guides.length === 0 && (
          <div className="card p-10 text-center text-slate-400">No guides added yet.</div>
        )}
        {!loading && !error && guides.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-base-border">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-base-surface text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((g) => (
                  <tr key={g.guide_id} className="border-t border-base-border bg-base-card">
                    <td className="px-4 py-3 text-white">{g.guide_name}</td>
                    <td className="px-4 py-3 text-slate-300">{g.phone}</td>
                    <td className="px-4 py-3 text-slate-300">{g.language}</td>
                    <td className="px-4 py-3 text-slate-300">{g.experience} yrs</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(g)} className="mr-2 text-accent hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(g.guide_id)} className="text-red-400 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Guide" : "Add Guide"}>
        {formError && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {formError}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Guide name"
            className="input-field"
            value={form.guide_name}
            onChange={(e) => setForm((f) => ({ ...f, guide_name: e.target.value }))}
          />
          <input
            required
            placeholder="Phone"
            className="input-field"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            required
            placeholder="Language(s) spoken"
            className="input-field"
            value={form.language}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
          />
          <input
            required
            type="number"
            min={0}
            placeholder="Years of experience"
            className="input-field"
            value={form.experience}
            onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Guide"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
