const EARTH_RADIUS_KM = 6371;

export function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

export function haversineDistance(coord1, coord2) {

    const lat1 = toRadians(coord1.lat);
    const lat2 = toRadians(coord2.lat);

    const deltaLat = toRadians(
        coord2.lat - coord1.lat
    );

    const deltaLon = toRadians(
        coord2.lon - coord1.lon
    );

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) ** 2;

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return EARTH_RADIUS_KM * c;
}