// Helper to calculate distance between two coordinates in KM
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

// Function to find nearest, current and next stops
const calculateStops = (currentLat, currentLng, stops) => {
    if (!stops || stops.length === 0) return { currentStop: null, nextStop: null };

    let nearestStopIndex = -1;
    let minDistance = Infinity;

    // Find the nearest stop
    stops.forEach((stop, index) => {
        const dist = getDistance(currentLat, currentLng, stop.lat, stop.lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestStopIndex = index;
        }
    });

    const nearestStop = stops[nearestStopIndex];

    // Simple logic:
    // If distance to nearest stop is small (< 0.5km), consider the bus AT that stop or just passed it.
    // Last Passed Stop is the nearest stop (if we assume the bus has reached it)
    // Next Stop is the one with order + 1

    let lastPassed = nearestStop.name;
    let next = "Destination";

    // Find the stop with order immediately after the nearest stop's order
    const nextStopObj = stops.find(s => s.order === nearestStop.order + 1);
    if (nextStopObj) {
        next = nextStopObj.name;
    } else if (nearestStop.order === Math.max(...stops.map(s => s.order))) {
        // We are at the last stop
        next = "Trip Completed";
    }

    return {
        currentStop: lastPassed,
        nextStop: next
    };
};

module.exports = { calculateStops };
