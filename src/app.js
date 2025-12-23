const express = require('express');
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
app.use(helmet());

app.use(express.static('public'));

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

// Routes
app.use('/api', routes);
app.use('/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

// Rate limiter middleware
app.use(rateLimiter);

module.exports = app;