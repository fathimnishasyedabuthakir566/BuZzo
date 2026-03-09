const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Bus = require('./models/busModel');

dotenv.config({ path: path.join(__dirname, '.env') });

const createBus = (data) => ({
    name: data.name,
    busNumber: data.busNumber,
    routeFrom: data.routeFrom,
    routeTo: data.routeTo,
    scheduledTime: Array.isArray(data.time) ? data.time : [data.time],
    platformNumber: data.platform,
    intermediateStops: data.stops || [],
    busType: data.busType || 'Mofussil',
    serviceType: data.serviceType || 'Ordinary',
    depot: data.depot || 'Tirunelveli',
    via: data.via || [],
    driverName: "City Driver",
    driverPhone: "9876543210",
    conductorName: "Staff",
    conductorPhone: "9876543211",
    capacity: data.capacity || 45,
    ac: data.ac || false,
    status: data.status || 'Not running',
    isActive: true,
    location: {
        lat: 8.7139 + (Math.random() - 0.5) * 0.05,
        lng: 77.7567 + (Math.random() - 0.5) * 0.05,
        lastUpdated: new Date()
    }
});

const stops = {
    nagercoil: [
        { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
        { name: "Nanguneri", lat: 8.4904, lng: 77.6534, order: 2 },
        { name: "Valliyur", lat: 8.3846, lng: 77.6167, order: 3 },
        { name: "Panagudi", lat: 8.3245, lng: 77.5812, order: 4 },
        { name: "Nagercoil BS", lat: 8.1833, lng: 77.4119, order: 5 }
    ],
    tiruchendur: [
        { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
        { name: "Srivaikuntam", lat: 8.6315, lng: 77.9100, order: 2 },
        { name: "Alwarthirunagari", lat: 8.6012, lng: 77.9400, order: 3 },
        { name: "Nazareth", lat: 8.5600, lng: 77.9700, order: 4 },
        { name: "Tiruchendur BS", lat: 8.4842, lng: 78.1250, order: 5 }
    ],
    thoothukudi: [
        { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
        { name: "Vagaikulam", lat: 8.7500, lng: 77.9500, order: 2 },
        { name: "Thoothukudi BS", lat: 8.8100, lng: 78.1400, order: 3 }
    ],
    tenkasi: [
        { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
        { name: "Alangulam", lat: 8.8741, lng: 77.5025, order: 2 },
        { name: "Tenkasi BS", lat: 8.9594, lng: 77.3135, order: 3 }
    ],
    madurai: [
        { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
        { name: "Kovilpatti", lat: 9.1700, lng: 77.8700, order: 2 },
        { name: "Virudhunagar", lat: 9.5800, lng: 77.9500, order: 3 },
        { name: "Madurai BS", lat: 9.9252, lng: 78.1198, order: 4 }
    ]
};

const busesData = [
    // --- PLATFORM 1: Nagercoil, Kanyakumari, Thisiyanvilai ---
    createBus({
        name: "Nagercoil (AC)",
        busNumber: "TN 72 N 565",
        routeFrom: "Tirunelveli",
        routeTo: "Nagercoil",
        time: ["05:40", "06:00", "06:20", "06:40", "07:20", "07:40", "08:00", "08:20", "09:10", "09:30", "09:50", "10:10", "10:40", "11:00", "11:20", "11:40", "12:30", "12:50", "13:10", "13:30", "14:00", "14:20", "14:40", "15:00", "15:50", "16:10", "16:30", "16:50", "17:20", "17:40", "18:00", "18:20", "19:10", "19:30", "19:50", "20:10", "20:40", "21:00", "21:20", "21:40"],
        platform: 1,
        stops: stops.nagercoil,
        busType: "AC",
        serviceType: "Express",
        via: ["Nanguneri"]
    }),
    createBus({
        name: "501 Kanyakumari",
        busNumber: "TN 72 K 501",
        routeFrom: "Tirunelveli",
        routeTo: "Kanyakumari",
        time: ["09:15", "10:15", "12:00", "14:15", "15:10", "18:10", "19:00", "19:15"],
        platform: 1,
        stops: stops.nagercoil,
        busType: "Mofussil",
        via: ["Nanguneri", "Valliyur", "Anjugramam"]
    }),
    createBus({
        name: "173-DLX Thisiyanvilai",
        busNumber: "TN 72 D 173",
        routeFrom: "Tirunelveli",
        routeTo: "Thisiyanvilai",
        time: ["07:30", "08:00", "08:40", "10:10", "11:30", "13:00", "14:20", "16:10", "17:30", "19:00", "19:10", "20:10"],
        platform: 1,
        stops: [{ name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 }, { name: "Nanguneri", lat: 8.4904, lng: 77.6534, order: 2 }, { name: "Thisiyanvilai", lat: 8.3512, lng: 77.8541, order: 3 }],
        busType: "Deluxe",
        serviceType: "1to1"
    }),

    // --- PLATFORM 2: Tiruchendur, Kayalpattinam ---
    createBus({
        name: "134 Kayalpattinam",
        busNumber: "TN 72 T 134",
        routeFrom: "Tirunelveli",
        routeTo: "Kayalpattinam",
        time: ["04:30", "05:20", "05:50", "07:35", "09:20", "09:45", "11:30", "13:10", "14:05", "15:45", "15:50", "16:15", "18:20", "19:20", "20:15", "21:00", "22:00"],
        platform: 2,
        stops: stops.tiruchendur,
        busType: "Mofussil",
        via: ["Tiruchendur", "Arumuganeri"]
    }),
    createBus({
        name: "137 Udangudi",
        busNumber: "TN 72 U 137",
        routeFrom: "Tirunelveli",
        routeTo: "Udangudi",
        time: ["06:30", "06:50", "07:05", "07:20", "08:00", "08:35", "08:55", "09:40", "10:30", "11:00", "12:00", "12:30", "13:10", "14:10", "14:30", "15:00", "15:45", "16:20", "16:55", "18:10", "18:30", "19:05", "20:00", "20:30", "22:00"],
        platform: 2,
        stops: stops.tiruchendur,
        busType: "Mofussil",
        via: ["Nazareth"]
    }),

    // --- PLATFORM 3: Thoothukudi, Rameswaram ---
    createBus({
        name: "150-DLX Thoothukudi 1to1",
        busNumber: "TN 72 T 150",
        routeFrom: "Tirunelveli",
        routeTo: "Thoothukudi",
        time: ["05:00", "05:45", "06:25", "06:55", "07:45", "08:25", "09:15", "09:45", "10:40", "10:55", "11:10", "12:05", "12:35", "13:30", "14:05", "14:55", "15:25", "16:10", "16:55", "17:45", "18:25", "18:45", "19:10", "19:45", "20:35", "21:10"],
        platform: 3,
        stops: stops.thoothukudi,
        busType: "Deluxe",
        serviceType: "1to1",
        via: ["EAC"]
    }),
    createBus({
        name: "675 Rameshwaram",
        busNumber: "TN 72 R 675",
        routeFrom: "Tirunelveli",
        routeTo: "Rameshwaram",
        time: ["06:15", "06:35", "08:10", "10:55", "15:10", "18:45"],
        platform: 3,
        stops: [...stops.thoothukudi, { name: "Rameshwaram", lat: 9.2881, lng: 79.3129, order: 4 }],
        busType: "Mofussil",
        via: ["Thoothukudi", "Ramnad"]
    }),

    // --- PLATFORM 4: Tenkasi, Papanasam ---
    createBus({
        name: "121-DLX Tenkasi 1to1",
        busNumber: "TN 72 T 121",
        routeFrom: "Tirunelveli",
        routeTo: "Tenkasi",
        time: ["06:00", "07:30", "09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"],
        platform: 4,
        stops: stops.tenkasi,
        busType: "Deluxe",
        serviceType: "1to1"
    }),
    createBus({
        name: "124 Surandai",
        busNumber: "TN 72 S 124",
        routeFrom: "Tirunelveli",
        routeTo: "Surandai",
        time: ["05:30", "06:45", "07:10", "07:25", "08:10", "08:35", "09:05", "09:25", "09:55", "10:15", "10:40", "11:00", "11:30", "12:15", "12:45", "13:10", "13:25", "13:45", "14:30", "15:00", "15:20", "16:00", "16:40", "17:20", "18:00", "18:05", "18:15", "19:00", "19:20", "20:00", "20:30", "21:20", "22:30"],
        platform: 4,
        stops: stops.tenkasi,
        busType: "Mofussil",
        via: ["Alangulam"]
    }),
    createBus({
        name: "Papanasam EAC",
        busNumber: "TN 72 P 129",
        routeFrom: "Tirunelveli",
        routeTo: "Papanasam",
        time: ["07:00", "07:50", "08:40", "10:00", "10:50", "11:40", "13:00", "13:50", "14:40", "16:00", "16:50", "17:40", "19:00", "20:00", "21:00"],
        platform: 4,
        stops: [{ name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 }, { name: "Ambasamudram", lat: 8.7100, lng: 77.4500, order: 2 }, { name: "Papanasam", lat: 8.6800, lng: 77.3700, order: 3 }],
        busType: "Express",
        serviceType: "EAC"
    }),

    // --- PLATFORM 5: Madurai, Coimbatore ---
    createBus({
        name: "Madurai BPR",
        busNumber: "TN 72 M 500",
        routeFrom: "Tirunelveli",
        routeTo: "Madurai",
        time: ["01:20", "02:40", "04:30", "05:00", "05:30", "06:05", "07:00", "07:40", "08:30", "08:40", "09:45", "10:00", "10:55", "11:30", "11:40", "11:55", "12:30", "13:10", "13:35", "14:00", "14:40", "15:05", "15:40", "15:45", "16:05", "16:45", "17:00", "17:55", "18:30", "19:30", "20:10", "21:00", "21:40", "22:30", "22:40", "22:50", "23:10", "24:00"],
        platform: 5,
        stops: stops.madurai,
        busType: "Express",
        serviceType: "BPR",
        via: ["Kovilpatti", "Virudhunagar"]
    }),
    createBus({
        name: "502 Vilathikulam",
        busNumber: "TN 72 V 502",
        routeFrom: "Tirunelveli",
        routeTo: "Vilathikulam",
        time: ["06:25", "06:50", "07:20", "07:45", "08:15", "09:00", "09:30", "10:45", "10:55", "12:05", "12:15", "12:50", "13:40", "14:30", "15:20", "15:40", "16:00", "16:20", "17:45", "19:35", "20:40"],
        platform: 5,
        stops: [{ name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 }, { name: "Vilathikulam", lat: 9.1415, lng: 78.1633, order: 2 }],
        busType: "Mofussil"
    }),

    // --- PLATFORM 6: SETC ---
    createBus({
        name: "Chennai Ultra Deluxe",
        busNumber: "TN 01 SETC 3000",
        routeFrom: "Tirunelveli",
        routeTo: "Chennai",
        time: ["16:05", "16:30", "17:20", "18:00", "18:30", "18:45", "19:00", "19:30", "19:45", "20:15", "20:30", "21:30", "22:00"],
        platform: 6,
        stops: [...stops.madurai, { name: "Trichy", lat: 10.7905, lng: 78.7047, order: 5 }, { name: "Chennai", lat: 13.0827, lng: 80.2707, order: 6 }],
        busType: "Ultra Deluxe",
        serviceType: "Express",
        via: ["Madurai", "Trichy"]
    }),
    createBus({
        name: "Bangalore AC Seater",
        busNumber: "TN 01 SETC 8855",
        routeFrom: "Tirunelveli",
        routeTo: "Bangalore",
        time: ["16:00", "18:45"],
        platform: 6,
        stops: [{ name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 }, { name: "Salem", lat: 11.6643, lng: 78.1460, order: 2 }, { name: "Bangalore", lat: 12.9716, lng: 77.5946, order: 3 }],
        busType: "AC",
        serviceType: "Express",
        ac: true,
        via: ["Salem", "Hosur"]
    }),

    // --- JUNCTION BUS STAND (New Request) ---
    // Manur, Alangulam Route
    createBus({ name: "4B Kalakkudi", busNumber: "TN 72 TB 4B", routeFrom: "Junction BS", routeTo: "Kalakkudi", time: "07:25", platform: 0, busType: "Town Bus", serviceType: "Ordinary", via: ["Manur"] }),
    createBus({ name: "4C Reddiarpatti", busNumber: "TN 72 TB 4C", routeFrom: "Junction BS", routeTo: "Reddiarpatti", time: "06:40", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "4D Keezhapillaiyarkulam", busNumber: "TN 72 TB 4D", routeFrom: "Junction BS", routeTo: "Keezhapillaiyarkulam", time: "07:45", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "4G Reddiarpatti", busNumber: "TN 72 TB 4G", routeFrom: "Junction BS", routeTo: "Reddiarpatti", time: "06:40", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "4I Ayyanaruthu", busNumber: "TN 72 TB 4I", routeFrom: "Junction BS", routeTo: "Ayyanaruthu", time: "04:50", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "4H Reddiarpatti School", busNumber: "TN 72 TB 4H", routeFrom: "Junction BS", routeTo: "Reddiarpatti", time: "05:55", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "4J Dhanushkodi Nagar", busNumber: "TN 72 TB 4J", routeFrom: "Junction BS", routeTo: "Dhanushkodi Nagar", time: "05:30", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "4L South Chezhianallur", busNumber: "TN 72 TB 4L", routeFrom: "Junction BS", routeTo: "South Chezhianallur", time: "05:50", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "4M Seethaikurichi", busNumber: "TN 72 TB 4M", routeFrom: "Junction BS", routeTo: "Seethaikurichi", time: "06:30", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),

    // College Routes
    createBus({ name: "5A Arts College", busNumber: "TN 72 TB 5A", routeFrom: "Junction BS", routeTo: "Arts College", time: "15:05", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "5C Azhagiyapandipuram", busNumber: "TN 72 TB 5C", routeFrom: "Junction BS", routeTo: "Azhagiyapandipuram", time: "08:05", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "5D Arts College", busNumber: "TN 72 TB 5D", routeFrom: "Junction BS", routeTo: "Arts College", time: "14:50", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),

    // Vallavankottai, Alangulam, Pudur
    createBus({ name: "6 Vallavankottai", busNumber: "TN 72 TB 6", routeFrom: "Junction BS", routeTo: "Vallavankottai", time: "20:20", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6A Pudur", busNumber: "TN 72 TB 6A-P", routeFrom: "Junction BS", routeTo: "Pudur", time: "06:00", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6A Alangulam", busNumber: "TN 72 TB 6A-A", routeFrom: "Junction BS", routeTo: "Alangulam", time: ["06:00", "10:15", "12:35"], platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6B Alangulam", busNumber: "TN 72 TB 6B", routeFrom: "Junction BS", routeTo: "Alangulam", time: ["07:00", "13:00"], platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6C Vellankulam", busNumber: "TN 72 TB 6C-V", routeFrom: "Junction BS", routeTo: "Vellankulam", time: "07:25", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6C Pudur", busNumber: "TN 72 TB 6C-P", routeFrom: "Junction BS", routeTo: "Pudur", time: ["11:25", "16:35", "18:55"], platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6C Tulukarpatti", busNumber: "TN 72 TB 6C-T", routeFrom: "Junction BS", routeTo: "Tulukarpatti", time: "13:45", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6C Vallavankottai", busNumber: "TN 72 TB 6C-VK", routeFrom: "Junction BS", routeTo: "Vallavankottai", time: "21:10", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),

    // Subramaniapuram, Kasinathapuram
    createBus({ name: "6D Subramaniapuram", busNumber: "TN 72 TB 6D-S", routeFrom: "Junction BS", routeTo: "Subramaniapuram", time: "06:40", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6D Kasinathapuram", busNumber: "TN 72 TB 6D-K", routeFrom: "Junction BS", routeTo: "Kasinathapuram", time: ["06:45", "12:00"], platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6G Tulukarpatti", busNumber: "TN 72 TB 6G-T", routeFrom: "Junction BS", routeTo: "Tulukarpatti", time: "08:30", platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6G Vallavankottai", busNumber: "TN 72 TB 6G-VK", routeFrom: "Junction BS", routeTo: "Vallavankottai", time: ["10:15", "12:00", "14:15", "18:30"], platform: 0, busType: "Town Bus", serviceType: "Ordinary" }),
    createBus({ name: "6G Subramaniapuram", busNumber: "TN 72 TB 6G-S", routeFrom: "Junction BS", routeTo: "Subramaniapuram", time: "16:05", platform: 0, busType: "Town Bus", serviceType: "Ordinary" })
];

const importData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected!');

        await Bus.deleteMany();
        console.log('Cleared existing bus data.');

        await Bus.insertMany(busesData);
        console.log(`${busesData.length} Bus Entries Successfully Imported!`);

        process.exit();
    } catch (error) {
        console.error(`Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

importData();
