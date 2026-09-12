export class ShipManager {
    constructor() {
        this.ships = new Map();
    }

    addShip(ship) {
        this.ships.set(ship.id, ship);
    }

    getShip(id) {
        return this.ships.get(id) || null;
    }

    getAllShips() {
        return [...this.ships.values()];
    }

    removeShip(id) {
        return this.ships.delete(id);
    }

    searchShips(query) {
        const normalizedQuery = query.toLowerCase();

        return this.getAllShips().filter(ship =>
            ship.name.toLowerCase().includes(normalizedQuery) ||
            ship.type.toLowerCase().includes(normalizedQuery)
        );
    }
}