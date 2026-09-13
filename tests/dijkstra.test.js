import test from "node:test";
import assert from "node:assert/strict";
import { Graph } from "../src/routing/graph.js";
import { dijkstra } from "../src/routing/dijkstra.js";

test("Dijkstra should find the shortest path on a known weighted graph", () => {
    // Graph:
    // A --4--> B --1--> D
    // A --2--> C --3--> D
    // Shortest A -> D is A -> B -> D (cost 5) vs A -> C -> D (cost 5)
    // If B->D is 1 and A->B is 3 => A->B->D = 4
    const graph = new Graph();
    graph.addNode({ id: "A" });
    graph.addNode({ id: "B" });
    graph.addNode({ id: "C" });
    graph.addNode({ id: "D" });

    graph.addEdge("A", "B", 3);
    graph.addEdge("B", "D", 1);
    graph.addEdge("A", "C", 2);
    graph.addEdge("C", "D", 5);

    const result = dijkstra(graph, "A", "D");

    assert.deepEqual(result.path, ["A", "B", "D"]);
    assert.equal(result.distance, 4);
});

test("Dijkstra returns empty path when target unreachable", () => {
    const graph = new Graph();
    graph.addNode({ id: "A" });
    graph.addNode({ id: "B" });

    const result = dijkstra(graph, "A", "B");
    assert.deepEqual(result.path, []);
    assert.equal(result.distance, Infinity);
});
