import test from "node:test";
import assert from "node:assert";

import { LandMask } from "../src/geography/landMask.js";


const testGeoJSON = {

    type: "FeatureCollection",

    features: [

        {
            type: "Feature",

            properties: {},

            geometry: {

                type: "Polygon",

                coordinates: [

                    [
                        [70, 10],
                        [80, 10],
                        [80, 20],
                        [70, 20],
                        [70, 10]
                    ]

                ]

            }

        }

    ]

};


test("LandMask should detect land", () => {

    const landMask =
        new LandMask(
            testGeoJSON
        );

    assert.strictEqual(
        landMask.isLand(15, 75),
        true
    );

});


test("LandMask should detect ocean", () => {

    const landMask =
        new LandMask(
            testGeoJSON
        );

    assert.strictEqual(
        landMask.isOcean(25, 75),
        true
    );

});


test("LandMask should reject points outside land", () => {

    const landMask =
        new LandMask(
            testGeoJSON
        );

    assert.strictEqual(
        landMask.isLand(25, 75),
        false
    );

});