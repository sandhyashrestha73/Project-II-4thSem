import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import Loader from "../../components/Loader";
import ErrorMessage, {
  extractErrorMessage,
} from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { getImageUrl } from "../../utils/imageUrl";

import {
  getAgencyDestinations,
  createDestination,
} from "../../services/destinationService";

import { agencyNavItems } from "./AgencyDashboard";


const emptyForm = {
  name: "",
  district: "",
  description: "",
  image: null,
};


export default function AgencyDestinations() {

  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [formError, setFormError] = useState("");

  const [saving, setSaving] = useState(false);


  // =======================================================
  // LOAD MY DESTINATIONS
  // =======================================================

  function load() {

    setLoading(true);
    setError("");

    getAgencyDestinations()
      .then(setDestinations)
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Could not load your destinations."
          )
        )
      )
      .finally(() => setLoading(false));
  }


  useEffect(() => {
    load();
  }, []);


  // =======================================================
  // OPEN CREATE MODAL
  // =======================================================

  function openCreate() {

    setForm(emptyForm);

    setFormError("");

    setModalOpen(true);
  }


  // =======================================================
  // IMAGE CHANGE
  // =======================================================

  function handleFileChange(e) {

    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {

      setFormError(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setFormError("");
  }


  // =======================================================
  // SUBMIT DESTINATION
  // =======================================================

  async function handleSubmit(e) {

    e.preventDefault();

    setFormError("");

    if (!form.image) {

      setFormError(
        "Please select a destination image."
      );

      return;
    }

    setSaving(true);

    try {

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("district", form.district);
      formData.append("description", form.description);
      formData.append("image", form.image);

      await createDestination(formData);

      setModalOpen(false);

      setForm(emptyForm);

      load();

    } catch (err) {

      setFormError(
        extractErrorMessage(
          err,
          "Could not submit destination."
        )
      );

    } finally {

      setSaving(false);

    }
  }


  // =======================================================
  // STATUS STYLE
  // =======================================================

  function getStatusStyle(status) {

    if (status === "Approved") {

      return "border-green-500/30 bg-green-500/10 text-green-400";

    }

    if (status === "Rejected") {

      return "border-red-500/30 bg-red-500/10 text-red-400";

    }

    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  }


  return (

    <DashboardLayout
      portalLabel="AGENCY PORTAL"
      navItems={agencyNavItems}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="section-title">
            Manage Destinations
          </h1>

          <p className="mt-2 text-slate-400">
            Add destinations and submit them for admin approval.
          </p>

        </div>


        <button
          onClick={openCreate}
          className="btn-primary"
        >
          + Add Destination
        </button>

      </div>


      {/* =================================================
          DESTINATIONS
      ================================================= */}

      <div className="mt-8">

        {loading && (
          <Loader label="Loading your destinations..." />
        )}


        {!loading && error && (

          <ErrorMessage
            message={error}
            onRetry={load}
          />

        )}


        {!loading &&
          !error &&
          destinations.length === 0 && (

            <div className="card p-10 text-center text-slate-400">

              <p>
                You have not submitted any destinations yet.
              </p>

              <button
                onClick={openCreate}
                className="btn-primary mt-4"
              >
                + Add Destination
              </button>

            </div>

          )}


        {!loading &&
          !error &&
          destinations.length > 0 && (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {destinations.map((destination) => (

                <div
                  key={destination.destination_id}
                  className="card overflow-hidden"
                >

                  {/* IMAGE */}

                  <div className="h-36 w-full bg-base-surface">

                    {destination.image ? (

                      <img
                        src={getImageUrl(destination.image)}
                        alt={destination.name}
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center text-slate-600">
                        No image
                      </div>

                    )}

                  </div>


                  {/* CONTENT */}

                  <div className="p-4">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="font-semibold text-white">
                          {destination.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {destination.district}
                        </p>

                      </div>


                      {/* STATUS */}

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          destination.status
                        )}`}
                      >
                        {destination.status}
                      </span>

                    </div>


                    {/* DESCRIPTION */}

                    {destination.description && (

                      <p className="mt-3 line-clamp-2 text-sm text-slate-400">
                        {destination.description}
                      </p>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

      </div>


      {/* =================================================
          ADD DESTINATION MODAL
      ================================================= */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Destination"
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

          {/* NAME */}

          <input
            required
            placeholder="Destination name"
            className="input-field"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />


          {/* DISTRICT */}

          <input
            required
            placeholder="District"
            className="input-field"
            value={form.district}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                district: e.target.value,
              }))
            }
          />


          {/* DESCRIPTION */}

          <textarea
            required
            rows={4}
            placeholder="Destination description"
            className="input-field resize-none"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />


          {/* IMAGE */}

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Destination Image
            </label>

            <input
              required
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="input-field"
              onChange={handleFileChange}
            />

            {form.image && (

              <p className="mt-2 text-sm text-slate-400">
                Selected: {form.image.name}
              </p>

            )}

          </div>


          {/* APPROVAL MESSAGE */}

          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-slate-400">

            Your destination will be submitted to the admin
            for approval. It will become publicly visible
            only after approval.

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >

            {saving
              ? "Submitting..."
              : "Submit Destination"}

          </button>

        </form>

      </Modal>

    </DashboardLayout>

  );
}