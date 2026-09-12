import test from "node:test";
import assert from "node:assert/strict";
import { normalize } from "../src/optimization/normalization.js";
import { CostEngine } from "../src/optimization/costEngine.js";

test("Normalize should convert a value to a 0 to 1 range", () => {
    assert.equal(normalize(50, 0, 100), 0.5);
});

test("Normalize should return zero when minimum and maximum are equal", () => {
    assert.equal(normalize(50, 50, 50), 0);
});

test("CostEngine should calculate weighted edge cost", () => {
    const engine = new CostEngine({
        timeWeight: 0.5,
        fuelWeight: 0.3,
        safetyWeight: 0.1,
        riskWeight: 0.1
    });

    const cost = engine.calculateEdgeCost({
        travelTime: 50,
        fuel: 50,
        safety: 50,
        risk: 50,
        ranges: {
            time: { min: 0, max: 100 },
            fuel: { min: 0, max: 100 },
            safety: { min: 0, max: 100 },
            risk: { min: 0, max: 100 }
        }
    });

    assert.equal(cost, 0.5);
});

test("CostEngine should calculate total route metrics", () => {
    const engine = new CostEngine({
        timeWeight: 0.5,
        fuelWeight: 0.3,
        safetyWeight: 0.1,
        riskWeight: 0.1
    });

    const result = engine.calculateRouteCost([
        {
            travelTime: 5,
            fuel: 100,
            safety: 2,
            risk: 1
        },
        {
            travelTime: 7,
            fuel: 150,
            safety: 3,
            risk: 2
        }
    ]);

    assert.equal(result.time, 12);
    assert.equal(result.fuel, 250);
    assert.equal(result.safety, 5);
    assert.equal(result.risk, 3);
});