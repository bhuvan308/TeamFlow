import { useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/Feedback';
import { RCA_SEVERITIES } from '../../api/RcaService';

export function RcaForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', severity: 'medium' });
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
        label="Title"
        required
        maxLength={200}
        value={form.title}
        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
      />
      <Select
        label="Severity"
        value={form.severity}
        onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
        options={RCA_SEVERITIES.map((s) => ({ value: s, label: s }))}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Start investigation
        </Button>
      </div>
    </form>
  );
}
