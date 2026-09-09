import { Coordinate } from "./coordinates.js";

export class GridNode {

    constructor(id, lat, lon) {

        this.id = id;

        this.coordinate = new Coordinate(
            lat,
            lon
        );

    }

}