import { useMemo, useState } from 'react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { TaskBoard } from '../tasks/TaskBoard';
import { TaskList } from '../tasks/TaskList';
import { TaskFilters } from '../tasks/TaskFilters';
import { TaskForm } from '../tasks/TaskForm';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Pagination } from '../common/Pagination';
import { Spinner, EmptyState, ErrorBanner } from '../common/Feedback';

export function ProjectTasksPanel({ project, members }) {
  const [view, setView] = useState(project.view_preference === 'list' ? 'list' : 'kanban');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const memberNameById = useMemo(() => new Map(members.map((m) => [m.id, m.name])), [members]);

  const { data, error, isLoading, refetch, setData } = useAsync(
    () => api.tasks.list(project.id, { ...filters, page: view === 'kanban' ? 1 : page, limit: view === 'kanban' ? 200 : 25 }),
    [project.id, filters, page, view]
  );

  async function handleCreateTask(values) {
    const { task, warnings } = await api.tasks.create(project.id, values);
    setData((prev) => ({ ...prev, tasks: [task, ...(prev?.tasks || [])] }));
    if (!warnings?.length) setIsCreateOpen(false);
    return warnings;
  }

  async function handleViewChange(nextView) {
    setView(nextView);
    setPage(1);
    try {
      await api.projects.setViewPreference(project.id, nextView === 'list' ? 'list' : 'kanban');
    } catch {
      // Non-critical: the view still switches locally even if persisting fails.
    }
  }

  async function handleStatusChange(taskId, status) {
    setStatusError(null);
    try {
      const { task } = await api.tasks.changeStatus(taskId, status);
      setData((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)) }));
    } catch (err) {
      setStatusError(err);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-md border border-brand-200 p-0.5">
          <button
            type="button"
            onClick={() => handleViewChange('kanban')}
            className={`rounded px-3 py-1 text-sm transition-colors ${view === 'kanban' ? 'bg-accent-gradient text-white shadow-sm shadow-violet-500/20' : 'text-brand-500 hover:bg-brand-100'}`}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => handleViewChange('list')}
            className={`rounded px-3 py-1 text-sm transition-colors ${view === 'list' ? 'bg-accent-gradient text-white shadow-sm shadow-violet-500/20' : 'text-brand-500 hover:bg-brand-100'}`}
          >
            List
          </button>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>New task</Button>
      </div>

      <TaskFilters filters={filters} members={members} onChange={(next) => { setFilters(next); setPage(1); }} />
      <ErrorBanner error={statusError} />

      {isLoading && <Spinner label="Loading tasks…" />}
      {error && <ErrorBanner error={error} onRetry={refetch} />}

      {!isLoading && !error && data?.tasks.length === 0 && (
        <EmptyState title="No tasks match these filters" description="Try clearing a filter or create a new task." />
      )}

      {!isLoading && !error && data?.tasks.length > 0 && view === 'kanban' && (
        <TaskBoard
          tasks={data.tasks}
          projectId={project.id}
          memberNameById={memberNameById}
          onStatusChange={handleStatusChange}
        />
      )}

      {!isLoading && !error && data?.tasks.length > 0 && view === 'list' && (
        <>
          <TaskList tasks={data.tasks} projectId={project.id} memberNameById={memberNameById} />
          <div className="mt-3">
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        </>
      )}

      <Modal title="New task" isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <TaskForm members={members} onSubmit={handleCreateTask} onCancel={() => setIsCreateOpen(false)} />
      </Modal>
    </div>
  );
}
