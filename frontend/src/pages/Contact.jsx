
import { useState } from "react";
import { sendContactMessage } from "../services/contactService";
import ErrorMessage, {
  extractErrorMessage,
} from "../components/ErrorMessage";


export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");


  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }


  function handleSubmit(e) {
    e.preventDefault();

    setSuccess("");
    setError("");

    setLoading(true);

    sendContactMessage(form)
      .then((data) => {
        setSuccess(
          data.message || "Your message has been sent successfully."
        );

        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      })
      .catch((err) => {
        setError(
          extractErrorMessage(
            err,
            "Could not send your message."
          )
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }


  return (
    <div>

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-accent-secondary">
            Get in Touch
          </p>

          <h1 className="section-title mt-2">
            Contact TourEase Nepal
          </h1>

          <p className="mt-4 max-w-2xl text-text-muted">
            Have a question about destinations, packages, agencies, or
            the TourEase platform? We would be happy to hear from you.
          </p>

        </div>
      </section>


      {/* ==================================================
          CONTACT CONTENT
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">

        <div className="grid gap-8 md:grid-cols-2">

          {/* ==================================================
              CONTACT INFORMATION
          ================================================== */}

          <div>

            <h2 className="text-2xl font-bold text-text-main">
              Contact Information
            </h2>

            <p className="mt-3 leading-7 text-text-muted">
              You can contact the TourEase Nepal team for general
              questions, feedback, or information related to the platform.
            </p>


            <div className="mt-8 space-y-5">

              <div className="card p-5">
                <p className="text-sm font-semibold text-text-main">
                  Email
                </p>

                <p className="mt-1 text-sm text-text-muted">
                  support@tourease.com
                </p>
              </div>


              <div className="card p-5">
                <p className="text-sm font-semibold text-text-main">
                  Location
                </p>

                <p className="mt-1 text-sm text-text-muted">
                  Pokhara, Nepal
                </p>
              </div>


              <div className="card p-5">
                <p className="text-sm font-semibold text-text-main">
                  Response Time
                </p>

                <p className="mt-1 text-sm text-text-muted">
                  We aim to respond to general inquiries as soon as
                  possible.
                </p>
              </div>

            </div>

          </div>


          {/* ==================================================
              CONTACT FORM
          ================================================== */}

          <div className="card p-6">

            <h2 className="text-xl font-bold text-text-main">
              Send us a Message
            </h2>


            {/* SUCCESS */}
            {success && (
              <div className="mt-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}


            {/* ERROR */}
            {error && (
              <div className="mt-5">
                <ErrorMessage message={error} />
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >

              {/* NAME */}
              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="input-field w-full"
                />
              </div>


              {/* EMAIL */}
              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  required
                  className="input-field w-full"
                />
              </div>


              {/* SUBJECT */}
              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Message subject"
                  required
                  className="input-field w-full"
                />
              </div>


              {/* MESSAGE */}
              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Message
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write your message..."
                  required
                  className="input-field w-full"
                />
              </div>


              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

            </form>

          </div>

        </div>

      </section>

    </div>
  );
}

