import { FibonacciHeap } from '@tyriar/fibonacci-heap';

/**
 *  Function that assumes
 *  - the last item is the item that needs to be rebalanced
 *  - the first item is intentionally left blank
 * */
// export type PrioritizeFn<T> = (items: T[]) => T[];

export class PriorityQueue<T> {
    private _heap: FibonacciHeap<number, T>;


    constructor(items: T[] = [], compareFn) {
        this._heap = new FibonacciHeap<number, T>(compareFn)

        items.forEach((item) => {
            this.insert(item);
        });
    }

    get length(): number {
        return this._heap.size()
    }

    insert(item: T) {
        this._heap.insert(Date.now(), item);
    }

    shift(): T | undefined {
        if (!this._heap.isEmpty()) {
            return this._heap.extractMinimum()?.value;
        }

        return undefined;
    }
}

/*
export class PriorityQueueFibonacci<T> {
    private _items: T[] = [];
    private _prioritizeFn: PrioritizeFn<T>

    constructor(items: T[], prioritizeFn: PrioritizeFn<T>) {
        this._items = [...items];
        this._prioritizeFn = prioritizeFn;
    }

    get items(): T[] {
        return [...this._items]
    }

    get length(): number {
        return this._items.length;
    }

    shift(): T | undefined {
        return this._items.shift();
    }

    insert(item: T): void {
        this._items = this._prioritizeFn([...this._items, item])
    }
}

function fib(n: number): number {
    if (n === 0) {
        return 0
    } else if (n === 1) {
        return 1
    }

    let fibonacciNumbers = [0, 1];
    let nextNumber = fibonacciNumbers[1] + fibonacciNumbers[0];

    for (let i = 1; i < n; i+= 1) {
        nextNumber = fibonacciNumbers[i] + fibonacciNumbers[i - 1]
        fibonacciNumbers.push(nextNumber);
    }

    return nextNumber;
}

/*
For each node, the linked list also maintains
- the number of children a node has (length)
- a pointer to the root containing the minimum key (minNode)
- whether the node is marked.

 Each node in the heap has degree at most O(\log n)O(logn), and the size of a subtree rooted in a node of degree kk is at least F_k+2F
k +2, where F_kF
k is the kth Fibonacci;
This structure is maintained by having a rule that at most one child can be cut from each non-root node.
/*
class Node {
    private _length = 0;
    private _minNode;
    private _parent = null;
    private marked = false;

    constructor(root) {
        this._minNode = root
        this._length = 1;
    }

    get length(): number {
        return this._length;
    }

    get minNode() {
        let minNode = this._minNode;
        this._length -= 1;


        return minNode
    }

    get parent() {
        return this._parent;
    }

    merge() {

    }

    insert(item) {
        let node = new Node(item);
        node._parent = this;
        this._length += 1;
    }
}

*/
