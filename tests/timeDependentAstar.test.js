import test from "node:test";
import assert from "node:assert/strict";
import { OceanGrid } from "../src/geography/grid.js";
import { buildGraphFromGrid } from "../src/geography/buildGraph.js";
import { timeDependentAStar } from "../src/routing/timeDependentAstar.js";
import { Ship } from "../src/ships/ship.js";

function createTestGridAndShip() {
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

    const ship = new Ship({
        id: "TEST_SHIP",
        name: "Test Cargo",
        type: "Cargo",
        cruisingSpeed: 20,
        maximumSpeed: 24,
        fuelConsumption: 0.4,
        maximumWaveHeight: 5,
        maximumWindSpeed: 40
    });

    return { grid, graph, ship };
}

test("Time-Dependent A* finds a valid route under normal conditions", () => {
    const { graph, ship } = createTestGridAndShip();

    const result = timeDependentAStar({
        graph,
        startId: "N0_0",
        targetId: "N2_2",
        ship,
        departureTime: new Date("2026-01-01T10:00:00Z"),
        profile: "BALANCED"
    });

    assert.ok(result.path.length > 0, "Path should contain nodes");
    assert.equal(result.path[0], "N0_0");
    assert.equal(result.path[result.path.length - 1], "N2_2");
    assert.ok(result.totalTime > 0, "Travel time should be positive");
    assert.ok(result.totalFuel > 0, "Fuel consumption should be positive");
    assert.ok(result.arrivalTime instanceof Date, "Arrival time should be valid Date");
});

test("Time-Dependent A* supports FASTEST, BALANCED, and SAFEST profiles", () => {
    const { graph, ship } = createTestGridAndShip();
    const departure = new Date("2026-01-01T08:00:00Z");

    const fastest = timeDependentAStar({ graph, startId: "N0_0", targetId: "N2_2", ship, departureTime: departure, profile: "FASTEST" });
    const balanced = timeDependentAStar({ graph, startId: "N0_0", targetId: "N2_2", ship, departureTime: departure, profile: "BALANCED" });
    const safest = timeDependentAStar({ graph, startId: "N0_0", targetId: "N2_2", ship, departureTime: departure, profile: "SAFEST" });

    assert.ok(fastest.path.length > 0);
    assert.ok(balanced.path.length > 0);
    assert.ok(safest.path.length > 0);
});

test("Time-Dependent A* rejects route if ship weather limits are exceeded everywhere", () => {
    const { graph } = createTestGridAndShip();
    // Fragile ship with very low tolerances
    const fragileShip = new Ship({
        id: "TINY_BOAT",
        name: "Tiny Boat",
        cruisingSpeed: 5,
        maximumSpeed: 6,
        fuelConsumption: 0.1,
        maximumWaveHeight: 0.01, // will fail in any real wave condition
        maximumWindSpeed: 0.01
    });

    const result = timeDependentAStar({
        graph,
        startId: "N0_0",
        targetId: "N2_2",
        ship: fragileShip,
        departureTime: new Date()
    });

    assert.equal(result.path.length, 0, "Should return empty path when conditions are unsafe");
});
