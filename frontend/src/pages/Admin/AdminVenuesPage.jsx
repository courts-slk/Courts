import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import Pill from '../../components/Pill';
import styles from './AdminVenuesPage.module.css';

const MOCK_VENUES = [
  { id: '1', name: 'Elite Futsal Arena', city: 'Colombo 7', courts: 2, price_range: '2,500–3,200', monthly_revenue: 186000, status: 'active' },
  { id: '2', name: 'SportZone Maradana', city: 'Maradana, Colombo', courts: 1, price_range: '1,800', monthly_revenue: 98000, status: 'active' },
  { id: '3', name: 'GreenField Courts', city: 'Gampaha', courts: 2, price_range: '2,000', monthly_revenue: null, status: 'pending' },
];

function statusColor(s) {
  if (s === 'active') return 'green';
  if (s === 'pending') return 'yellow';
  if (s === 'suspended') return 'red';
  return 'gray';
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getCourts().then(r => setVenues(r.data.courts || r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const data = venues.length > 0 ? venues : MOCK_VENUES;

  const handleApprove = (id) => {
    setVenues(prev => prev.map(v => v.id === id ? { ...v, status: 'active' } : v));
    alert('Venue approved!');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Venue Management</h1>
        <p className={styles.subtitle}>{data.filter(v => v.status === 'active').length} active venues</p>
      </div>
      <div className={styles.grid}>
        {data.map(v => (
          <div key={v.id} className={`${styles.card} ${v.status === 'pending' ? styles.cardPending : ''}`}>
            <div className={styles.cardTop}>
              <div>
                <div className={styles.venueName}>{v.name}</div>
                <div className={styles.venueCity}>{v.city}</div>
              </div>
              <Pill color={statusColor(v.status)}>{v.status?.charAt(0).toUpperCase() + v.status?.slice(1)}</Pill>
            </div>
            <div className={styles.venueMeta}>{v.courts} court{v.courts > 1 ? 's' : ''} · LKR {v.price_range}/hr</div>
            {v.monthly_revenue && (
              <div className={styles.venueRev}>LKR {Number(v.monthly_revenue).toLocaleString()}/month</div>
            )}
            {v.status === 'pending' && (
              <div className={styles.venueActions}>
                <button className={styles.approveBtn} onClick={() => handleApprove(v.id)}>Approve</button>
                <button className={styles.rejectBtn}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
