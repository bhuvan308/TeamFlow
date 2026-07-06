import { useState } from 'react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { RcaCard } from '../rca/RcaCard';
import { RcaForm } from '../rca/RcaForm';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Spinner, EmptyState, ErrorBanner } from '../common/Feedback';

export function ProjectRcasPanel({ project }) {
  const { data, error, isLoading, refetch, setData } = useAsync(() => api.rcas.list(project.id), [project.id]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  async function handleCreate(values) {
    const { rca } = await api.rcas.create(project.id, values);
    setData((prev) => ({ rcas: [rca, ...(prev?.rcas || [])] }));
    setIsCreateOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-500">Root cause investigations for this project.</p>
        <Button onClick={() => setIsCreateOpen(true)}>New RCA</Button>
      </div>

      {isLoading && <Spinner label="Loading RCAs…" />}
      {error && <ErrorBanner error={error} onRetry={refetch} />}

      {!isLoading && !error && data?.rcas.length === 0 && (
        <EmptyState
          title="No investigations yet"
          description="Start one when an incident needs a root cause analysis."
          action={<Button onClick={() => setIsCreateOpen(true)}>New RCA</Button>}
        />
      )}

      {!isLoading && !error && data?.rcas.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.rcas.map((rca) => (
            <RcaCard key={rca.id} rca={rca} projectId={project.id} />
          ))}
        </div>
      )}

      <Modal title="New RCA" isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <RcaForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
      </Modal>
    </div>
  );
}
