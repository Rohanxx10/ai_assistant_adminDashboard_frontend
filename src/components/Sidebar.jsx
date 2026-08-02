import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: 'Overview', icon: '◧', end: true },
  { to: '/users', label: 'Users', icon: '◍' },
  { to: '/transactions', label: 'Transactions', icon: '⎘' },
  { to: '/coupons', label: 'Coupons', icon: '⌗' },
  { to: '/search-history', label: 'Search history', icon: '≋' },
  { to: '/notifications', label: 'Notifications', icon: '◔' },
  { to: '/app-info', label: 'App info', icon: '✎' },
  { to: '/pricing', label: 'Pricing', icon: '₹' },
  { to: '/ai-providers', label: 'AI providers', icon: '⚙' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('admin_username') || 'admin';

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="mark">L</span>
        Ledger Admin
      </div>

      <div className="nav-section-label">Monitor</div>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <span aria-hidden>{l.icon}</span>
          {l.label}
        </NavLink>
      ))}

      <div className="sidebar-footer">
        <div style={{ marginBottom: 8 }}>Signed in as <strong style={{ color: '#fff' }}>{username}</strong></div>
        <button className="btn sm" onClick={logout} style={{ width: '100%' }}>
          Log out
        </button>
      </div>
    </aside>
  );
}
