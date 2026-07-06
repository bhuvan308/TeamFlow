import { Link } from 'react-router-dom';
import { PriorityBadge } from '../common/Badge';

export function TaskCard({ task, projectId, assigneeName }) {
  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();

  return (
    <Link
      to={`/projects/${projectId}/tasks/${task.id}`}
      className="card block space-y-2 hover:border-violet-300"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-brand-900">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="flex items-center justify-between text-xs text-brand-400">
        <span className={isOverdue ? 'font-medium text-red-600' : ''}>
          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
        </span>
        {task.assignee_id && <span>{assigneeName || 'Assigned'}</span>}
      </div>
    </Link>
  );
}
