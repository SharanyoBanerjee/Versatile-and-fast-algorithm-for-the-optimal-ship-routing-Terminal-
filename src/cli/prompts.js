import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

let rl = null;
let lineIterator = null;

function getLineIterator() {
    if (!lineIterator) {
        rl = readline.createInterface({ input, output, terminal: false });
        lineIterator = rl[Symbol.asyncIterator]();
    }
    return lineIterator;
}

export async function prompt(question = "") {
    if (question) {
        output.write(question);
    }
    const iter = getLineIterator();
    const result = await iter.next();
    if (result.done) {
        return "";
    }
    return (result.value || "").trim();
}

export async function promptChoice(question, options) {
    console.log(question);
    options.forEach((opt, i) => {
        console.log(`  ${i + 1}. ${opt}`);
    });

    const answer = await prompt("\nSelect an option > ");
    const index = parseInt(answer, 10) - 1;

    if (isNaN(index) || index < 0 || index >= options.length) {
        console.log("Invalid selection. Please try again.");
        return promptChoice(question, options);
    }

    return index;
}

export async function selectShip(ships) {
    const options = ships.map(ship =>
        `${ship.name} (${ship.type}) - Speed: ${ship.cruisingSpeed} kts | Fuel: ${ship.fuelConsumption} units/km`
    );
    const index = await promptChoice("\nAvailable ships:", options);
    return ships[index];
}

export async function selectPort(ports, type = "departure") {
    const label = type === "departure" ? "Departure" : "Destination";
    const options = ports.map(p => `${p.name} (${p.country}) [${p.id}]`);
    const index = await promptChoice(`\nSelect ${label} port:`, options);
    return ports[index];
}

export async function selectOptimizationMode() {
    const modes = [
        "FASTEST - Minimize voyage time",
        "BALANCED - Balance time, fuel & safety",
        "SAFEST - Prioritize avoiding severe weather"
    ];

    const index = await promptChoice("\nSelect optimization mode:", modes);
    const modeKeys = ["FASTEST", "BALANCED", "SAFEST"];
    return modeKeys[index];
}

export async function selectDepartureTime() {
    console.log("\nEnter departure time:");
    const defaultDate = new Date().toISOString().split("T")[0];
    const defaultHour = String(new Date().getUTCHours());

    const dateStr = await prompt(`Date (YYYY-MM-DD) [${defaultDate}]: `);
    const hourStr = await prompt(`Hour in UTC (0-23) [${defaultHour}]: `);

    const date = dateStr ? dateStr.trim() : defaultDate;
    const hour = hourStr && hourStr.trim() !== "" ? parseInt(hourStr.trim(), 10) : parseInt(defaultHour, 10);

    const time = new Date(`${date}T${hour.toString().padStart(2, "0")}:00:00Z`);
    return isNaN(time.getTime()) ? new Date() : time;
}

export function closeReader() {
    if (rl) {
        rl.close();
        rl = null;
        lineIterator = null;
    }
}
