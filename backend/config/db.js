const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        console.error('The server will start but database operations will fail.');
        console.error('Please check your network connection and MongoDB Atlas IP whitelist.');
    }

    // Handle connection events for resilience
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Mongoose will auto-reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully.');
    });
};

module.exports = connectDB;
