import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import styles from './AdminDashboard.module.css';

const CITIES = ['Colombo', 'Kandy'];
const CITY_H = [100, 55];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).catch(console.error);
  }, []);

  const MOCK_PENDING = [
    { id: '1', name: 'GreenField Courts', city: 'Gampaha', courts: 2 },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Platform Overview</h1>
        <p className={styles.subtitle}>Courts — Admin Dashboard</p>
      </div>

      <div className={styles.statsRow}>
        <StatCard label="Revenue (MTD)" value={stats?.total_revenue ? `${Math.round(stats.total_revenue / 1000)}K` : '1.27M'} change="↑ 22%" changeType="up" />
        <StatCard label="Total Bookings" value={stats?.total_bookings || 487} change="↑ 64 this week" changeType="up" />
        <StatCard label="Active Users" value={stats?.total_users || '1,840'} change="↑ 120 new" changeType="up" />
        <StatCard label="Venues Onboarded" value={stats?.total_courts || 23} change="↑ 3 new" changeType="up" />
      </div>

      <div className={styles.twoThirds}>
        <div className={styles.card}>
          <div className={styles.cardHeader}><div className={styles.cardTitle}>Revenue by City — June 2026</div></div>
          <div className={styles.barChart} style={{ height: 100 }}>
            {CITIES.map((c, i) => (
              <div key={c} className={styles.barWrap}>
                <div className={styles.bar} style={{ height: CITY_H[i], background: i === 0 ? 'var(--b-300)' : 'var(--stat-bar)', opacity: i === 0 ? 1 : 0.7 }} />
                <div className={styles.barLabel}>{c}</div>
              </div>
            ))}
          </div>
          <div className={styles.cityRow}>
            <div>
              <div className={styles.cityName}>Colombo</div>
              <div className={styles.cityRev}>LKR 820,000</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.cityName}>Kandy</div>
              <div className={styles.cityRevMuted}>LKR 450,000</div>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.card}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Live Activity</div></div>
            <div className={styles.liveNum}>12</div>
            <div className={styles.liveSub}>courts in use right now</div>
            <div className={styles.liveDetail}>3 bookings in last 30 min</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Pending Venues</div></div>
            {MOCK_PENDING.map(v => (
              <div key={v.id} className={styles.pendingItem}>
                <div className={styles.pendingAvatar}>{v.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                <div className={styles.pendingInfo}>
                  <div className={styles.pendingName}>{v.name}</div>
                  <div className={styles.pendingDetail}>{v.city} · {v.courts} courts</div>
                </div>
                <button className={styles.approveBtn} onClick={() => alert('Venue approved!')}>Approve</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
