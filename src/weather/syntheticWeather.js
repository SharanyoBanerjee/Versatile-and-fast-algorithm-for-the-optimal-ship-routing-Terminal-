import { Weather } from "./weather.js";
import { WeatherProvider } from "./weatherProvider.js";

export class SyntheticWeatherProvider extends WeatherProvider {
    getWeather(latitude, longitude, time) {
        const hour = new Date(time).getUTCHours();

        const windSpeed = 10 + (hour % 6);
        const windDirection = 90;
        const waveHeight = 1 + ((hour % 4) * 0.5);
        const waveDirection = 90;
        const currentSpeed = 1 + ((hour % 3) * 0.5);
        const currentDirection = 90;

        return new Weather({
            latitude,
            longitude,
            time: new Date(time),
            windSpeed,
            windDirection,
            waveHeight,
            waveDirection,
            currentSpeed,
            currentDirection
        });
    }
}