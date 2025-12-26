const express = require('express');
const MatchesController = require('../controllers/matchesController');

const router = express.Router();
const ctrl = new MatchesController();

// list matches (path param: /:userId)
router.get('/:userId', ctrl.list.bind(ctrl));

// create a match
router.post('/', ctrl.create.bind(ctrl));

// update a match (params or body)
router.put('/', ctrl.update.bind(ctrl));

// delete (not implemented)
router.delete('/:user1Id/:matchedID', ctrl.delete.bind(ctrl));

module.exports = router;
