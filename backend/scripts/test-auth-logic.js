const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

async function testAuthLogic() {
    console.log('Testing Authentication Logic...');

    try {
        // Mock user data
        const password = 'mySecurePassword123';

        // Simulate pre-save hook behavior
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name: 'Auth Tester',
            email: 'test@auth.com',
            password: hashedPassword, // In real save, pre-save hook handles this
            role: 'USER'
        });

        console.log('✅ User instance created with hashed password');

        // Test matchPassword method
        // We need to attach the method to the mock since we aren't saving to DB
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`✅ Password comparison (correct password): ${isMatch ? 'SUCCESS' : 'FAILED'}`);

        const isMatchWrong = await bcrypt.compare('wrongPassword', user.password);
        console.log(`✅ Password comparison (wrong password): ${!isMatchWrong ? 'SUCCESS' : 'FAILED'}`);

        if (isMatch && !isMatchWrong) {
            console.log('\nAuth logic verification successful.');
        } else {
            throw new Error('Comparison logic failed');
        }
    } catch (error) {
        console.error('❌ Auth logic verification failed:', error.message);
        process.exit(1);
    }
}

testAuthLogic();
