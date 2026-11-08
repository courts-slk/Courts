import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courtsAPI, bookingsAPI } from '../../api/client';
import { formatCurrency, formatSlotTime } from '../../utils/formatters';
import SlotPicker from '../../components/SlotPicker';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './Booking.module.css';

export default function BookingPage() {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    courtsAPI.get(courtId)
      .then(({ data }) => setCourt(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courtId]);

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const { data } = await bookingsAPI.create({
        court_id: courtId,
        slot_id: selectedSlot.id,
        total_amount: court.price_per_hour,
        notes: '',
      });

      navigate(`/booking-confirmed/${data.id}`, { state: { booking: data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!court) return <div style={{ textAlign: 'center', padding: '2rem' }}>Court not found</div>;

  return (
    <div className={styles.page}>
      <h1>Book {court.name}</h1>

      <div className={styles.container}>
        <div className={styles.picker}>
          <SlotPicker courtId={courtId} onSlotSelect={setSelectedSlot} loading={booking} />
        </div>

        <div className={styles.summary}>
          <h2>Booking Summary</h2>

          <div className={styles.summaryItem}>
            <span>Court</span>
            <span>{court.name}</span>
          </div>

          {selectedSlot && (
            <div className={styles.summaryItem}>
              <span>Date & Time</span>
              <span>{formatSlotTime(selectedSlot.date, selectedSlot.start_time, selectedSlot.end_time)}</span>
            </div>
          )}

          <div className={styles.summaryItem}>
            <span>Price per Hour</span>
            <span>{formatCurrency(court.price_per_hour)}</span>
          </div>

          <div className={`${styles.summaryItem} ${styles.highlight}`}>
            <span>Total Amount</span>
            <span>{formatCurrency(court.price_per_hour)}</span>
          </div>

          <div className={styles.deposit}>
            <p><strong>Deposit Required:</strong> {formatCurrency(500)}</p>
            <p className={styles.depositNote}>Cash at location upon arrival</p>
          </div>

          <div className={styles.cancellation}>
            <p><strong>Cancellation Policy:</strong></p>
            <ul>
              <li>More than 24 hours before: Full refund</li>
              <li>0–24 hours before: 50% refund</li>
              <li>No show: No refund</li>
            </ul>
          </div>

          {error && <div className="error">{error}</div>}

          <button
            className="btn btn-primary"
            onClick={handleBooking}
            disabled={!selectedSlot || booking}
            style={{ width: '100%' }}
          >
            {booking ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
