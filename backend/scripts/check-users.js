const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const checkUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const users = await User.find({});

        console.log('\n=== CURRENT USERS IN DATABASE ===');
        if (users.length === 0) {
            console.log('No users found yet.');
        } else {
            users.forEach(user => {
                console.log(`- Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
            });
        }
        console.log('=================================\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

checkUsers();
