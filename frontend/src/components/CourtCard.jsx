import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import styles from './CourtCard.module.css';

export default function CourtCard({ court, onClick }) {
  const imageUrl = court.images?.[0] || '/icons/logo-mark.png';

  return (
    <Link to={`/courts/${court.id}`} className={styles.card} onClick={onClick}>
      <div className={styles.image}>
        <img src={imageUrl} alt={court.name} onError={(e) => e.target.src = '/icons/logo-mark.png'} />
      </div>
      <div className={styles.content}>
        <h3>{court.name}</h3>
        <p className={styles.city}>{court.city}</p>
        <div className={styles.footer}>
          <span className={styles.price}>{formatCurrency(court.price_per_hour)}/hr</span>
          {court.surface_type && <span className={styles.surface}>{court.surface_type}</span>}
        </div>
      </div>
    </Link>
  );
}
