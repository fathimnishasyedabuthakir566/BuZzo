const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, uploadProfileImage, getUserActivity, blockUser, unblockUser } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Admin only routes
router.get('/activity', protect, admin, getUserActivity);
router.post('/:id/block', protect, admin, blockUser);
router.post('/:id/unblock', protect, admin, unblockUser);

module.exports = router;
