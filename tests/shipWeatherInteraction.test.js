import test from "node:test";
import assert from "node:assert/strict";
import { Ship } from "../src/ships/ship.js";
import { Weather } from "../src/weather/weather.js";
import { ShipWeatherInteraction } from "../src/weather/shipWeatherInteraction.js";

function createShip() {
    return new Ship({
        id: "SHIP001",
        name: "Ocean Star",
        type: "cargo",
        cruisingSpeed: 20,
        maximumSpeed: 25,
        fuelConsumption: 100,
        maximumWaveHeight: 5,
        maximumWindSpeed: 35
    });
}

test("Current should increase speed when moving with it", () => {
    const ship = createShip();

    const weather = new Weather({
        latitude: 10,
        longitude: 75,
        time: new Date("2026-09-12T10:00:00Z"),
        windSpeed: 0,
        windDirection: 90,
        waveHeight: 0,
        waveDirection: 90,
        currentSpeed: 2,
        currentDirection: 90
    });

    const interaction = new ShipWeatherInteraction(ship, weather);

    const speed = interaction.calculateEffectiveSpeed(90);

    assert.equal(speed, 22);
});

test("Current should reduce speed when moving against it", () => {
    const ship = createShip();

    const weather = new Weather({
        latitude: 10,
        longitude: 75,
        time: new Date("2026-09-12T10:00:00Z"),
        windSpeed: 0,
        windDirection: 90,
        waveHeight: 0,
        waveDirection: 90,
        currentSpeed: 2,
        currentDirection: 90
    });

    const interaction = new ShipWeatherInteraction(ship, weather);

    const speed = interaction.calculateEffectiveSpeed(270);

    assert.equal(speed, 18);
});

test("Wind and waves should reduce effective speed", () => {
    const ship = createShip();

    const weather = new Weather({
        latitude: 10,
        longitude: 75,
        time: new Date("2026-09-12T10:00:00Z"),
        windSpeed: 20,
        windDirection: 90,
        waveHeight: 2,
        waveDirection: 90,
        currentSpeed: 0,
        currentDirection: 90
    });

    const interaction = new ShipWeatherInteraction(ship, weather);

    const speed = interaction.calculateEffectiveSpeed(90);

    assert.equal(speed, 18.6);
});

test("Unsafe weather should make the route infeasible", () => {
    const ship = createShip();

    const weather = new Weather({
        latitude: 10,
        longitude: 75,
        time: new Date("2026-09-12T10:00:00Z"),
        windSpeed: 40,
        windDirection: 90,
        waveHeight: 2,
        waveDirection: 90,
        currentSpeed: 1,
        currentDirection: 90
    });

    const interaction = new ShipWeatherInteraction(ship, weather);

    const result = interaction.evaluate(100, 90);

    assert.equal(result.feasible, false);
    assert.equal(result.travelTime, Infinity);
    assert.equal(result.fuel, Infinity);
});

test("Interaction should calculate travel time", () => {
    const ship = createShip();

    const weather = new Weather({
        latitude: 10,
        longitude: 75,
        time: new Date("2026-09-12T10:00:00Z"),
        windSpeed: 0,
        windDirection: 90,
        waveHeight: 0,
        waveDirection: 90,
        currentSpeed: 2,
        currentDirection: 90
    });

    const interaction = new ShipWeatherInteraction(ship, weather);

    const time = interaction.calculateTravelTime(185.2, 90);

    assert.equal(time, 4.545454545454545);
});