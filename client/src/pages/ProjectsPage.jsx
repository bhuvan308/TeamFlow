import { useState } from 'react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Spinner, EmptyState, ErrorBanner } from '../components/common/Feedback';

export function ProjectsPage() {
  const { data, error, isLoading, refetch, setData } = useAsync(() => api.projects.list(), []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  async function handleCreate(values) {
    const { project } = await api.projects.create(values);
    setData((prev) => ({ projects: [{ ...project, role: 'owner' }, ...(prev?.projects || [])] }));
    setIsCreateOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-brand-900">Projects</h1>
        <Button onClick={() => setIsCreateOpen(true)}>New project</Button>
      </div>

      {isLoading && <Spinner label="Loading projects…" />}
      {error && <ErrorBanner error={error} onRetry={refetch} />}

      {!isLoading && !error && data?.projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking tasks and RCAs."
          action={<Button onClick={() => setIsCreateOpen(true)}>New project</Button>}
        />
      )}

      {!isLoading && !error && data?.projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <Modal title="New project" isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <ProjectForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} submitLabel="Create project" />
      </Modal>
    </div>
  );
}
