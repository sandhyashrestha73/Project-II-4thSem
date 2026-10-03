import { Link, useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";
import AiComparisonSummary from "../components/AiComparisonSummary";

export default function ComparePackages() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPackages = location.state?.packages || [];
  const destinations = location.state?.destinations || [];
  const agencies = location.state?.agencies || [];

  const destinationName = (id) =>
    destinations.find(
      (d) => String(d.destination_id) === String(id)
    )?.name || "Unknown";

  const agencyName = (id) =>
    agencies.find(
      (a) => String(a.agency_id) === String(id)
    )?.agency_name || "Unknown Agency";

  if (selectedPackages.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-text-main">
          Compare Tour Packages
        </h1>

        <p className="mt-3 text-text-muted">
          Please select at least two packages to compare.
        </p>

        <button
          type="button"
          onClick={() => navigate("/packages")}
          className="btn-primary mt-6"
        >
          Browse Packages
        </button>
      </div>
    );
  }

  // First column is for labels.
  // Remaining columns are divided equally between packages.
  const packageColumnWidth = `${100 / selectedPackages.length}%`;

  return (
    <div>
      {/* Header */}
      <section className="bg-base-surface py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="section-title">
            Compare Tour Packages
          </h1>

          <p className="mt-2 text-text-muted">
            Compare package details side by side before
            choosing your trip.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="overflow-x-auto rounded-2xl border border-base-border bg-base-card shadow-sm">
          <table className="w-full min-w-[850px] table-fixed border-collapse">
            {/* Fixed column widths */}
            <colgroup>
              <col className="w-44" />

              {selectedPackages.map((p) => (
                <col
                  key={p.package_id}
                  style={{
                    width: packageColumnWidth,
                  }}
                />
              ))}
            </colgroup>

            <thead>
              <tr className="border-b border-base-border">
                {/* Label column */}
                <th className="w-44 bg-base-surface p-5 text-left text-sm font-semibold text-text-muted">
                  Package Details
                </th>

                {/* Package columns */}
                {selectedPackages.map((p) => (
                  <th
                    key={p.package_id}
                    className="border-l border-base-border p-5 text-left align-top"
                  >
                    {/* Image */}
                    <div className="w-full overflow-hidden rounded-xl bg-base-surface">
                      {p.image ? (
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.package_name}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center text-text-subtle">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Package Name */}
                    <h2 className="mt-4 break-words text-lg font-bold text-text-main">
                      {p.package_name}
                    </h2>

                    {/* Agency Name */}
                    <p className="mt-1 break-words text-sm font-medium text-accent-secondary">
                      {agencyName(p.agency_id)}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Destination */}
              <tr className="border-b border-base-border">
                <td className="bg-base-surface p-5 font-semibold text-text-main">
                  Destination
                </td>

                {selectedPackages.map((p) => (
                  <td
                    key={p.package_id}
                    className="border-l border-base-border p-5 align-top text-text-muted"
                  >
                    <span className="break-words">
                      {destinationName(
                        p.destination_id
                      )}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Agency */}
              <tr className="border-b border-base-border">
                <td className="bg-base-surface p-5 font-semibold text-text-main">
                  Agency
                </td>

                {selectedPackages.map((p) => (
                  <td
                    key={p.package_id}
                    className="border-l border-base-border p-5 align-top text-text-muted"
                  >
                    <span className="break-words">
                      {agencyName(p.agency_id)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Duration */}
              <tr className="border-b border-base-border">
                <td className="bg-base-surface p-5 font-semibold text-text-main">
                  Duration
                </td>

                {selectedPackages.map((p) => (
                  <td
                    key={p.package_id}
                    className="border-l border-base-border p-5 align-top text-text-muted"
                  >
                    {p.duration || "Not specified"}
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className="border-b border-base-border">
                <td className="bg-base-surface p-5 font-semibold text-text-main">
                  Price
                </td>

                {selectedPackages.map((p) => (
                  <td
                    key={p.package_id}
                    className="border-l border-base-border p-5 align-top font-bold text-accent-secondary"
                  >
                    NPR{" "}
                    {Number(
                      p.price
                    ).toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr className="border-b border-base-border">
                <td className="bg-base-surface p-5 font-semibold text-text-main">
                  Description
                </td>

                {selectedPackages.map((p) => (
                  <td
                    key={p.package_id}
                    className="border-l border-base-border p-5 align-top leading-relaxed text-text-muted break-words"
                  >
                    {p.description ||
                      "No description available."}
                  </td>
                ))}
              </tr>

              {/* Booking */}
              <tr>
                <td className="bg-base-surface p-5 font-semibold text-text-main">
                  Action
                </td>

                {selectedPackages.map((p) => (
                  <td
                    key={p.package_id}
                    className="border-l border-base-border p-5 align-top"
                  >
                    <Link
                      to={`/packages/${p.package_id}`}
                      className="btn-primary inline-block"
                    >
                      View & Book
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {selectedPackages.length === 2 && (
          <AiComparisonSummary
            packageA={selectedPackages[0]}
            packageB={selectedPackages[1]}
          />
        )}
        <div className="mt-8">
          <Link
            to="/packages"
            className="text-sm font-semibold text-accent-secondary hover:underline"
          >
            ← Back to Packages
          </Link>
        </div>
      </section>
    </div>
  );
}