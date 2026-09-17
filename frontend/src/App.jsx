
function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* ==================== NAVBAR ==================== */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          
          {/* Logo */}
          <a href="#home" className="text-2xl font-bold tracking-tight">
            TourEase{" "}
            <span className="text-emerald-600">Nepal</span>
          </a>

          {/* Navigation Links */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-slate-700 transition hover:text-emerald-600"
            >
              Home
            </a>

            <a
              href="#agencies"
              className="text-sm font-medium text-slate-700 transition hover:text-emerald-600"
            >
              Agencies
            </a>

            <a
              href="#packages"
              className="text-sm font-medium text-slate-700 transition hover:text-emerald-600"
            >
              Packages
            </a>

            <a
              href="#destinations"
              className="text-sm font-medium text-slate-700 transition hover:text-emerald-600"
            >
              Destinations
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-700 transition hover:text-emerald-600"
            >
              About
            </a>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Login
            </button>

            <button className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              Sign Up
            </button>
          </div>
        </div>
      </nav>


      {/* ==================== HERO SECTION ==================== */}
      <section
        id="home"
        className="relative overflow-hidden bg-white"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

          {/* Hero Content */}
          <div>
            <p className="mb-4 text-sm font-bold tracking-[0.2em] text-emerald-600">
              DISCOVER NEPAL WITH EASE
            </p>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
              Explore Nepal.
              <br />
              <span className="text-emerald-600">
                Travel with Ease.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Find trusted tourism agencies, explore amazing tour
              packages, compare prices, and plan your perfect journey
              across Nepal.
            </p>

            {/* Hero Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700">
                Explore Packages
              </button>

              <button className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-600">
                Find Agencies
              </button>
            </div>
          </div>


          {/* Hero Image Placeholder */}
          <div className="relative">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-sky-100 to-slate-200 shadow-2xl">
              
              <div className="text-center">
                <div className="mb-4 text-6xl">🏔️</div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Explore Nepal
                </h2>

                <p className="mt-2 text-slate-600">
                  Mountains • Culture • Adventure
                </p>
              </div>
            </div>

            {/* Decorative Circle */}
            <div className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-full bg-emerald-100 blur-2xl" />
          </div>
        </div>
      </section>


      {/* ==================== SEARCH SECTION ==================== */}
      <section className="relative z-10 -mt-6 px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">

            {/* Destination */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Where do you want to go?
              </label>

              <input
                type="text"
                placeholder="Search destination..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>


            {/* Travel Type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Travel Type
              </label>

              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option>Select type</option>
                <option>Trekking</option>
                <option>Tour</option>
                <option>Adventure</option>
                <option>Cultural</option>
              </select>
            </div>


            {/* Search Button */}
            <button className="rounded-xl bg-slate-900 px-7 py-3 font-semibold text-white transition hover:bg-emerald-600">
              Search
            </button>

          </div>
        </div>
      </section>


      {/* ==================== FEATURED SECTION ==================== */}
      <section
        id="agencies"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >

        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-emerald-600">
            TRUSTED BY TRAVELERS
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Explore Nepal with Trusted Agencies
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Discover reliable agencies and exciting travel
            experiences.
          </p>
        </div>


        {/* Cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">

          {/* Card 1 */}
          <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">

            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-200">
              <span className="text-6xl">🏕️</span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">
                Trusted Agencies
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Find verified tourism agencies for your next
                adventure.
              </p>

              <button className="mt-5 font-semibold text-emerald-600 transition group-hover:text-emerald-700">
                View Agencies →
              </button>
            </div>
          </div>


          {/* Card 2 */}
          <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">

            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200">
              <span className="text-6xl">🗺️</span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">
                Popular Packages
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Compare packages, prices and services in one place.
              </p>

              <button className="mt-5 font-semibold text-emerald-600 transition group-hover:text-emerald-700">
                Explore Packages →
              </button>
            </div>
          </div>


          {/* Card 3 */}
          <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">

            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200">
              <span className="text-6xl">🏔️</span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">
                Beautiful Destinations
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Discover amazing destinations throughout Nepal.
              </p>

              <button className="mt-5 font-semibold text-emerald-600 transition group-hover:text-emerald-700">
                Explore Destinations →
              </button>
            </div>
          </div>

        </div>
      </section>


      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between lg:px-8">

          <div>
            <h3 className="text-xl font-bold">
              TourEase <span className="text-emerald-400">Nepal</span>
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              Discover, compare and book your perfect Nepal
              experience.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            © 2026 TourEase Nepal. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  )
}

export default App
