import chalk from "chalk";

import { prompt, selectShip, selectPort, selectOptimizationMode, selectDepartureTime, closeReader } from "./prompts.js";
import { formatHeader, formatRouteResult, formatError, formatSuccess, formatLoading } from "./formatter.js";
import { loadPorts } from "../ports/portManager.js";
import { SyntheticWeatherProvider } from "../weather/syntheticWeather.js";
import { OceanGrid } from "../geography/grid.js";
import { LandMask } from "../geography/landMask.js";
import { buildGraphFromGrid } from "../geography/buildGraph.js";
import { timeDependentAStar } from "../routing/timeDependentAstar.js";
import { getProfile } from "../optimization/optimizationProfiles.js";
import { CostEngine } from "../optimization/costEngine.js";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, "..", "..", "data") + "/";

async function loadShips() {
    const { Ship } = await import("../ships/ship.js");
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
    return ships;
}

async function initializeSystem() {
    console.log(chalk.cyan("========================================"));
    console.log(chalk.cyan("       OCEAN ROUTE OPTIMIZER"));
    console.log(chalk.cyan("========================================"));
    console.log();
    console.log(chalk.blue("Initializing routing system..."));

    await formatLoading("Loading port data...");
    const ports = await loadPorts(DATA_PATH + "ports.json");
    formatSuccess(`Loaded ${ports.getAllPorts().length} ports`);

    await formatLoading("Initializing weather model...");
    const weatherProvider = new SyntheticWeatherProvider();
    formatSuccess("Synthetic weather provider ready");

    await formatLoading("Building ocean grid...");
    const grid = new OceanGrid({
        minLat: -30,
        maxLat: 25,
        minLon: 30,
        maxLon: 110,
        step: 2,
        navigability: (lat, lon) => true
    });
    grid.generate();
    formatSuccess(`Generated grid with ${grid.nodes.size} nodes`);

    await formatLoading("Building routing graph...");
    const graph = buildGraphFromGrid(grid);
    formatSuccess(`Graph has ${graph.nodes.size} navigable nodes`);

    console.log();
    return { ports, weatherProvider, graph, grid };
}

function findNearestNodeId(grid, latitude, longitude) {
    const node = grid.findNearestNavigableNode(latitude, longitude);
    return node ? node.id : null;
}

async function run() {
    try {
        const { ports, weatherProvider, graph, grid } = await initializeSystem();
        const ships = await loadShips();

        console.log();
        console.log("Ready to calculate optimal ship routes.");
        console.log();

        const ship = await selectShip(ships);
        formatSuccess(`Selected: ${ship.name}`);

        const departurePort = await selectPort(ports.getAllPorts(), "departure");
        formatSuccess(`Departure: ${departurePort.name}`);

        const destinationPort = await selectPort(ports.getAllPorts(), "destination");
        formatSuccess(`Destination: ${destinationPort.name}`);

        const { mode, customWeights } = await selectOptimizationMode();

        let optimizationProfile;
        if (customWeights) {
            optimizationProfile = getProfile("CUSTOM", customWeights);
        } else {
            optimizationProfile = getProfile(mode);
        }

        formatSuccess(`Optimization: ${optimizationProfile.name}`);

        const departureTime = await selectDepartureTime();
        formatSuccess(`Departure: ${departureTime.toUTCString()}`);

        console.log();
        await formatLoading("Finding route nodes...", 1000);

        const startNodeId = findNearestNodeId(grid, departurePort.latitude, departurePort.longitude);
        const targetNodeId = findNearestNodeId(grid, destinationPort.latitude, destinationPort.longitude);

        if (!startNodeId || !targetNodeId) {
            formatError("Could not find route nodes for selected ports.");
            return;
        }

        if (startNodeId === targetNodeId) {
            formatError("Departure and destination are too close. Please select different ports.");
            return;
        }

        console.log();
        await formatLoading("Computing optimal route...", 2000);

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
            formatError("No route found between the selected ports.");
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

    } catch (error) {
        formatError(error.message);
    } finally {
        closeReader();
    }
}

run();
