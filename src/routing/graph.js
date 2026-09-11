export class Graph {

    constructor() {

        this.nodes = new Map();

    }


    addNode(node) {

        this.nodes.set(
            node.id,
            {
                node: node,
                edges: []
            }
        );

    }


    addEdge(from, to, weight) {

        const fromNode =
            this.nodes.get(from);

        const toNode =
            this.nodes.get(to);

        if (!fromNode) {

            throw new Error(
                `Node ${from} does not exist.`
            );

        }

        if (!toNode) {

            throw new Error(
                `Node ${to} does not exist.`
            );

        }

        fromNode.edges.push({
            to: to,
            weight: weight
        });

    }


    addBidirectionalEdge(
        first,
        second,
        weight
    ) {

        this.addEdge(
            first,
            second,
            weight
        );

        this.addEdge(
            second,
            first,
            weight
        );

    }


    getNode(id) {

        return this.nodes.get(id);

    }

}