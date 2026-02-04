const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, city, profilePhoto } = req.body;

    console.log('Register Request:', { name, email, role });

    if (!name || !email || !password) {
        console.log('Error: Missing fields');
        res.status(400);
        throw new Error('Please add all fields');
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
        password, // Note: Password should be hashed in a real app
        role,
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
            token: null, // Placeholder for JWT
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

    if (!user) {
        console.log('User not found:', email);
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Basic check without hash for now
    if (user.password === password) {
        console.log('Login successful for:', email);
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            city: user.city,
            profilePhoto: user.profilePhoto,
            token: null, // Placeholder for JWT
        });
    } else {
        console.log('Password mismatch for:', email);
        res.status(401);
        throw new Error('Invalid credentials');
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
    getMe,
    updateUserProfile,
    uploadProfileImage,
};
