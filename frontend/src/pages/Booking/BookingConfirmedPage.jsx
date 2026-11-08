import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency, formatSlotTime } from '../../utils/formatters';
import styles from './Booking.module.css';

export default function BookingConfirmedPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Booking not found.{' '}
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const handleAddToCalendar = () => {
    if (!booking.date || !booking.start_time) return;

    const [year, month, day] = booking.date.split('-');
    const [startHour, startMin] = booking.start_time.split(':');
    const [endHour, endMin]     = (booking.end_time || '').split(':') || ['00', '00'];

    const dtStart = `${year}${month}${day}T${startHour}${startMin || '00'}00`;
    const dtEnd   = `${year}${month}${day}T${endHour || '00'}${endMin || '00'}00`;
    const stamp   = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

    const event = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Courts//Courts Booking//EN',
      'BEGIN:VEVENT',
      `UID:${booking.id}@courts.lk`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `DTSTAMP:${stamp}`,
      `SUMMARY:Courts Booking — ${booking.booking_reference}`,
      `DESCRIPTION:Booking at ${booking.court_name || 'Court'}. Reference: ${booking.booking_reference}`,
      `LOCATION:${booking.court_name || 'Courts Venue'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([event], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courts-${booking.booking_reference}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const slotLabel = booking.date && booking.start_time
    ? formatSlotTime(booking.date, booking.start_time, booking.end_time)
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.confirmed}>
        <div className={styles.checkmark}>✓</div>
        <h1>Booking Confirmed!</h1>

        <div className={styles.reference}>
          {booking.booking_reference}
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          Save your reference number — you'll need it at the venue.
        </p>

        <div style={{ background: 'var(--bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', textAlign: 'left' }}>
          {booking.court_name && <p style={{ marginBottom: 'var(--space-2)' }}><strong>Court:</strong> {booking.court_name}</p>}
          {slotLabel         && <p style={{ marginBottom: 'var(--space-2)' }}><strong>When:</strong> {slotLabel}</p>}
          <p style={{ marginBottom: 'var(--space-2)' }}><strong>Amount Due:</strong> {formatCurrency(booking.total_amount)}</p>
          <p style={{ marginBottom: 'var(--space-2)' }}><strong>Payment:</strong> Cash at location</p>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
            Pay the {formatCurrency(500)} deposit within 10 minutes to secure your slot.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          {booking.date && booking.start_time && (
            <button className="btn btn-secondary" onClick={handleAddToCalendar} style={{ flex: 1 }}>
              📅 Add to Calendar
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/bookings')} style={{ flex: 1 }}>
            My Bookings
          </button>
        </div>

        <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ width: '100%' }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
