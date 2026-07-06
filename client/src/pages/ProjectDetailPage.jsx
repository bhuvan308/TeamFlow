import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { Tabs } from '../components/common/Tabs';
import { Spinner, ErrorBanner } from '../components/common/Feedback';
import { ProjectTasksPanel } from '../components/projects/ProjectTasksPanel';
import { ProjectRcasPanel } from '../components/projects/ProjectRcasPanel';
import { ProjectMembersPanel } from '../components/projects/ProjectMembersPanel';
import { ProjectReportsPanel } from '../components/projects/ProjectReportsPanel';
import { ProjectSettingsPanel } from '../components/projects/ProjectSettingsPanel';

const TABS = [
  { value: 'board', label: 'Board' },
  { value: 'rcas', label: 'RCAs' },
  { value: 'members', label: 'Members' },
  { value: 'reports', label: 'Reports' },
  { value: 'settings', label: 'Settings' },
];

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('board');

  const projectQuery = useAsync(async () => {
    const [{ project }, { projects }, { members }] = await Promise.all([
      api.projects.getOne(projectId),
      api.projects.list(),
      api.projects.listMembers(projectId),
    ]);
    // The single-project GET doesn't include the caller's role/view
    // preference (those only come back on the list endpoint) - stitch them
    // together here so every panel gets one consistent project object.
    const membership = projects.find((p) => p.id === projectId);
    return {
      project: { ...project, role: membership?.role, view_preference: membership?.view_preference },
      members,
    };
  }, [projectId]);

  const { data, error, isLoading, refetch, setData } = projectQuery;

  if (isLoading) return <Spinner label="Loading project…" />;
  if (error) return <ErrorBanner error={error} onRetry={refetch} />;
  if (!data) return null;

  const { project, members } = data;

  return (
    <div>
      <Link to="/projects" className="mb-2 inline-block text-sm text-brand-500 hover:underline">
        ← All projects
      </Link>
      <h1 className="mb-4 text-lg font-semibold text-brand-900">{project.name}</h1>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'board' && <ProjectTasksPanel project={project} members={members} />}
      {activeTab === 'rcas' && <ProjectRcasPanel project={project} />}
      {activeTab === 'members' && (
        <ProjectMembersPanel
          project={project}
          members={members}
          onMembersChange={(next) => setData({ ...data, members: next })}
        />
      )}
      {activeTab === 'reports' && <ProjectReportsPanel project={project} />}
      {activeTab === 'settings' && (
        <ProjectSettingsPanel
          project={project}
          onUpdated={(next) => setData({ ...data, project: next })}
        />
      )}
    </div>
  );
}
