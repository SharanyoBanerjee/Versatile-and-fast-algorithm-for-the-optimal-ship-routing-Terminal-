export class ShipWeatherInteraction {
    constructor(ship, weather) {
        this.ship = ship;
        this.weather = weather;
    }

    calculateCurrentEffect(travelDirection) {
        const angleDifference =
            this.weather.currentDirection - travelDirection;

        const angleRadians = angleDifference * Math.PI / 180;

        return this.weather.currentSpeed * Math.cos(angleRadians);
    }

    calculateWindPenalty() {
        return this.weather.windSpeed * 0.02;
    }

    calculateWavePenalty() {
        return this.weather.waveHeight * 0.5;
    }

    calculateEffectiveSpeed(travelDirection) {
        const shipSpeed = this.ship.cruisingSpeed;

        const currentEffect =
            this.calculateCurrentEffect(travelDirection);

        const windPenalty =
            this.calculateWindPenalty();

        const wavePenalty =
            this.calculateWavePenalty();

        return shipSpeed +
            currentEffect -
            windPenalty -
            wavePenalty;
    }

    calculateTravelTime(distanceKm, travelDirection) {
        const effectiveSpeedKnots =
            this.calculateEffectiveSpeed(travelDirection);

        const effectiveSpeedKmH =
            effectiveSpeedKnots * 1.852;

        return distanceKm / effectiveSpeedKmH;
    }

    calculateFuel(distanceKm, travelDirection) {
        const effectiveSpeed =
            this.calculateEffectiveSpeed(travelDirection);

        const baseFuel =
            this.ship.calculateFuel(distanceKm);

        const speedFactor =
            this.ship.cruisingSpeed / effectiveSpeed;

        return baseFuel * speedFactor;
    }

    isFeasible() {
        return this.ship.canOperateInWeather(this.weather);
    }

    evaluate(distanceKm, travelDirection) {
        const feasible = this.isFeasible();

        if (!feasible) {
            return {
                feasible: false,
                effectiveSpeed: 0,
                travelTime: Infinity,
                fuel: Infinity
            };
        }

        const effectiveSpeed =
            this.calculateEffectiveSpeed(travelDirection);

        if (effectiveSpeed <= 0) {
            return {
                feasible: false,
                effectiveSpeed: 0,
                travelTime: Infinity,
                fuel: Infinity
            };
        }

        return {
            feasible: true,
            effectiveSpeed,
            travelTime: this.calculateTravelTime(
                distanceKm,
                travelDirection
            ),
            fuel: this.calculateFuel(
                distanceKm,
                travelDirection
            )
        };
    }
}