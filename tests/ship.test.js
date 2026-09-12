import test from "node:test";
import assert from "node:assert/strict";
import { Ship } from "../src/ships/ship.js";
import { ShipManager } from "../src/ships/shipManager.js";

test("Ship should convert knots to km/h", () => {
    const ship = new Ship({
        id: "SHIP001",
        name: "Ocean Star",
        type: "cargo",
        cruisingSpeed: 20,
        maximumSpeed: 25,
        fuelConsumption: 100,
        maximumWaveHeight: 5,
        maximumWindSpeed: 35
    });

    assert.equal(ship.getSpeedKmH(), 37.04);
});

test("Ship should calculate travel time", () => {
    const ship = new Ship({
        id: "SHIP001",
        name: "Ocean Star",
        type: "cargo",
        cruisingSpeed: 20,
        maximumSpeed: 25,
        fuelConsumption: 100,
        maximumWaveHeight: 5,
        maximumWindSpeed: 35
    });

    assert.equal(ship.calculateTravelTime(185.2), 5);
});

test("Ship should calculate fuel consumption", () => {
    const ship = new Ship({
        id: "SHIP001",
        name: "Ocean Star",
        type: "cargo",
        cruisingSpeed: 20,
        maximumSpeed: 25,
        fuelConsumption: 100,
        maximumWaveHeight: 5,
        maximumWindSpeed: 35
    });

    assert.equal(ship.calculateFuel(500), 50000);
});

test("Ship should reject unsafe weather", () => {
    const ship = new Ship({
        id: "SHIP001",
        name: "Ocean Star",
        type: "cargo",
        cruisingSpeed: 20,
        maximumSpeed: 25,
        fuelConsumption: 100,
        maximumWaveHeight: 5,
        maximumWindSpeed: 35
    });

    assert.equal(
        ship.canOperateInWeather({
            waveHeight: 6,
            windSpeed: 30
        }),
        false
    );
});

test("ShipManager should manage ships", () => {
    const manager = new ShipManager();

    const ship = new Ship({
        id: "SHIP001",
        name: "Ocean Star",
        type: "cargo",
        cruisingSpeed: 20,
        maximumSpeed: 25,
        fuelConsumption: 100,
        maximumWaveHeight: 5,
        maximumWindSpeed: 35
    });

    manager.addShip(ship);

    assert.equal(manager.getShip("SHIP001"), ship);
    assert.equal(manager.getAllShips().length, 1);
});