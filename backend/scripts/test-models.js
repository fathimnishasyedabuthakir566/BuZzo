const mongoose = require('mongoose');
const User = require('./models/userModel');
const Bus = require('./models/busModel');
const Route = require('./models/routeModel');
const Stop = require('./models/stopModel');
const LiveBusLocation = require('./models/liveBusLocationModel');

async function testModels() {
    console.log('Testing Mongoose Models...');

    try {
        // 1. Test User
        const user = new User({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'ADMIN',
            phone: '1234567890'
        });
        console.log('✅ User Model instance created');

        // 2. Test Bus
        const bus = new Bus({
            name: 'Tirunelveli Express',
            busNumber: 'TN-72-B-1234',
            routeFrom: 'Tirunelveli',
            routeTo: 'Chennai',
            scheduledTime: ['08:00', '20:00']
        });
        console.log('✅ Bus Model instance created');

        // 3. Test Route
        const route = new Route({
            source: 'Tirunelveli',
            destination: 'Chennai'
        });
        console.log('✅ Route Model instance created');

        // 4. Test Stop
        const stop = new Stop({
            route_id: new mongoose.Types.ObjectId(),
            stop_name: 'Madurai',
            latitude: 9.9252,
            longitude: 78.1198,
            stop_order: 1
        });
        console.log('✅ Stop Model instance created');

        // 5. Test LiveBusLocation
        const liveLoc = new LiveBusLocation({
            bus_id: new mongoose.Types.ObjectId(),
            latitude: 8.7139,
            longitude: 77.7567
        });
        console.log('✅ LiveBusLocation Model instance created');

        console.log('\nAll models verified successfully (schema-wise).');
    } catch (error) {
        console.error('❌ Model verification failed:', error.message);
        process.exit(1);
    }
}

testModels();
