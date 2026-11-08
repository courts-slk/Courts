const db = require('../db');

const LOCK_DURATION_MS = 10 * 60 * 1000;

function expirePendingBookings() {
  try {
    const cutoff = new Date(Date.now() - LOCK_DURATION_MS).toISOString();
    const result = db.prepare(`
      UPDATE bookings
      SET status = 'cancelled',
          cancelled_at = CURRENT_TIMESTAMP,
          cancellation_reason = 'Booking expired — payment not confirmed within 10 minutes',
          updated_at = CURRENT_TIMESTAMP
      WHERE status = 'pending' AND created_at < ?
    `).run(cutoff);

    if (result.changes > 0) {
      console.log(`[expireBookings] Expired ${result.changes} pending booking(s)`);
    }
  } catch (err) {
    console.error('[expireBookings] Error:', err.message);
  }
}

module.exports = { expirePendingBookings };
