export default function Footer() {
  return (
    <footer className="border-t border-base-border bg-base-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-extrabold text-text-main">
              Tour<span className="text-accent-secondary">Ease</span> Nepal
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Discover verified tourism agencies, curated packages and destinations across Nepal.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-text-main">Explore</p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><a href="/destinations" className="hover:text-accent-secondary">Destinations</a></li>
              <li><a href="/packages" className="hover:text-accent-secondary">Packages</a></li>
              <li><a href="/blog" className="hover:text-accent-secondary">Blog</a></li>
              <li><a href="/gallery" className="hover:text-accent-secondary">Gallery</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-text-main">Company</p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><a href="#" className="hover:text-accent-secondary">About</a></li>
              <li><a href="#" className="hover:text-accent-secondary">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-text-main">Legal</p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><a href="#" className="hover:text-accent-secondary">Privacy</a></li>
              <li><a href="#" className="hover:text-accent-secondary">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-base-border pt-6 text-center text-xs text-text-subtle">
          © {new Date().getFullYear()} TourEase Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}