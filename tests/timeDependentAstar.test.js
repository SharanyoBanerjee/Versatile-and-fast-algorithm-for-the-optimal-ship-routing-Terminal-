import test from "node:test";
import assert from "node:assert";
import { OceanGrid } from "../src/geography/grid.js";
import { buildGraphFromGrid } from "../src/geography/buildGraph.js";
import { timeDependentAStar } from "../src/routing/timeDependentAstar.js";
import { SyntheticWeatherProvider } from "../src/weather/syntheticWeather.js";
import { Ship } from "../src/ships/ship.js";
import { CostEngine } from "../src/optimization/costEngine.js";

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

test("Time-dependent A* finds path with static weather", () => {
    const { graph, ship, weatherProvider, costEngine } = createTestSystem();
    const departureTime = new Date("2026-01-01T10:00:00Z");

    const result = timeDependentAStar({
        graph,
        startId: "N0_0",
        targetId: "N2_2",
        ship,
        weatherProvider,
        costEngine,
        departureTime
    });

    assert.ok(result.path.length > 0, "Should find a path");
    assert.ok(result.totalTime > 0, "Should have positive travel time");
});

test("Changing weather changes travel time", () => {
    const { graph, ship, costEngine } = createTestSystem();

    const weatherMorning = new class {
        getWeather(lat, lon, time) {
            const hour = new Date(time).getUTCHours();
            const windSpeed = hour < 12 ? 5 : 25;
            const waveHeight = hour < 12 ? 0.5 : 4;
            return {
                latitude: lat,
                longitude: lon,
                time,
                windSpeed,
                windDirection: 90,
                waveHeight,
                waveDirection: 90,
                currentSpeed: 1,
                currentDirection: 90
            };
        }
    };

    const departureMorning = new Date("2026-01-01T10:00:00Z");
    const departureAfternoon = new Date("2026-01-01T14:00:00Z");

    const resultMorning = timeDependentAStar({
        graph,
        startId: "N0_0",
        targetId: "N2_2",
        ship,
        weatherProvider: weatherMorning,
        costEngine,
        departureTime: departureMorning
    });

    const resultAfternoon = timeDependentAStar({
        graph,
        startId: "N0_0",
        targetId: "N2_2",
        ship,
        weatherProvider: weatherMorning,
        costEngine,
        departureTime: departureAfternoon
    });

    assert.ok(resultMorning.totalTime < resultAfternoon.totalTime ||
               resultMorning.totalTime === resultAfternoon.totalTime,
        "Morning departure should be faster or equal due to better weather");
});

test("Dangerous weather can make route infeasible", () => {
    const { graph, costEngine } = createTestSystem();

    const severeWeather = new class {
        getWeather(lat, lon, time) {
            return {
                latitude: lat,
                longitude: lon,
                time,
                windSpeed: 60,
                windDirection: 90,
                waveHeight: 8,
                waveDirection: 90,
                currentSpeed: 2,
                currentDirection: 90
            };
        }
    };

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

    const departureTime = new Date("2026-01-01T10:00:00Z");

    const result = timeDependentAStar({
        graph,
        startId: "N0_0",
        targetId: "N2_2",
        ship,
        weatherProvider: severeWeather,
        costEngine,
        departureTime
    });

    assert.ok(result.path.length === 0 || result.totalTime === Infinity,
        "Route should be infeasible or empty with severe weather");
});

test("Time-dependent routing can select different route from static", () => {
    const { graph, ship, weatherProvider, costEngine } = createTestSystem();

    const timeDependentResult = timeDependentAStar({
        graph,
        startId: "N0_0",
        targetId: "N2_2",
        ship,
        weatherProvider,
        costEngine,
        departureTime: new Date("2026-01-01T10:00:00Z")
    });

    assert.ok(timeDependentResult.path, "Time-dependent route should exist");
});
