import { PriorityQueue } from "../src/priority";

function prioritizeFn(items: number[]): number[] {

    function getParentIndex(index: number): number {
        return Math.round(index / 2) - 1;
    }

    let currentIndex = items.length - 1
    let parentIndex = getParentIndex(currentIndex);

    // do this while the current item has a better score than its parent and
    // we still have a parent
    while (
        (parentIndex >= 0) &&
        (items[currentIndex] as number < items[parentIndex])
    ) {
        // swap places
        let currentItem = items[currentIndex];
        let parentItem = items[parentIndex]
        items[parentIndex] = currentItem;
        items[currentIndex] = parentItem;

        currentIndex = parentIndex;
        parentIndex = getParentIndex(currentIndex);
    }

    return items
}

describe.skip('PriorityQueue', () => {

    describe('.shift', () => {
        it('should return 1', () => {
            const queue = new PriorityQueue([2, 4, 6, 8, 9, 11], prioritizeFn);
            queue.insert(1);
            expect(queue.items).toEqual([1, 4, 2, 8, 9, 11, 6]);
            expect(queue.shift()).toBe(1);
        })

        it('should return 1', () => {
            const queue = new PriorityQueue([2, 3, 4, 6, 8, 9, 11], prioritizeFn);
            queue.insert(1);
            expect(queue.items).toEqual([1, 2, 4, 3, 8, 9, 11, 6]);
            expect(queue.shift()).toBe(1);
        })

        it('should return 2', () => {
            const queue = new PriorityQueue([2, 4, 6, 8, 9, 11], prioritizeFn);
            queue.insert(3);

            expect(queue.items).toEqual([2, 4, 3, 8, 9, 11, 6]);
            expect(queue.shift()).toBe(2);
        })
    });


})
