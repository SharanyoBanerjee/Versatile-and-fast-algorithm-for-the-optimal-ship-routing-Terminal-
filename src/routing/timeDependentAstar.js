import { PriorityQueue } from "./priorityQueue.js";
import { haversineDistance } from "../geography/distance.js";
import { getWeather, calculateEffectiveSpeed, calculateSafetyPenalty } from "../weather/weather.js";
import { calculateCost, getProfile } from "../optimization/cost.js";

export function timeDependentAStar({
    graph,
    startId,
    targetId,
    ship,
    departureTime = new Date(),
    profile = "BALANCED"
}) {
    const activeProfile = typeof profile === "string" ? getProfile(profile) : profile;

    const startNode = graph.getNode(startId);
    const targetNode = graph.getNode(targetId);

    if (!startNode || !targetNode) {
        throw new Error("Start or target node does not exist in graph.");
    }

    const gScore = new Map();
    const fScore = new Map();
    const previous = new Map();
    const arrivalTimes = new Map();
    const edgeMetrics = new Map();

    for (const id of graph.nodes.keys()) {
        gScore.set(id, Infinity);
        fScore.set(id, Infinity);
        previous.set(id, null);
        arrivalTimes.set(id, null);
        edgeMetrics.set(id, []);
    }

    const priorityQueue = new PriorityQueue();

    const initialDeparture = departureTime instanceof Date ? departureTime : new Date(departureTime);
    gScore.set(startId, 0);
    arrivalTimes.set(startId, initialDeparture);

    const initialHeuristic = calculateHeuristic(
        startNode.node.coordinate,
        targetNode.node.coordinate,
        ship
    );

    fScore.set(startId, initialHeuristic);
    priorityQueue.enqueue(startId, initialHeuristic);

    while (!priorityQueue.isEmpty()) {
        const current = priorityQueue.dequeue();
        const currentId = current.element;

        if (currentId === targetId) {
            break;
        }

        if (current.priority > fScore.get(currentId)) {
            continue;
        }

        const currentTime = arrivalTimes.get(currentId);
        const currentNode = graph.getNode(currentId);

        for (const edge of currentNode.edges) {
            const neighborNode = graph.getNode(edge.to);
            if (!neighborNode) continue;

            const coord = currentNode.node.coordinate;
            const weather = getWeather(
                coord.lat !== undefined ? coord.lat : coord.latitude,
                coord.lon !== undefined ? coord.lon : coord.longitude,
                currentTime
            );

            // Safety limit verification
            if (!ship.canOperateInWeather(weather)) {
                continue;
            }

            const effectiveSpeed = calculateEffectiveSpeed(ship.cruisingSpeed, weather);
            const edgeTravelTime = ship.calculateTravelTime(edge.weight, effectiveSpeed);
            const edgeFuel = ship.calculateFuel(edge.weight);
            const safetyPenalty = calculateSafetyPenalty(weather, ship);

            const edgeCost = calculateCost({
                travelTime: edgeTravelTime,
                fuel: edgeFuel,
                safety: safetyPenalty,
                profile: activeProfile
            });

            const tentativeGScore = gScore.get(currentId) + edgeCost;

            if (tentativeGScore < gScore.get(edge.to)) {
                previous.set(edge.to, currentId);
                gScore.set(edge.to, tentativeGScore);

                const nextArrival = new Date(currentTime.getTime() + edgeTravelTime * 3600 * 1000);
                arrivalTimes.set(edge.to, nextArrival);

                const metrics = [...(edgeMetrics.get(currentId) || [])];
                metrics.push({
                    from: currentId,
                    to: edge.to,
                    distance: edge.weight,
                    travelTime: edgeTravelTime,
                    fuel: edgeFuel,
                    effectiveSpeed,
                    weather
                });
                edgeMetrics.set(edge.to, metrics);

                const heuristic = calculateHeuristic(
                    neighborNode.node.coordinate,
                    targetNode.node.coordinate,
                    ship
                );

                const newFScore = tentativeGScore + heuristic;
                fScore.set(edge.to, newFScore);
                priorityQueue.enqueue(edge.to, newFScore);
            }
        }
    }

    const path = [];
    let curr = targetId;

    while (curr !== null) {
        path.unshift(curr);
        curr = previous.get(curr);
    }

    if (path.length === 1 && path[0] !== startId) {
        return {
            path: [],
            distance: Infinity,
            totalTime: Infinity,
            totalFuel: Infinity,
            metrics: [],
            arrivalTime: null
        };
    }

    const metrics = edgeMetrics.get(targetId) || [];
    const totalDistance = metrics.reduce((sum, m) => sum + m.distance, 0);
    const totalTime = metrics.reduce((sum, m) => sum + m.travelTime, 0);
    const totalFuel = metrics.reduce((sum, m) => sum + m.fuel, 0);

    return {
        path,
        distance: totalDistance > 0 ? totalDistance : haversineDistance(startNode.node.coordinate, targetNode.node.coordinate),
        totalTime,
        totalFuel,
        metrics,
        arrivalTime: arrivalTimes.get(targetId)
    };
}

function calculateHeuristic(fromCoord, toCoord, ship) {
    const distance = haversineDistance(fromCoord, toCoord);
    const maxSpeedKmH = ship.getSpeedKmH(ship.maximumSpeed || ship.cruisingSpeed);
    return maxSpeedKmH > 0 ? distance / maxSpeedKmH : distance;
}
