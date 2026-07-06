import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold text-brand-900">Page not found</h1>
      <p className="text-sm text-brand-500">The page you're looking for doesn't exist.</p>
      <Link to="/projects" className="mt-2 text-sm font-medium text-brand-900 hover:underline">
        Back to projects
      </Link>
    </div>
  );
}
