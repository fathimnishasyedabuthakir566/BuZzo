const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
            enum: ['USER', 'ADMIN', 'DRIVER'],
            default: 'USER',
            uppercase: true, // Automatically convert to uppercase
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number'],
        },
        isBlocked: {
            type: Boolean,
            default: false,
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

// Match user-entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Add indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
