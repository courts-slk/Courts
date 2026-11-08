import StatCard from '../../components/StatCard';
import styles from './AdminRevenuePage.module.css';

const VENUES = [
  { name: 'Elite Futsal Arena', city: 'Colombo', bookings: 74, gross: 185000, refunds: 1000, net: 184000 },
  { name: 'SportZone Maradana', city: 'Colombo', bookings: 54, gross: 97200, refunds: 500, net: 96700 },
  { name: 'Premier Pitch Kandy', city: 'Kandy', bookings: 91, gross: 291200, refunds: 1600, net: 289600 },
  { name: 'GoalZone Nugegoda', city: 'Colombo', bookings: 48, gross: 96000, refunds: 650, net: 95350 },
];

export default function AdminRevenuePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Revenue Overview</h1>
        <p className={styles.subtitle}>Platform financial performance — June 2026</p>
      </div>
      <div className={styles.statsRow}>
        <StatCard label="Gross Revenue (MTD)" value="1.27M" change="↑ 22%" changeType="up" />
        <StatCard label="Total Deposits" value="243K" change="487 transactions" changeType="up" />
        <StatCard label="Refunds Issued" value="3,750" change="4 refunds" changeType="down" />
        <StatCard label="Net Revenue" value="1.26M" change="↑ 22%" changeType="up" />
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}><div className={styles.cardTitle}>Revenue Breakdown by Venue</div></div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Venue</th><th>City</th><th>Bookings</th><th>Gross</th><th>Refunds</th><th>Net</th>
            </tr>
          </thead>
          <tbody>
            {VENUES.map(v => (
              <tr key={v.name}>
                <td className={styles.tdName}>{v.name}</td>
                <td>{v.city}</td>
                <td className={styles.mono}>{v.bookings}</td>
                <td className={styles.tdPos}>{v.gross.toLocaleString()}</td>
                <td className={styles.tdNeg}>{v.refunds.toLocaleString()}</td>
                <td className={styles.tdPos}>{v.net.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
