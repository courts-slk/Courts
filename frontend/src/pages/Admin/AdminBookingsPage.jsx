import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import Pill from '../../components/Pill';
import styles from './AdminBookingsPage.module.css';

function statusColor(s) {
  if (s === 'confirmed') return 'green';
  if (s === 'pending') return 'yellow';
  if (s === 'cancelled') return 'red';
  if (s === 'completed') return 'gray';
  return 'gray';
}

const MOCK = [
  { id: 'BK-2847', customer_name: 'Ruwan De Silva', venue: 'Elite Futsal Arena', city: 'Colombo', date: 'Jun 6', duration_hours: 1, payment_method: 'COH', deposit: 500, status: 'pending' },
  { id: 'BK-2846', customer_name: 'Supun Nishantha', venue: 'Elite Futsal Arena', city: 'Colombo', date: 'Jun 7', duration_hours: 2, payment_method: 'Stripe', deposit: 500, status: 'confirmed' },
  { id: 'BK-2845', customer_name: 'Kavitha Perera', venue: 'Premier Pitch Kandy', city: 'Kandy', date: 'Jun 5', duration_hours: 1.5, payment_method: 'Stripe', deposit: 500, status: 'completed' },
  { id: 'BK-2840', customer_name: 'Ashan Kumara', venue: 'SportZone Maradana', city: 'Colombo', date: 'Jun 3', duration_hours: 1, payment_method: 'COH', deposit: 500, status: 'completed' },
  { id: 'BK-2835', customer_name: 'Nimal Raj', venue: 'GoalZone Nugegoda', city: 'Colombo', date: 'Jun 2', duration_hours: 1, payment_method: 'Stripe', deposit: 250, status: 'cancelled' },
];

const CITIES = ['All Cities', 'Colombo', 'Kandy', 'Today', 'This Week'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Cities');

  useEffect(() => {
    adminAPI.getBookings().then(r => setBookings(r.data.bookings || r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const data = bookings.length > 0 ? bookings : MOCK;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>All Bookings</h1>
        <p className={styles.subtitle}>Platform-wide booking history</p>
      </div>

      <div className={styles.filterRow}>
        {CITIES.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}>{f}</button>
        ))}
      </div>

      <div className={styles.card} style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Player</th><th>Venue</th><th>City</th><th>Date</th>
              <th>Duration</th><th>Method</th><th>Deposit</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(b => (
              <tr key={b.id}>
                <td className={styles.mono}>#{b.id}</td>
                <td className={styles.tdName}>{b.customer_name || 'Customer'}</td>
                <td>{b.venue || b.court_name || '—'}</td>
                <td>{b.city || '—'}</td>
                <td className={styles.mono}>{b.date}</td>
                <td>{b.duration_hours || 1} hr{b.duration_hours > 1 ? 's' : ''}</td>
                <td>{b.payment_method || 'Stripe'}</td>
                <td className={b.status === 'cancelled' ? styles.tdNeg : styles.tdPos}>{b.deposit || 500}</td>
                <td><Pill color={statusColor(b.status)}>{b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
