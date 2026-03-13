const mongoose = require('mongoose');

const tripSchema = mongoose.Schema(
    {
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bus',
            required: true,
        },
        routeId: {
            type: mongoose.Schema.Types.ObjectId, // Optional if referring to generic routes or simple string
            ref: 'Route',
        },
        routeName: {
            type: String, // String fallback if route collection isn't heavily used
        },
        startTime: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        distanceCovered: {
            type: Number, // In kilometers
            default: 0,
        },
        duration: {
            type: Number, // In minutes
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active'
        }
    },
    {
        timestamps: true,
    }
);

// Add indexes for quick lookups
tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ busId: 1 });

module.exports = mongoose.model('Trip', tripSchema);
