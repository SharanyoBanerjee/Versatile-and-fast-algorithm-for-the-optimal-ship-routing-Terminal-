import test from "node:test";
import assert from "node:assert/strict";
import { Weather } from "../src/weather/weather.js";
import { SyntheticWeatherProvider } from "../src/weather/syntheticWeather.js";

test("Weather should store environmental data", () => {
    const time = new Date("2026-09-12T10:00:00Z");

    const weather = new Weather({
        latitude: 10,
        longitude: 75,
        time,
        windSpeed: 20,
        windDirection: 90,
        waveHeight: 2.5,
        waveDirection: 90,
        currentSpeed: 1.5,
        currentDirection: 90
    });

    assert.equal(weather.latitude, 10);
    assert.equal(weather.longitude, 75);
    assert.equal(weather.time, time);
    assert.equal(weather.windSpeed, 20);
    assert.equal(weather.windDirection, 90);
    assert.equal(weather.waveHeight, 2.5);
    assert.equal(weather.waveDirection, 90);
    assert.equal(weather.currentSpeed, 1.5);
    assert.equal(weather.currentDirection, 90);
});

test("SyntheticWeatherProvider should return weather", () => {
    const provider = new SyntheticWeatherProvider();
    const time = new Date("2026-09-12T10:00:00Z");

    const weather = provider.getWeather(10, 75, time);

    assert.equal(weather.latitude, 10);
    assert.equal(weather.longitude, 75);
    assert.equal(weather.time.getTime(), time.getTime());

    assert.ok(weather.windSpeed >= 10);
    assert.ok(weather.waveHeight >= 1);
    assert.ok(weather.currentSpeed >= 1);
});

test("Synthetic weather should change with time", () => {
    const provider = new SyntheticWeatherProvider();

    const time1 = new Date("2026-09-12T10:00:00Z");
    const time2 = new Date("2026-09-12T12:00:00Z");

    const weather1 = provider.getWeather(10, 75, time1);
    const weather2 = provider.getWeather(10, 75, time2);

    assert.notEqual(weather1.windSpeed, weather2.windSpeed);
    assert.notEqual(weather1.waveHeight, weather2.waveHeight);
    assert.notEqual(weather1.currentSpeed, weather2.currentSpeed);
});