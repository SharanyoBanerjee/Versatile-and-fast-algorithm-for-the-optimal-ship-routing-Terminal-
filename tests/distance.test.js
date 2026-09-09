import test from "node:test";
import assert from "node:assert";

import { haversineDistance } from "../src/geography/distance.js";


test("Distance between identical coordinates should be zero", () => {

    const point = {
        lat: 19.076,
        lon: 72.878
    };

    const distance = haversineDistance(
        point,
        point
    );

    assert.strictEqual(distance, 0);

});