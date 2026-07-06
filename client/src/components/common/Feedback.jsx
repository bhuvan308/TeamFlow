export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-400">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-transparent"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-brand-200 p-8 text-center">
      <p className="text-sm font-medium text-brand-700">{title}</p>
      {description && <p className="mt-1 text-sm text-brand-400">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <span>{error.message || 'Something went wrong.'}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-medium underline hover:no-underline">
          Try again
        </button>
      )}
    </div>
  );
}
