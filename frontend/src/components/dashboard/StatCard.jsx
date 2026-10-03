export default function StatCard({ label, value, hint }) {
  const isTextValue =
    typeof value === "string" &&
    value.toLowerCase() === "no ratings yet";

  return (
    <div className="card border border-[#e2e8f0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Card Label */}
      <p className="text-sm font-semibold text-[#475569]">
        {label}
      </p>

      {/* Main Value */}
      <p
        className={`mt-2 font-extrabold text-[#0f172a] ${
          isTextValue ? "text-lg" : "text-3xl"
        }`}
      >
        {value}
      </p>

      {/* Hint / Additional Information */}
      {hint && (
        <p className="mt-1 text-xs font-medium text-[#64748b]">
          {hint}
        </p>
      )}
    </div>
  );
}

