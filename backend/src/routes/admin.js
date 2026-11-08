const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const db = require('../db');

const guard = [authenticate, requireRole('admin')];

router.get('/users', ...guard, (req, res, next) => {
  try {
    const users = db.prepare('SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err) { next(err); }
});

router.put('/users/:id/role', ...guard, (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, req.params.id);
    res.json({ id: req.params.id, role });
  } catch (err) { next(err); }
});

router.get('/courts', ...guard, (req, res, next) => {
  try {
    const courts = db.prepare(`
      SELECT c.*, u.full_name AS vendor_name
      FROM courts c JOIN users u ON u.id = c.vendor_id
      ORDER BY c.created_at DESC
    `).all();
    res.json(courts.map(c => {
      let images = [];
      try { images = JSON.parse(c.images || '[]'); } catch {}
      return { ...c, images };
    }));
  } catch (err) { next(err); }
});

router.put('/courts/:id/approve', ...guard, (req, res, next) => {
  try {
    const { is_active } = req.body;
    db.prepare('UPDATE courts SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
    res.json({ id: req.params.id, is_active: !!is_active });
  } catch (err) { next(err); }
});

router.get('/bookings', ...guard, (req, res, next) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, u.full_name AS customer_name, c.name AS court_name,
             s.date, s.start_time, s.end_time
      FROM bookings b
      JOIN users u ON u.id = b.customer_id
      JOIN courts c ON c.id = b.court_id
      JOIN availability_slots s ON s.id = b.slot_id
      ORDER BY b.created_at DESC
    `).all();
    res.json(bookings);
  } catch (err) { next(err); }
});

router.get('/stats', ...guard, (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalUsers = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
    const totalCourts = db.prepare('SELECT COUNT(*) AS n FROM courts WHERE is_active = 1').get().n;
    const todayBookings = db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE date(created_at) = ?").get(today).n;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount),0) AS n FROM bookings WHERE status = 'confirmed'").get().n;
    const recentBookings = db.prepare(`
      SELECT b.id, b.booking_reference, b.status, b.total_amount, b.created_at,
             u.full_name AS customer_name, c.name AS court_name
      FROM bookings b
      JOIN users u ON u.id = b.customer_id
      JOIN courts c ON c.id = b.court_id
      ORDER BY b.created_at DESC LIMIT 10
    `).all();

    res.json({ totalUsers, totalCourts, todayBookings, totalRevenue, recentBookings });
  } catch (err) { next(err); }
});

module.exports = router;
