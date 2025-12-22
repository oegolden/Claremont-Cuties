const express = require('express');
const UsersController = require('../controllers/usersController');

const router = express.Router();
const ctrl = new UsersController();


router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;