import test from "node:test";
import assert from "node:assert";

import { OceanGrid } from "../src/geography/grid.js";


test("OceanGrid should generate the correct number of nodes", () => {

    const grid =
        new OceanGrid({

            minLat: 10,
            maxLat: 12,

            minLon: 70,
            maxLon: 72,

            step: 1

        });

    const nodes =
        grid.generate();

    assert.strictEqual(
        nodes.size,
        9
    );

});


test("OceanGrid should generate navigable nodes", () => {

    const grid =
        new OceanGrid({

            minLat: 10,
            maxLat: 12,

            minLon: 70,
            maxLon: 72,

            step: 1

        });

    const nodes =
        grid.generate();

    const node =
        nodes.get("N0_0");

    assert.ok(node);

    assert.strictEqual(
        node.navigable,
        true
    );

});


test("OceanGrid should detect neighboring nodes", () => {

    const grid =
        new OceanGrid({

            minLat: 10,
            maxLat: 12,

            minLon: 70,
            maxLon: 72,

            step: 1

        });

    grid.generate();

    const center =
        grid.getNode("N1_1");

    const neighbors =
        grid.getNeighbors(
            center
        );

    assert.strictEqual(
        neighbors.length,
        8
    );

});


test("OceanGrid should find the nearest navigable node", () => {

    const grid =
        new OceanGrid({

            minLat: 10,
            maxLat: 12,

            minLon: 70,
            maxLon: 72,

            step: 1

        });

    grid.generate();

    const nearest =
        grid.findNearestNavigableNode(
            10.1,
            70.1
        );

    assert.ok(nearest);

    assert.strictEqual(
        nearest.id,
        "N0_0"
    );

});