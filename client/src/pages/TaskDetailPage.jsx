import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { Spinner, ErrorBanner, EmptyState } from '../components/common/Feedback';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Button } from '../components/common/Button';
import { CommentList } from '../components/comments/CommentList';
import { CommentForm } from '../components/comments/CommentForm';
import { AttachmentList } from '../components/attachments/AttachmentList';
import { AttachmentUpload } from '../components/attachments/AttachmentUpload';
import { TASK_STATUSES, TASK_PRIORITIES, TASK_STATUS_LABELS } from '../api/TaskService';

export function TaskDetailPage() {
  const { projectId, taskId } = useParams();

  const { data, error, isLoading, refetch, setData } = useAsync(async () => {
    const [{ task }, { members }, { comments }, { attachments }, { blockers }, { dependents }] = await Promise.all([
      api.tasks.getOne(taskId),
      api.projects.listMembers(projectId),
      api.comments.list('task', taskId),
      api.attachments.list('task', taskId),
      api.tasks.listBlockers(taskId),
      api.tasks.listDependents(taskId),
    ]);
    return { task, members, comments, attachments, blockers, dependents };
  }, [taskId]);

  const [statusError, setStatusError] = useState(null);
  const [dependencyId, setDependencyId] = useState('');
  const [dependencyError, setDependencyError] = useState(null);

  if (isLoading) return <Spinner label="Loading task…" />;
  if (error) return <ErrorBanner error={error} onRetry={refetch} />;
  if (!data) return null;

  const { task, members, comments, attachments, blockers, dependents } = data;
  const memberNameById = new Map(members.map((m) => [m.id, m.name]));

  async function handleFieldSave(fields) {
    const { task: updated } = await api.tasks.update(taskId, fields);
    setData((prev) => ({ ...prev, task: updated }));
  }

  async function handleStatusChange(e) {
    const status = e.target.value;
    setStatusError(null);
    try {
      const { task: updated } = await api.tasks.changeStatus(taskId, status);
      setData((prev) => ({ ...prev, task: updated }));
    } catch (err) {
      setStatusError(err);
    }
  }

  async function handleAddComment(body) {
    const { comment } = await api.comments.create('task', taskId, body);
    setData((prev) => ({ ...prev, comments: [...prev.comments, comment] }));
  }

  async function handleUpload(file) {
    const { attachment } = await api.attachments.upload('task', taskId, file);
    setData((prev) => ({ ...prev, attachments: [attachment, ...prev.attachments] }));
  }

  async function handleAddDependency(e) {
    e.preventDefault();
    setDependencyError(null);
    try {
      await api.tasks.addDependency(taskId, dependencyId);
      const { blockers: nextBlockers } = await api.tasks.listBlockers(taskId);
      setData((prev) => ({ ...prev, blockers: nextBlockers }));
      setDependencyId('');
    } catch (err) {
      setDependencyError(err);
    }
  }

  async function handleRemoveDependency(targetTaskId) {
    await api.tasks.removeDependency(taskId, targetTaskId);
    setData((prev) => ({ ...prev, blockers: prev.blockers.filter((b) => b.id !== targetTaskId) }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <Link to={`/projects/${projectId}`} className="mb-2 inline-block text-sm text-brand-500 hover:underline">
            ← Back to board
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-brand-900">{task.title}</h1>
            <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-brand-800">Details</h3>
          <InlineEditableTask task={task} members={members} onSave={handleFieldSave} />
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-brand-800">Comments</h3>
          <CommentList comments={comments} />
          <div className="mt-4">
            <CommentForm onSubmit={handleAddComment} />
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-brand-800">Attachments</h3>
          <AttachmentList attachments={attachments} />
          <div className="mt-3">
            <AttachmentUpload onUpload={handleUpload} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-brand-800">Status</h3>
          <ErrorBanner error={statusError} />
          <Select value={task.status} onChange={handleStatusChange} options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_LABELS[s] }))} />
        </div>

        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-brand-800">Blocked by</h3>
          {blockers.length === 0 && <p className="text-sm text-brand-400">Nothing blocking this task.</p>}
          <ul className="space-y-2">
            {blockers.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <Link to={`/projects/${projectId}/tasks/${b.id}`} className="truncate text-brand-700 hover:underline">
                  {b.title}
                </Link>
                <button type="button" onClick={() => handleRemoveDependency(b.id)} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddDependency} className="mt-3 flex gap-2">
            <Input
              className="flex-1"
              placeholder="Blocking task ID"
              value={dependencyId}
              onChange={(e) => setDependencyId(e.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={!dependencyId}>
              Add
            </Button>
          </form>
          <ErrorBanner error={dependencyError} />
        </div>

        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-brand-800">Blocks</h3>
          {dependents.length === 0 ? (
            <EmptyState title="No dependents" description="No task depends on this one." />
          ) : (
            <ul className="space-y-1">
              {dependents.map((d) => (
                <li key={d.id}>
                  <Link to={`/projects/${projectId}/tasks/${d.id}`} className="text-sm text-brand-700 hover:underline">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small inline edit form for the mutable task fields, kept local to this
 * page since nothing else reuses this exact field combination. */
function InlineEditableTask({ task, members, onSave }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    assigneeId: task.assignee_id || '',
    dueDate: task.due_date ? task.due_date.slice(0, 10) : '',
  });
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = JSON.stringify(form) !== JSON.stringify({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    assigneeId: task.assignee_id || '',
    dueDate: task.due_date ? task.due_date.slice(0, 10) : '',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onSave({ ...form, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null });
    } catch (err) {
      setError(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <ErrorBanner error={error} />
      <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} maxLength={200} required />
      <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} maxLength={5000} />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Priority"
          value={form.priority}
          onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
          options={TASK_PRIORITIES.map((p) => ({ value: p, label: p }))}
        />
        <Input label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
      </div>
      <Select
        label="Assignee"
        placeholder="Unassigned"
        value={form.assigneeId}
        onChange={(e) => setForm((p) => ({ ...p, assigneeId: e.target.value }))}
        options={members.map((m) => ({ value: m.id, label: m.name }))}
      />
      {isDirty && (
        <Button type="submit" isLoading={isSaving}>
          Save changes
        </Button>
      )}
    </form>
  );
}
