const express = require('express');
const { authenticateToken } = require('../middleware/jwtAuthentication');
const FormsController = require('../controllers/formsController');

const router = express.Router();
const ctrl = new FormsController();

router.post('/', authenticateToken, ctrl.create.bind(ctrl));

module.exports = router;