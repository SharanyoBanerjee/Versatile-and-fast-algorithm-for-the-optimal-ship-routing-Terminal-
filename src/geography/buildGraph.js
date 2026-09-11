import { Graph } from "../routing/graph.js";
import { haversineDistance } from "./distance.js";


export function buildGraphFromGrid(grid) {

    const graph = new Graph();

    for (const node of grid.nodes.values()) {

        if (node.navigable) {

            graph.addNode(node);

        }

    }


    for (const node of grid.nodes.values()) {

        if (!node.navigable) {
            continue;
        }

        const neighbors =
            grid.getNeighbors(node);

        for (const neighbor of neighbors) {

            if (!neighbor.navigable) {
                continue;
            }

            const distance =
                haversineDistance(
                    node.coordinate,
                    neighbor.coordinate
                );

            graph.addEdge(
                node.id,
                neighbor.id,
                distance
            );

        }

    }

    return graph;

}