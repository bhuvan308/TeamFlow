export function Input({ label, id, error, hint, className = '', ...rest }) {
  const fieldId = id || rest.name;
  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <input
        id={fieldId}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {hint && !error && <p className="mt-1 text-xs text-brand-400">{hint}</p>}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
