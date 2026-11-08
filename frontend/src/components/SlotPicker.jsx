import { useState, useEffect } from 'react';
import { courtsAPI } from '../api/client';
import { formatDate, formatTime } from '../utils/formatters';
import styles from './SlotPicker.module.css';

export default function SlotPicker({ courtId, onSlotSelect, loading }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  useEffect(() => {
    if (!courtId) return;
    setFetchingSlots(true);
    setSelectedSlot(null);
    courtsAPI.getSlots(courtId, date)
      .then(({ data }) => setSlots(data))
      .catch(console.error)
      .finally(() => setFetchingSlots(false));
  }, [courtId, date]);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot.id);
    onSlotSelect(slot);
  };

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className={styles.picker}>
      <div className={styles.dateSelect}>
        <label>Select Date:</label>
        <div className={styles.dateButtons}>
          {dateOptions.map((d) => (
            <button
              key={d}
              className={`${styles.dateBtn} ${date === d ? styles.active : ''}`}
              onClick={() => setDate(d)}
            >
              {formatDate(d)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.slotsSection}>
        <label>Select Time:</label>
        {fetchingSlots ? (
          <p className={styles.loading}>Loading slots...</p>
        ) : slots.length === 0 ? (
          <p className={styles.noSlots}>No slots available for this date</p>
        ) : (
          <div className={styles.slotsGrid}>
            {slots.map((slot) => (
              <button
                key={slot.id}
                className={`${styles.slot} ${!slot.is_available ? styles.unavailable : ''} ${selectedSlot === slot.id ? styles.selected : ''}`}
                onClick={() => handleSlotClick(slot)}
                disabled={!slot.is_available || loading}
              >
                {formatTime(slot.start_time)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
