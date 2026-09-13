import chalk from "chalk";

export function formatHeader(title) {
    const line = "=".repeat(40);
    console.log(chalk.cyan(line));
    console.log(chalk.cyan(`  ${title}`));
    console.log(chalk.cyan(line));
    console.log();
}

export function formatRouteResult({
    ship,
    departurePort,
    destinationPort,
    mode,
    route,
    distance,
    totalTime,
    totalFuel,
    arrivalTime
}) {
    console.log();
    console.log(chalk.cyan("----------------------------------------"));
    console.log(chalk.cyan("ROUTE"));
    console.log(chalk.cyan("----------------------------------------"));
    console.log();

    if (route.path && route.path.length > 0) {
        for (let i = 0; i < route.path.length; i++) {
            const nodeId = route.path[i];
            const isStart = i === 0;
            const isEnd = i === route.path.length - 1;

            let label = nodeId;
            if (isStart) label = `${departurePort.name} (${departurePort.country})`;
            else if (isEnd) label = `${destinationPort.name} (${destinationPort.country})`;

            if (isStart) {
                console.log(chalk.green.bold(`  ▶  ${label}`));
            } else if (isEnd) {
                console.log(chalk.green.bold(`  ■  ${label}`));
            } else {
                console.log(chalk.white(`  ↓  ${label}`));
            }
        }
    } else {
        console.log(chalk.red("  No valid navigable route found."));
    }

    console.log();
    console.log(chalk.cyan("----------------------------------------"));
    console.log(chalk.cyan("RESULT"));
    console.log(chalk.cyan("----------------------------------------"));
    console.log(chalk.yellow.bold("Ship:     "), chalk.white(`${ship.name} (${ship.type})`));
    console.log(chalk.yellow.bold("From:     "), chalk.white(`${departurePort.name}, ${departurePort.country}`));
    console.log(chalk.yellow.bold("To:       "), chalk.white(`${destinationPort.name}, ${destinationPort.country}`));
    console.log(chalk.magenta.bold("Distance: "), chalk.white(`${distance.toFixed(1)} km`));
    console.log(chalk.magenta.bold("Time:     "), chalk.white(`${totalTime.toFixed(1)} hours`));
    console.log(chalk.magenta.bold("Fuel:     "), chalk.white(`${totalFuel.toFixed(1)} units`));
    console.log(chalk.blue.bold("Mode:     "), chalk.white(mode));
    console.log(chalk.blue.bold("Algorithm:"), chalk.white("Time-Dependent A*"));

    if (arrivalTime) {
        console.log(chalk.cyan.bold("Arrival:  "), chalk.white(arrivalTime.toUTCString()));
    }
    console.log(chalk.cyan("----------------------------------------"));
    console.log();
}

export function formatSuccess(message) {
    console.log(chalk.green("✓ ") + chalk.green(message));
}

export function formatError(message) {
    console.log();
    console.log(chalk.red.bold("ERROR: ") + chalk.red(message));
    console.log();
}
