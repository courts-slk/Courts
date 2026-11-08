import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courtsAPI } from '../../api/client';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './CourtDetail.module.css';

export default function CourtDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    courtsAPI.get(id)
      .then(({ data }) => setCourt(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!court) return <div style={{ textAlign: 'center', padding: '2rem' }}>Court not found</div>;

  const images = court.images || [];
  const currentImage = images[imageIndex] || '/icons/logo-mark.png';

  const nextImage = () => setImageIndex((i) => (i + 1) % (images.length || 1));
  const prevImage = () => setImageIndex((i) => (i - 1 + (images.length || 1)) % (images.length || 1));

  return (
    <div className={styles.page}>
      {/* Image carousel */}
      <div className={styles.imageContainer}>
        <img src={currentImage} alt={court.name} onError={(e) => e.target.src = '/icons/logo-mark.png'} />
        {images.length > 1 && (
          <>
            <button className={styles.prevBtn} onClick={prevImage}>‹</button>
            <button className={styles.nextBtn} onClick={nextImage}>›</button>
            <div className={styles.imageIndicators}>
              {images.map((_, i) => (
                <div key={i} className={`${styles.dot} ${i === imageIndex ? styles.active : ''}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.content}>
        <h1>{court.name}</h1>
        {court.description && <p className={styles.description}>{court.description}</p>}

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.label}>Location</span>
            <p>{court.address}</p>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.label}>Price</span>
            <p className={styles.price}>{formatCurrency(court.price_per_hour)} per hour</p>
          </div>

          {court.surface_type && (
            <div className={styles.detailItem}>
              <span className={styles.label}>Surface</span>
              <p>{court.surface_type}</p>
            </div>
          )}

          {court.pitch_size && (
            <div className={styles.detailItem}>
              <span className={styles.label}>Size</span>
              <p>{court.pitch_size}</p>
            </div>
          )}

          {court.vendor_name && (
            <div className={styles.detailItem}>
              <span className={styles.label}>Operator</span>
              <p>{court.vendor_name}</p>
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={() => navigate(`/book/${court.id}`)} style={{ width: '100%', marginTop: 'var(--space-6)' }}>
          Book Now
        </button>
      </div>
    </div>
  );
}
