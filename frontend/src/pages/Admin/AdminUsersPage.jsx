import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import Pill from '../../components/Pill';
import styles from './AdminUsersPage.module.css';

const MOCK_USERS = [
  { id: '1', full_name: 'Ashan Kumara', phone: '+94 77 164 9831', created_at: 'Jan 2025', booking_count: 7, points: 350, status: 'active' },
  { id: '2', full_name: 'Ruwan De Silva', phone: '+94 71 234 5678', created_at: 'Mar 2025', booking_count: 12, points: 600, status: 'active' },
  { id: '3', full_name: 'Kavitha Perera', phone: '+94 76 987 6543', created_at: 'Feb 2025', booking_count: 5, points: 250, status: 'inactive' },
  { id: '4', full_name: 'Nimal Raj', phone: '+94 75 555 1234', created_at: 'Apr 2025', booking_count: 2, points: 100, status: 'suspended' },
];

function statusColor(s) {
  if (s === 'active') return 'green';
  if (s === 'inactive') return 'yellow';
  if (s === 'suspended') return 'red';
  return 'gray';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUsers().then(r => setUsers(r.data.users || r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const data = users.length > 0 ? users : MOCK_USERS;
  const initials = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>User Management</h1>
        <p className={styles.subtitle}>{data.length} registered players</p>
      </div>
      <div className={styles.card} style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th><th>Phone</th><th>Joined</th><th>Bookings</th><th>Points</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {data.map(u => (
              <tr key={u.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar} style={{ background: u.status === 'suspended' ? 'rgba(214,79,79,0.15)' : 'var(--g-800)', color: u.status === 'suspended' ? 'var(--danger)' : 'var(--b-100)' }}>{initials(u.full_name)}</div>
                    <span className={styles.tdName}>{u.full_name}</span>
                  </div>
                </td>
                <td className={styles.mono}>{u.phone || '—'}</td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}</td>
                <td className={styles.mono}>{u.booking_count || 0}</td>
                <td className={styles.mono} style={{ color: 'var(--warning)' }}>{u.points || 0} ★</td>
                <td><Pill color={statusColor(u.status || 'active')}>{(u.status || 'Active').charAt(0).toUpperCase() + (u.status || 'active').slice(1)}</Pill></td>
                <td>
                  {u.status === 'suspended'
                    ? <button className={styles.editBtn} style={{ color: 'var(--accent)' }}>Restore</button>
                    : <button className={styles.editBtn}>Edit</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
