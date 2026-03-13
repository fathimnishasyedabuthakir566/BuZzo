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
            type: String, // Optional for Google Auth users
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Allows multiple null values
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN', 'DRIVER'],
            default: 'USER',
            uppercase: true, // Automatically convert to uppercase
        },
        phone: {
            type: String, // Optional for Google users
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
        // --- DRIVER SPECIFIC FIELDS ---
        licenseNumber: { type: String },
        assignedRoute: { type: String },
        totalTrips: { type: Number, default: 0 },
        totalDistance: { type: Number, default: 0 }, // in km
        drivingHours: { type: Number, default: 0 }, // in hours
        lastTripTime: { type: Date },
        emergencyContact: { type: String },
        availabilityStatus: { 
            type: String, 
            enum: ['Available', 'On Trip', 'Offline'],
            default: 'Offline'
        },
        // --- PASSENGER SPECIFIC FIELDS ---
        favoriteRoutes: [{ type: String }],
        travelHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }], // Array of trip references
        // --- ADMIN SPECIFIC FIELDS ---
        department: { type: String },

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
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Add indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
