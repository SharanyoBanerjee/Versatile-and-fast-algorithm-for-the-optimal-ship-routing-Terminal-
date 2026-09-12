export class Weather {
    constructor({
        latitude,
        longitude,
        time,
        windSpeed,
        windDirection,
        waveHeight,
        waveDirection,
        currentSpeed,
        currentDirection
    }) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.time = time;
        this.windSpeed = windSpeed;
        this.windDirection = windDirection;
        this.waveHeight = waveHeight;
        this.waveDirection = waveDirection;
        this.currentSpeed = currentSpeed;
        this.currentDirection = currentDirection;
    }
}