const express = require('express');
const multer = require('multer');
const UsersController = require('../controllers/usersController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();
const ctrl = new UsersController();


router.get('/', ctrl.list.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.get('/:id', ctrl.get.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.delete.bind(ctrl));

// Image routes
router.get('/:id/image', ctrl.getImage.bind(ctrl));
router.post('/:id/image', upload.single('image'), ctrl.createImage.bind(ctrl));
router.put('/:id/image', upload.single('image'), ctrl.updateImage.bind(ctrl));
router.delete('/:id/image', ctrl.deleteImage.bind(ctrl));

module.exports = router;