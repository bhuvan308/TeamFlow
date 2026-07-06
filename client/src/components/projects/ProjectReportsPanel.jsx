import { useState } from 'react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Spinner, ErrorBanner } from '../common/Feedback';

const HEALTH_TONE = { healthy: 'success', watch: 'warning', at_risk: 'danger' };

export function ProjectReportsPanel({ project }) {
  const { data, error, isLoading, refetch } = useAsync(() => api.reports.dashboard(project.id), [project.id]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  async function handleExport() {
    setExportError(null);
    setIsExporting(true);
    try {
      await api.reports.downloadTasksCsv(project.id);
    } catch (err) {
      setExportError(err);
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) return <Spinner label="Loading report…" />;
  if (error) return <ErrorBanner error={error} onRetry={refetch} />;
  if (!data) return null;

  const { completion, workload, rcas, health } = data;
  const maxOpenTasks = Math.max(1, ...workload.map((w) => w.open_tasks));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge tone={HEALTH_TONE[health.health] || 'neutral'}>{health.health.replace('_', ' ')}</Badge>
          <span className="text-sm text-brand-500">
            {completion.done}/{completion.total} tasks done ({Math.round(completion.rate * 100)}%)
          </span>
        </div>
        <div>
          <Button variant="secondary" isLoading={isExporting} onClick={handleExport}>
            Export tasks CSV
          </Button>
          {exportError && <ErrorBanner error={exportError} />}
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-brand-800">Workload by member</h3>
        <div className="space-y-2">
          {workload.map((w) => (
            <div key={w.user_id} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 truncate text-brand-600">{w.name}</span>
              <div className="h-2 flex-1 rounded-full bg-brand-100">
                <div
                  className="h-2 rounded-full bg-accent-gradient"
                  style={{ width: `${(w.open_tasks / maxOpenTasks) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-brand-400">{w.open_tasks} open</span>
            </div>
          ))}
          {workload.length === 0 && <p className="text-sm text-brand-400">No members yet.</p>}
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-brand-800">RCAs by status &amp; severity</h3>
        {rcas.length === 0 && <p className="text-sm text-brand-400">No RCAs recorded yet.</p>}
        {rcas.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-brand-400">
              <tr>
                <th className="py-1">Status</th>
                <th className="py-1">Severity</th>
                <th className="py-1 text-right">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {rcas.map((row, i) => (
                <tr key={i}>
                  <td className="py-1 capitalize">{row.status.replace('_', ' ')}</td>
                  <td className="py-1 capitalize">{row.severity}</td>
                  <td className="py-1 text-right">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
