function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ attachments }) {
  if (attachments.length === 0) {
    return <p className="text-sm text-brand-400">No attachments yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {attachments.map((a) => (
        <li key={a.id} className="flex items-center justify-between rounded-md border border-brand-100 p-2 text-sm">
          <span className="truncate text-brand-700">{a.file_name}</span>
          <span className="ml-3 shrink-0 text-xs text-brand-400">{formatSize(Number(a.size_bytes))}</span>
        </li>
      ))}
    </ul>
  );
}
