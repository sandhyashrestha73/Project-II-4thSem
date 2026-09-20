export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-red-50 px-6 py-8 text-center">
      <p className="text-danger">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Try again
        </button>
      )}
    </div>
  );
}

export function extractErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  return err?.response?.data?.message || fallback;
}