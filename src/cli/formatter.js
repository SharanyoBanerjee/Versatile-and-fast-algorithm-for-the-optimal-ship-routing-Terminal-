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
    optimizationMode,
    route,
    distance,
    totalTime,
    totalFuel,
    arrivalTime
}) {
    formatHeader("ROUTE RESULT");

    console.log(chalk.yellow.bold("Ship:"), chalk.white(ship.name));
    console.log(chalk.yellow.bold("Type:"), chalk.white(ship.type));
    console.log();
    console.log(chalk.green.bold("From:"), chalk.white(`${departurePort.name}, ${departurePort.country}`));
    console.log(chalk.green.bold("To:"), chalk.white(`${destinationPort.name}, ${destinationPort.country}`));
    console.log();
    console.log(chalk.blue.bold("Mode:"), chalk.white(optimizationMode.name));
    console.log();
    console.log(chalk.magenta.bold("Distance:"), chalk.white(`${distance.toFixed(2)} km`));
    console.log(chalk.magenta.bold("Estimated Time:"), chalk.white(`${totalTime.toFixed(2)} hours`));
    console.log(chalk.magenta.bold("Estimated Fuel:"), chalk.white(`${totalFuel.toFixed(2)} units`));
    console.log();

    if (arrivalTime) {
        console.log(chalk.cyan.bold("Estimated Arrival:"), chalk.white(arrivalTime.toUTCString()));
    }

    console.log();
    console.log(chalk.yellow.bold("Route:"));
    console.log();

    if (route.path && route.path.length > 0) {
        const stepSymbols = ["→", "↓", "→", "↓"];

        for (let i = 0; i < route.path.length; i++) {
            const nodeId = route.path[i];
            const isStart = i === 0;
            const isEnd = i === route.path.length - 1;

            let marker = "○";
            let color = chalk.white;

            if (isStart) {
                marker = "▶";
                color = chalk.green.bold;
            } else if (isEnd) {
                marker = "■";
                color = chalk.green.bold;
            }

            const prefix = i > 0 ? `  ${stepSymbols[i % stepSymbols.length]}  ` : "     ";

            let label = nodeId;
            if (departurePort && isStart) {
                label = departurePort.name;
            } else if (destinationPort && isEnd) {
                label = destinationPort.name;
            }

            console.log(`${prefix}${color(marker)} ${label}`);
        }
    } else {
        console.log(chalk.red("  No route found."));
    }

    console.log();
    formatRouteExplanation(route, distance, totalTime, totalFuel, optimizationMode);
}

export function formatRouteExplanation(route, distance, totalTime, totalFuel, mode) {
    console.log(chalk.yellow.bold("WHY THIS ROUTE?"));
    console.log();

    const reasons = [];

    if (mode.fuel > mode.time) {
        reasons.push("+ Lower fuel consumption");
    }
    if (mode.time > mode.fuel && mode.time > mode.safety && mode.time > mode.risk) {
        reasons.push("+ Faster travel time");
    }
    if (mode.safety > mode.time || mode.safety > mode.fuel) {
        reasons.push("+ Safer routing through calmer waters");
    }
    if (mode.risk > mode.time || mode.risk > mode.fuel) {
        reasons.push("+ Reduced weather risk exposure");
    }

    if (reasons.length === 0) {
        reasons.push("+ Balanced trade-off between time, fuel, and safety");
    }

    reasons.forEach(r => console.log(chalk.green(r)));

    if (route.metrics && route.metrics.length > 0) {
        console.log();
        console.log(chalk.dim("  Route details:"));
        console.log(chalk.dim(`  - Total edges: ${route.metrics.length}`));
        console.log(chalk.dim(`  - Average effective speed: ${(distance / totalTime / 1.852).toFixed(2)} knots`));
    }

    console.log();
    console.log(chalk.yellow.bold("LIMITATIONS:"));
    console.log(chalk.dim("  This is a simplified educational model."));
    console.log(chalk.dim("  Actual maritime routing considers many more factors."));
}

export function formatError(message) {
    console.log();
    console.log(chalk.red.bold("ERROR:"));
    console.log(chalk.red(message));
    console.log();
}

export function formatWarning(message) {
    console.log();
    console.log(chalk.yellow.bold("WARNING:"));
    console.log(chalk.yellow(message));
    console.log();
}

export function formatSuccess(message) {
    console.log(chalk.green.bold("✓ ") + chalk.green(message));
}

export function formatInfo(message) {
    console.log(chalk.blue(message));
}

export function formatLoading(message, durationMs = 300) {
    if (!process.stdout.isTTY) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        let frameIndex = 0;

        const interval = setInterval(() => {
            process.stdout.write(`\r${frames[frameIndex % frames.length]} ${message}`);
            frameIndex++;
        }, 80);

        setTimeout(() => {
            clearInterval(interval);
            process.stdout.write("\r" + " ".repeat(message.length + 10) + "\r");
            resolve();
        }, durationMs);
    });
}
