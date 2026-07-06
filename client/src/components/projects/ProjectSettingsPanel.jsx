import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { ProjectForm } from './ProjectForm';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Button } from '../common/Button';

export function ProjectSettingsPanel({ project, onUpdated }) {
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canEdit = project.role === 'owner' || project.role === 'admin';
  const canDelete = project.role === 'owner';

  async function handleUpdate(values) {
    const { project: updated } = await api.projects.update(project.id, values);
    onUpdated({ ...project, ...updated });
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await api.projects.remove(project.id);
      navigate('/projects', { replace: true });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-brand-800">Project details</h3>
        {canEdit ? (
          <ProjectForm initialValues={project} onSubmit={handleUpdate} submitLabel="Save changes" />
        ) : (
          <p className="text-sm text-brand-500">Only project owners and admins can edit these details.</p>
        )}
      </div>

      {canDelete && (
        <div className="card border-red-200">
          <h3 className="mb-1 text-sm font-semibold text-red-700">Delete project</h3>
          <p className="mb-3 text-sm text-brand-500">
            This permanently removes the project, its tasks, and its RCAs. This cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
            Delete project
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete this project?"
        message={`"${project.name}" and everything in it will be permanently deleted.`}
        confirmLabel="Delete permanently"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
