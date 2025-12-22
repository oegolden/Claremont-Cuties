const express = require('express');
const HealthController = require('../controllers/healthController');
const usersRouter = require('./users');

const router = express.Router();
const healthController = new HealthController();

router.get('/health', healthController.checkHealth.bind(healthController));

router.use('/users', usersRouter);

module.exports = router;