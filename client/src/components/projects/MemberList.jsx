import { Badge } from '../common/Badge';

export function MemberList({ members, canManage, currentUserId, onRemove }) {
  return (
    <ul className="divide-y divide-brand-100">
      {members.map((member) => (
        <li key={member.id} className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-brand-800">{member.name}</p>
            <p className="text-xs text-brand-400">{member.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{member.role}</Badge>
            {canManage && member.id !== currentUserId && (
              <button
                type="button"
                onClick={() => onRemove(member.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
