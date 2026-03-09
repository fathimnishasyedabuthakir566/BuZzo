const mongoose = require('mongoose');

const liveBusLocationSchema = mongoose.Schema(
    {
        bus_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bus',
            required: true,
            unique: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false, // We use updated_at manually or via default
    }
);

module.exports = mongoose.model('LiveBusLocation', liveBusLocationSchema);
