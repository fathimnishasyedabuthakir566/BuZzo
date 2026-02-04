const mongoose = require('mongoose');

const busSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        busNumber: {
            type: String,
            required: true,
            unique: true,
        },
        routeFrom: { type: String, required: true },
        routeTo: { type: String, required: true },
        scheduledTime: { type: String, required: true }, // Format: "HH:mm"
        platformNumber: { type: Number },
        intermediateStops: [
            {
                name: { type: String, required: true },
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
                order: { type: Number, required: true }
            }
        ],
        currentStop: { type: String },
        nextStop: { type: String },
        driverName: { type: String },
        driverPhone: { type: String },
        conductorName: { type: String },
        conductorPhone: { type: String },
        capacity: { type: Number },
        ac: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['on-time', 'delayed', 'arriving', 'departed', 'offline'],
            default: 'offline',
        },
        location: {
            lat: { type: Number },
            lng: { type: Number },
            lastUpdated: { type: Date },
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Bus', busSchema);
