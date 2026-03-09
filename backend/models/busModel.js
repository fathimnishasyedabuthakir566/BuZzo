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
        scheduledTime: [{ type: String, required: true }], // Changed to Array of strings "HH:mm"
        platformNumber: { type: Number },
        busType: {
            type: String,
            enum: ['Town Bus', 'Mofussil', 'Express', 'Deluxe', 'AC', 'Ultra Deluxe', 'SFS'],
            default: 'Mofussil'
        },
        serviceType: {
            type: String,
            enum: ['Ordinary', 'Express', 'Special', '1to1', 'EAC', 'BPR'],
            default: 'Ordinary'
        },
        depot: {
            type: String,
            default: 'Tirunelveli'
        },
        via: [{ type: String }], // Major stops
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
            enum: ['Upcoming', 'Delayed', 'Arriving soon', 'Arrived', 'Not running', 'on-time'],
            default: 'Not running',
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

// Add indexes for performance
busSchema.index({ busNumber: 1 });
busSchema.index({ routeFrom: 1, routeTo: 1 });
busSchema.index({ status: 1 });
busSchema.index({ platformNumber: 1 });

module.exports = mongoose.model('Bus', busSchema);
