const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/userModel');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const users = await User.find({});
        console.log('Total users found:', users.length);
        
        users.forEach(user => {
            console.log(`Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
        });
        
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUsers();
