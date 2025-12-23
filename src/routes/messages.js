const express = require('express');
const MessagesController = require('../controllers/messagesController');

const router = express.Router();
const ctrl = new MessagesController();

// conversation listing
router.get('/conversation', ctrl.listConversation.bind(ctrl));

// single message
router.get('/:id', ctrl.get.bind(ctrl));

// create
router.post('/', ctrl.create.bind(ctrl));

// update
router.put('/:id', ctrl.update.bind(ctrl));

// delete
router.delete('/:id', ctrl.delete.bind(ctrl));

module.exports = router;
