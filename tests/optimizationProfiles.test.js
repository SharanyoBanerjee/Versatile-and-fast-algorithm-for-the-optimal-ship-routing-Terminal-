import test from "node:test";
import assert from "node:assert";
import { optimizationProfiles, getProfile, createCustomProfile, listProfiles } from "../src/optimization/optimizationProfiles.js";

test("Optimization profiles exist", () => {
    assert.ok(optimizationProfiles.FASTEST);
    assert.ok(optimizationProfiles.FUEL_EFFICIENT);
    assert.ok(optimizationProfiles.SAFEST);
    assert.ok(optimizationProfiles.BALANCED);
});

test("Profile weights sum to 1", () => {
    const profiles = [
        optimizationProfiles.FASTEST,
        optimizationProfiles.FUEL_EFFICIENT,
        optimizationProfiles.SAFEST,
        optimizationProfiles.BALANCED
    ];

    for (const profile of profiles) {
        const sum = profile.time + profile.fuel + profile.safety + profile.risk;
        assert.strictEqual(sum, 1, `Profile ${profile.name} weights should sum to 1`);
    }
});

test("Fastest emphasizes time", () => {
    const profile = optimizationProfiles.FASTEST;
    assert.ok(profile.time > profile.fuel);
    assert.ok(profile.time > profile.safety);
    assert.ok(profile.time > profile.risk);
});

test("Fuel efficient emphasizes fuel", () => {
    const profile = optimizationProfiles.FUEL_EFFICIENT;
    assert.ok(profile.fuel > profile.time);
    assert.ok(profile.fuel > profile.safety);
    assert.ok(profile.fuel > profile.risk);
});

test("Safest emphasizes safety and risk", () => {
    const profile = optimizationProfiles.SAFEST;
    assert.ok(profile.safety + profile.risk > profile.time);
    assert.ok(profile.safety + profile.risk > profile.fuel);
});

test("getProfile returns correct profile", () => {
    const profile = getProfile("FASTEST");
    assert.strictEqual(profile.name, "Fastest");
    assert.strictEqual(profile.time, 0.70);
});

test("getProfile throws for unknown profile", () => {
    assert.throws(() => getProfile("INVALID"), /Unknown optimization profile/);
});

test("custom profile normalizes weights", () => {
    const custom = createCustomProfile({ time: 30, fuel: 30, safety: 25, risk: 15 });
    const sum = custom.time + custom.fuel + custom.safety + custom.risk;
    assert.strictEqual(sum, 1);
    assert.strictEqual(custom.time, 0.3);
});

test("custom profile requires non-negative weights", () => {
    assert.throws(() => createCustomProfile({ time: -1, fuel: 1, safety: 0, risk: 0 }), /non-negative/);
});

test("custom profile requires at least one positive weight", () => {
    assert.throws(() => createCustomProfile({ time: 0, fuel: 0, safety: 0, risk: 0 }), /positive/);
});

test("listProfiles returns all profile names", () => {
    const profiles = listProfiles();
    assert.ok(profiles.includes("FASTEST"));
    assert.ok(profiles.includes("FUEL_EFFICIENT"));
    assert.ok(profiles.includes("SAFEST"));
    assert.ok(profiles.includes("BALANCED"));
});
