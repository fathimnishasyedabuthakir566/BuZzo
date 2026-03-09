const mongoose = require('mongoose');

const routeSchema = mongoose.Schema(
    {
        source: {
            type: String,
            required: [true, 'Please add a source'],
        },
        destination: {
            type: String,
            required: [true, 'Please add a destination'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Route', routeSchema);
