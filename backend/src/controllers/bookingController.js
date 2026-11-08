const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const DEPOSIT = 500;

function generateRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'COURTS-';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

function expirePendingBookings() {
  const cutoff = new Date(Date.now() - LOCK_DURATION_MS).toISOString();
  db.prepare(`
    UPDATE bookings SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP,
      cancellation_reason = 'Booking expired — payment not confirmed within 10 minutes'
    WHERE status = 'pending' AND created_at < ?
  `).run(cutoff);
}

function createBooking(req, res, next) {
  try {
    expirePendingBookings();

    const { court_id, slot_id, total_amount, notes } = req.body;
    if (!court_id || !slot_id || !total_amount) {
      return res.status(400).json({ error: 'court_id, slot_id, total_amount are required' });
    }

    const court = db.prepare('SELECT id FROM courts WHERE id = ? AND is_active = 1').get(court_id);
    if (!court) return res.status(404).json({ error: 'Court not found' });

    const slot = db.prepare('SELECT * FROM availability_slots WHERE id = ? AND court_id = ? AND is_blocked = 0').get(slot_id, court_id);
    if (!slot) return res.status(404).json({ error: 'Slot not found or blocked' });

    // Check slot isn't taken by an active or locked booking
    const now = new Date().toISOString();
    const conflict = db.prepare(`
      SELECT id FROM bookings
      WHERE slot_id = ? AND status NOT IN ('cancelled')
        AND (status = 'confirmed' OR slot_locked_until > ?)
    `).get(slot_id, now);
    if (conflict) return res.status(409).json({ error: 'Slot is already booked or locked' });

    const id = uuidv4();
    let booking_reference;
    // Ensure unique reference
    for (let i = 0; i < 5; i++) {
      const ref = generateRef();
      const exists = db.prepare('SELECT id FROM bookings WHERE booking_reference = ?').get(ref);
      if (!exists) { booking_reference = ref; break; }
    }

    const lockedUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
    const commission = parseFloat(total_amount) * 0.05;

    db.prepare(`
      INSERT INTO bookings (id, booking_reference, court_id, customer_id, slot_id, total_amount, commission_amount, slot_locked_until, notes)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(id, booking_reference, court_id, req.user.id, slot_id, parseFloat(total_amount), commission, lockedUntil, notes || null);

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    res.status(201).json({
      ...booking,
      expires_at: lockedUntil,
    });
  } catch (err) {
    next(err);
  }
}

function listBookings(req, res, next) {
  try {
    const bookings = db.prepare(`
      SELECT b.*, c.name AS court_name, s.date, s.start_time, s.end_time
      FROM bookings b
      JOIN courts c ON c.id = b.court_id
      JOIN availability_slots s ON s.id = b.slot_id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

function getBooking(req, res, next) {
  try {
    expirePendingBookings();
    const booking = db.prepare(`
      SELECT b.*, c.name AS court_name, c.address AS court_address,
             s.date, s.start_time, s.end_time
      FROM bookings b
      JOIN courts c ON c.id = b.court_id
      JOIN availability_slots s ON s.id = b.slot_id
      WHERE b.id = ? AND b.customer_id = ?
    `).get(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

function confirmBooking(req, res, next) {
  try {
    expirePendingBookings();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND customer_id = ?').get(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: `Cannot confirm a booking with status '${booking.status}'` });
    }

    const now = new Date();
    if (booking.slot_locked_until && new Date(booking.slot_locked_until) < now) {
      return res.status(410).json({ error: 'Booking window expired. Please make a new booking.' });
    }

    db.prepare(`
      UPDATE bookings SET status = 'confirmed', payment_confirmed = 1,
        payment_confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(req.params.id);

    const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

function cancelBooking(req, res, next) {
  try {
    const booking = db.prepare(`
      SELECT b.*, s.date, s.start_time FROM bookings b
      JOIN availability_slots s ON s.id = b.slot_id
      WHERE b.id = ? AND b.customer_id = ?
    `).get(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    const slotDateTime = new Date(`${booking.date}T${booking.start_time}`);
    const hoursUntilSlot = (slotDateTime - Date.now()) / 3600000;

    let refund_amount;
    if (hoursUntilSlot >= 24) refund_amount = DEPOSIT;
    else if (hoursUntilSlot > 0) refund_amount = DEPOSIT * 0.5;
    else refund_amount = 0;

    const reason = req.body.cancellation_reason || 'Cancelled by customer';
    db.prepare(`
      UPDATE bookings SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP,
        cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reason, req.params.id);

    res.json({ id: req.params.id, status: 'cancelled', refund_amount });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, listBookings, getBooking, confirmBooking, cancelBooking };
