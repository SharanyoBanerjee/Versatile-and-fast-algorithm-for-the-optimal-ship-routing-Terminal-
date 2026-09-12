export class WeatherProvider {
    getWeather(latitude, longitude, time) {
        throw new Error("getWeather() must be implemented by a weather provider");
    }
}