const TONE_CLASS = {
  neutral: 'bg-brand-100 text-brand-700',
  info: 'bg-sky-100 text-sky-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};

export function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}

const STATUS_TONE = {
  todo: 'neutral',
  in_progress: 'info',
  in_review: 'warning',
  done: 'success',
  blocked: 'danger',
};

const PRIORITY_TONE = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

const SEVERITY_TONE = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

export function StatusBadge({ status, label }) {
  return <Badge tone={STATUS_TONE[status] || 'neutral'}>{label || status}</Badge>;
}

export function PriorityBadge({ priority }) {
  return <Badge tone={PRIORITY_TONE[priority] || 'neutral'}>{priority}</Badge>;
}

export function SeverityBadge({ severity }) {
  return <Badge tone={SEVERITY_TONE[severity] || 'neutral'}>{severity}</Badge>;
}
