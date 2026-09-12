import { normalize } from "./normalization.js";

export class CostEngine {
    constructor({
        timeWeight,
        fuelWeight,
        safetyWeight,
        riskWeight
    }) {
        this.timeWeight = timeWeight;
        this.fuelWeight = fuelWeight;
        this.safetyWeight = safetyWeight;
        this.riskWeight = riskWeight;
    }

    calculateEdgeCost({
        travelTime,
        fuel,
        safety,
        risk,
        ranges
    }) {
        const normalizedTime = normalize(
            travelTime,
            ranges.time.min,
            ranges.time.max
        );

        const normalizedFuel = normalize(
            fuel,
            ranges.fuel.min,
            ranges.fuel.max
        );

        const normalizedSafety = normalize(
            safety,
            ranges.safety.min,
            ranges.safety.max
        );

        const normalizedRisk = normalize(
            risk,
            ranges.risk.min,
            ranges.risk.max
        );

        return (
            this.timeWeight * normalizedTime +
            this.fuelWeight * normalizedFuel +
            this.safetyWeight * normalizedSafety +
            this.riskWeight * normalizedRisk
        );
    }

    calculateRouteCost(routeMetrics) {
        const totalTime = routeMetrics.reduce(
            (total, edge) => total + edge.travelTime,
            0
        );

        const totalFuel = routeMetrics.reduce(
            (total, edge) => total + edge.fuel,
            0
        );

        const totalSafety = routeMetrics.reduce(
            (total, edge) => total + edge.safety,
            0
        );

        const totalRisk = routeMetrics.reduce(
            (total, edge) => total + edge.risk,
            0
        );

        return {
            time: totalTime,
            fuel: totalFuel,
            safety: totalSafety,
            risk: totalRisk
        };
    }
}