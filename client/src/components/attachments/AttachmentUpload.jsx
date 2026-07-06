import { useRef, useState } from 'react';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/Feedback';
import { MAX_UPLOAD_MB } from '../../api/AttachmentService';

export function AttachmentUpload({ onUpload }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <ErrorBanner error={error} />
      <input ref={inputRef} type="file" onChange={handleFileChange} className="hidden" id="attachment-input" />
      <Button
        type="button"
        variant="secondary"
        isLoading={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        Upload file
      </Button>
      <p className="text-xs text-brand-400">Max {MAX_UPLOAD_MB} MB per file.</p>
    </div>
  );
}
