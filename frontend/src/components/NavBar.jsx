import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';
import styles from './NavBar.module.css';

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

export default function NavBar() {
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(getUser());
  }, [location]);

  if (!user) return null;

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/',         label: 'Home',     icon: '⚽' },
    { path: '/bookings', label: 'Bookings', icon: '📋' },
    ...(user.role === 'vendor' ? [{ path: '/vendor',  label: 'Vendor', icon: '🏟️' }] : []),
    ...(user.role === 'admin'  ? [{ path: '/admin',   label: 'Admin',  icon: '⚙️' }] : []),
    { path: '/profile',  label: 'Profile',  icon: '👤' },
  ];

  return (
    <>
      {/* Top nav bar (desktop) */}
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            Courts
            {DEMO && <span className={styles.demoBadge}>DEMO</span>}
          </Link>
          <div className={styles.links}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={isActive(item.path) ? styles.active : ''}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Bottom tab bar (mobile only) */}
      <nav className={styles.bottomBar}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.tabItem} ${isActive(item.path) ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon}>{item.icon}</span>
            <span className={styles.tabLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
