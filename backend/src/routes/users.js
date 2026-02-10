const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/jwtAuthentication');
const UsersController = require('../controllers/usersController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();
const ctrl = new UsersController();

// Public: create user
router.post('/', ctrl.create.bind(ctrl));

// Protected user routes
router.get('/', authenticateToken, ctrl.list.bind(ctrl));
router.get('/:id', authenticateToken, ctrl.get.bind(ctrl));
router.put('/:id', authenticateToken, ctrl.update.bind(ctrl));
router.delete('/:id', authenticateToken, ctrl.delete.bind(ctrl));

// Image routes (protected)
router.get('/:id/image', authenticateToken, ctrl.getImage.bind(ctrl));
router.post('/:id/image', authenticateToken, upload.single('image'), ctrl.createImage.bind(ctrl));
router.put('/:id/image', authenticateToken, upload.single('image'), ctrl.updateImage.bind(ctrl));
router.delete('/:id/image', authenticateToken, ctrl.deleteImage.bind(ctrl));

module.exports = router;