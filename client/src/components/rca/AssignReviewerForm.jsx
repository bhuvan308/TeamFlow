import { useState } from 'react';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/Feedback';

export function AssignReviewerForm({ members, onSubmit }) {
  const [reviewerId, setReviewerId] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reviewerId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(reviewerId);
      setReviewerId('');
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Select
        className="flex-1"
        placeholder="Choose a reviewer"
        value={reviewerId}
        onChange={(e) => setReviewerId(e.target.value)}
        options={members.map((m) => ({ value: m.id, label: m.name }))}
      />
      <Button type="submit" variant="secondary" isLoading={isSubmitting}>
        Assign
      </Button>
      {error && <ErrorBanner error={error} />}
    </form>
  );
}
