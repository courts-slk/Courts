import styles from './StatCard.module.css';

export default function StatCard({ label, value, change, changeType = 'up' }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {change && (
        <div className={`${styles.change} ${changeType === 'up' ? styles.up : changeType === 'down' ? styles.down : styles.warn}`}>
          {change}
        </div>
      )}
    </div>
  );
}
