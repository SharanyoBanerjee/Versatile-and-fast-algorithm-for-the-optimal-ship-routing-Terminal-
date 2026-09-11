import { PriorityQueue } from "./priorityQueue.js";
import { haversineDistance } from "../geography/distance.js";


export function aStar(graph, startId, targetId) {

    const gScore = new Map();
    const fScore = new Map();
    const previous = new Map();

    const priorityQueue = new PriorityQueue();

    for (const id of graph.nodes.keys()) {

        gScore.set(id, Infinity);
        fScore.set(id, Infinity);
        previous.set(id, null);

    }

    const startNode = graph.getNode(startId);
    const targetNode = graph.getNode(targetId);

    if (!startNode || !targetNode) {

        throw new Error(
            "Start or target node does not exist."
        );

    }

    gScore.set(startId, 0);

    const startHeuristic = haversineDistance(
        startNode.node.coordinate,
        targetNode.node.coordinate
    );

    fScore.set(
        startId,
        startHeuristic
    );

    priorityQueue.enqueue(
        startId,
        startHeuristic
    );

    while (!priorityQueue.isEmpty()) {

        const current = priorityQueue.dequeue();

        const currentId = current.element;
        const currentFScore = current.priority;

        if (
            currentFScore >
            fScore.get(currentId)
        ) {
            continue;
        }

        if (currentId === targetId) {
            break;
        }

        const currentNode = graph.getNode(currentId);

        for (const edge of currentNode.edges) {

            const tentativeGScore =
                gScore.get(currentId) +
                edge.weight;

            if (
                tentativeGScore <
                gScore.get(edge.to)
            ) {

                previous.set(
                    edge.to,
                    currentId
                );

                gScore.set(
                    edge.to,
                    tentativeGScore
                );

                const neighborNode =
                    graph.getNode(edge.to);

                const heuristic =
                    haversineDistance(
                        neighborNode.node.coordinate,
                        targetNode.node.coordinate
                    );

                const newFScore =
                    tentativeGScore +
                    heuristic;

                fScore.set(
                    edge.to,
                    newFScore
                );

                priorityQueue.enqueue(
                    edge.to,
                    newFScore
                );

            }

        }

    }

    const path = [];

    let current = targetId;

    while (current !== null) {

        path.unshift(current);

        current = previous.get(current);

    }

    if (
        path.length === 1 &&
        path[0] !== startId
    ) {

        return {
            path: [],
            distance: Infinity
        };

    }

    return {
        path: path,
        distance: gScore.get(targetId)
    };

}