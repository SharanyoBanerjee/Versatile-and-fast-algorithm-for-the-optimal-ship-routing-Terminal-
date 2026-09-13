import { timeDependentAStar } from "./timeDependentAstar.js";

export class RouteReplanner {
    constructor({
        routingEngine,
        replanThreshold = 0.2,
        costIncreaseThreshold = 0.15
    }) {
        this.routingEngine = routingEngine;
        this.replanThreshold = replanThreshold;
        this.costIncreaseThreshold = costIncreaseThreshold;
        this.lastRoute = null;
        this.lastCost = null;
    }

    evaluate(currentPosition, currentTime, ship, weatherProvider, costEngine, targetId) {
        if (!this.lastRoute) {
            return { shouldReplan: false, reason: "No previous route to evaluate." };
        }

        const evaluation = this.routingEngine.evaluateRoute(
            this.lastRoute,
            currentPosition,
            currentTime,
            ship,
            weatherProvider
        );

        if (!evaluation.stillFeasible) {
            return {
                shouldReplan: true,
                reason: "Route is no longer feasible due to weather conditions."
            };
        }

        if (evaluation.costIncreaseRatio > this.costIncreaseThreshold) {
            return {
                shouldReplan: true,
                reason: `Route cost increased by ${(evaluation.costIncreaseRatio * 100).toFixed(1)}%.`
            };
        }

        if (evaluation.riskIncrease > this.replanThreshold) {
            return {
                shouldReplan: true,
                reason: "Risk level increased significantly."
            };
        }

        return {
            shouldReplan: false,
            reason: "Current route remains acceptable.",
            evaluation
        };
    }

    replan({
        currentPosition,
        currentTime,
        targetId,
        ship,
        weatherProvider,
        costEngine,
        graph
    }) {
        const currentNode = this.findNearestNode(graph, currentPosition.latitude, currentPosition.longitude);

        if (!currentNode) {
            throw new Error("Cannot find current position in graph.");
        }

        const newRoute = timeDependentAStar({
            graph,
            startId: currentNode.id,
            targetId,
            ship,
            weatherProvider,
            costEngine,
            departureTime: currentTime
        });

        this.lastRoute = newRoute;
        this.lastCost = newRoute.totalTime;

        return {
            route: newRoute,
            replanned: true,
            fromPosition: currentPosition,
            fromTime: currentTime
        };
    }

    findNearestNode(graph, latitude, longitude) {
        let nearestNode = null;
        let shortestDistance = Infinity;

        for (const [id, nodeData] of graph.nodes.entries()) {
            if (!nodeData.node.navigable) continue;

            const distance = Math.sqrt(
                Math.pow(nodeData.node.coordinate.lat - latitude, 2) +
                Math.pow(nodeData.node.coordinate.lon - longitude, 2)
            );

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestNode = { id, ...nodeData };
            }
        }

        return nearestNode;
    }

    storeRoute(route) {
        this.lastRoute = route;
        this.lastCost = route.totalTime;
    }
}
