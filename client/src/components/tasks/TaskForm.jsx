import { useState } from 'react';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/Feedback';
import { TASK_PRIORITIES } from '../../api/TaskService';

export function TaskForm({ members, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: '',
    dueDate: '',
  });
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      };
      const warnings = await onSubmit(payload);
      if (warnings?.length) setWarning(warnings[0]);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBanner error={error} />
      {warning && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {warning.message || 'Heads up: this assignee already has several open tasks.'}
        </p>
      )}
      <Input label="Title" name="title" required maxLength={200} value={form.title} onChange={handleChange} />
      <Textarea
        label="Description"
        name="description"
        maxLength={5000}
        value={form.description}
        onChange={handleChange}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
          options={TASK_PRIORITIES.map((p) => ({ value: p, label: p }))}
        />
        <Input label="Due date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
      </div>
      <Select
        label="Assignee"
        name="assigneeId"
        placeholder="Unassigned"
        value={form.assigneeId}
        onChange={handleChange}
        options={members.map((m) => ({ value: m.id, label: m.name }))}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create task
        </Button>
      </div>
    </form>
  );
}
