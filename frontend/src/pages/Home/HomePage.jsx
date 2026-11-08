import { useState, useEffect } from 'react';
import { courtsAPI } from '../../api/client';
import CourtCard from '../../components/CourtCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './Home.module.css';

export default function HomePage() {
  const [city, setCity] = useState('colombo');
  const [search, setSearch] = useState('');
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    courtsAPI.list({ city, search })
      .then(({ data }) => setCourts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city, search]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Find Your Court</h1>
        <p>Book your perfect futsal slot</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.cityTabs}>
          {['colombo', 'kandy'].map(c => (
            <button
              key={c}
              className={`${styles.tab} ${city === c ? styles.active : ''}`}
              onClick={() => { setCity(c); setSearch(''); }}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search courts by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : courts.length === 0 ? (
        <div className={styles.empty}>
          <p>No courts found. Try searching for something else.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {courts.map(court => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      )}
    </div>
  );
}
