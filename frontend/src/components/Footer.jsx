import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-base-border bg-base-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">

          {/* Brand */}
          <div>
            <Link to="/" className="text-lg font-extrabold text-text-main">
              Tour<span className="text-accent-secondary">Ease</span> Nepal
            </Link>

            <p className="mt-3 text-sm text-text-muted">
              Discover verified tourism agencies, curated packages and
              destinations across Nepal.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="mb-3 text-sm font-semibold text-text-main">
              Explore
            </p>

            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-accent-secondary"
                >
                  Destinations
                </Link>
              </li>

              <li>
                <Link
                  to="/packages"
                  className="hover:text-accent-secondary"
                >
                  Packages
                </Link>
              </li>

              <li>
                <Link
                  to="/blog"
                  className="hover:text-accent-secondary"
                >
                  Blog
                </Link>
              </li>

              <li>
                <Link
                  to="/gallery"
                  className="hover:text-accent-secondary"
                >
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-3 text-sm font-semibold text-text-main">
              Company
            </p>

            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link
                  to="/about"
                  className="hover:text-accent-secondary"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="hover:text-accent-secondary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-sm font-semibold text-text-main">
              Legal
            </p>

            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-accent-secondary"
                >
                  Privacy
                </Link>
              </li>

              <li>
                <Link
                  to="/terms"
                  className="hover:text-accent-secondary"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-base-border pt-6 text-center text-xs text-text-subtle">
          © {new Date().getFullYear()} TourEase Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

