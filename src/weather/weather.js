export class Weather {
    constructor({ windSpeed = 10, waveHeight = 1, time = new Date() }) {
        this.windSpeed = windSpeed;
        this.waveHeight = waveHeight;
        this.time = time instanceof Date ? time : new Date(time);
    }
}

export function getWeather(latitude, longitude, time) {
    const date = time instanceof Date ? time : new Date(time);
    const hour = date.getUTCHours();

    // Deterministic synthetic weather model (wind: 10-25 kts, waves: 1.0-3.0m)
    const windSpeed = 10 + (hour % 6) * 2 + Math.abs(Math.sin(latitude * 0.05)) * 3;
    const waveHeight = 1.0 + (hour % 4) * 0.4 + Math.abs(Math.cos(longitude * 0.05)) * 0.4;

    return new Weather({
        windSpeed,
        waveHeight,
        time: date
    });
}

export function calculateEffectiveSpeed(shipSpeedKnots, weather) {
    const windPenalty = weather.windSpeed * 0.1;
    const wavePenalty = weather.waveHeight * 0.8;
    const effective = shipSpeedKnots - windPenalty - wavePenalty;
    return Math.max(effective, 1.0); // Ensure minimal forward motion if feasible
}

export function calculateSafetyPenalty(weather, ship) {
    const windRatio = weather.windSpeed / ship.maximumWindSpeed;
    const waveRatio = weather.waveHeight / ship.maximumWaveHeight;
    return Math.max(windRatio, waveRatio) * 10;
}