export class Coordinate {

    constructor(lat, lon) {
        this.lat = lat;
        this.lon = lon;
    }

    get latitude() {
        return this.lat;
    }

    get longitude() {
        return this.lon;
    }

}