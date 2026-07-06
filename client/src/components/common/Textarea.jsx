export function Textarea({ label, id, error, className = '', rows = 4, ...rest }) {
  const fieldId = id || rest.name;
  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={rows}
        className="input resize-y"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${fieldId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
