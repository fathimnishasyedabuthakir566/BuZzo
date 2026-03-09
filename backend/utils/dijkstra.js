/**
 * Dijkstra's algorithm to find the shortest path between nodes in a graph.
 * @param {Object} graph - Adjacency list representation: { node1: { neighbor1: weight, neighbor2: weight }, ... }
 * @param {string} startNode - The starting node.
 * @param {string} endNode - The destination node.
 * @returns {Object} { path: string[], distance: number }
 */
const dijkstra = (graph, startNode, endNode) => {
    const distances = {};
    const prev = {};
    const nodes = new Set();

    for (let node in graph) {
        distances[node] = Infinity;
        prev[node] = null;
        nodes.add(node);
    }
    distances[startNode] = 0;

    while (nodes.size > 0) {
        let closestNode = null;
        for (let node of nodes) {
            if (closestNode === null || distances[node] < distances[closestNode]) {
                closestNode = node;
            }
        }

        if (distances[closestNode] === Infinity || closestNode === endNode) {
            break;
        }

        nodes.delete(closestNode);

        for (let neighbor in graph[closestNode]) {
            let alt = distances[closestNode] + graph[closestNode][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = closestNode;
            }
        }
    }

    const path = [];
    let u = endNode;
    if (prev[u] || u === startNode) {
        while (u) {
            path.unshift(u);
            u = prev[u];
        }
    }

    return {
        path: path.length > 1 || path[0] === startNode ? path : [],
        distance: distances[endNode] === Infinity ? 0 : distances[endNode]
    };
};

module.exports = dijkstra;
