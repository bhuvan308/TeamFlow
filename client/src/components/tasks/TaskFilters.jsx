import { Select } from '../common/Select';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../api/TaskService';

export function TaskFilters({ filters, onChange, members }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Select
        placeholder="All statuses"
        value={filters.status || ''}
        onChange={(e) => update('status', e.target.value)}
        options={TASK_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))}
      />
      <Select
        placeholder="All priorities"
        value={filters.priority || ''}
        onChange={(e) => update('priority', e.target.value)}
        options={TASK_PRIORITIES.map((p) => ({ value: p, label: p }))}
      />
      <Select
        placeholder="Any assignee"
        value={filters.assigneeId || ''}
        onChange={(e) => update('assigneeId', e.target.value)}
        options={members.map((m) => ({ value: m.id, label: m.name }))}
      />
    </div>
  );
}
