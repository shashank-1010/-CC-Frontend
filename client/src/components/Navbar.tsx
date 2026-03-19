import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/notes', label: 'Notes' },
    { to: '/rides', label: 'Rides' },
    { to: '/studygroups', label: 'Study Groups' },
    { to: '/activities', label: 'Activities' },
    { to: '/polls', label: 'Polls' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">Campus Connect</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(l.to) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-purple-50 text-purple-700' : 'text-purple-600 hover:bg-purple-50'}`}>
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  {user.name}
                </Link>
                <button onClick={logout} className="btn-secondary text-sm py-1.5">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-1.5">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-md text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              {l.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm text-purple-700 hover:bg-purple-50">Admin</Link>
          )}
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600">Logout</button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1 text-center text-sm">Login</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
