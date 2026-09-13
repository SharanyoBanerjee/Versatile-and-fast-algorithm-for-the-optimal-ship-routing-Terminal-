export class Ship {
    constructor({
        id = "SHIP1",
        name,
        type = "Cargo Ship",
        cruisingSpeed,
        maximumSpeed = cruisingSpeed * 1.2,
        fuelConsumption,
        maximumWaveHeight = 5,
        maximumWindSpeed = 40
    }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.cruisingSpeed = cruisingSpeed;
        this.maximumSpeed = maximumSpeed;
        this.fuelConsumption = fuelConsumption;
        this.maximumWaveHeight = maximumWaveHeight;
        this.maximumWindSpeed = maximumWindSpeed;
    }

    getSpeedKmH(speedKnots = this.cruisingSpeed) {
        return speedKnots * 1.852;
    }

    calculateTravelTime(distanceKm, speedKnots = this.cruisingSpeed) {
        const speedKmH = this.getSpeedKmH(speedKnots);
        return speedKmH > 0 ? distanceKm / speedKmH : Infinity;
    }

    calculateFuel(distanceKm) {
        return distanceKm * this.fuelConsumption;
    }

    canOperateInWeather(weather) {
        if (!weather) return true;
        return (
            weather.waveHeight <= this.maximumWaveHeight &&
            weather.windSpeed <= this.maximumWindSpeed
        );
    }
}