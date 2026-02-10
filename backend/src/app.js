const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const helmet = require('helmet');
const rateLimiter = require('./middleware/rateLimiter.cjs');
const app = express();
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/index');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security Middleware through helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for some React/Vite setups
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://*.s3.amazonaws.com", "https://s3.amazonaws.com"],
        connectSrc: ["'self'", "https://*.s3.amazonaws.com", "https://s3.amazonaws.com"], // Good practice for fetch/XHR
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Serve React app static files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.ACCESS_TOKEN_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Rate limiter middleware (apply before routes)
app.use(rateLimiter);

// API Routes
app.use('/api', routes);
app.use('/auth', authRoutes);

// Serve React app for all non-API routes (client-side routing fallback)
app.use((req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;