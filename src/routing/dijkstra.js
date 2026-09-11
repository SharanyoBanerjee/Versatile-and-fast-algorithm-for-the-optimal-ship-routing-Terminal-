import { PriorityQueue } from "./priorityQueue.js";


export function dijkstra(graph, startId, targetId) {

    const distances = new Map();
    const previous = new Map();

    const priorityQueue = new PriorityQueue();

    for (const id of graph.nodes.keys()) {

        distances.set(id, Infinity);
        previous.set(id, null);

    }

    distances.set(startId, 0);

    priorityQueue.enqueue(
        startId,
        0
    );

    while (!priorityQueue.isEmpty()) {

        const current = priorityQueue.dequeue();

        const currentId = current.element;
        const currentDistance = current.priority;

        if (
            currentDistance >
            distances.get(currentId)
        ) {
            continue;
        }

        if (currentId === targetId) {
            break;
        }

        const currentNode = graph.getNode(currentId);

        for (const edge of currentNode.edges) {

            const newDistance =
                currentDistance + edge.weight;

            if (
                newDistance <
                distances.get(edge.to)
            ) {

                distances.set(
                    edge.to,
                    newDistance
                );

                previous.set(
                    edge.to,
                    currentId
                );

                priorityQueue.enqueue(
                    edge.to,
                    newDistance
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
        distance: distances.get(targetId)
    };

}
