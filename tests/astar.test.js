import test from "node:test";
import assert from "node:assert";

import { Graph } from "../src/routing/graph.js";
import { GridNode } from "../src/geography/grid.js";
import { aStar } from "../src/routing/astar.js";


test("A* should find the shortest geographic path", () => {

    const graph = new Graph();

    const nodeA = new GridNode(
        "A",
        18,
        72
    );

    const nodeB = new GridNode(
        "B",
        18,
        73
    );

    const nodeC = new GridNode(
        "C",
        18,
        74
    );

    const nodeD = new GridNode(
        "D",
        17,
        72
    );

    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addNode(nodeC);
    graph.addNode(nodeD);

    graph.addEdge(
        "A",
        "B",
        100
    );

    graph.addEdge(
        "B",
        "C",
        100
    );

    graph.addEdge(
        "A",
        "D",
        300
    );

    graph.addEdge(
        "D",
        "C",
        300
    );

    const result = aStar(
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
        200
    );

});