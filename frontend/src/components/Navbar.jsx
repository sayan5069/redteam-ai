import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>, label: 'Dashboard' },
    { to: '/history', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, label: 'History' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar fixed left-0 top-0 h-full w-60 bg-bg-surface backdrop-blur-xl border-r border-border flex-col z-40">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-red/20 flex items-center justify-center border border-accent-red/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-red">
                <path d="M12 2l4.5 4-1.5 12h-6L7.5 6z" />
                <path d="M12 22V10" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary tracking-wide">
                REDTEAM <span className="text-accent-red">AI</span>
              </h1>
              <p className="text-[10px] text-text-muted tracking-widest uppercase">
                Adversarial Testing
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-black/40 shadow-inner flex items-center justify-center border border-border">
              <span className="text-xs text-text-muted">
                {user?.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-primary truncate">{user?.email}</p>
              <p className="text-[10px] text-text-muted">Researcher</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-text-muted hover:text-accent-red transition-colors py-2 border border-border rounded-lg hover:border-accent-red/30"
          >
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-bg-surface backdrop-blur-xl border-t border-border z-40 px-4 py-2 justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'text-accent-red'
                  : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs text-text-muted hover:text-accent-red transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
}
