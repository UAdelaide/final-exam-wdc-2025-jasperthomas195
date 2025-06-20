const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT user_id, username, password_hash, role FROM Users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "incorrect details"});
    }

    const user = rows[0];

    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'incorrect details'});
    }

    req.session_user = {
      id: user.user_id,
      username: user.username,
      role: user.role
    };

    res.json({
      message: 'successful login',
      role: user.role
    });
  } catch (error) {
    console.error
  }
  const user = users.find(u =>
  u.username === username && u.password === password);

  if (user) {
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    res.json({
      message: 'successful login',
      role: user.role
    });
  } else {
    res.status(401).json({ error: 'incorrect details' });
  }
});


module.exports = router;