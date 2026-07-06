const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
};

export function Button({ variant = 'primary', isLoading = false, children, className = '', ...rest }) {
  return (
    <button
      className={`${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} ${className}`}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
