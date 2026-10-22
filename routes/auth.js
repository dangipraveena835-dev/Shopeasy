const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, phone, address) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, hash, phone || null, address || null);

  res.status(201).json({ message: 'Registered successfully', userId: result.lastInsertRowid });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// GET /api/auth/me (login hona zaroori)
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, role, phone, address FROM users WHERE id = ?'
  ).get(req.user.id);
  res.json(user);
});

module.exports = router;