import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';

export function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="card card-accent-top block transition hover:border-violet-300">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-brand-900">{project.name}</h3>
        <Badge tone="neutral">{project.role}</Badge>
      </div>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-brand-500">{project.description}</p>
      )}
      <p className="mt-3 text-xs text-brand-400">
        Updated {new Date(project.updated_at).toLocaleDateString()}
      </p>
    </Link>
  );
}
