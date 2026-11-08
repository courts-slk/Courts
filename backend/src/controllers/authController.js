const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { signToken } = require('../utils/jwt');
const { isValidEmail, isValidPassword } = require('../utils/validators');

async function register(req, res, next) {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'full_name, email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const safeRole = ['customer', 'vendor'].includes(role) ? role : 'customer';

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);

    db.prepare(
      'INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES (?,?,?,?,?,?)'
    ).run(id, full_name.trim(), email.toLowerCase().trim(), phone || null, password_hash, safeRole);

    const token = signToken({ id, email: email.toLowerCase(), role: safeRole });
    res.status(201).json({ user: { id, email: email.toLowerCase(), full_name: full_name.trim(), role: safeRole }, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
}

function me(req, res, next) {
  try {
    const user = db.prepare('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { full_name, phone } = req.body;
    db.prepare('UPDATE users SET full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(full_name?.trim() || null, phone || null, req.user.id);
    const user = db.prepare('SELECT id, full_name, email, phone, role FROM users WHERE id = ?').get(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateProfile };
