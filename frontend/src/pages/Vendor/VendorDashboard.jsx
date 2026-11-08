import { useState, useEffect } from 'react';
import { vendorAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import Pill from '../../components/Pill';
import styles from './VendorDashboard.module.css';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'Sa', 'Su'];
const BAR_HEIGHTS = [45, 60, 35, 70, 55, 80, 65];

export default function VendorDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorAPI.getBookings().then(r => setBookings(r.data.bookings || r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending = bookings.filter(b => b.status === 'pending');
  const todayBookings = bookings.filter(b => b.date === new Date().toISOString().slice(0, 10));

  const handleAction = async (id, action) => {
    try {
      await vendorAPI.updateBookingStatus(id, { status: action === 'accept' ? 'confirmed' : 'cancelled' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: action === 'accept' ? 'confirmed' : 'cancelled' } : b));
    } catch {
      alert('Could not update booking. Please try again.');
    }
  };

  const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  const MOCK_PENDING = [
    { id: '1', customer_name: 'Ruwan De Silva', date: 'Today', start_time: '19:00', end_time: '20:00', payment_method: 'COH', total_price: 2500 },
    { id: '2', customer_name: 'Supun Nishantha', date: 'Tomorrow', start_time: '08:00', end_time: '10:00', payment_method: 'Stripe', total_price: 5000 },
    { id: '3', customer_name: 'Kavitha Perera', date: 'Jun 10', start_time: '14:00', end_time: '15:30', payment_method: 'Stripe', total_price: 3750 },
  ];

  const displayPending = pending.length > 0 ? pending : MOCK_PENDING;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Vendor Dashboard</h1>
        <p className={styles.subtitle}>Manage your courts &amp; bookings</p>
      </div>

      <div className={styles.statsRow}>
        <StatCard label="Today's Bookings" value={todayBookings.length || 8} change="↑ 2 from yesterday" changeType="up" />
        <StatCard label="Today's Revenue" value="20K" change="↑ LKR 5,000" changeType="up" />
        <StatCard label="Pending Approvals" value={pending.length || 5} change="⚠ Action needed" changeType="warn" />
        <StatCard label="Month Revenue" value="186K" change="↑ 18%" changeType="up" />
      </div>

      <div className={styles.twoThirds}>
        {/* Pending requests */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Pending Requests</div>
            <button className={styles.cardAction}>View all</button>
          </div>

          {loading && <div className={styles.empty}>Loading…</div>}
          {!loading && displayPending.length === 0 && (
            <div className={styles.empty}>No pending requests</div>
          )}

          {!loading && displayPending.map(b => (
            <div key={b.id} className={styles.reqItem}>
              <div className={styles.reqAvatar}>{initials(b.customer_name || 'User')}</div>
              <div className={styles.reqInfo}>
                <div className={styles.reqName}>{b.customer_name || 'Customer'}</div>
                <div className={styles.reqDetail}>{b.date || '—'} · {b.start_time}–{b.end_time} · {b.payment_method || 'Stripe'} · LKR {Number(b.total_price || 0).toLocaleString()}</div>
              </div>
              <div className={styles.reqActions}>
                <button className={styles.acceptBtn} onClick={() => handleAction(b.id, 'accept')}>Accept</button>
                <button className={styles.rejectBtn} onClick={() => handleAction(b.id, 'reject')}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          {/* Weekly revenue chart */}
          <div className={styles.card}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Weekly Revenue</div></div>
            <div className={styles.barChart}>
              {DAYS.map((d, i) => (
                <div key={`${d}-${i}`} className={styles.barWrap}>
                  <div className={styles.bar} style={{ height: BAR_HEIGHTS[i], background: i === 5 ? 'var(--b-300)' : 'var(--stat-bar)', opacity: i === 5 ? 1 : 0.7 }} />
                  <div className={styles.barLabel} style={{ color: i === 5 ? 'var(--b-500)' : undefined }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Court status */}
          <div className={styles.card}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Court Status</div></div>
            <div className={styles.courtStatusRow}>
              <span>Court A (5v5)</span>
              <Pill color="red">In Use</Pill>
            </div>
            <div className={styles.courtStatusRow} style={{ borderBottom: 'none' }}>
              <span>Court B (7v7)</span>
              <Pill color="green">Available</Pill>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
