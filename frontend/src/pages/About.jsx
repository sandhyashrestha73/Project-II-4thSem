
export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-secondary">
            About TourEase Nepal
          </p>

          <h1 className="section-title mt-2">
            Explore Nepal with Ease
          </h1>

          <p className="mt-4 max-w-3xl text-text-muted">
            TourEase Nepal is a tourism discovery and booking platform designed
            to help travelers discover destinations, compare tour packages,
            and connect with tourism agencies across Nepal.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-main">
              What is TourEase Nepal?
            </h2>

            <p className="mt-4 leading-7 text-text-muted">
              TourEase Nepal brings tourism-related information together in
              one place. Travelers can explore destinations, view available
              packages, read travel blogs, and discover tourism agencies
              through a simple and user-friendly platform.
            </p>

            <p className="mt-4 leading-7 text-text-muted">
              Our goal is to make planning a trip in Nepal easier by reducing
              the need to search through scattered information from different
              sources.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-semibold text-text-main">
              What you can do on TourEase
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-text-muted">
              <li>• Explore destinations across Nepal</li>
              <li>• Browse available tour packages</li>
              <li>• Discover tourism agencies</li>
              <li>• Read travel-related blogs</li>
              <li>• View tourism and destination galleries</li>
              <li>• Manage bookings through the platform</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-base-surface py-14">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-bold text-text-main">
            Our Purpose
          </h2>

          <p className="mt-4 leading-7 text-text-muted">
            TourEase Nepal aims to provide a convenient digital platform for
            discovering and planning travel in Nepal while making tourism
            information easier to access for travelers and tourism service
            providers.
          </p>
        </div>
      </section>
    </div>
  );
}

