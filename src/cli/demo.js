import chalk from "chalk";

import { loadPorts } from "../ports/portManager.js";
import { SyntheticWeatherProvider } from "../weather/syntheticWeather.js";
import { OceanGrid } from "../geography/grid.js";
import { buildGraphFromGrid } from "../geography/buildGraph.js";
import { timeDependentAStar } from "../routing/timeDependentAstar.js";
import { getProfile } from "../optimization/optimizationProfiles.js";
import { CostEngine } from "../optimization/costEngine.js";
import { formatRouteResult } from "./formatter.js";
import { Ship } from "../ships/ship.js";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, "..", "..", "data") + "/";

async function runDemo() {
    console.log(
        chalk.cyan("========================================")
    );
    console.log(
        chalk.cyan("       OCEAN ROUTE OPTIMIZER")
    );
    console.log(
        chalk.cyan("       DEMO MODE - Automated Run")
    );
    console.log(
        chalk.cyan("========================================")
    );
    console.log();

    console.log(chalk.blue("Initializing routing system..."));

    const ports = await loadPorts(DATA_PATH + "ports.json");
    console.log(chalk.green("✓ Loaded", ports.getAllPorts().length, "ports"));

    const weatherProvider = new SyntheticWeatherProvider();
    console.log(chalk.green("✓ Synthetic weather provider ready"));

    const grid = new OceanGrid({
        minLat: -30,
        maxLat: 25,
        minLon: 30,
        maxLon: 110,
        step: 2,
        navigability: (lat, lon) => true
    });
    grid.generate();
    console.log(chalk.green("✓ Generated grid with", grid.nodes.size, "nodes"));

    const graph = buildGraphFromGrid(grid);
    console.log(chalk.green("✓ Graph has", graph.nodes.size, "navigable nodes"));

    console.log();
    console.log(chalk.yellow.bold("Available Ships:"));
    const ships = [
        new Ship({
            id: "SHIP1",
            name: "Ocean Star",
            type: "Container Ship",
            cruisingSpeed: 22,
            maximumSpeed: 25,
            fuelConsumption: 0.5,
            maximumWaveHeight: 4,
            maximumWindSpeed: 35
        }),
        new Ship({
            id: "SHIP2",
            name: "Pacific Trader",
            type: "Bulk Carrier",
            cruisingSpeed: 16,
            maximumSpeed: 18,
            fuelConsumption: 0.35,
            maximumWaveHeight: 6,
            maximumWindSpeed: 45
        }),
        new Ship({
            id: "SHIP3",
            name: "Indian Voyager",
            type: "General Cargo",
            cruisingSpeed: 14,
            maximumSpeed: 16,
            fuelConsumption: 0.3,
            maximumWaveHeight: 3.5,
            maximumWindSpeed: 30
        })
    ];

    ships.forEach((ship, i) => {
        console.log(
            chalk.white(`  ${i + 1}. ${ship.name} (${ship.type}) - ${ship.cruisingSpeed} knots`)
        );
    });

    console.log();
    console.log(chalk.yellow.bold("Available Ports:"));
    const portList = ports.getAllPorts();
    portList.forEach((port, i) => {
        console.log(
            chalk.white(`  ${i + 1}. ${port.name} (${port.country}) [${port.id}]`)
        );
    });

    console.log();
    console.log(chalk.blue("========================================"));
    console.log(chalk.blue("         RUNNING DEMO ROUTE"));
    console.log(chalk.blue("========================================"));
    console.log();

    const ship = ships[0]; // Ocean Star
    const departurePort = portList.find(p => p.id === "INMUM"); // Mumbai
    const destinationPort = portList.find(p => p.id === "SGSIN"); // Singapore
    const optimizationProfile = getProfile("BALANCED");
    const departureTime = new Date("2026-01-15T08:00:00Z");

    console.log(chalk.yellow.bold("Selected Route:"));
    console.log(chalk.white(`  Ship: ${ship.name}`));
    console.log(chalk.white(`  From: ${departurePort.name}, ${departurePort.country}`));
    console.log(chalk.white(`  To: ${destinationPort.name}, ${destinationPort.country}`));
    console.log(chalk.white(`  Mode: ${optimizationProfile.name}`));
    console.log(chalk.white(`  Departure: ${departureTime.toUTCString()}`));
    console.log();

    function findNearestNodeId(grid, latitude, longitude) {
        const node = grid.findNearestNavigableNode(latitude, longitude);
        return node ? node.id : null;
    }

    const startNodeId = findNearestNodeId(grid, departurePort.latitude, departurePort.longitude);
    const targetNodeId = findNearestNodeId(grid, destinationPort.latitude, destinationPort.longitude);

    console.log(chalk.blue("Computing optimal route..."));

    const costEngine = new CostEngine({
        timeWeight: optimizationProfile.time,
        fuelWeight: optimizationProfile.fuel,
        safetyWeight: optimizationProfile.safety,
        riskWeight: optimizationProfile.risk
    });

    const result = timeDependentAStar({
        graph,
        startId: startNodeId,
        targetId: targetNodeId,
        ship,
        weatherProvider,
        costEngine,
        departureTime,
        heuristicMultiplier: 1.0
    });

    console.log();

    if (!result.path || result.path.length === 0) {
        console.log(chalk.red.bold("ERROR:"));
        console.log(chalk.red("No route found between the selected ports."));
        return;
    }

    formatRouteResult({
        ship,
        departurePort,
        destinationPort,
        optimizationMode: optimizationProfile,
        route: result,
        distance: result.distance,
        totalTime: result.totalTime,
        totalFuel: result.totalFuel,
        arrivalTime: result.arrivalTime
    });

    console.log();
    console.log(chalk.cyan("========================================"));
    console.log(chalk.cyan("       DEMO COMPLETE"));
    console.log(chalk.cyan("========================================"));
    console.log();
    console.log(chalk.dim("To use interactively, run: npm start"));
    console.log(chalk.dim("Then follow the prompts to select:"));
    console.log(chalk.dim("  1. Ship (Ocean Star, Pacific Trader, Indian Voyager)"));
    console.log(chalk.dim("  2. Departure port"));
    console.log(chalk.dim("  3. Destination port"));
    console.log(chalk.dim("  4. Optimization mode (Fastest, Fuel Efficient, Safest, Balanced, Custom)"));
    console.log(chalk.dim("  5. Departure time"));
}

runDemo().catch(err => {
    console.error(chalk.red("Demo failed:", err.message));
    process.exit(1);
});
