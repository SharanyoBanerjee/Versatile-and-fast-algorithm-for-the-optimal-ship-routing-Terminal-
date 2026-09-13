export const optimizationProfiles = {
    FASTEST: {
        name: "Fastest",
        time: 0.70,
        fuel: 0.10,
        safety: 0.15,
        risk: 0.05
    },
    FUEL_EFFICIENT: {
        name: "Fuel Efficient",
        time: 0.15,
        fuel: 0.65,
        safety: 0.15,
        risk: 0.05
    },
    SAFEST: {
        name: "Safest",
        time: 0.10,
        fuel: 0.10,
        safety: 0.60,
        risk: 0.20
    },
    BALANCED: {
        name: "Balanced",
        time: 0.30,
        fuel: 0.30,
        safety: 0.25,
        risk: 0.15
    }
};

export function createCustomProfile(weights) {
    const { time, fuel, safety, risk } = weights;

    if (time < 0 || fuel < 0 || safety < 0 || risk < 0) {
        throw new Error("All weights must be non-negative.");
    }

    const total = time + fuel + safety + risk;

    if (total === 0) {
        throw new Error("At least one weight must be positive.");
    }

    return {
        name: "Custom",
        time: time / total,
        fuel: fuel / total,
        safety: safety / total,
        risk: risk / total
    };
}

export function getProfile(name, customWeights = null) {
    if (name === "CUSTOM" && customWeights) {
        return createCustomProfile(customWeights);
    }

    const profile = optimizationProfiles[name];

    if (!profile) {
        throw new Error(
            `Unknown optimization profile: ${name}. ` +
            `Available: ${Object.keys(optimizationProfiles).join(", ")}`
        );
    }

    return { ...profile };
}

export function listProfiles() {
    return Object.keys(optimizationProfiles);
}
