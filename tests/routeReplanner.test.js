import test from "node:test";
import assert from "node:assert";
import { RouteReplanner } from "../src/routing/routeReplanner.js";
import { OceanGrid } from "../src/geography/grid.js";
import { buildGraphFromGrid } from "../src/geography/buildGraph.js";
import { SyntheticWeatherProvider } from "../src/weather/syntheticWeather.js";
import { Ship } from "../src/ships/ship.js";
import { CostEngine } from "../src/optimization/costEngine.js";
import { timeDependentAStar } from "../src/routing/timeDependentAstar.js";

function createTestSystem() {
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
        id: "TEST",
        name: "Test Ship",
        type: "Cargo",
        cruisingSpeed: 20,
        maximumSpeed: 22,
        fuelConsumption: 0.4,
        maximumWaveHeight: 5,
        maximumWindSpeed: 40
    });
    const weatherProvider = new SyntheticWeatherProvider();
    const costEngine = new CostEngine({
        timeWeight: 0.5,
        fuelWeight: 0.3,
        safetyWeight: 0.1,
        riskWeight: 0.1
    });
    return { grid, graph, ship, weatherProvider, costEngine };
}

test("Replanner detects infeasible route", () => {
    const { graph, ship, weatherProvider, costEngine } = createTestSystem();

    const departureTime = new Date("2026-01-01T10:00:00Z");
    const route = timeDependentAStar({
        graph,
        startId: "N0_0",
        targetId: "N2_2",
        ship,
        weatherProvider,
        costEngine,
        departureTime
    });

    const replanner = new RouteReplanner({
        routingEngine: {
            evaluateRoute: () => ({ stillFeasible: false })
        }
    });

    replanner.storeRoute(route);

    const result = replanner.evaluate(
        { latitude: 10.5, longitude: 71 },
        departureTime,
        ship,
        weatherProvider,
        costEngine,
        "N2_2"
    );

    assert.ok(result.shouldReplan, "Should detect need to replan");
});

test("No unnecessary replanning for stable conditions", () => {
    const replanner = new RouteReplanner({
        routingEngine: {
            evaluateRoute: () => ({
                stillFeasible: true,
                costIncreaseRatio: 0.02,
                riskIncrease: 0.01
            })
        },
        costIncreaseThreshold: 0.15
    });

    const route = { path: ["N0_0", "N1_1", "N2_2"], totalTime: 10 };
    replanner.storeRoute(route);

    const result = replanner.evaluate(
        { latitude: 10.5, longitude: 71 },
        new Date(),
        new Ship({
            id: "TEST",
            name: "Test",
            type: "Cargo",
            cruisingSpeed: 20,
            maximumSpeed: 22,
            fuelConsumption: 0.4,
            maximumWaveHeight: 5,
            maximumWindSpeed: 40
        }),
        new SyntheticWeatherProvider(),
        new CostEngine({ timeWeight: 0.5, fuelWeight: 0.3, safetyWeight: 0.1, riskWeight: 0.1 }),
        "N2_2"
    );

    assert.ok(!result.shouldReplan, "Should not replan for minor changes");
});

test("Replanner generates new route", () => {
    const { graph, ship, weatherProvider, costEngine } = createTestSystem();

    const replanner = new RouteReplanner({
        routingEngine: null
    });

    // Use N1_1 as current position (exists in graph)
    const result = replanner.replan({
        currentPosition: { latitude: 11, longitude: 71 },
        currentTime: new Date("2026-01-01T12:00:00Z"),
        targetId: "N2_2",
        ship,
        weatherProvider,
        costEngine,
        graph
    });

    assert.ok(result.replanned, "Should indicate replanning occurred");
    assert.ok(result.route.path, "Should have new route path");
    assert.ok(result.route.path.length > 0, "Route should have at least one node");
});
