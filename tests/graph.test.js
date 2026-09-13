import test from "node:test";
import assert from "node:assert/strict";
import { Graph } from "../src/routing/graph.js";

test("Graph should store nodes and edges", () => {
    const graph = new Graph();
    const nodeA = { id: "A", coordinate: { lat: 10, lon: 70 } };
    const nodeB = { id: "B", coordinate: { lat: 11, lon: 71 } };

    graph.addNode(nodeA);
    graph.addNode(nodeB);

    assert.ok(graph.hasNode("A"));
    assert.ok(graph.hasNode("B"));
    assert.equal(graph.nodes.size, 2);

    graph.addEdge("A", "B", 150);
    const nodeAData = graph.getNode("A");
    assert.equal(nodeAData.edges.length, 1);
    assert.equal(nodeAData.edges[0].to, "B");
    assert.equal(nodeAData.edges[0].weight, 150);
});

test("Graph should support bidirectional edges", () => {
    const graph = new Graph();
    graph.addNode({ id: "A" });
    graph.addNode({ id: "B" });

    graph.addBidirectionalEdge("A", "B", 100);

    assert.equal(graph.getNode("A").edges[0].to, "B");
    assert.equal(graph.getNode("B").edges[0].to, "A");
});