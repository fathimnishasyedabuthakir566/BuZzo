const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, city, profilePhoto } = req.body;

    console.log('Register Request:', { name, email, role });

    if (!name || !email || !password || !phone) {
        console.log('Error: Missing fields');
        res.status(400);
        throw new Error('Please add all fields including phone number');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'USER', // Default role is USER
        phone,
        city,
        profilePhoto
    });

    if (user) {
        console.log('User registered successfully:', user.email);
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            city: user.city,
            profilePhoto: user.profilePhoto,
            token: generateToken(user._id),
        });
    } else {
        console.log('User registration failed');
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Check for user email
    const user = await User.findOne({ email });

    if (user && user.isBlocked) {
        res.status(403);
        throw new Error('This account has been blocked. Please contact support.');
    }

    if (user && (await user.matchPassword(password))) {
        console.log('Login successful for:', email);

        // Update activity
        user.lastActive = new Date();
        user.loginHistory.push({
            ip: req.ip,
            device: req.headers['user-agent']
        });
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            city: user.city,
            profilePhoto: user.profilePhoto,
            token: generateToken(user._id),
        });
    } else {
        console.log('Authentication failed for:', email);
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Authenticate with Google
// @route   POST /api/users/google-login
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { token, role } = req.body;

    if (!token) {
        res.status(400);
        throw new Error('Google token is missing');
    }

    try {
        // Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists: update googleId if not present, and handle login
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.profilePhoto) user.profilePhoto = picture;
                await user.save();
            }

            if (user.isBlocked) {
                res.status(403);
                throw new Error('This account has been blocked. Please contact support.');
            }

            console.log('Google Login successful for existing user:', email);
        } else {
            // User does not exist: Create a new user account
            console.log('Creating new user from Google Login:', email);
            user = await User.create({
                name,
                email,
                googleId,
                profilePhoto: picture,
                role: role || 'USER', // Ensure role fallback
                // Phone is not provided by Google, will be skipped or asked later
            });
        }

        // Update login history
        user.lastActive = new Date();
        user.loginHistory.push({
            ip: req.ip,
            device: req.headers['user-agent'] || 'Google Auth'
        });
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            city: user.city,
            profilePhoto: user.profilePhoto,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error('Google token verification failed:', error);
        res.status(401);
        throw new Error('Google authentication failed - invalid token');
    }
});

// @desc    Get user activity (Admin)
// @route   GET /api/users/activity
// @access  Private (Admin)
const getUserActivity = asyncHandler(async (req, res) => {
    const users = await User.find({}, 'name email role phone lastActive loginHistory isBlocked').sort('-lastActive');
    res.json(users);
});

// @desc    Block user
// @route   POST /api/users/:id/block
// @access  Private (Admin)
const blockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isBlocked = true;
        await user.save();
        res.json({ message: 'User blocked' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Unblock user
// @route   POST /api/users/:id/unblock
// @access  Private (Admin)
const unblockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isBlocked = false;
        await user.save();
        res.json({ message: 'User unblocked' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.body.id); // In real app, get from req.user.id

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.city = req.body.city || user.city;
        user.profilePhoto = req.body.profilePhoto || user.profilePhoto;
        user.assignedBus = req.body.assignedBus || user.assignedBus;

        // Role specific profile updates
        if (req.body.licenseNumber) user.licenseNumber = req.body.licenseNumber;
        if (req.body.emergencyContact) user.emergencyContact = req.body.emergencyContact;
        if (req.body.availabilityStatus) user.availabilityStatus = req.body.availabilityStatus;
        if (req.body.department) user.department = req.body.department;
        if (req.body.favoriteRoutes) user.favoriteRoutes = req.body.favoriteRoutes;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            city: updatedUser.city,
            profilePhoto: updatedUser.profilePhoto,
            assignedBus: updatedUser.assignedBus,
            token: null,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Upload profile image
// @route   POST /api/users/upload-image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image');
    }

    const { userId } = req.body; // In real app, get from req.user.id
    const user = await User.findById(userId);

    if (user) {
        const imageUrl = `/uploads/${req.file.filename}`;
        user.profilePhoto = imageUrl;
        await user.save();

        res.json({
            _id: user._id,
            profilePhoto: imageUrl,
            message: 'Image uploaded successfully'
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'User data display' });
});

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    updateUserProfile,
    uploadProfileImage,
    getUserActivity,
    blockUser,
    unblockUser,
};
