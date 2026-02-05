const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'driver'],
            default: 'user',
        },
        phone: {
            type: String,
        },
        city: {
            type: String,
        },
        profilePhoto: {
            type: String,
        },
        assignedBus: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bus',
        },
        lastActive: {
            type: Date,
        },
        loginHistory: [{
            timestamp: { type: Date, default: Date.now },
            ip: String,
            device: String
        }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
