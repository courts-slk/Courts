import { Link } from 'react-router-dom';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';
import styles from './BookingCard.module.css';

export default function BookingCard({ booking }) {
  const statusClass = {
    pending: 'pending',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'success',
  }[booking.status] || 'default';

  return (
    <Link to={`/bookings/${booking.id}`} className={styles.card}>
      <div className={styles.header}>
        <h3>{booking.court_name}</h3>
        <span className={`badge ${statusClass}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
      <div className={styles.details}>
        <p>{formatDate(booking.date)} • {formatTime(booking.start_time)}</p>
        <p className={styles.reference}>{booking.booking_reference}</p>
      </div>
      <div className={styles.footer}>
        <span className={styles.amount}>{formatCurrency(booking.total_amount)}</span>
      </div>
    </Link>
  );
}
