import { useState, useEffect } from 'react';
import { vendorAPI, courtsAPI } from '../../api/client';
import Pill from '../../components/Pill';
import styles from './VendorCourtsPage.module.css';

export default function VendorCourtsPage() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    vendorAPI.getCourts()
      .then(r => setCourts(r.data.courts || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (court) => {
    setSaving(court.id);
    try {
      await courtsAPI.update(court.id, court);
      alert(`${court.name} saved!`);
    } catch {
      alert('Could not save. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (id, field, value) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const MOCK = [
    { id: 'a', name: 'Elite Futsal Arena — Court A', surface_type: 'Artificial Turf', pitch_size: '40m × 20m', price_per_hour: 2500, sport_type: '5v5', is_available: true },
    { id: 'b', name: 'Elite Futsal Arena — Court B', surface_type: 'Wooden Floor', pitch_size: '50m × 25m', price_per_hour: 3200, sport_type: '7v7', is_available: true },
  ];

  const data = courts.length > 0 ? courts : MOCK;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>My Courts</h1>
        <p className={styles.subtitle}>Manage your court listings</p>
      </div>

      <div className={styles.topActions}>
        <button className={styles.btnPrimary} onClick={() => alert('Add court coming soon!')}>
          + Add New Court
        </button>
      </div>

      {loading && <div className={styles.empty}>Loading courts…</div>}

      <div className={styles.grid}>
        {data.map(court => (
          <div key={court.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>{court.sport_type || '5v5'} Court</div>
              <Pill color={court.is_available ? 'green' : 'red'}>
                {court.is_available ? 'Live' : 'Inactive'}
              </Pill>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel}>Court Name</label>
              <input
                className={styles.formInput}
                value={court.name || ''}
                onChange={e => handleChange(court.id, 'name', e.target.value)}
              />
            </div>

            <div className={styles.twoCol}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Surface</label>
                <input
                  className={styles.formInput}
                  value={court.surface_type || ''}
                  onChange={e => handleChange(court.id, 'surface_type', e.target.value)}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Pitch Size</label>
                <input
                  className={styles.formInput}
                  value={court.pitch_size || ''}
                  onChange={e => handleChange(court.id, 'pitch_size', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel}>Price per Hour (LKR)</label>
              <input
                className={styles.formInput}
                type="number"
                value={court.price_per_hour || ''}
                onChange={e => handleChange(court.id, 'price_per_hour', e.target.value)}
              />
            </div>

            <div className={styles.cardActions}>
              <button
                className={styles.btnPrimary}
                style={{ fontSize: 12, padding: '8px 14px' }}
                onClick={() => handleSave(court)}
                disabled={saving === court.id}
              >
                {saving === court.id ? 'Saving…' : 'Save'}
              </button>
              <button
                className={styles.btnDanger}
                onClick={() => {
                  handleChange(court.id, 'is_available', !court.is_available);
                  alert(court.is_available ? 'Court deactivated.' : 'Court activated.');
                }}
              >
                {court.is_available ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
