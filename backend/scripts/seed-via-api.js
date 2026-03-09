const http = require('http');

const createBus = (name, number, from, to, times, platform, type, service, depot, via, stops = [], ac = false, status = 'on-time') => ({
    name,
    busNumber: number,
    routeFrom: from,
    routeTo: to,
    scheduledTime: Array.isArray(times) ? times : [times],
    platformNumber: platform,
    busType: type,
    serviceType: service,
    depot: depot,
    via: via || [],
    intermediateStops: stops,
    driverName: "City Driver",
    driverPhone: "9876543210",
    conductorName: "Staff",
    conductorPhone: "9876543211",
    capacity: 45,
    ac,
    status
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

const tenkasiStops = [
    { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
    { name: "Alangulam", lat: 8.8741, lng: 77.5025, order: 2 },
    { name: "Tenkasi", lat: 8.9594, lng: 77.3037, order: 3 }
];

const maduraiStops = [
    { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
    { name: "Kovilpatti", lat: 9.1700, lng: 77.8700, order: 2 },
    { name: "Sattur", lat: 9.3500, lng: 77.9300, order: 3 },
    { name: "Virudhunagar", lat: 9.5800, lng: 77.9500, order: 4 },
    { name: "Madurai BS", lat: 9.9252, lng: 78.1198, order: 5 }
];


const buses = [
    // --- PLATFORM 1: Nagercoil & Kanyakumari ---
    // Nagercoil - End to End
    createBus(
        "Nagercoil End-to-End",
        "TN 72 N 1801",
        "Tirunelveli",
        "Nagercoil",
        ["05:40", "06:00", "06:20", "06:40", "07:00", "07:20", "07:40", "08:00", "08:20", "08:40"],
        1,
        "Mofussil",
        "1to1",
        "Ranithottam",
        ["Nanguneri", "Valliyur", "Panagudi"],
        nagercoilStops
    ),
    // Nagercoil - AC
    createBus(
        "Nagercoil AC",
        "TN 72 N 2205",
        "Tirunelveli",
        "Nagercoil",
        ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"],
        1,
        "AC",
        "EAC",
        "Ranithottam",
        ["Nanguneri", "Valliyur"],
        nagercoilStops,
        true
    ),
    // Kanyakumari - Deluxe
    createBus(
        "Kanyakumari Deluxe",
        "TN 72 N 1555",
        "Tirunelveli",
        "Kanyakumari",
        ["06:00", "08:30", "10:30", "12:30", "14:30", "16:30"],
        1,
        "Deluxe",
        "Express",
        "Kanyakumari",
        ["Nagercoil", "Suchindram"],
        nagercoilStops
    ),

    // --- PLATFORM 2: Tiruchendur & Tuticorin via Srivaikuntam ---
    // Tiruchendur - BPR
    createBus(
        "Tiruchendur BPR",
        "TN 72 N 1680",
        "Tirunelveli",
        "Tiruchendur",
        ["05:30", "06:30", "07:30", "08:30", "09:30", "10:30"],
        2,
        "Mofussil",
        "BPR",
        "Tiruchendur",
        ["Srivaikuntam", "Alwarthirunagari", "Kurumbur"],
        tiruchendurStops
    ),
    // Udangudi via Nazareth
    createBus(
        "Udangudi via Nazareth",
        "TN 72 N 1345",
        "Tirunelveli",
        "Udangudi",
        ["07:00", "12:00", "17:00"],
        2,
        "Town Bus",
        "Ordinary",
        "Tiruchendur",
        ["Nazareth", "Sathankulam"],
        tiruchendurStops
    ),

    // --- PLATFORM 3: Tuticorin (Direct) & Rameswaram ---
    // Tuticorin - End to End
    createBus(
        "Tuticorin End-to-End",
        "TN 72 N 1950",
        "Tirunelveli",
        "Thoothukudi",
        ["05:00", "05:15", "05:30", "05:45", "06:00", "06:15", "06:30"],
        3,
        "Mofussil",
        "1to1",
        "Thoothukudi City",
        ["Vasavappapuram"],
        [{ name: "Tirunelveli", lat: 8.7139, lng: 77.7567, order: 1 }, { name: "Thoothukudi", lat: 8.8100, lng: 78.1400, order: 2 }]
    ),
    // Rameswaram - Express
    createBus(
        "Rameswaram Express",
        "TN 72 N 2100",
        "Tirunelveli",
        "Rameshwaram",
        ["06:00", "13:00", "20:00"],
        3,
        "Express",
        "Express",
        "Rameshwaram",
        ["Thoothukudi", "Sayalkudi", "Ramanathapuram"],
        [{ name: "Tirunelveli", lat: 8.7139, lng: 77.7567, order: 1 }, { name: "Rameshwaram", lat: 9.2881, lng: 79.3129, order: 2 }]
    ),

    // --- PLATFORM 4: Tenkasi, Sengottai, Papanasam ---
    // Tenkasi - Point to Point
    createBus(
        "Tenkasi P2P",
        "TN 72 N 1400",
        "Tirunelveli",
        "Tenkasi",
        ["05:10", "05:40", "06:10", "06:40", "07:10"],
        4,
        "Mofussil",
        "1to1",
        "Tenkasi",
        ["Alangulam"],
        tenkasiStops
    ),
    // Papanasam - Town Bus
    createBus(
        "Papanasam Town",
        "TN 72 N 1290",
        "Tirunelveli",
        "Papanasam",
        ["06:30", "09:30", "12:30", "15:30", "18:30"],
        4,
        "Town Bus",
        "Ordinary",
        "Ambasamudram",
        ["Cheranmahadevi", "Ambasamudram"],
        [{ name: "Tirunelveli", lat: 8.7139, lng: 77.7567, order: 1 }, { name: "Papanasam", lat: 8.7000, lng: 77.3800, order: 2 }]
    ),
    // Coutrallam Special
    createBus(
        "Coutrallam Special",
        "TN 72 N 1450",
        "Tirunelveli",
        "Coutrallam",
        ["08:00", "10:00", "14:00"],
        4,
        "Deluxe",
        "Special",
        "Tenkasi",
        ["Alangulam", "Tenkasi"],
        tenkasiStops
    ),

    // --- PLATFORM 5: Madurai, Trichy, Coimbatore ---
    // Madurai - BPR
    createBus(
        "Madurai BPR",
        "TN 72 N 2005",
        "Tirunelveli",
        "Madurai",
        ["05:00", "06:00", "07:00", "08:00", "09:00", "10:00"],
        5,
        "Mofussil",
        "BPR",
        "Bypass",
        ["Virudhunagar"],
        maduraiStops
    ),
    // Coimbatore - Ultra Deluxe
    createBus(
        "Coimbatore Ultra Deluxe",
        "TN 72 N 2500",
        "Tirunelveli",
        "Coimbatore",
        ["20:00", "21:00", "22:00"],
        5,
        "Ultra Deluxe",
        "Express",
        "Tirenelveli",
        ["Madurai", "Dindigul", "Palani", "Pollachi"],
        maduraiStops
    ),

    // --- PLATFORM 6: Chennai (SETC) ---
    // Chennai - AC
    createBus(
        "Chennai AC Sleeper",
        "TN 01 N 1001",
        "Tirunelveli",
        "Chennai",
        ["18:00", "19:00", "20:00"],
        6,
        "AC",
        "Express",
        "Chennai - Koyambedu",
        ["Madurai", "Trichy", "Villupuram"],
        maduraiStops, // Reusing Madurai stops as base
        true
    ),
    // Chennai - Non AC
    createBus(
        "Chennai Ultra Deluxe",
        "TN 01 N 1050",
        "Tirunelveli",
        "Chennai",
        ["14:00", "16:00", "17:30", "21:30"],
        6,
        "Ultra Deluxe",
        "Express",
        "Chennai - Koyambedu",
        ["Madurai", "Trichy", "Melmaruvathur"],
        maduraiStops
    )
];

function postBus(busData) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(busData);
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: '/api/buses',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    resolve(true);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function seedViaAPI() {
    console.log(`Seeding ${buses.length} buses via API...`);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < buses.length; i++) {
        try {
            await postBus(buses[i]);
            success++;
            if (success % 5 === 0) console.log(`  Progress: ${success}/${buses.length}`);
        } catch (e) {
            failed++;
            // If bus already exists, that's OK
            if (!e.message.includes('already exists') && !e.message.includes('E11000')) {
                console.error(`  Failed bus ${buses[i].busNumber}: ${e.message}`);
            } else {
                console.log(`  Skipped (Duplicate): ${buses[i].busNumber}`);
            }
        }
    }

    console.log(`\nDone! Created: ${success}, Skipped/Failed: ${failed}`);
}

seedViaAPI();
