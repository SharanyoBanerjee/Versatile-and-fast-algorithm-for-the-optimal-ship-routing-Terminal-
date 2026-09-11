import { readFile } from "node:fs/promises";

import { haversineDistance } from "../geography/distance.js";


export class PortManager {

    constructor(ports) {

        this.ports = ports;

    }


    getAllPorts() {

        return this.ports;

    }


    getPortById(id) {

        return this.ports.find(
            port => port.id === id
        );

    }


    getPortByName(name) {

        const searchName =
            name.toLowerCase();

        return this.ports.find(
            port =>
                port.name.toLowerCase() ===
                searchName
        );

    }


    searchPorts(query) {

        const searchQuery =
            query.toLowerCase();

        return this.ports.filter(
            port =>
                port.name
                    .toLowerCase()
                    .includes(searchQuery) ||
                port.country
                    .toLowerCase()
                    .includes(searchQuery)
        );

    }


    findNearestPort(
        latitude,
        longitude
    ) {

        let nearestPort = null;

        let shortestDistance =
            Infinity;

        for (const port of this.ports) {

            const distance =
                haversineDistance(
                    {
                        latitude,
                        longitude
                    },
                    {
                        latitude: port.latitude,
                        longitude: port.longitude
                    }
                );

            if (
                distance <
                shortestDistance
            ) {

                shortestDistance =
                    distance;

                nearestPort =
                    port;

            }

        }

        return nearestPort;

    }

}


export async function loadPorts(
    filePath
) {

    const file =
        await readFile(
            filePath,
            "utf8"
        );

    const data =
        JSON.parse(file);

    return new PortManager(
        data.ports || []
    );

}