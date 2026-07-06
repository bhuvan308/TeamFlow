import { useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/Feedback';

export function AddMemberForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ userId: '', role: 'member' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBanner error={error} />
      <Input
        label="User ID"
        name="userId"
        required
        hint="The teammate's account ID (UUID)."
        value={form.userId}
        onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
      />
      <Select
        label="Role"
        value={form.role}
        onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'member', label: 'Member' },
          { value: 'viewer', label: 'Viewer' },
        ]}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Add member
        </Button>
      </div>
    </form>
  );
}
