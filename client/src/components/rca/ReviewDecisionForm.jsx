import { useState } from 'react';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/Feedback';

export function ReviewDecisionForm({ onDecide }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [pendingDecision, setPendingDecision] = useState(null);

  async function submit(decision) {
    setError(null);
    if (!comment.trim()) {
      setError(new Error('A comment is required to record a decision.'));
      return;
    }
    setPendingDecision(decision);
    try {
      await onDecide({ decision, comment });
      setComment('');
    } catch (err) {
      setError(err);
    } finally {
      setPendingDecision(null);
    }
  }

  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-semibold text-brand-800">Your review</h3>
      <ErrorBanner error={error} />
      <Textarea
        placeholder="Explain your decision…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={5000}
      />
      <div className="flex justify-end gap-2">
        <Button variant="danger" isLoading={pendingDecision === 'rejected'} onClick={() => submit('rejected')}>
          Reject
        </Button>
        <Button isLoading={pendingDecision === 'approved'} onClick={() => submit('approved')}>
          Approve
        </Button>
      </div>
    </div>
  );
}
