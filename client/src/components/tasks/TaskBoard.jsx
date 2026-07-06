import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TASK_STATUSES, TASK_STATUS_LABELS } from '../../api/TaskService';

export function TaskBoard({ tasks, projectId, memberNameById, onStatusChange }) {
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const tasksByStatus = TASK_STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  function handleDrop(status, e) {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData('text/task-id');
    const sourceStatus = e.dataTransfer.getData('text/task-status');
    if (taskId && sourceStatus !== status) onStatusChange(taskId, status);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {TASK_STATUSES.map((status) => (
        <div
          key={status}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverStatus(status);
          }}
          onDragLeave={() => setDragOverStatus(null)}
          onDrop={(e) => handleDrop(status, e)}
          className={`min-h-[10rem] rounded-lg border p-2 transition-colors ${
            dragOverStatus === status ? 'border-violet-300 bg-violet-50' : 'border-brand-200 bg-white/60'
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              {TASK_STATUS_LABELS[status]}
            </h3>
            <span className="text-xs text-brand-400">{tasksByStatus[status].length}</span>
          </div>
          <div className="space-y-2">
            {tasksByStatus[status].map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/task-id', task.id);
                  e.dataTransfer.setData('text/task-status', task.status);
                }}
              >
                <TaskCard task={task} projectId={projectId} assigneeName={memberNameById.get(task.assignee_id)} />
              </div>
            ))}
            {tasksByStatus[status].length === 0 && (
              <p className="px-1 py-2 text-xs text-brand-400">Drop a task here</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
