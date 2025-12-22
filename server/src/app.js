const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const helmet = require('helmet');
const rateLimiter = require('./middleware/rateLimiter.cjs');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Middleware through helmet
app.use(helmet());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Rate limiter middleware
app.use(rateLimiter);

module.exports = app;