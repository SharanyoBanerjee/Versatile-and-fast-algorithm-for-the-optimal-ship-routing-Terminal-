export class Graph {

    constructor() {

        this.nodes = new Map();

    }

    addNode(node) {

        this.nodes.set(node.id, {
            node: node,
            edges: []
        });

    }

    addEdge(from, to, weight) {

        const fromNode = this.nodes.get(from);

        if (!fromNode) {
            throw new Error(`Node ${from} does not exist.`);
        }

        fromNode.edges.push({
            to: to,
            weight: weight
        });

    }

    getNode(id) {

        return this.nodes.get(id);

    }

}