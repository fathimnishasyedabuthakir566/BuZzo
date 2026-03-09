const mongoose = require('mongoose');

const stopSchema = mongoose.Schema(
    {
        route_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Route',
            required: true,
        },
        stop_name: {
            type: String,
            required: [true, 'Please add a stop name'],
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        stop_order: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Stop', stopSchema);
