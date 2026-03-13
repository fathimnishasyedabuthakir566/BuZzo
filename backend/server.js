const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const { errorHandler } = require('./middleware/errorMiddleware');
const Bus = require('./models/busModel'); // Import Bus Model
const { calculateStops } = require('./utils/routeUtils');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Define port - prioritize env variable, then default to 5001 (or 8082 if running as standalone/electron)
// We will set PORT=8082 in the Electron environment
const PORT = process.env.PORT || 5001;


// Connect to database
connectDB();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Set global.io for controllers to emit events
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend in Production/Desktop Mode
// If we are in production OR explicitly told to serve static
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
    // Serve static files from the React app build directory
    // Assuming backend/server.js -> backend/ -> root/ -> dist/
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
        // Don't intercept API routes or socket.io
        if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
            return next();
        }
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
}


// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a bus route room
    socket.on('join-route', (routeId) => {
        socket.join(routeId);
        console.log(`User ${socket.id} joined route: ${routeId}`);
    });

    // Start a trip (Explicit Online)
    socket.on('start-trip', async (routeId) => {
        socket.join(routeId);
        try {
            await Bus.findByIdAndUpdate(routeId, {
                status: 'on-time',
                isActive: true
            });
            console.log(`Trip started for bus: ${routeId}`);
            io.to(routeId).emit('status-update', { routeId, status: 'on-time', isActive: true });
        } catch (err) {
            console.error('Error starting trip:', err.message);
        }
    });

    // Driver sends location update
    socket.on('update-location', async (data) => {
        // data: { routeId, lat, lng }
        console.log('Location Update:', data);

        try {
            const bus = await Bus.findById(data.routeId);
            if (!bus) return;

            const { currentStop, nextStop } = calculateStops(data.lat, data.lng, bus.intermediateStops);

            // Update with stop info
            const updateData = {
                location: {
                    lat: data.lat,
                    lng: data.lng,
                    lastUpdated: new Date()
                },
                currentStop,
                nextStop,
                status: 'on-time',
                isActive: true
            };

            await Bus.findByIdAndUpdate(data.routeId, updateData);

            // Broadcast ENRICHED data to everyone (Global) and the specific route room
            const payload = {
                ...data,
                busId: data.routeId, // Ensure busId is set for frontend compatibility
                currentStop,
                nextStop,
                lastUpdated: updateData.location.lastUpdated
            };

            io.emit('receive-location', payload); // Global broadcast
            io.to(data.routeId).emit('receive-location', payload); // Room broadcast (for backward compatibility)

        } catch (err) {
            console.error('Error processing location update:', err.message);
        }
    });

    // Stop a trip (Explicit Offline)
    socket.on('stop-trip', async (routeId) => {
        try {
            await Bus.findByIdAndUpdate(routeId, {
                status: 'offline',
                isActive: false
            });
            console.log(`Trip stopped for bus: ${routeId}`);
            io.to(routeId).emit('status-update', { routeId, status: 'offline', isActive: false });
        } catch (err) {
            console.error('Error stopping trip:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});


// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/buses', require('./routes/busRoutes')); // Add Bus Routes
app.use('/api/trips', require('./routes/tripRoutes')); // Add Trip Routes

// Error Handler
app.use(errorHandler);

// const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
