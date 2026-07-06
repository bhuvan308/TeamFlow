import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { MemberList } from './MemberList';
import { AddMemberForm } from './AddMemberForm';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function ProjectMembersPanel({ project, members, onMembersChange }) {
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const canManage = project.role === 'owner' || project.role === 'admin';

  async function handleAdd(values) {
    const { member } = await api.projects.addMember(project.id, values);
    onMembersChange([...members.filter((m) => m.id !== member.user_id), { ...member, id: member.user_id }]);
    setIsAddOpen(false);
  }

  async function handleRemove(userId) {
    await api.projects.removeMember(project.id, userId);
    onMembersChange(members.filter((m) => m.id !== userId));
  }

  return (
    <div className="max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-500">{members.length} member(s) in this project.</p>
        {canManage && <Button onClick={() => setIsAddOpen(true)}>Add member</Button>}
      </div>

      <div className="card">
        <MemberList members={members} canManage={canManage} currentUserId={user?.id} onRemove={handleRemove} />
      </div>

      <Modal title="Add member" isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <AddMemberForm onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} />
      </Modal>
    </div>
  );
}
