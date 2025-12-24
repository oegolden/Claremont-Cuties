const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login.html?error=access_denied`);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard.html#token=${encodeURIComponent(token)}`);
    })(req, res, next);
  }
);

// Microsoft OAuth Routes
router.get(
  '/microsoft',
  passport.authenticate('microsoft', {
    prompt: 'select_account',
  })
);

router.get(
  '/microsoft/callback',
  (req, res, next) => {
    passport.authenticate('microsoft', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login.html?error=access_denied`);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard.html#token=${encodeURIComponent(token)}`);
    })(req, res, next);
  }
);

// Get current user info
router.get('/me', require('../middleware/jwtAuthentication'), async (req, res) => {
  try {
    const { pool } = require('../config/db');
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      delete user.password;
      res.json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;