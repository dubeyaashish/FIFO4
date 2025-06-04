const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { secretKey } = require('../config');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, fullName, department, employeeId, password, role } = req.body;
  try {
    const checkQuery = `SELECT * FROM InventoryTrackLogin WHERE email = ? OR employee_id = ?`;
    const [existingUser] = await db.promise().query(checkQuery, [email, employeeId]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email or Employee ID already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const qrToken = crypto.randomBytes(32).toString('hex');
    const sql = `
      INSERT INTO InventoryTrackLogin (email, full_name, department, employee_id, password_hash, qr_token, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.promise().query(sql, [email, fullName, department, employeeId, passwordHash, qrToken, role]);
    res.status(201).json({ message: 'User registered successfully', qrToken });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const sql = `SELECT * FROM InventoryTrackLogin WHERE email = ?`;
    const [user] = await db.promise().query(sql, [email]);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const foundUser = user[0];
    const isMatch = await bcrypt.compare(password, foundUser.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const updateSql = `UPDATE InventoryTrackLogin SET last_logged_in = NOW() WHERE id = ?`;
    await db.promise().query(updateSql, [foundUser.id]);
    const token = jwt.sign(
      {
        userId: foundUser.id,
        email: foundUser.email,
        userName: foundUser.full_name,
        role: foundUser.role,
      },
      secretKey,
      { expiresIn: '6h' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        userName: foundUser.full_name,
        role: foundUser.role,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization header missing or token missing' });
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token is invalid or expired' });
    req.user = user;
    next();
  });
};

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted to protected route', user: req.user });
});

router.get('/user-details', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sql = 'SELECT full_name, department FROM InventoryTrackLogin WHERE id = ?';
    const [results] = await db.promise().query(sql, [userId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      fullName: results[0].full_name,
      department: results[0].department,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

module.exports = { router, authenticateToken };
