import { Badge } from '../common/Badge';

const DECISION_TONE = { approved: 'success', rejected: 'danger' };

export function ReviewerList({ reviewers, canManage, onRemove }) {
  if (reviewers.length === 0) {
    return <p className="text-sm text-brand-400">No reviewers assigned yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {reviewers.map((r) => (
        <li key={r.id} className="flex items-start justify-between gap-3 rounded-md border border-brand-100 p-3">
          <div>
            <p className="text-sm font-medium text-brand-800">{r.reviewer_name}</p>
            {r.comment && <p className="mt-1 text-xs text-brand-500">"{r.comment}"</p>}
          </div>
          <div className="flex items-center gap-2">
            {r.decision ? (
              <Badge tone={DECISION_TONE[r.decision]}>{r.decision}</Badge>
            ) : (
              <Badge tone="neutral">Pending</Badge>
            )}
            {canManage && !r.decision && (
              <button
                type="button"
                onClick={() => onRemove(r.reviewer_id)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
