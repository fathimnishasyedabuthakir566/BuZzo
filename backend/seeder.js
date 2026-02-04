const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Bus = require('./models/busModel');

dotenv.config({ path: path.join(__dirname, '.env') });

const createBus = (name, number, from, to, time, platform, stops = [], ac = false, status = 'on-time') => ({
    name,
    busNumber: number,
    routeFrom: from,
    routeTo: to,
    scheduledTime: time,
    platformNumber: platform,
    intermediateStops: stops,
    driverName: "City Driver",
    driverPhone: "9876543210",
    conductorName: "Staff",
    conductorPhone: "9876543211",
    capacity: 45,
    ac,
    status,
    isActive: true,
    location: {
        lat: 8.7139 + (Math.random() - 0.5) * 0.05,
        lng: 77.7567 + (Math.random() - 0.5) * 0.05,
        lastUpdated: new Date()
    }
});

const nagercoilStops = [
    { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
    { name: "Nanguneri", lat: 8.4904, lng: 77.6534, order: 2 },
    { name: "Valliyur", lat: 8.3846, lng: 77.6167, order: 3 },
    { name: "Panagudi", lat: 8.3245, lng: 77.5812, order: 4 },
    { name: "Nagercoil BS", lat: 8.1833, lng: 77.4119, order: 5 }
];

const tiruchendurStops = [
    { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
    { name: "Srivaikuntam", lat: 8.6315, lng: 77.9100, order: 2 },
    { name: "Alwarthirunagari", lat: 8.6012, lng: 77.9400, order: 3 },
    { name: "Nazareth", lat: 8.5600, lng: 77.9700, order: 4 },
    { name: "Tiruchendur BS", lat: 8.4842, lng: 78.1250, order: 5 }
];

const buses = [
    // --- PLATFORM 1: Nagercoil, Kanyakumari, Thisiyanvilai ---
    ...["05:40", "06:00", "06:20", "06:40", "07:20", "07:40", "08:00", "08:20", "09:10", "09:30", "09:50", "10:10", "10:40", "11:00", "11:20", "11:40", "12:30", "12:50", "13:10", "13:30", "14:00", "14:20", "14:40", "15:00", "15:50", "16:10", "16:30", "16:50", "17:20", "17:40", "18:00", "18:20", "19:10", "19:30", "19:50", "20:10", "20:40", "21:00", "21:20", "21:40"].map((t, i) =>
        createBus("Nagercoil (AC)", `TN 72 N ${2000 + i}`, "Tirunelveli", "Nagercoil", t, 1, nagercoilStops, true)),

    ...["09:15", "10:15", "12:00", "14:15", "15:10", "18:10", "19:00", "19:15"].map((t, i) =>
        createBus("501 Kanyakumari", `TN 72 K 501${i}`, "Tirunelveli", "Kanyakumari", t, 1, nagercoilStops)),

    ...["07:30", "08:00", "08:40", "10:10", "11:30", "13:00", "14:20", "16:10", "17:30", "19:00", "19:10", "20:10"].map((t, i) =>
        createBus("173-DLX Thisiyanvilai", `TN 72 D 173${i}`, "Tirunelveli", "Thisiyanvilai", t, 1, [
            { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Nanguneri", lat: 8.4904, lng: 77.6534, order: 2 },
            { name: "Thisiyanvilai", lat: 8.3512, lng: 77.8541, order: 3 }
        ])),

    // --- PLATFORM 2: Tiruchendur, Sathankulam, Udangudi ---
    ...["04:30", "05:20", "07:35", "11:30", "14:05", "19:20", "21:00"].map((t, i) =>
        createBus("134 Kaayalpattinam", `TN 72 T 134${i}`, "Tirunelveli", "Kaayalpattinam", t, 2, tiruchendurStops)),

    ...["06:30", "08:35", "10:30", "14:10", "16:55", "19:05", "22:00"].map((t, i) =>
        createBus("137 Udangudi (Nazareth)", `TN 72 U 137${i}`, "Tirunelveli", "Udangudi", t, 2, tiruchendurStops)),

    // --- PLATFORM 3: Thoothukudi, Sankarankovil, Theni ---
    ...["05:00", "06:55", "08:25", "10:40", "12:05", "14:05", "16:10", "18:45", "20:35"].map((t, i) =>
        createBus("150-DLX Thoothukudi", `TN 72 T 150${i}`, "Tirunelveli", "Thoothukudi", t, 3, [
            { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Deivaseyalpuram", lat: 8.7500, lng: 77.9500, order: 2 },
            { name: "Thoothukudi BS", lat: 8.8100, lng: 78.1400, order: 3 }
        ])),

    ...["06:15", "08:10", "10:55", "15:10", "18:45"].map((t, i) =>
        createBus("675 Rameshwaram", `TN 72 R 675${i}`, "Tirunelveli", "Rameshwaram", t, 3, [
            { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Thoothukudi", lat: 8.8100, lng: 78.1400, order: 2 },
            { name: "Rameshwaram", lat: 9.2881, lng: 79.3129, order: 3 }
        ])),

    // --- PLATFORM 4: Tenkasi, Papanasam, Kalakkad ---
    ...["05:30", "07:10", "09:05", "11:00", "13:10", "15:20", "18:00", "20:00"].map((t, i) =>
        createBus("124 Surandai", `TN 72 S 124${i}`, "Tirunelveli", "Surandai", t, 4, [
            { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Alangulam", lat: 8.8741, lng: 77.5025, order: 2 },
            { name: "Surandai", lat: 8.9745, lng: 77.4021, order: 3 }
        ])),

    ...["07:00", "08:40", "10:50", "13:00", "15:20", "17:40", "19:00", "21:00"].map((t, i) =>
        createBus("Papanasam (EAC)", `TN 72 P 129${i}`, "Tirunelveli", "Papanasam", t, 4, [
            { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Ambasamudram", lat: 8.7100, lng: 77.4500, order: 2 },
            { name: "Papanasam", lat: 8.6800, lng: 77.3700, order: 3 }
        ])),

    // --- PLATFORM 5: Madurai, Trichy, Coimbatore ---
    ...["05:00", "07:00", "09:45", "11:30", "13:10", "15:05", "17:00", "19:30", "21:40", "23:10"].map((t, i) =>
        createBus("Madurai (EAC)", `TN 72 M 500${i}`, "Tirunelveli", "Madurai", t, 5, [
            { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Kovilpatti", lat: 9.1700, lng: 77.8700, order: 2 },
            { name: "Sattur", lat: 9.3500, lng: 77.9300, order: 3 },
            { name: "Virudhunagar", lat: 9.5800, lng: 77.9500, order: 4 },
            { name: "Madurai BS", lat: 9.9252, lng: 78.1198, order: 5 }
        ])),

    // --- PLATFORM 6: SETC / Ultra Deluxe ---
    ...["16:05", "18:00", "19:00", "20:30", "22:00"].map((t, i) =>
        createBus("Chennai (Ultra Deluxe)", `TN 01 SETC ${3000 + i}`, "Tirunelveli", "Chennai", t, 6, [
            { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Madurai", lat: 9.9252, lng: 78.1198, order: 2 },
            { name: "Trichy", lat: 10.7905, lng: 78.7047, order: 3 },
            { name: "Chennai", lat: 13.0827, lng: 80.2707, order: 4 }
        ])),

    createBus("Bangalore (AC Seater)", "TN 01 SETC 8855", "Tirunelveli", "Bangalore", "16:00", 6, [
        { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
        { name: "Salem", lat: 11.6643, lng: 78.1460, order: 2 },
        { name: "Hosur", lat: 12.7409, lng: 77.8253, order: 3 },
        { name: "Bangalore", lat: 12.9716, lng: 77.5946, order: 4 }
    ], true)
];

const importData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected!');
        await Bus.deleteMany();
        console.log('Cleared existing bus data.');
        await Bus.insertMany(buses);
        console.log(`${buses.length} Buses Successfully Imported with Intermediate Stops!`);
        process.exit();
    } catch (error) {
        console.error(`Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

importData();
