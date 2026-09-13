export const OPTIMIZATION_PROFILES = {
    FASTEST: {
        name: "Fastest",
        timeWeight: 0.8,
        fuelWeight: 0.1,
        safetyWeight: 0.1
    },
    BALANCED: {
        name: "Balanced",
        timeWeight: 0.4,
        fuelWeight: 0.3,
        safetyWeight: 0.3
    },
    SAFEST: {
        name: "Safest",
        timeWeight: 0.1,
        fuelWeight: 0.2,
        safetyWeight: 0.7
    }
};

export function getProfile(mode) {
    const profile = OPTIMIZATION_PROFILES[mode.toUpperCase()];
    if (!profile) {
        throw new Error(`Unknown optimization mode: ${mode}`);
    }
    return profile;
}

export function calculateCost({ travelTime, fuel, safety = 0, profile }) {
    const weights = typeof profile === "string" ? getProfile(profile) : profile;
    return (
        weights.timeWeight * travelTime +
        weights.fuelWeight * fuel +
        weights.safetyWeight * safety
    );
}
