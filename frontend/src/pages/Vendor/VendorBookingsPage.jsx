import { useState, useEffect } from 'react';
import { vendorAPI } from '../../api/client';
import Pill from '../../components/Pill';
import styles from './VendorBookingsPage.module.css';

function statusColor(s) {
  if (s === 'confirmed') return 'green';
  if (s === 'pending') return 'yellow';
  if (s === 'cancelled') return 'red';
  return 'gray';
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorAPI.getBookings().then(r => setBookings(r.data.bookings || r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id) => {
    try {
      await vendorAPI.updateBookingStatus(id, { status: 'confirmed' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
    } catch {
      alert('Could not update.');
    }
  };

  const MOCK = [
    { id: 'BK-2847', customer_name: 'Ruwan De Silva', court_name: 'Court A', date: 'Jun 6', start_time: '19:00', duration_hours: 1, payment_method: 'COH', total_price: 2500, status: 'pending' },
    { id: 'BK-2846', customer_name: 'Supun Nishantha', court_name: 'Court B', date: 'Jun 7', start_time: '08:00', duration_hours: 2, payment_method: 'Stripe', total_price: 5000, status: 'pending' },
    { id: 'BK-2845', customer_name: 'Ashan Kumara', court_name: 'Court A', date: 'Jun 9', start_time: '11:00', duration_hours: 1, payment_method: 'Stripe', total_price: 2500, status: 'confirmed' },
    { id: 'BK-2840', customer_name: 'Nimal Raj', court_name: 'Court B', date: 'Jun 1', start_time: '10:00', duration_hours: 2, payment_method: 'COH', total_price: 5000, status: 'completed' },
  ];

  const data = bookings.length > 0 ? bookings : MOCK;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Bookings</h1>
        <p className={styles.subtitle}>All bookings for your courts</p>
      </div>

      <div className={styles.card} style={{ overflowX: 'auto' }}>
        {loading && <div className={styles.empty}>Loading…</div>}
        {!loading && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th><th>Player</th><th>Court</th><th>Date &amp; Time</th>
                <th>Duration</th><th>Method</th><th>Amount</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.map(b => (
                <tr key={b.id}>
                  <td className={styles.mono}>#{b.id}</td>
                  <td className={styles.tdName}>{b.customer_name || 'Customer'}</td>
                  <td>{b.court_name || b.court?.name || '—'}</td>
                  <td className={styles.mono}>{b.date} · {b.start_time}</td>
                  <td>{b.duration_hours || 1} hr{b.duration_hours > 1 ? 's' : ''}</td>
                  <td>{b.payment_method || 'Stripe'}</td>
                  <td className={styles.tdPos}>{Number(b.total_price || 0).toLocaleString()}</td>
                  <td><Pill color={statusColor(b.status)}>{b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}</Pill></td>
                  <td>
                    {b.status === 'pending' && (
                      <button className={styles.acceptBtn} onClick={() => handleAccept(b.id)}>Accept</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
