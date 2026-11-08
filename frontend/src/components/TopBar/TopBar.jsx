import { useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './TopBar.module.css';

const PAGE_TITLES = {
  '/':                  'Browse Courts',
  '/bookings/new':      'Book a Slot',
  '/bookings':          'My Bookings',
  '/loyalty':           'Loyalty Points',
  '/profile':           'Profile',
  '/vendor':            'Dashboard',
  '/vendor/bookings':   'Bookings',
  '/vendor/slots':      'Availability Calendar',
  '/vendor/courts':     'My Courts',
  '/vendor/analytics':  'Analytics',
  '/admin':             'Platform Overview',
  '/admin/bookings':    'All Bookings',
  '/admin/users':       'User Management',
  '/admin/venues':      'Venue Management',
  '/admin/revenue':     'Revenue Overview',
};

function getTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/book/')) return 'Book a Slot';
  if (pathname.startsWith('/courts/')) return 'Court Details';
  if (pathname.startsWith('/bookings/')) return 'Booking Details';
  return 'Courts';
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function TopBar() {
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const title = getTitle(location.pathname);

  return (
    <div className={styles.topBar}>
      <span className={styles.title}>{title}</span>

      <div className={styles.right}>
        {/* Search */}
        <div className={styles.search}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search courts, locations…" className={styles.searchInput} />
        </div>

        {/* Theme toggle */}
        <button
          className={styles.themeToggle}
          onClick={toggle}
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          <span className={styles.themeIcon}>{theme === 'light' ? '☀️' : '🌙'}</span>
          <div className={`${styles.knob} ${theme === 'dark' ? styles.knobDark : ''}`}>
            {theme === 'light' ? <SunIcon /> : <MoonIcon />}
          </div>
        </button>

        {/* Notifications */}
        <button className={styles.notifBtn} aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className={styles.notifDot} />
        </button>
      </div>
    </div>
  );
}
