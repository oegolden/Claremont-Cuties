const express = require('express');
const HealthController = require('../controllers/healthController');
const usersRouter = require('./users');

const router = express.Router();
const healthController = new HealthController();
const messagesRouter = require('./messages');
const matchesRouter = require('./matches');

router.get('/health', healthController.checkHealth.bind(healthController));

router.use('/users', usersRouter);
router.use('/messages', messagesRouter);
router.use('/matches', matchesRouter);

module.exports = router;