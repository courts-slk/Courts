import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courtsAPI } from '../../api/client';
import styles from './BrowsePage.module.css';

export default function BrowsePage() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    courtsAPI.list().then(r => setCourts(r.data.courts || r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const FILTERS = ['All', 'Colombo', 'Kandy', 'Futsal 5v5', 'Futsal 7v7', 'Available Now'];

  const PitchSVG = () => (
    <svg className={styles.pitch} width="110" height="74" viewBox="0 0 110 74">
      <rect x="4" y="4" width="102" height="66" rx="2" fill="none" stroke="#e8e0c4" strokeWidth="1.5"/>
      <line x1="55" y1="4" x2="55" y2="70" stroke="#e8e0c4" strokeWidth="1"/>
      <circle cx="55" cy="37" r="11" fill="none" stroke="#e8e0c4" strokeWidth="1"/>
      <rect x="4" y="21" width="16" height="32" rx="1" fill="none" stroke="#e8e0c4" strokeWidth="1"/>
      <rect x="90" y="21" width="16" height="32" rx="1" fill="none" stroke="#e8e0c4" strokeWidth="1"/>
      <circle cx="55" cy="37" r="2" fill="#e8e0c4"/>
    </svg>
  );

  const IMG_GRADIENTS = [
    'linear-gradient(135deg, #1a3d22 0%, #0d2211 100%)',
    'linear-gradient(135deg, #1a2a3a 0%, #0e1e2e 100%)',
    'linear-gradient(135deg, #2a1a0f 0%, #1a0e05 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #0e0e1e 100%)',
    'linear-gradient(135deg, #0f2a1a 0%, #081a10 100%)',
    'linear-gradient(135deg, #2a0f1a 0%, #1a0810 100%)',
  ];

  const getAvailBadge = (court) => {
    if (!court.is_available) return { cls: styles.badgeClosed, text: 'Closed' };
    const slots = court.available_slots || 0;
    if (slots > 3) return { cls: styles.badgeOpen, text: 'Open' };
    if (slots > 0) return { cls: styles.badgeBusy, text: 'Busy' };
    return { cls: styles.badgeClosed, text: 'Full' };
  };

  const getTags = (court) => {
    const tags = [];
    if (court.sport_type) tags.push(court.sport_type);
    if (court.surface_type) tags.push(court.surface_type);
    if (court.features) tags.push(...court.features.slice(0, 2));
    return tags.slice(0, 4);
  };

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loading}>Loading courts…</div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Find Your Court</h1>
        <p className={styles.subtitle}>{courts.length} courts available across Sri Lanka</p>
      </div>

      <div className={styles.filterRow}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}>{f}</button>
        ))}
      </div>

      <div className={styles.grid}>
        {courts.map((court, i) => {
          const badge = getAvailBadge(court);
          const tags = getTags(court);
          const grad = IMG_GRADIENTS[i % IMG_GRADIENTS.length];
          const stars = court.avg_rating || 4.5;
          const starStr = '★'.repeat(Math.floor(stars)) + (stars % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(stars));
          return (
            <div key={court.id} className={styles.courtCard} onClick={() => navigate(`/book/${court.id}`)}>
              <div className={styles.courtImg} style={{ background: grad }}>
                <PitchSVG />
                <div className={styles.priceBadge}>LKR {Number(court.price_per_hour || 2500).toLocaleString()}/hr</div>
                <div className={`${styles.availBadge} ${badge.cls}`}>{badge.text}</div>
              </div>
              <div className={styles.courtInfo}>
                <div className={styles.courtName}>{court.name}</div>
                <div className={styles.courtLoc}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {court.location || court.address || 'Colombo'}
                </div>
                {tags.length > 0 && (
                  <div className={styles.tags}>
                    {tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                )}
                <div className={styles.courtMeta}>
                  <div className={styles.stars}>
                    {starStr.replace('½', '')}
                    <span className={styles.reviewCount}>({court.review_count || 0})</span>
                  </div>
                  <div className={styles.priceText}>
                    {Number(court.price_per_hour || 2500).toLocaleString()}/hr
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {courts.length === 0 && (
          <div className={styles.empty} style={{ gridColumn: '1/-1' }}>
            No courts found. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
