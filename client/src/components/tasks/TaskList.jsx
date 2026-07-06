import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { TASK_STATUS_LABELS } from '../../api/TaskService';

export function TaskList({ tasks, projectId, memberNameById }) {
  return (
    <div className="overflow-hidden rounded-lg border border-brand-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-500">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Assignee</th>
            <th className="px-4 py-2">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-brand-50">
              <td className="px-4 py-2">
                <Link to={`/projects/${projectId}/tasks/${task.id}`} className="font-medium text-brand-900 hover:underline">
                  {task.title}
                </Link>
              </td>
              <td className="px-4 py-2">
                <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />
              </td>
              <td className="px-4 py-2">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="px-4 py-2 text-brand-500">
                {task.assignee_id ? memberNameById.get(task.assignee_id) || 'Unknown' : '—'}
              </td>
              <td className="px-4 py-2 text-brand-500">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
