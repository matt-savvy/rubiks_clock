import { PriorityQueue, Node } from "../src/priority";

describe('PriorityQueue', () => {

    describe('test', () => {
        it('inserting the new min, should return 1 (size === 6)', () => {
            const queue = new PriorityQueue([2, 4, 6, 8, 9, 11]);
            queue.insert(1);
            // expect(queue.items).toEqual([1, 4, 2, 8, 9, 11, 6]);
            expect(queue.extractMin()).toBe(1);
            expect(queue.extractMin()).not.toBe(1);
        })

        it('inserting the new min, should return 1 (size === 7)', () => {
            const queue = new PriorityQueue([2, 3, 4, 6, 8, 9, 11]);

            queue.insert(1);

            // expect(queue.items).toEqual([1, 2, 4, 3, 8, 9, 11, 6]);
            expect(queue.extractMin()).toBe(1);
            expect(queue.extractMin()).not.toBe(1);
        })

        it('inserting not the next min', () => {
            const queue = new PriorityQueue([2, 4, 6, 8, 9, 11]);
            queue.insert(3);

            // expect(queue.items).toEqual([2, 4, 3, 8, 9, 11, 6]);
            expect(queue.extractMin()).toBe(2);
            expect(queue.extractMin()).toBe(3);
        })

        it('should return 2 (double)', () => {
            const queue = new PriorityQueue([2, 4, 6, 8, 9, 11]);
            queue.insert(2);

            // expect(queue.items).toEqual([2, 4, 3, 8, 9, 11, 6]);
            expect(queue.extractMin()).toBe(2);
            expect(queue.extractMin()).toBe(2);
            expect(queue.extractMin()).not.toBe(2);
        })
    });

})


describe('Node', () => {
    test('add, next, prev, min', () => {
        let root = new Node(1);

        expect(root.next).toBe(null);
        expect(root.prev).toBe(null);

        let two = root.addSibling(2);

        expect(root.next).toBe(two)
        expect(two.prev).toBe(root);

        let three = two.addSibling(3);
        let four = three.addSibling(4);
        let five = four.addSibling(5);
        expect(root.values()).toEqual([
            1,
            2,
            3,
            4,
            5,
        ])
        expect(root.values()).toEqual(two.values().sort())
        expect(root.values()).toEqual(three.values().sort())
        expect(root.values()).toEqual(four.values().sort())
        expect(root.values()).toEqual(five.values().sort())

        let siblings = three.siblings();

        expect(siblings.next().value).toBe(two);
        expect(siblings.next().value).toBe(root);
        expect(siblings.next().value).toBe(four);
        expect(siblings.next().value).toBe(five);

    })

    test('keep adding', () => {
        let list = new Node(1);
        list.addSibling(2);
        list.addSibling(3);
        list.addSibling(4);
        list.addSibling(5);
        expect(list.values()).toEqual([1, 2 , 3, 4, 5]);

    });

    test('size', () => {
        let list = new Node(1);
        list.addChild(2);
        list.addChild(3);
        list.addChild(4);
        list.addChild(5);
        expect(list.size).toBe(5);
    });

    test('size with nested children', () => {
        let list = new Node(1);
        let firstChild = list.addChild(2);
        let secondChild = list.addChild(3);

        firstChild.addChild(21);
        firstChild.addChild(22);
        firstChild.addChild(23);
        firstChild.addChild(24);
        firstChild.addChild(25);

        secondChild.addChild(34);
        let grandChild = secondChild.addChild(35);
        grandChild.addChild(351);

        expect(list.size).toBe(11);
        expect(firstChild.size).toBe(6);
        expect(secondChild.size).toBe(4);
        expect(grandChild.size).toBe(2);
    });

    test('add child', () => {
        let node = new Node(1);
        let child = node.addChild(2);
        expect(child.parent).toBe(node);
        expect(node.child).toBe(child);

        let anotherChild = node.addChild(3);
        expect(anotherChild.parent).toBe(node);
        expect(node.child?.next).toBe(anotherChild);
    })



})
