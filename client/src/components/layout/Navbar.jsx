import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-accent-gradient text-white shadow-sm shadow-violet-500/20' : 'text-brand-600 hover:bg-brand-100'
  }`;

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-brand-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <NavLink to="/projects" className="text-base font-semibold text-gradient">
            TeamFlow
          </NavLink>
          <nav className="flex gap-1">
            <NavLink to="/projects" className={navLinkClass}>
              Projects
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Settings
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="hidden text-sm text-brand-500 sm:inline">{user?.name}</span>
          <button type="button" onClick={handleLogout} className="btn-secondary">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
