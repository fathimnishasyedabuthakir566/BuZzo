const Bus = require('../models/busModel');
const { getDistance } = require('./routeUtils');

/**
 * Builds an adjacency list graph from all buses and their intermediate stops.
 * @returns {Object} Graph: { stopName: { neighborName: distance } }
 */
const buildGraphFromBuses = async () => {
    const buses = await Bus.find({});
    const graph = {};

    buses.forEach(bus => {
        const stops = bus.intermediateStops.sort((a, b) => a.order - b.order);
        
        for (let i = 0; i < stops.length - 1; i++) {
            const current = stops[i];
            const next = stops[i+1];
            
            if (!graph[current.name]) graph[current.name] = {};
            if (!graph[next.name]) graph[next.name] = {};

            const dist = getDistance(current.lat, current.lng, next.lat, next.lng);

            // In a bus network, paths are often directed, but for "shortest path between stops"
            // we might treat it as undirected if buses run both ways or if we just want connectivity.
            // Choosing directed for now as routes are usually one-way sequences.
            graph[current.name][next.name] = Math.min(graph[current.name][next.name] || Infinity, dist);
        }
    });

    return graph;
};

module.exports = { buildGraphFromBuses };
