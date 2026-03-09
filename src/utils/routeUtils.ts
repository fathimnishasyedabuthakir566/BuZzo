/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculates the Estimated Time of Arrival (ETA) in minutes.
 * @param distance Distance in kilometers
 * @param averageSpeed Average speed in km/h (default is 40 km/h)
 * @returns ETA in minutes
 */
export const calculateETA = (distance: number, averageSpeed: number = 40): number => {
    if (distance <= 0) return 0;
    const timeInHours = distance / averageSpeed;
    return Math.round(timeInHours * 60);
};

/**
 * Formats ETA minutes into a human-readable string.
 * @param minutes ETA in minutes
 * @returns Formatted string (e.g., "12 mins", "1 hr 5 mins")
 */
export const formatETA = (minutes: number): string => {
    if (minutes < 1) return "Arriving";
    if (minutes < 60) return `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
};

/**
 * Graph interface for Dijkstra
 */
export interface Graph {
    [key: string]: { [key: string]: number };
}

/**
 * Dijkstra algorithm to find the shortest distance from start node to all other nodes.
 * @param graph Graph represented as an adjacency list with weights
 * @param start Starting node key
 * @returns Object with distances and previous nodes for path reconstruction
 */
export const dijkstra = (graph: Graph, start: string) => {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const visited = new Set<string>();
    const nodes = Object.keys(graph);

    for (const node of nodes) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;

    while (visited.size < nodes.length) {
        let closestNode = null;
        let shortestDistance = Infinity;

        for (const node of nodes) {
            if (!visited.has(node) && distances[node] < shortestDistance) {
                closestNode = node;
                shortestDistance = distances[node];
            }
        }

        if (closestNode === null || shortestDistance === Infinity) break;

        visited.add(closestNode);

        for (const neighbor in graph[closestNode]) {
            const distance = graph[closestNode][neighbor];
            const newDistance = distances[closestNode] + distance;

            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = closestNode;
            }
        }
    }

    return { distances, previous };
};

/**
 * Reconstructs the shortest path from start to end using Dijkstra's results.
 * @param previous Previous nodes map from dijkstra function
 * @param end Destination node key
 * @returns Ordered array of node keys
 */
export const getShortestPath = (previous: { [key: string]: string | null }, end: string): string[] => {
    const path: string[] = [];
    let current: string | null = end;

    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    return path.length > 1 || path[0] === end ? path : [];
};

/**
 * Finds the nearest bus stop from the user's current location.
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @param stops Array of bus stops
 * @returns The nearest stop object
 */
export const findNearestStop = (
    userLat: number,
    userLng: number,
    stops: { name: string; lat: number; lng: number; order: number }[]
) => {
    if (!stops || stops.length === 0) return null;

    let nearest = stops[0];
    let minDistance = calculateDistance(userLat, userLng, stops[0].lat, stops[0].lng);

    for (let i = 1; i < stops.length; i++) {
        const dist = calculateDistance(userLat, userLng, stops[i].lat, stops[i].lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearest = stops[i];
        }
    }

    return { ...nearest, distance: minDistance };
};

/**
 * Calculates walking time in minutes based on distance.
 * @param distance Distance in kilometers
 * @param walkingSpeed Walking speed in km/h (default is 5 km/h)
 * @returns Walking time in minutes
 */
export const calculateWalkingTime = (distance: number, walkingSpeed: number = 5): number => {
    if (distance <= 0) return 0;
    const timeInHours = distance / walkingSpeed;
    return Math.ceil(timeInHours * 60);
};
/**
 * Calculates the total distance of a route from a specific stop index to the end.
 * @param stops Array of bus stops
 * @param startIndex Index to start from
 * @returns Total distance in kilometers
 */
export const calculateRouteDistance = (
    stops: { lat: number; lng: number; order: number }[],
    startIndex: number
): number => {
    if (!stops || startIndex < 0 || startIndex >= stops.length - 1) return 0;
    
    let total = 0;
    const sortedStops = [...stops].sort((a, b) => a.order - b.order);
    
    for (let i = startIndex; i < sortedStops.length - 1; i++) {
        total += calculateDistance(
            sortedStops[i].lat,
            sortedStops[i].lng,
            sortedStops[i + 1].lat,
            sortedStops[i + 1].lng
        );
    }
    
    return total;
};
