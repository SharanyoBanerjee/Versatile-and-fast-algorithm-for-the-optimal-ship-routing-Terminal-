import test from "node:test";
import assert from "node:assert";

import { Graph } from "../src/routing/graph.js";
import { dijkstra } from "../src/routing/dijkstra.js";


test("Dijkstra should find the shortest path", () => {

    const graph = new Graph();

    graph.addNode({
        id: "A"
    });

    graph.addNode({
        id: "B"
    });

    graph.addNode({
        id: "C"
    });

    graph.addNode({
        id: "D"
    });

    graph.addEdge("A", "B", 10);
    graph.addEdge("A", "D", 15);
    graph.addEdge("B", "C", 10);
    graph.addEdge("D", "C", 5);

    const result = dijkstra(
        graph,
        "A",
        "C"
    );

    assert.deepStrictEqual(
        result.path,
        ["A", "B", "C"]
    );

    assert.strictEqual(
        result.distance,
        20
    );

});