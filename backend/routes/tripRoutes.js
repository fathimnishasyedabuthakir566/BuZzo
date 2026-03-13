const express = require('express');
const router = express.Router();
const { startTrip, endTrip, getMyTrips } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMyTrips);
router.route('/start').post(protect, startTrip);
router.route('/:id/end').put(protect, endTrip);

module.exports = router;
