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
dotenv.config();

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

            // Broadcast ENRICHED data to everyone in that route room
            io.to(data.routeId).emit('receive-location', {
                ...data,
                currentStop,
                nextStop
            });

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

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
