import test from "node:test";
import assert from "node:assert/strict";
import { Graph } from "../src/routing/graph.js";
import { aStar } from "../src/routing/astar.js";
import { OceanGrid } from "../src/geography/grid.js";
import { buildGraphFromGrid } from "../src/geography/buildGraph.js";

test("A* should find the shortest geographic path on an ocean grid", () => {
    const grid = new OceanGrid({
        minLat: 10,
        maxLat: 12,
        minLon: 70,
        maxLon: 72,
        step: 1,
        navigability: () => true
    });
    grid.generate();
    const graph = buildGraphFromGrid(grid);

    const result = aStar(graph, "N0_0", "N2_2");

    assert.ok(result.path.length > 0);
    assert.equal(result.path[0], "N0_0");
    assert.equal(result.path[result.path.length - 1], "N2_2");
    assert.ok(result.distance > 0);
});

test("A* throws an error when start or target node does not exist", () => {
    const graph = new Graph();
    assert.throws(() => {
        aStar(graph, "INVALID_START", "INVALID_TARGET");
    }, /Start or target node does not exist/);
});