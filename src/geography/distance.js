const EARTH_RADIUS_KM = 6371;

export function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function getLat(point) {
    return point.lat !== undefined
        ? point.lat
        : point.latitude;
}

function getLon(point) {
    return point.lon !== undefined
        ? point.lon
        : point.longitude;
}

export function haversineDistance(coord1, coord2) {

    const lat1 = toRadians(getLat(coord1));
    const lat2 = toRadians(getLat(coord2));

    const deltaLat = toRadians(
        getLat(coord2) - getLat(coord1)
    );

    const deltaLon = toRadians(
        getLon(coord2) - getLon(coord1)
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