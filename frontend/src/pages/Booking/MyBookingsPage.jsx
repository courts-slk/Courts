import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../api/client';
import Pill from '../../components/Pill';
import styles from './MyBookingsPage.module.css';

function statusColor(status) {
  if (status === 'confirmed') return 'green';
  if (status === 'pending') return 'blue';
  if (status === 'cancelled') return 'red';
  if (status === 'completed') return 'gray';
  return 'gray';
}

const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    bookingsAPI.list().then(r => setBookings(r.data.bookings || r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancel(id, { reason: 'User cancelled' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (e) {
      alert('Could not cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  const FILTERS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

  const filtered = bookings.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Upcoming') return ['confirmed', 'pending'].includes(b.status);
    if (filter === 'Completed') return b.status === 'completed';
    if (filter === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const formatDateTime = (b) => {
    const date = b.date ? new Date(b.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
    const time = b.start_time && b.end_time ? `${b.start_time}–${b.end_time}` : '';
    const price = b.total_price ? ` · LKR ${Number(b.total_price).toLocaleString()}` : '';
    return [date, time, price].filter(Boolean).join(' · ');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>My Bookings</h1>
        <p className={styles.subtitle}>Upcoming &amp; past reservations</p>
      </div>

      <div className={styles.filterRow}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}>{f}</button>
        ))}
      </div>

      {loading && <div className={styles.empty}>Loading bookings…</div>}

      {!loading && (
        <div className={styles.card}>
          {filtered.length === 0 && (
            <div className={styles.empty}>No bookings found.</div>
          )}
          {filtered.map(b => (
            <div key={b.id} className={styles.item}>
              <div className={styles.itemIcon} style={{ opacity: b.status === 'cancelled' || b.status === 'completed' ? 0.5 : 1 }}>
                <CalIcon />
              </div>
              <div className={styles.itemBody}>
                <div className={styles.courtName} style={{ color: ['cancelled', 'completed'].includes(b.status) ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {b.court_name || b.court?.name || 'Court'}
                </div>
                <div className={styles.itemTime}>{formatDateTime(b)}</div>
              </div>
              <div className={styles.itemActions}>
                <Pill color={statusColor(b.status)}>
                  {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                </Pill>
                {(b.status === 'confirmed' || b.status === 'pending') && (
                  <button
                    className={styles.cancelBtn}
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                  >
                    {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
                {b.status === 'completed' && (
                  <button className={styles.rateBtn} onClick={() => alert('Rating submitted. Thanks!')}>Rate ★</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
