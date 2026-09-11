import { readFile } from "node:fs/promises";


function pointInRing(
    latitude,
    longitude,
    ring
) {

    let inside = false;

    for (
        let i = 0, j = ring.length - 1;
        i < ring.length;
        j = i++
    ) {

        const [longitudeA, latitudeA] =
            ring[i];

        const [longitudeB, latitudeB] =
            ring[j];

        const intersects =
            (
                latitudeA > latitude
            ) !== (
                latitudeB > latitude
            ) &&
            longitude <
            (
                (longitudeB - longitudeA) *
                (latitude - latitudeA) /
                (latitudeB - latitudeA) +
                longitudeA
            );

        if (intersects) {

            inside = !inside;

        }

    }

    return inside;

}


function pointInPolygon(
    latitude,
    longitude,
    polygon
) {

    if (polygon.length === 0) {

        return false;

    }

    const outerRing =
        polygon[0];

    if (
        !pointInRing(
            latitude,
            longitude,
            outerRing
        )
    ) {

        return false;

    }

    for (
        let i = 1;
        i < polygon.length;
        i++
    ) {

        if (
            pointInRing(
                latitude,
                longitude,
                polygon[i]
            )
        ) {

            return false;

        }

    }

    return true;

}


function pointInGeometry(
    latitude,
    longitude,
    geometry
) {

    if (!geometry) {

        return false;

    }

    if (geometry.type === "Polygon") {

        return pointInPolygon(
            latitude,
            longitude,
            geometry.coordinates
        );

    }

    if (geometry.type === "MultiPolygon") {

        for (
            const polygon of geometry.coordinates
        ) {

            if (
                pointInPolygon(
                    latitude,
                    longitude,
                    polygon
                )
            ) {

                return true;

            }

        }

    }

    return false;

}


export class LandMask {

    constructor(geoJSON) {

        this.features =
            geoJSON.features || [];

    }


    isLand(
        latitude,
        longitude
    ) {

        for (
            const feature of this.features
        ) {

            if (
                pointInGeometry(
                    latitude,
                    longitude,
                    feature.geometry
                )
            ) {

                return true;

            }

        }

        return false;

    }


    isOcean(
        latitude,
        longitude
    ) {

        return !this.isLand(
            latitude,
            longitude
        );

    }

}


export async function loadLandMask(
    filePath
) {

    const file =
        await readFile(
            filePath,
            "utf8"
        );

    const geoJSON =
        JSON.parse(file);

    return new LandMask(
        geoJSON
    );

}