import { PriorityQueue } from "./priorityQueue.js";
import { haversineDistance } from "../geography/distance.js";
import { ShipWeatherInteraction } from "../weather/shipWeatherInteraction.js";

export function timeDependentAStar({
    graph,
    startId,
    targetId,
    ship,
    weatherProvider,
    costEngine,
    departureTime,
    heuristicMultiplier = 1.0
}) {
    const gScore = new Map();
    const fScore = new Map();
    const previous = new Map();
    const arrivalTime = new Map();
    const edgeMetrics = new Map();

    const priorityQueue = new PriorityQueue();

    for (const id of graph.nodes.keys()) {
        gScore.set(id, Infinity);
        fScore.set(id, Infinity);
        previous.set(id, null);
        arrivalTime.set(id, null);
        edgeMetrics.set(id, null);
    }

    const startNode = graph.getNode(startId);
    const targetNode = graph.getNode(targetId);

    if (!startNode || !targetNode) {
        throw new Error(
            "Start or target node does not exist."
        );
    }

    gScore.set(startId, 0);
    arrivalTime.set(startId, departureTime);

    const startHeuristic = calculateHeuristic(
        startNode.node.coordinate,
        targetNode.node.coordinate,
        ship,
        "time"
    );

    fScore.set(startId, startHeuristic * heuristicMultiplier);
    priorityQueue.enqueue(startId, fScore.get(startId));

    while (!priorityQueue.isEmpty()) {
        const current = priorityQueue.dequeue();
        const currentId = current.element;

        if (currentId === targetId) {
            break;
        }

        const currentFScore = fScore.get(currentId);
        if (current !== null && current.priority > currentFScore) {
            continue;
        }

        const currentTime = arrivalTime.get(currentId);
        const currentNode = graph.getNode(currentId);

        for (const edge of currentNode.edges) {
            const neighborNode = graph.getNode(edge.to);
            if (!neighborNode) continue;

            const coord = currentNode.node.coordinate;
            const weatherAtCurrent = weatherProvider.getWeather(
                coord.lat !== undefined ? coord.lat : coord.latitude,
                coord.lon !== undefined ? coord.lon : coord.longitude,
                currentTime
            );

            const travelDirection = calculateBearing(
                currentNode.node.coordinate,
                neighborNode.node.coordinate
            );

            const interaction = new ShipWeatherInteraction(ship, weatherAtCurrent);
            const evaluation = interaction.evaluate(edge.weight, travelDirection);

            if (!evaluation.feasible) {
                continue;
            }

            const tentativeGScore = gScore.get(currentId) + evaluation.travelTime;

            if (tentativeGScore < gScore.get(edge.to)) {
                previous.set(edge.to, currentId);
                gScore.set(edge.to, tentativeGScore);
                arrivalTime.set(edge.to, new Date(currentTime.getTime() + evaluation.travelTime * 3600000));

                const metrics = edgeMetrics.get(currentId) || [];
                metrics.push({
                    from: currentId,
                    to: edge.to,
                    travelTime: evaluation.travelTime,
                    fuel: evaluation.fuel,
                    effectiveSpeed: evaluation.effectiveSpeed,
                    weather: weatherAtCurrent
                });
                edgeMetrics.set(edge.to, metrics);

                const heuristic = calculateHeuristic(
                    neighborNode.node.coordinate,
                    targetNode.node.coordinate,
                    ship,
                    "time"
                );

                const newFScore = tentativeGScore + heuristic * heuristicMultiplier;
                fScore.set(edge.to, newFScore);
                priorityQueue.enqueue(edge.to, newFScore);
            }
        }
    }

    const path = [];
    let current = targetId;

    while (current !== null) {
        path.unshift(current);
        current = previous.get(current);
    }

    if (path.length === 1 && path[0] !== startId) {
        return {
            path: [],
            distance: Infinity,
            totalTime: Infinity,
            totalFuel: Infinity,
            metrics: []
        };
    }

    const metrics = edgeMetrics.get(targetId) || [];
    const totalTime = gScore.get(targetId);
    const totalFuel = metrics.reduce((sum, m) => sum + m.fuel, 0);

    return {
        path,
        distance: haversineDistance(
            startNode.node.coordinate,
            targetNode.node.coordinate
        ),
        totalTime,
        totalFuel,
        metrics,
        arrivalTime: arrivalTime.get(targetId)
    };
}

function calculateHeuristic(coord1, coord2, ship, objective) {
    const distance = haversineDistance(coord1, coord2);

    if (objective === "time") {
        const maxSpeed = ship.cruisingSpeed * 1.852;
        return maxSpeed > 0 ? distance / maxSpeed : Infinity;
    }

    return distance;
}

function calculateBearing(from, to) {
    const fromLat = from.lat !== undefined ? from.lat : from.latitude;
    const fromLon = from.lon !== undefined ? from.lon : from.longitude;
    const toLat = to.lat !== undefined ? to.lat : to.latitude;
    const toLon = to.lon !== undefined ? to.lon : to.longitude;

    const lat1 = fromLat * Math.PI / 180;
    const lat2 = toLat * Math.PI / 180;
    const deltaLon = (toLon - fromLon) * Math.PI / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
}
