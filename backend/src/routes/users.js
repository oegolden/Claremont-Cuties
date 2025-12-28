const express = require('express');
const UsersController = require('../controllers/usersController');

const router = express.Router();
const ctrl = new UsersController();

// needs explicit binding to preserve "this" context
router.get('/', ctrl.list.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.get('/:id', ctrl.get.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.delete.bind(ctrl));

module.exports = router;