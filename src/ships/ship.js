export class Ship {
    constructor({
        id,
        name,
        type,
        cruisingSpeed,
        maximumSpeed,
        fuelConsumption,
        maximumWaveHeight,
        maximumWindSpeed
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

    getSpeedKmH() {
        return this.cruisingSpeed * 1.852;
    }

    calculateTravelTime(distanceKm) {
        return distanceKm / this.getSpeedKmH();
    }

    calculateFuel(distanceKm) {
        return distanceKm * this.fuelConsumption;
    }

    canOperateInWeather(weather) {
        return (
            weather.waveHeight <= this.maximumWaveHeight &&
            weather.windSpeed <= this.maximumWindSpeed
        );
    }
}