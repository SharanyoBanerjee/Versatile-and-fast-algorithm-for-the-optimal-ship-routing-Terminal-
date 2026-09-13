import test from "node:test";
import assert from "node:assert/strict";
import { haversineDistance, toRadians } from "../src/geography/distance.js";

test("Distance between identical coordinates should be zero", () => {
    const point = { lat: 18.94, lon: 72.84 };
    const distance = haversineDistance(point, point);
    assert.equal(distance, 0);
});

test("Distance between Mumbai and Singapore should be approximately ~3900 km", () => {
    const mumbai = { lat: 18.94, lon: 72.84 };
    const singapore = { lat: 1.26, lon: 103.84 };
    const distance = haversineDistance(mumbai, singapore);

    // Great circle distance between Mumbai and Singapore is ~3900km
    assert.ok(distance > 3800 && distance < 4000, `Expected ~3900km, got ${distance}`);
});

test("toRadians converts degrees correctly", () => {
    assert.equal(toRadians(0), 0);
    assert.equal(toRadians(180), Math.PI);
});