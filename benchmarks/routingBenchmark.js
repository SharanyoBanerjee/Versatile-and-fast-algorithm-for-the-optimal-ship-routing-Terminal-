import { OceanGrid } from "../src/geography/grid.js";
import { buildGraphFromGrid } from "../src/geography/buildGraph.js";
import { dijkstra } from "../src/routing/dijkstra.js";
import { aStar } from "../src/routing/astar.js";
import { timeDependentAStar } from "../src/routing/timeDependentAstar.js";
import { SyntheticWeatherProvider } from "../src/weather/syntheticWeather.js";
import { Ship } from "../src/ships/ship.js";
import { CostEngine } from "../src/optimization/costEngine.js";
import { haversineDistance } from "../src/geography/distance.js";

function benchmark(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return { result, time: end - start };
}

function createGrid(step) {
    const grid = new OceanGrid({
        minLat: 10,
        maxLat: 15,
        minLon: 70,
        maxLon: 75,
        step: step,
        navigability: () => true
    });
    grid.generate();
    return buildGraphFromGrid(grid);
}

function createTestData() {
    const ship = new Ship({
        id: "BENCHMARK",
        name: "Benchmark Ship",
        type: "Container",
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
    return { ship, weatherProvider, costEngine };
}

function countNodesExplored(path, totalNodes) {
    if (!path || path.length === 0) return 0;
    return (path.length / totalNodes) * 100;
}

console.log("\n========================================");
console.log("     ROUTING ALGORITHM BENCHMARK");
console.log("========================================\n");

const { ship, weatherProvider, costEngine } = createTestData();
const departureTime = new Date("2026-01-01T10:00:00Z");
const startId = "N0_0";

[1, 0.5, 0.25].forEach(step => {
    console.log(`\n--- Grid Resolution: ${step}° ---`);
    const graph = createGrid(step);
    const totalNodes = graph.nodes.size;

    const startNode = graph.getNode(startId);
    const endRow = Math.floor((15 - 10) / step);
    const targetId = `N${endRow}_${endRow}`;

    console.log(`Total navigable nodes: ${totalNodes}`);
    console.log(`Start: ${startId} -> Target: ${targetId}\n`);

    console.log("Dijkstra:");
    const dijkstraResult = benchmark("  Execution time", () => {
        const result = dijkstra(graph, startId, targetId);
        return {
            pathLength: result.path.length,
            distance: result.distance,
            nodesExplored: countNodesExplored(result.path, totalNodes)
        };
    });

    console.log("A*:");
    const astarResult = benchmark("  Execution time", () => {
        const result = aStar(graph, startId, targetId);
        return {
            pathLength: result.path.length,
            distance: result.distance,
            nodesExplored: countNodesExplored(result.path, totalNodes)
        };
    });

    console.log("Time-Dependent A*:");
    const tdResult = benchmark("  Execution time", () => {
        const result = timeDependentAStar({
            graph,
            startId,
            targetId,
            ship,
            weatherProvider,
            costEngine,
            departureTime
        });
        return {
            pathLength: result.path.length,
            totalTime: result.totalTime,
            totalFuel: result.totalFuel,
            nodesExplored: countNodesExplored(result.path, totalNodes)
        };
    });

    console.log("\nComparison:");
    console.log(`  Dijkstra path length: ${dijkstraResult.result.pathLength} nodes`);
    console.log(`  A* path length: ${astarResult.result.pathLength} nodes`);
    console.log(`  Time-Dep A* path length: ${tdResult.result.pathLength} nodes`);
    console.log(`  Dijkstra distance: ${dijkstraResult.result.distance.toFixed(2)} km`);
    console.log(`  A* distance: ${astarResult.result.distance.toFixed(2)} km`);
    console.log(`  Time-Dep A* total time: ${tdResult.result.totalTime.toFixed(2)} hours`);
    console.log(`  Time-Dep A* total fuel: ${tdResult.result.totalFuel.toFixed(2)} units\n`);
});

console.log("========================================\n");
