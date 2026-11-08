import StatCard from '../../components/StatCard';
import styles from './VendorAnalyticsPage.module.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_H = [40, 55, 45, 60, 75, 100, 70];
const HOURS = ['6am', '9am', '12pm', '3pm', '6pm', '8pm', '10pm'];
const HOUR_H = [15, 25, 40, 60, 100, 85, 30];

export default function VendorAnalyticsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Analytics</h1>
        <p className={styles.subtitle}>Performance for your courts</p>
      </div>

      <div className={styles.statsRow}>
        <StatCard label="Month Revenue" value="186K" change="↑ 18%" changeType="up" />
        <StatCard label="Total Bookings" value="74" change="↑ 12" changeType="up" />
        <StatCard label="Cancellations" value="4" change="↑ 2" changeType="down" />
        <StatCard label="Avg Rating" value="4.8★" change="↑ 0.2" changeType="up" />
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHeader}><div className={styles.cardTitle}>Bookings by Day</div></div>
          <div className={styles.barChart} style={{ height: 100 }}>
            {DAYS.map((d, i) => (
              <div key={d} className={styles.barWrap}>
                <div className={styles.bar} style={{ height: DAY_H[i], background: i >= 4 ? 'var(--b-300)' : 'var(--stat-bar)', opacity: i >= 4 ? 1 : 0.7 }} />
                <div className={styles.barLabel} style={{ color: i >= 4 ? 'var(--b-500)' : undefined }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}><div className={styles.cardTitle}>Peak Hours</div></div>
          <div className={styles.barChart} style={{ height: 100 }}>
            {HOURS.map((h, i) => (
              <div key={h} className={styles.barWrap}>
                <div className={styles.bar} style={{ height: HOUR_H[i], background: i >= 4 ? 'var(--b-300)' : 'var(--stat-bar)', opacity: i >= 4 ? 1 : 0.7 }} />
                <div className={styles.barLabel} style={{ color: i >= 4 ? 'var(--b-500)' : undefined }}>{h}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
