import styles from './LoyaltyPage.module.css';

const HISTORY = [
  { court: 'Elite Futsal Arena', date: 'Jun 5', booking: '#BK-2845', pts: 50 },
  { court: 'SportZone Maradana', date: 'May 28', booking: '#BK-2838', pts: 50 },
  { court: 'Premier Pitch Kandy', date: 'May 20', booking: '#BK-2830', pts: 50 },
];

export default function LoyaltyPage() {
  const points = 350;
  const goal = 500;
  const pct = Math.round((points / goal) * 100);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  const StarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Loyalty Points</h1>
        <p className={styles.subtitle}>Earn 50 pts per booking. Every 500 pts = 1 free hour.</p>
      </div>

      <div className={styles.twoCol}>
        {/* Points ring */}
        <div className={styles.card} style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div className={styles.loyaltyRing}>
            <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="9"/>
              <circle cx="45" cy="45" r={r} fill="none" stroke="var(--b-300)" strokeWidth="9"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
            </svg>
            <div className={styles.ringText}>{pct}%</div>
          </div>
          <div className={styles.pointsBig}>{points}</div>
          <div className={styles.pointsSub}>of {goal} points</div>
          <div className={styles.pointsNote}>
            <strong style={{ color: 'var(--g-700)' }}>{goal - points} more points</strong> to earn a free 1-hour booking at any court
          </div>
          <div style={{ marginTop: 16 }}>
            <button className={styles.redeemBtn} disabled>Redeem Free Hour (locked)</button>
          </div>
        </div>

        {/* History */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Points History</div>
          </div>
          {HISTORY.map((h, i) => (
            <div key={i} className={styles.histItem}>
              <div className={styles.histIcon}><StarIcon /></div>
              <div>
                <div className={styles.histCourt}>{h.court}</div>
                <div className={styles.histDate}>{h.date} · {h.booking}</div>
              </div>
              <div className={styles.histPts}>+{h.pts}</div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 10 }}>
            +200 pts from 4 earlier bookings
          </div>
        </div>
      </div>
    </div>
  );
}
