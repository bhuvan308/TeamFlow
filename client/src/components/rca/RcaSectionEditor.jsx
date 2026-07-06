import { useState } from 'react';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { RCA_SECTION_LABELS } from '../../api/RcaService';

export function RcaSectionEditor({ section, canEdit, onSave }) {
  const [content, setContent] = useState(section.content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const isDirty = content !== section.content;

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      await onSave(section.section_type, content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-800">{RCA_SECTION_LABELS[section.section_type]}</h3>
        {canEdit && isDirty && (
          <Button variant="secondary" onClick={handleSave} isLoading={isSaving} className="!py-1 !text-xs">
            Save section
          </Button>
        )}
      </div>
      <Textarea
        rows={5}
        disabled={!canEdit}
        placeholder={canEdit ? 'Describe this section…' : 'Not filled in.'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
