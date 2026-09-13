import chalk from "chalk";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { prompt, selectShip, selectPort, selectOptimizationMode, selectDepartureTime, closeReader } from "./prompts.js";
import { formatHeader, formatRouteResult, formatError, formatSuccess } from "./formatter.js";
import { OceanGrid } from "../geography/grid.js";
import { buildGraphFromGrid } from "../geography/buildGraph.js";
import { timeDependentAStar } from "../routing/timeDependentAstar.js";
import { Ship } from "../ships/ship.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORTS_PATH = join(__dirname, "..", "..", "data", "ports.json");

function getShips() {
    return [
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
}

async function loadPortsData() {
    const raw = await readFile(PORTS_PATH, "utf8");
    const json = JSON.parse(raw);
    return json.ports || [];
}

async function initialize() {
    formatHeader("OCEAN ROUTE OPTIMIZER");
    console.log(chalk.blue("Initializing routing system..."));

    const ports = await loadPortsData();
    formatSuccess(`Loaded ${ports.length} ports`);

    const grid = new OceanGrid({
        minLat: -30,
        maxLat: 25,
        minLon: 30,
        maxLon: 110,
        step: 2,
        navigability: () => true
    });
    grid.generate();
    formatSuccess(`Generated grid with ${grid.nodes.size} nodes`);

    const graph = buildGraphFromGrid(grid);
    formatSuccess(`Graph has ${graph.nodes.size} navigable nodes`);
    console.log();

    return { ports, grid, graph };
}

async function run() {
    try {
        const { ports, grid, graph } = await initialize();
        const ships = getShips();

        const ship = await selectShip(ships);
        formatSuccess(`Selected Ship: ${ship.name}`);

        const departurePort = await selectPort(ports, "departure");
        formatSuccess(`Departure: ${departurePort.name}`);

        const destinationPort = await selectPort(ports, "destination");
        formatSuccess(`Destination: ${destinationPort.name}`);

        if (departurePort.id === destinationPort.id) {
            formatError("Departure and destination ports cannot be the same.");
            return;
        }

        const mode = await selectOptimizationMode();
        formatSuccess(`Optimization: ${mode}`);

        const departureTime = await selectDepartureTime();
        formatSuccess(`Departure Time: ${departureTime.toUTCString()}`);

        const startNode = grid.findNearestNavigableNode(departurePort.latitude, departurePort.longitude);
        const targetNode = grid.findNearestNavigableNode(destinationPort.latitude, destinationPort.longitude);

        if (!startNode || !targetNode) {
            formatError("Could not map selected ports to grid nodes.");
            return;
        }

        console.log(chalk.blue("\nCalculating optimal route..."));

        const result = timeDependentAStar({
            graph,
            startId: startNode.id,
            targetId: targetNode.id,
            ship,
            departureTime,
            profile: mode
        });

        if (!result.path || result.path.length === 0) {
            formatError("No navigable route found under current weather and ship constraints.");
            return;
        }

        formatRouteResult({
            ship,
            departurePort,
            destinationPort,
            mode,
            route: result,
            distance: result.distance,
            totalTime: result.totalTime,
            totalFuel: result.totalFuel,
            arrivalTime: result.arrivalTime
        });

    } catch (err) {
        formatError(err.message);
    } finally {
        closeReader();
    }
}

run();
