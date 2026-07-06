import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { Spinner, ErrorBanner } from '../components/common/Feedback';
import { SeverityBadge, Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { RcaSectionEditor } from '../components/rca/RcaSectionEditor';
import { ReviewerList } from '../components/rca/ReviewerList';
import { AssignReviewerForm } from '../components/rca/AssignReviewerForm';
import { ReviewDecisionForm } from '../components/rca/ReviewDecisionForm';
import { CommentList } from '../components/comments/CommentList';
import { CommentForm } from '../components/comments/CommentForm';
import { AttachmentList } from '../components/attachments/AttachmentList';
import { AttachmentUpload } from '../components/attachments/AttachmentUpload';

const STATUS_TONE = { draft: 'neutral', submitted: 'warning', in_review: 'info', closed: 'success', rejected: 'danger' };

export function RcaDetailPage() {
  const { projectId, rcaId } = useParams();
  const { user } = useAuth();

  const { data, error, isLoading, refetch, setData } = useAsync(async () => {
    const [{ rca, sections, reviewers }, { members }, { comments }, { attachments }] = await Promise.all([
      api.rcas.getOne(rcaId),
      api.projects.listMembers(projectId),
      api.comments.list('rca', rcaId),
      api.attachments.list('rca', rcaId),
    ]);
    return { rca, sections, reviewers, members, comments, attachments };
  }, [rcaId]);

  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <Spinner label="Loading RCA…" />;
  if (error) return <ErrorBanner error={error} onRetry={refetch} />;
  if (!data) return null;

  const { rca, sections, reviewers, members, comments, attachments } = data;
  const isDraft = rca.status === 'draft';
  const myPendingReview = reviewers.find((r) => r.reviewer_id === user?.id && !r.decision);
  const canSubmit = isDraft;

  async function handleSaveSection(sectionType, content) {
    const { section } = await api.rcas.updateSection(rcaId, sectionType, content);
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.section_type === section.section_type ? section : s)),
    }));
  }

  async function handleAssignReviewer(reviewerId) {
    const { review } = await api.rcas.assignReviewer(rcaId, reviewerId);
    setData((prev) => ({ ...prev, reviewers: [...prev.reviewers, review] }));
  }

  async function handleRemoveReviewer(reviewerId) {
    await api.rcas.removeReviewer(rcaId, reviewerId);
    setData((prev) => ({ ...prev, reviewers: prev.reviewers.filter((r) => r.reviewer_id !== reviewerId) }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const { rca: updated } = await api.rcas.submit(rcaId);
      setData((prev) => ({ ...prev, rca: updated }));
    } catch (err) {
      setSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDecide(values) {
    const { review, rcaOutcome } = await api.rcas.decideReview(rcaId, values);
    setData((prev) => ({
      ...prev,
      reviewers: prev.reviewers.map((r) => (r.reviewer_id === review.reviewer_id ? { ...r, ...review } : r)),
      rca: rcaOutcome?.rca || prev.rca,
    }));
  }

  async function handleAddComment(body) {
    const { comment } = await api.comments.create('rca', rcaId, body);
    setData((prev) => ({ ...prev, comments: [...prev.comments, comment] }));
  }

  async function handleUpload(file) {
    const { attachment } = await api.attachments.upload('rca', rcaId, file);
    setData((prev) => ({ ...prev, attachments: [attachment, ...prev.attachments] }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div>
          <Link to={`/projects/${projectId}`} className="mb-2 inline-block text-sm text-brand-500 hover:underline">
            ← Back to RCAs
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-brand-900">{rca.title}</h1>
            <SeverityBadge severity={rca.severity} />
            <Badge tone={STATUS_TONE[rca.status]}>{rca.status.replace('_', ' ')}</Badge>
          </div>
        </div>

        {sections.map((section) => (
          <RcaSectionEditor key={section.id} section={section} canEdit={isDraft} onSave={handleSaveSection} />
        ))}

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

      <div className="space-y-4">
        {canSubmit && (
          <div className="card">
            <h3 className="mb-2 text-sm font-semibold text-brand-800">Submit for review</h3>
            <p className="mb-3 text-sm text-brand-500">
              All sections need content and at least one reviewer before this can be submitted.
            </p>
            <ErrorBanner error={submitError} />
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Submit RCA
            </Button>
          </div>
        )}

        {myPendingReview && (
          <ReviewDecisionForm onDecide={handleDecide} />
        )}

        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-brand-800">Reviewers</h3>
          <ReviewerList reviewers={reviewers} canManage={isDraft} onRemove={handleRemoveReviewer} />
          {isDraft && (
            <div className="mt-3">
              <AssignReviewerForm members={members} onSubmit={handleAssignReviewer} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
