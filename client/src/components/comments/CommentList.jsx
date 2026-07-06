const MENTION_RE = /@\[([^\]]+)\]\([0-9a-fA-F-]{36}\)/g;

/** Renders "@[Name](uuid)" mention syntax as a plain highlighted @Name chip.
 * Splitting into text nodes and letting React render them keeps this safe
 * from injection - nothing here is ever passed through innerHTML. */
function renderBody(body) {
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = MENTION_RE.exec(body)) !== null) {
    if (match.index > lastIndex) parts.push(body.slice(lastIndex, match.index));
    parts.push(
      <span key={`mention-${key++}`} className="rounded bg-brand-100 px-1 font-medium text-brand-700">
        @{match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < body.length) parts.push(body.slice(lastIndex));
  return parts;
}

export function CommentList({ comments }) {
  if (comments.length === 0) {
    return <p className="text-sm text-brand-400">No comments yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-md border border-brand-100 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-800">{comment.author_name}</span>
            <span className="text-xs text-brand-400">{new Date(comment.created_at).toLocaleString()}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-brand-600">{renderBody(comment.body)}</p>
        </li>
      ))}
    </ul>
  );
}
