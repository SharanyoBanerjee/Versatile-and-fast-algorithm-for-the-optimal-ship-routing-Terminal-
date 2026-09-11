import test from "node:test";
import assert from "node:assert";

import { PortManager } from "../src/ports/portManager.js";


const ports = [

    {
        id: "TEST1",
        name: "Test Port",
        country: "India",
        latitude: 10,
        longitude: 70
    },

    {
        id: "TEST2",
        name: "Another Port",
        country: "Singapore",
        latitude: 20,
        longitude: 80
    }

];


test("PortManager should return all ports", () => {

    const manager =
        new PortManager(
            ports
        );

    assert.strictEqual(
        manager.getAllPorts().length,
        2
    );

});


test("PortManager should find port by ID", () => {

    const manager =
        new PortManager(
            ports
        );

    const port =
        manager.getPortById(
            "TEST1"
        );

    assert.strictEqual(
        port.name,
        "Test Port"
    );

});


test("PortManager should search ports", () => {

    const manager =
        new PortManager(
            ports
        );

    const results =
        manager.searchPorts(
            "Singapore"
        );

    assert.strictEqual(
        results.length,
        1
    );

});


test("PortManager should find nearest port", () => {

    const manager =
        new PortManager(
            ports
        );

    const port =
        manager.findNearestPort(
            10.1,
            70.1
        );

    assert.strictEqual(
        port.id,
        "TEST1"
    );

});