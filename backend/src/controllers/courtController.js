const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { isValidDate, isValidTime } = require('../utils/validators');

function listCourts(req, res, next) {
  try {
    const { city, search } = req.query;
    let query = 'SELECT * FROM courts WHERE is_active = 1';
    const params = [];

    if (city) {
      query += ' AND city = ?';
      params.push(city.toLowerCase());
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const courts = db.prepare(query).all(...params);

    const result = courts.map(c => ({
      ...c,
      images: parseImages(c.images),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

function getCourt(req, res, next) {
  try {
    const court = db.prepare('SELECT * FROM courts WHERE id = ? AND is_active = 1').get(req.params.id);
    if (!court) return res.status(404).json({ error: 'Court not found' });

    const vendor = db.prepare('SELECT full_name, phone FROM users WHERE id = ?').get(court.vendor_id);

    res.json({
      ...court,
      images: parseImages(court.images),
      vendor_name: vendor?.full_name,
    });
  } catch (err) {
    next(err);
  }
}

function getSlots(req, res, next) {
  try {
    const { date } = req.query;
    if (!date || !isValidDate(date)) {
      return res.status(400).json({ error: 'Valid date query param required (YYYY-MM-DD)' });
    }

    const now = new Date().toISOString();

    const slots = db.prepare(`
      SELECT s.*,
        CASE WHEN b.id IS NOT NULL AND b.status NOT IN ('cancelled') THEN 0 ELSE 1 END AS is_available
      FROM availability_slots s
      LEFT JOIN bookings b ON b.slot_id = s.id
        AND b.status NOT IN ('cancelled')
        AND (b.slot_locked_until > ? OR b.status = 'confirmed')
      WHERE s.court_id = ? AND s.date = ? AND s.is_blocked = 0
      ORDER BY s.start_time
    `).all(now, req.params.id, date);

    res.json(slots);
  } catch (err) {
    next(err);
  }
}

function createCourt(req, res, next) {
  try {
    const { name, description, city, address, latitude, longitude, surface_type, pitch_size, price_per_hour } = req.body;
    if (!name || !city || !address || !price_per_hour) {
      return res.status(400).json({ error: 'name, city, address, price_per_hour are required' });
    }
    if (!['colombo', 'kandy'].includes(city)) {
      return res.status(400).json({ error: 'city must be colombo or kandy' });
    }

    const images = req.body.images || [];
    const id = uuidv4();

    db.prepare(`INSERT INTO courts (id, vendor_id, name, description, city, address, latitude, longitude, surface_type, pitch_size, price_per_hour, images) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, req.user.id, name.trim(), description || null, city, address.trim(), latitude || null, longitude || null, surface_type || null, pitch_size || null, parseFloat(price_per_hour), JSON.stringify(images));

    const court = db.prepare('SELECT * FROM courts WHERE id = ?').get(id);
    res.status(201).json({ ...court, images: parseImages(court.images) });
  } catch (err) {
    next(err);
  }
}

function updateCourt(req, res, next) {
  try {
    const court = db.prepare('SELECT * FROM courts WHERE id = ? AND vendor_id = ?').get(req.params.id, req.user.id);
    if (!court) return res.status(404).json({ error: 'Court not found' });

    const { name, description, city, address, latitude, longitude, surface_type, pitch_size, price_per_hour, images } = req.body;

    db.prepare(`UPDATE courts SET name=?, description=?, city=?, address=?, latitude=?, longitude=?, surface_type=?, pitch_size=?, price_per_hour=?, images=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(
        name ?? court.name,
        description ?? court.description,
        city ?? court.city,
        address ?? court.address,
        latitude ?? court.latitude,
        longitude ?? court.longitude,
        surface_type ?? court.surface_type,
        pitch_size ?? court.pitch_size,
        price_per_hour ? parseFloat(price_per_hour) : court.price_per_hour,
        images ? JSON.stringify(images) : court.images,
        req.params.id
      );

    const updated = db.prepare('SELECT * FROM courts WHERE id = ?').get(req.params.id);
    res.json({ ...updated, images: parseImages(updated.images) });
  } catch (err) {
    next(err);
  }
}

function deleteCourt(req, res, next) {
  try {
    const court = db.prepare('SELECT id FROM courts WHERE id = ? AND vendor_id = ?').get(req.params.id, req.user.id);
    if (!court) return res.status(404).json({ error: 'Court not found' });

    db.prepare('UPDATE courts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
    res.json({ message: 'Court deactivated' });
  } catch (err) {
    next(err);
  }
}

function createSlots(req, res, next) {
  try {
    const court = db.prepare('SELECT id FROM courts WHERE id = ? AND vendor_id = ?').get(req.params.id, req.user.id);
    if (!court) return res.status(404).json({ error: 'Court not found' });

    const { date, start_time, end_time, recurring, days } = req.body;
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ error: 'date, start_time, end_time are required' });
    }
    if (!isValidDate(date) || !isValidTime(start_time) || !isValidTime(end_time)) {
      return res.status(400).json({ error: 'Invalid date or time format' });
    }

    const created = [];
    const numDays = recurring ? Math.min(parseInt(days) || 7, 30) : 1;

    for (let i = 0; i < numDays; i++) {
      const slotDate = new Date(date);
      slotDate.setDate(slotDate.getDate() + i);
      const dateStr = slotDate.toISOString().split('T')[0];

      const exists = db.prepare('SELECT id FROM availability_slots WHERE court_id=? AND date=? AND start_time=?').get(req.params.id, dateStr, start_time);
      if (exists) continue;

      const id = uuidv4();
      db.prepare('INSERT INTO availability_slots (id, court_id, date, start_time, end_time) VALUES (?,?,?,?,?)').run(id, req.params.id, dateStr, start_time, end_time);
      created.push({ id, court_id: req.params.id, date: dateStr, start_time, end_time });
    }

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

function blockSlot(req, res, next) {
  try {
    const { slot_id } = req.params;
    const slot = db.prepare(`
      SELECT s.* FROM availability_slots s
      JOIN courts c ON c.id = s.court_id
      WHERE s.id = ? AND c.vendor_id = ?
    `).get(slot_id, req.user.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    const { is_blocked } = req.body;
    db.prepare('UPDATE availability_slots SET is_blocked = ? WHERE id = ?').run(is_blocked ? 1 : 0, slot_id);
    res.json({ id: slot_id, is_blocked: !!is_blocked });
  } catch (err) {
    next(err);
  }
}

function getVendorBookings(req, res, next) {
  try {
    const bookings = db.prepare(`
      SELECT b.*, u.full_name AS customer_name, c.name AS court_name,
             s.date, s.start_time, s.end_time
      FROM bookings b
      JOIN users u ON u.id = b.customer_id
      JOIN courts c ON c.id = b.court_id
      JOIN availability_slots s ON s.id = b.slot_id
      WHERE c.vendor_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = db.prepare(`
      SELECT b.* FROM bookings b
      JOIN courts c ON c.id = b.court_id
      WHERE b.id = ? AND c.vendor_id = ?
    `).get(id, req.user.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    db.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    res.json({ id, status });
  } catch (err) {
    next(err);
  }
}

function getVendorCourts(req, res, next) {
  try {
    const courts = db.prepare('SELECT * FROM courts WHERE vendor_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(courts.map(c => ({ ...c, images: parseImages(c.images) })));
  } catch (err) {
    next(err);
  }
}

function getVendorSlots(req, res, next) {
  try {
    const { court_id, date } = req.query;
    if (!court_id) return res.status(400).json({ error: 'court_id required' });

    const court = db.prepare('SELECT id FROM courts WHERE id = ? AND vendor_id = ?').get(court_id, req.user.id);
    if (!court) return res.status(404).json({ error: 'Court not found' });

    let query = 'SELECT * FROM availability_slots WHERE court_id = ?';
    const params = [court_id];
    if (date) { query += ' AND date = ?'; params.push(date); }
    query += ' ORDER BY date, start_time';

    const slots = db.prepare(query).all(...params);
    res.json(slots);
  } catch (err) {
    next(err);
  }
}

function parseImages(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

module.exports = {
  listCourts, getCourt, getSlots,
  createCourt, updateCourt, deleteCourt,
  createSlots, blockSlot,
  getVendorBookings, updateBookingStatus,
  getVendorCourts, getVendorSlots,
};
