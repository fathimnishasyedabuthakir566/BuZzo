const asyncHandler = require('express-async-handler');
const Bus = require('../models/busModel');
const dijkstra = require('../utils/dijkstra');
const { buildGraphFromBuses } = require('../utils/graphBuilder');

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
        // Map intermediateStops to timings format for frontend
        const timings = (bus.intermediateStops || []).map(stop => {
            let status = 'upcoming';
            if (stop.name === bus.currentStop) status = 'current';
            // Simple logic: if order < current stop's order, it's departed
            const currentStopObj = bus.intermediateStops.find(s => s.name === bus.currentStop);
            if (currentStopObj && stop.order < currentStopObj.order) status = 'departed';

            return {
                location: stop.name,
                time: bus.scheduledTime[0] || "--:--", // Placeholder or logic for stop-specific time
                status
            };
        });

        res.json({
            ...bus._doc,
            id: bus._id,
            timings: timings.length > 0 ? timings : [
                { location: bus.routeFrom, time: bus.scheduledTime[0] || "--:--", status: 'departed' },
                { location: bus.routeTo, time: bus.scheduledTime[bus.scheduledTime.length - 1] || "--:--", status: 'upcoming' }
            ]
        });
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});

const createBus = asyncHandler(async (req, res) => {
    const {
        name,
        busNumber,
        routeFrom,
        routeTo,
        scheduledTime,
        depot,
        busType,
        serviceType,
        intermediateStops,
        driverName,
        driverPhone,
        conductorName,
        conductorPhone,
        capacity,
        ac
    } = req.body;

    if (!busNumber || !routeFrom || !routeTo) {
        res.status(400);
        throw new Error('Please provide bus number, source, and destination');
    }

    const busExists = await Bus.findOne({ busNumber });
    if (busExists) {
        res.status(400);
        throw new Error('Bus already exists');
    }

    const bus = await Bus.create({
        name: name || busNumber,
        busNumber,
        routeFrom,
        routeTo,
        scheduledTime: scheduledTime || [],
        depot,
        busType,
        serviceType,
        intermediateStops: intermediateStops || [],
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

const getRoutes = asyncHandler(async (req, res) => {
    const buses = await Bus.find({}, 'routeFrom routeTo');
    const routes = new Set(buses.map(bus => `${bus.routeFrom} - ${bus.routeTo}`));
    res.json(Array.from(routes));
});

// @desc    Get shortest path between stops
// @route   GET /api/buses/shortest-path
// @access  Public
const getShortestPath = asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        res.status(400);
        throw new Error('Please provide from and to stops');
    }

    const graph = await buildGraphFromBuses();
    
    // Ensure both nodes exist in the graph
    if (!graph[from] || !graph[to]) {
        res.status(404);
        throw new Error('One or both stops not found in the bus network');
    }

    const result = dijkstra(graph, from, to);

    res.json({
        from,
        to,
        path: result.path,
        distance: `${result.distance.toFixed(2)} km`
    });
});

// @desc    Add intermediate stop to a bus
// @route   POST /api/buses/:id/add-stop
// @access  Private (Admin)
const addIntermediateStop = asyncHandler(async (req, res) => {
    const { name, lat, lng, order } = req.body;

    if (!name || lat === undefined || lng === undefined || order === undefined) {
        res.status(400);
        throw new Error('Please provide name, lat, lng, and order for the stop');
    }

    const bus = await Bus.findById(req.params.id);

    if (bus) {
        // Add the new stop
        bus.intermediateStops.push({ name, lat, lng, order });
        
        // Re-sort stops by order to ensure consistency
        bus.intermediateStops.sort((a, b) => a.order - b.order);

        await bus.save();
        res.status(201).json(bus);
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
    deleteBus,
    getRoutes,
    getShortestPath,
    addIntermediateStop
};
