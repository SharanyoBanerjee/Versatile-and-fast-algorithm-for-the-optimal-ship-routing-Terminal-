export class PriorityQueue {

    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {

        const item = {
            element: element,
            priority: priority
        };

        this.items.push(item);

        this.bubbleUp();

    }

    dequeue() {

        if (this.items.length === 0) {
            return null;
        }

        const minimum = this.items[0];

        const last = this.items.pop();

        if (this.items.length > 0) {

            this.items[0] = last;

            this.bubbleDown();

        }

        return minimum;

    }

    bubbleUp() {

        let index = this.items.length - 1;

        while (index > 0) {

            const parentIndex = Math.floor(
                (index - 1) / 2
            );

            if (
                this.items[parentIndex].priority <=
                this.items[index].priority
            ) {
                break;
            }

            [
                this.items[parentIndex],
                this.items[index]
            ] = [
                this.items[index],
                this.items[parentIndex]
            ];

            index = parentIndex;

        }

    }

    bubbleDown() {

        let index = 0;

        while (true) {

            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;

            let smallest = index;

            if (
                leftChild < this.items.length &&
                this.items[leftChild].priority <
                this.items[smallest].priority
            ) {
                smallest = leftChild;
            }

            if (
                rightChild < this.items.length &&
                this.items[rightChild].priority <
                this.items[smallest].priority
            ) {
                smallest = rightChild;
            }

            if (smallest === index) {
                break;
            }

            [
                this.items[index],
                this.items[smallest]
            ] = [
                this.items[smallest],
                this.items[index]
            ];

            index = smallest;

        }

    }

    isEmpty() {

        return this.items.length === 0;

    }

}