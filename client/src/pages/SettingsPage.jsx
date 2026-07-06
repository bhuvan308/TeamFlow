import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { ErrorBanner } from '../components/common/Feedback';

export function SettingsPage() {
  const { user, updatePreferences } = useAuth();
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [emailOptOut, setEmailOptOut] = useState(String(Boolean(user?.email_opt_out)));
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await updatePreferences({ theme, emailOptOut: emailOptOut === 'true' });
      setSuccess(true);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Settings</h1>

      <div className="card mb-4">
        <h2 className="mb-1 text-sm font-medium text-brand-700">Account</h2>
        <p className="text-sm text-brand-500">{user?.name}</p>
        <p className="text-sm text-brand-400">{user?.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <ErrorBanner error={error} />
        {success && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Preferences saved.
          </p>
        )}
        <Select
          label="Theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
        <Select
          label="Email notifications"
          value={emailOptOut}
          onChange={(e) => setEmailOptOut(e.target.value)}
          options={[
            { value: 'false', label: 'Send me email notifications' },
            { value: 'true', label: "Don't email me" },
          ]}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Save changes
        </Button>
      </form>
    </div>
  );
}
