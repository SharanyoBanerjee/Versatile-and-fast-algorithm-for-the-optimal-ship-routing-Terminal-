import test from "node:test";
import assert from "node:assert";

import { Graph } from "../src/routing/graph.js";
import { GridNode } from "../src/geography/grid.js";


test("Graph should store nodes", () => {

    const graph = new Graph();

    const node = new GridNode(
        "N1",
        18.5,
        72.8
    );

    graph.addNode(node);

    const result = graph.getNode("N1");

    assert.ok(result);

});