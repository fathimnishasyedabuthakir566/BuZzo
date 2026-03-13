const asyncHandler = require('express-async-handler');
const Trip = require('../models/tripModel');
const User = require('../models/userModel');
const Bus = require('../models/busModel');

// @desc    Start a new trip
// @route   POST /api/trips/start
// @access  Private (Driver)
const startTrip = asyncHandler(async (req, res) => {
    const { busId, routeId, routeName } = req.body;
    const driverId = req.user.id; // User id from JWT

    // Verify driver exists
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'DRIVER') {
        res.status(403);
        throw new Error('Not authorized as driver');
    }

    // Verify bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
        res.status(404);
        throw new Error('Bus not found');
    }

    // Create active trip
    const trip = await Trip.create({
        driverId,
        busId,
        routeId,
        routeName: routeName || `${bus.routeFrom} to ${bus.routeTo}`,
        status: 'active',
        startTime: Date.now()
    });

    // Update Driver Status
    driver.availabilityStatus = 'On Trip';
    driver.assignedBus = busId;
    if (routeName) driver.assignedRoute = routeName;
    await driver.save();

    // Update Bus Activity
    bus.isActive = true;
    bus.status = 'on-route';
    bus.driverName = driver.name;
    bus.driverPhone = driver.phone;
    await bus.save();

    res.status(201).json(trip);
});

// @desc    End a trip and calculate stats
// @route   PUT /api/trips/:id/end
// @access  Private (Driver)
const endTrip = asyncHandler(async (req, res) => {
    const { distanceCovered } = req.body; // Driver inputs or GPS calculated km
    const tripId = req.params.id;

    const trip = await Trip.findById(tripId);

    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }

    // Verify user owns trip or is admin
    if (trip.driverId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized');
    }

    if (trip.status === 'completed') {
        res.status(400);
        throw new Error('Trip already completed');
    }

    const endTime = Date.now();
    const durationMs = endTime - new Date(trip.startTime).getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    const dist = parseFloat(distanceCovered) || 0;

    // Update trip
    trip.endTime = endTime;
    trip.distanceCovered = dist;
    trip.duration = durationHours * 60; // save in minutes
    trip.status = 'completed';
    const updatedTrip = await trip.save();

    // Update driver statistics
    const driver = await User.findById(trip.driverId);
    if (driver) {
        driver.totalTrips = (driver.totalTrips || 0) + 1;
        driver.totalDistance = (driver.totalDistance || 0) + dist;
        driver.drivingHours = (driver.drivingHours || 0) + durationHours;
        driver.lastTripTime = endTime;
        driver.availabilityStatus = 'Available';
        await driver.save();

        // ** Realtime updates: emit via global.io **
        if (global.io) {
            global.io.emit('driverStatsUpdated', {
                driverId: driver._id,
                stats: {
                    totalTrips: driver.totalTrips,
                    totalDistance: driver.totalDistance,
                    drivingHours: driver.drivingHours,
                    lastTripTime: driver.lastTripTime,
                    availabilityStatus: driver.availabilityStatus
                }
            });
        }
    }

    // Free the bus
    const bus = await Bus.findById(trip.busId);
    if (bus) {
        bus.isActive = false;
        bus.status = 'Not running';
        await bus.save();
    }

    res.json(updatedTrip);
});

// @desc    Get trip history for a user
// @route   GET /api/trips
// @access  Private
const getMyTrips = asyncHandler(async (req, res) => {
    // If driver, return trips driven. If passenger, return trips traveled (needs booking system for latter).
    // Simply fetch by driverId for now
    const trips = await Trip.find({ driverId: req.user.id })
        .populate('busId', 'name busNumber')
        .sort('-startTime');

    res.json(trips);
});

module.exports = {
    startTrip,
    endTrip,
    getMyTrips
};
