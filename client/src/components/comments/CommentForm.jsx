import { useState } from 'react';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/Feedback';

export function CommentForm({ onSubmit }) {
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(body);
      setBody('');
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <ErrorBanner error={error} />
      <Textarea
        placeholder="Add a comment… (mention someone with @[Name](user-id))"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting} disabled={!body.trim()}>
          Comment
        </Button>
      </div>
    </form>
  );
}
