import { Coordinate } from "./coordinates.js";

import { haversineDistance } from "./distance.js";


export class GridNode {

    constructor(
        id,
        lat,
        lon,
        navigable = true
    ) {

        this.id = id;

        this.coordinate =
            new Coordinate(
                lat,
                lon
            );

        this.navigable =
            navigable;

    }

}


export class OceanGrid {

    constructor({
        minLat,
        maxLat,
        minLon,
        maxLon,
        step = 1,
        navigability = () => true
    }) {

        this.minLat =
            minLat;

        this.maxLat =
            maxLat;

        this.minLon =
            minLon;

        this.maxLon =
            maxLon;

        this.step =
            step;

        this.navigability =
            navigability;

        this.nodes =
            new Map();

    }


    generate() {

        let row = 0;

        for (
            let lat = this.minLat;
            lat <= this.maxLat;
            lat += this.step
        ) {

            let column = 0;

            for (
                let lon = this.minLon;
                lon <= this.maxLon;
                lon += this.step
            ) {

                const id =
                    `N${row}_${column}`;

                const navigable =
                    this.navigability(
                        lat,
                        lon
                    );

                const node =
                    new GridNode(
                        id,
                        lat,
                        lon,
                        navigable
                    );

                this.nodes.set(
                    id,
                    node
                );

                column++;

            }

            row++;

        }

        return this.nodes;

    }


    getNode(id) {

        return this.nodes.get(id);

    }


    findNearestNavigableNode(
        latitude,
        longitude
    ) {

        let nearestNode =
            null;

        let shortestDistance =
            Infinity;

        for (
            const node of this.nodes.values()
        ) {

            if (!node.navigable) {
                continue;
            }

            const distance =
                haversineDistance(
                    {
                        latitude,
                        longitude
                    },
                    node.coordinate
                );

            if (
                distance <
                shortestDistance
            ) {

                shortestDistance =
                    distance;

                nearestNode =
                    node;

            }

        }

        return nearestNode;

    }


    getNeighbors(node) {

        const neighbors = [];

        const directions = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1]
        ];

        const rowColumn =
            this.getRowColumn(
                node.id
            );

        if (!rowColumn) {
            return neighbors;
        }

        const {
            row,
            column
        } = rowColumn;

        for (
            const [
                rowOffset,
                columnOffset
            ] of directions
        ) {

            const neighborRow =
                row + rowOffset;

            const neighborColumn =
                column + columnOffset;

            const neighborId =
                `N${neighborRow}_${neighborColumn}`;

            const neighbor =
                this.nodes.get(
                    neighborId
                );

            if (
                neighbor &&
                neighbor.navigable
            ) {

                neighbors.push(
                    neighbor
                );

            }

        }

        return neighbors;

    }


    getRowColumn(id) {

        const match =
            id.match(
                /^N(\d+)_(\d+)$/
            );

        if (!match) {
            return null;
        }

        return {
            row: Number(match[1]),
            column: Number(match[2])
        };

    }

}