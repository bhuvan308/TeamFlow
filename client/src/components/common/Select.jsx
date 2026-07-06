export function Select({ label, id, error, options, placeholder, className = '', ...rest }) {
  const fieldId = id || rest.name;
  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <select id={fieldId} className="input" aria-invalid={Boolean(error)} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
