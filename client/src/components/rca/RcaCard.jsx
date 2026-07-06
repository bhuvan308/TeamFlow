import { Link } from 'react-router-dom';
import { SeverityBadge, Badge } from '../common/Badge';

const STATUS_TONE = {
  draft: 'neutral',
  submitted: 'warning',
  in_review: 'info',
  closed: 'success',
  rejected: 'danger',
};

export function RcaCard({ rca, projectId }) {
  return (
    <Link to={`/projects/${projectId}/rcas/${rca.id}`} className="card card-accent-top block hover:border-violet-300">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-brand-900">{rca.title}</h4>
        <SeverityBadge severity={rca.severity} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Badge tone={STATUS_TONE[rca.status] || 'neutral'}>{rca.status}</Badge>
        <span className="text-xs text-brand-400">
          Created {new Date(rca.created_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
