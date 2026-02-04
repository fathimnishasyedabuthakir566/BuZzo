const asyncHandler = require('express-async-handler');
const Bus = require('../models/busModel');

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
const getBuses = asyncHandler(async (req, res) => {
    console.log('GET /api/buses - Fetching buses...');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000; // Default to large number if not specified
    const skip = (page - 1) * limit;

    const total = await Bus.countDocuments({});
    const buses = await Bus.find({}).skip(skip).limit(limit);

    res.json({
        buses,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get single bus
// @route   GET /api/buses/:id
// @access  Public
const getBusById = asyncHandler(async (req, res) => {
    const bus = await Bus.findById(req.params.id);
    if (bus) {
        res.json(bus);
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});

// @desc    Create a bus
// @route   POST /api/buses
// @access  Private (Admin/Driver)
const createBus = asyncHandler(async (req, res) => {
    const { name, busNumber, routeFrom, routeTo, scheduledTime, driverName, driverPhone, conductorName, conductorPhone, capacity, ac } = req.body;

    const busExists = await Bus.findOne({ busNumber });
    if (busExists) {
        res.status(400);
        throw new Error('Bus already exists');
    }

    const bus = await Bus.create({
        name,
        busNumber,
        routeFrom,
        routeTo,
        scheduledTime,
        driverName,
        driverPhone,
        conductorName,
        conductorPhone,
        capacity,
        ac
    });

    if (bus) {
        res.status(201).json(bus);
    } else {
        res.status(400);
        throw new Error('Invalid bus data');
    }
});

// @desc    Update a bus
// @route   PUT /api/buses/:id
// @access  Private (Admin)
const updateBus = asyncHandler(async (req, res) => {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
        bus.name = req.body.name || bus.name;
        bus.busNumber = req.body.busNumber || bus.busNumber;
        bus.routeFrom = req.body.routeFrom || bus.routeFrom;
        bus.routeTo = req.body.routeTo || bus.routeTo;
        bus.scheduledTime = req.body.scheduledTime || bus.scheduledTime;
        bus.driverName = req.body.driverName || bus.driverName;
        bus.driverPhone = req.body.driverPhone || bus.driverPhone;
        bus.conductorName = req.body.conductorName || bus.conductorName;
        bus.conductorPhone = req.body.conductorPhone || bus.conductorPhone;
        bus.capacity = req.body.capacity !== undefined ? req.body.capacity : bus.capacity;
        bus.ac = req.body.ac !== undefined ? req.body.ac : bus.ac;
        bus.status = req.body.status || bus.status;
        bus.platformNumber = req.body.platformNumber !== undefined ? req.body.platformNumber : bus.platformNumber;
        bus.intermediateStops = req.body.intermediateStops || bus.intermediateStops;

        const updatedBus = await bus.save();
        res.json(updatedBus);
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});

// @desc    Delete a bus
// @route   DELETE /api/buses/:id
// @access  Private (Admin)
const deleteBus = asyncHandler(async (req, res) => {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
        await bus.deleteOne();
        res.json({ message: 'Bus removed' });
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});

module.exports = {
    getBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus
};
