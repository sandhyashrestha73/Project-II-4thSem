import { useEffect, useState } from "react";
import { getAiComparison } from "../services/packageService";

const CATEGORY_ICONS = {
  Price: "💰",
  Duration: "🕒",
  Destination: "📍",
  Agency: "🏢",
  Rating: "⭐",
  "Inclusions and Services": "🧳",
};

export default function AiComparisonSummary({ packageA, packageB }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoggedIn = Boolean(localStorage.getItem("tourease_token"));

  // If the selected packages change, clear the old summary.
  useEffect(() => {
    setStatus("idle");
    setResult(null);
    setErrorMessage("");
  }, [packageA.package_id, packageB.package_id]);

  async function handleGenerate() {
    setStatus("loading");
    setErrorMessage("");

    try {
        const data = await getAiComparison(
        packageA.package_id,
        packageB.package_id
      );
      

      setResult(data);
      setStatus("success");
    } catch (error) {
      if (error.status === 401 || error.status === 422) {
        setErrorMessage("Please log in again to use AI comparison.");
      } else if (error.status === 404 || error.status === 400) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("AI comparison is temporarily unavailable.");
      }
      setStatus("error");
    }
  }

  const summary = result?.ai_summary;
  const priceDifference = result?.comparison?.price?.difference;

  return (
    <div className="mt-8 rounded-2xl border border-base-border bg-base-card p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main">
            AI Comparison Summary
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            A short, neutral explanation of the differences. The final
            decision is yours.
          </p>
        </div>

        {isLoggedIn && status !== "loading" && status !== "success" && (
          <button
            type="button"
            onClick={handleGenerate}
            className="btn-primary"
          >
            {status === "error" ? "Try Again" : "Generate AI Summary"}
          </button>
        )}
      </div>

      {!isLoggedIn && (
        <p className="mt-4 text-sm text-text-muted">
          Please log in to generate an AI comparison.
        </p>
      )}

      {status === "loading" && (
        <p className="mt-6 animate-pulse text-text-muted">
          Generating AI comparison...
        </p>
      )}

      {status === "error" && (
        <p className="mt-6 rounded-xl border border-base-border bg-base-surface p-4 text-sm text-text-muted">
          {errorMessage}
        </p>
      )}

      {status === "success" && summary && (
        <div className="mt-6 space-y-8">
          {/* Overview */}
          <div>
            <h3 className="font-semibold text-text-main">Overview</h3>
            <p className="mt-2 leading-relaxed text-text-muted">
              {summary.overview}
            </p>
            {priceDifference && (
              <p className="mt-2 text-sm font-semibold text-accent-secondary">
                Price difference: {priceDifference}
              </p>
            )}
          </div>

          {/* Key differences */}
          {summary.keyDifferences.length > 0 && (
            <div>
              <h3 className="font-semibold text-text-main">
                Key Differences
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {summary.keyDifferences.map((item, index) => (
                  <div
                    key={`${item.category}-${index}`}
                    className="rounded-xl border border-base-border bg-base-surface p-4"
                  >
                    <p className="font-semibold text-text-main">
                      {CATEGORY_ICONS[item.category] || "•"}{" "}
                      {item.category}
                    </p>
                    <p className="mt-2 break-words text-sm text-text-muted">
                      <span className="font-medium text-text-main">
                        {packageA.package_name}:
                      </span>{" "}
                      {item.packageA}
                    </p>
                    <p className="mt-1 break-words text-sm text-text-muted">
                      <span className="font-medium text-text-main">
                        {packageB.package_name}:
                      </span>{" "}
                      {item.packageB}
                    </p>
                    <p className="mt-2 break-words text-sm leading-relaxed text-text-muted">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          <div className="grid gap-6 md:grid-cols-2">
            <HighlightList
              title={`${packageA.package_name} Highlights`}
              items={summary.packageAHighlights}
            />
            <HighlightList
              title={`${packageB.package_name} Highlights`}
              items={summary.packageBHighlights}
            />
          </div>

          {/* Considerations */}
          <HighlightList
            title="Important Considerations"
            items={summary.importantConsiderations}
          />

          <p className="text-xs text-text-subtle">
            AI-generated from the package details above. Please confirm
            details with the agency before booking.
          </p>
        </div>
      )}
    </div>
  );
}

function HighlightList({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-text-main">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
        {items.map((text, index) => (
          <li key={index} className="break-words">
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}