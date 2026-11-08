import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth';
import styles from './Sidebar.module.css';

// ── SVG icons ───────────────────────────────────────
const icons = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  dollar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const LogoBadge = () => (
  <svg viewBox="0 0 32 32" fill="none" width="18" height="18">
    <circle cx="16" cy="16" r="14" fill="#1a3d22" stroke="#d4c99a" strokeWidth="1.5"/>
    <circle cx="16" cy="16" r="10" fill="#1a3d22" stroke="#d4c99a" strokeWidth="0.8"/>
    <line x1="8" y1="12" x2="24" y2="12" stroke="#d4c99a" strokeWidth="0.4" opacity="0.5"/>
    <line x1="8" y1="16" x2="24" y2="16" stroke="#d4c99a" strokeWidth="0.4" opacity="0.5"/>
    <line x1="8" y1="20" x2="24" y2="20" stroke="#d4c99a" strokeWidth="0.4" opacity="0.5"/>
    <line x1="12" y1="8" x2="12" y2="24" stroke="#d4c99a" strokeWidth="0.4" opacity="0.5"/>
    <line x1="16" y1="8" x2="16" y2="24" stroke="#d4c99a" strokeWidth="0.4" opacity="0.5"/>
    <line x1="20" y1="8" x2="20" y2="24" stroke="#d4c99a" strokeWidth="0.4" opacity="0.5"/>
    <circle cx="5" cy="16" r="1.5" fill="#d4c99a"/>
    <circle cx="27" cy="16" r="1.5" fill="#d4c99a"/>
  </svg>
);

function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.active : ''}`
      }
    >
      <span className={styles.navIcon}>{icon}</span>
      <span className={styles.navLabel}>{label}</span>
      {badge != null && <span className={styles.navBadge}>{badge}</span>}
    </NavLink>
  );
}

export default function Sidebar() {
  const user = getUser();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() || '??';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoWrap}>
        <div className={styles.logoBadge}><LogoBadge /></div>
        <div className={styles.logoText}>
          <div className={styles.wordmark}>COURTS</div>
          <div className={styles.tagline}>Book Smarter, Play Harder</div>
        </div>
      </div>

      {/* Navigation sections */}
      <div className={styles.navBody}>
        {user.role === 'customer' && (
          <>
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Discover</div>
              <NavItem to="/" icon={icons.search} label="Browse Courts" />
              <NavItem to="/bookings/new" icon={icons.calendar} label="Book a Slot" />
            </div>
            <div className={styles.section}>
              <div className={styles.sectionLabel}>My Account</div>
              <NavItem to="/bookings" icon={icons.file} label="My Bookings" />
              <NavItem to="/loyalty" icon={icons.star} label="Loyalty Points" />
              <NavItem to="/profile" icon={icons.user} label="Profile" />
            </div>
          </>
        )}

        {user.role === 'vendor' && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Operations</div>
            <NavItem to="/vendor" icon={icons.grid} label="Dashboard" />
            <NavItem to="/vendor/bookings" icon={icons.calendar} label="Bookings" />
            <NavItem to="/vendor/slots" icon={icons.clock} label="Availability" />
            <NavItem to="/vendor/courts" icon={icons.home} label="My Courts" />
            <NavItem to="/vendor/analytics" icon={icons.chart} label="Analytics" />
          </div>
        )}

        {user.role === 'admin' && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Platform</div>
            <NavItem to="/admin" icon={icons.grid} label="Overview" />
            <NavItem to="/admin/bookings" icon={icons.calendar} label="All Bookings" />
            <NavItem to="/admin/users" icon={icons.users} label="Users" />
            <NavItem to="/admin/venues" icon={icons.home} label="Venues" />
            <NavItem to="/admin/revenue" icon={icons.dollar} label="Revenue" />
          </div>
        )}
      </div>

      {/* User info + logout */}
      <div className={styles.navBottom}>
        <div className={styles.navUser}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.full_name || user.email}</div>
            <div className={styles.userRole}>{user.role === 'admin' ? 'Platform Admin' : user.role === 'vendor' ? 'Venue Owner' : 'Player'}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
            {icons.logout}
          </button>
        </div>
      </div>
    </nav>
  );
}
