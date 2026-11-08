import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../api/client';
import { formatCurrency, formatSlotTime, hoursUntil, getRefundAmount } from '../../utils/formatters';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './Booking.module.css';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    bookingsAPI.get(id)
      .then(({ data }) => setBooking(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingsAPI.cancel(id, { cancellation_reason: cancelReason });
      setShowCancelModal(false);
      // Refresh booking
      const { data } = await bookingsAPI.get(id);
      setBooking(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!booking) return <div style={{ textAlign: 'center', padding: '2rem' }}>Booking not found</div>;

  const hours = hoursUntil(booking.date, booking.start_time);
  const canCancel = booking.status === 'confirmed' && hours && hours > 0;
  const refundAmount = getRefundAmount(booking.date, booking.start_time);

  return (
    <div className={styles.page}>
      <div className={styles.container} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.summary}>
          <h1>Booking Details</h1>

          <div className={styles.summaryItem}>
            <span>Reference</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
              {booking.booking_reference}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span>Court</span>
            <span>{booking.court_name}</span>
          </div>

          <div className={styles.summaryItem}>
            <span>Date & Time</span>
            <span>{formatSlotTime(booking.date, booking.start_time, booking.end_time)}</span>
          </div>

          <div className={styles.summaryItem}>
            <span>Status</span>
            <span>
              <span className={`badge ${booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'default'}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span>Total Amount</span>
            <span className={styles.highlight}>{formatCurrency(booking.total_amount)}</span>
          </div>

          <div className={styles.summaryItem}>
            <span>Deposit</span>
            <span>{formatCurrency(booking.deposit_amount)}</span>
          </div>

          {booking.status === 'cancelled' && (
            <>
              <div className={styles.summaryItem}>
                <span>Cancellation Reason</span>
                <span>{booking.cancellation_reason || 'N/A'}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Refund Amount</span>
                <span className={styles.highlight}>{formatCurrency(refundAmount)}</span>
              </div>
            </>
          )}

          {booking.status === 'confirmed' && hours !== null && (
            <div style={{ background: 'var(--success-light)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-4)' }}>
              <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 600 }}>
                {hours >= 24 ? '✓ Full refund available' : hours > 0 ? `⚠ 50% refund available (${Math.floor(hours)} hours left)` : '✗ No refund available'}
              </p>
            </div>
          )}

          {canCancel && (
            <button
              className="btn btn-danger"
              onClick={() => setShowCancelModal(true)}
              style={{ width: '100%', marginTop: 'var(--space-6)' }}
            >
              Cancel Booking
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => navigate('/bookings')}
            style={{ width: '100%', marginTop: 'var(--space-3)' }}
          >
            Back to Bookings
          </button>
        </div>
      </div>

      <Modal isOpen={showCancelModal} title="Cancel Booking" onClose={() => setShowCancelModal(false)}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <p>Are you sure you want to cancel this booking?</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            You will receive a refund of {formatCurrency(refundAmount)} based on the cancellation policy.
          </p>
          <textarea
            placeholder="Cancellation reason (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            style={{ width: '100%', minHeight: '80px', marginTop: 'var(--space-4)' }}
            disabled={cancelling}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)} disabled={cancelling} style={{ flex: 1 }}>
            Keep Booking
          </button>
          <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling} style={{ flex: 1 }}>
            {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
