import { useState } from "react";
import {
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";
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
    <div className="min-h-screen">

      {/* ==================================================
          HERO
      ================================================== */}
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2">
              <MessageCircle
                size={17}
                className="text-accent"
              />

              <span className="text-sm font-semibold uppercase tracking-wider text-accent">
                Get in Touch
              </span>
            </div>

            <h1 className="section-title mt-2">
              Contact TourEase Nepal
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
              Have a question about destinations, packages, agencies, or
              the TourEase platform? We would be happy to hear from you.
            </p>

          </div>

        </div>
      </section>

      {/* ==================================================
          CONTACT CONTENT
      ================================================== */}
      <section className="bg-base-bg py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">

            {/* ==================================================
                LEFT — CONTACT INFORMATION
            ================================================== */}
            <div>

              <div className="max-w-xl">

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <MessageCircle size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                      We're here to help
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-text-main">
                      Contact Information
                    </h2>
                  </div>
                </div>

                <p className="mt-5 leading-7 text-text-muted">
                  You can contact the TourEase Nepal team for general
                  questions, feedback, or information related to the platform.
                  We are happy to help you with your travel-related queries.
                </p>

              </div>

              {/* Contact Cards */}
              <div className="mt-8 space-y-4">

                {/* EMAIL */}
                <div className="group rounded-2xl border border-base-border bg-base-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-[#0f172a]">
                      <Mail size={22} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-main">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm text-text-muted">
                        toureasenepal@gmail.com
                      </p>
                    </div>

                  </div>

                </div>

                {/* LOCATION */}
                <div className="group rounded-2xl border border-base-border bg-base-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-[#0f172a]">
                      <MapPin size={22} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-text-main">
                        Location
                      </p>

                      <p className="mt-1 text-sm text-text-muted">
                        Pokhara, Nepal
                      </p>
                    </div>

                  </div>

                </div>

                {/* RESPONSE TIME */}
                <div className="group rounded-2xl border border-base-border bg-base-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-[#0f172a]">
                      <Clock size={22} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-text-main">
                        Response Time
                      </p>

                      <p className="mt-1 text-sm leading-6 text-text-muted">
                        We aim to respond to general inquiries as soon as
                        possible.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================================
                RIGHT — CONTACT FORM
            ================================================== */}
            <div className="rounded-2xl border border-base-border bg-base-card p-6 shadow-lg shadow-black/5 md:p-8">

              {/* Form Header */}
              <div className="border-b border-base-border pb-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                    <Mail size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-text-main">
                      Send us a Message
                    </h2>

                    <p className="mt-1 text-sm text-text-muted">
                      Fill out the form and we'll get back to you.
                    </p>
                  </div>

                </div>

              </div>

              {/* SUCCESS */}
              {success && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">

                  <div className="mt-0.5 shrink-0">
                    ✓
                  </div>

                  <p>{success}</p>

                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="mt-5">
                  <ErrorMessage message={error} />
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >

                {/* NAME */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-text-main">
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
                  <label className="mb-1.5 block text-sm font-semibold text-text-main">
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
                  <label className="mb-1.5 block text-sm font-semibold text-text-main">
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
                  <label className="mb-1.5 block text-sm font-semibold text-text-main">
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Write your message..."
                    required
                    className="input-field w-full resize-none"
                  />
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition-all duration-200 hover:bg-accent-hover hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <Send size={17} />

                  {loading
                    ? "Sending..."
                    : "Send Message"}
                </button>

              </form>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

