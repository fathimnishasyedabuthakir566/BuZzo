const express = require('express');
const router = express.Router();
const {
    getBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
    getRoutes,
    getShortestPath,
    addIntermediateStop
} = require('../controllers/busController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getBuses)
    .post(protect, admin, createBus);

router.route('/routes')
    .get(getRoutes);

router.get('/shortest-path', getShortestPath);

router.post('/:id/add-stop', protect, admin, addIntermediateStop);

router.route('/:id')
    .get(getBusById)
    .put(protect, admin, updateBus)
    .delete(protect, admin, deleteBus);

module.exports = router;
