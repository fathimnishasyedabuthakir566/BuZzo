const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, uploadProfileImage } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.put('/profile', updateUserProfile);
router.post('/upload-image', upload.single('image'), uploadProfileImage);
router.get('/me', getMe);

module.exports = router;
