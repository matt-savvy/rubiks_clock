import { FibonacciHeap } from '@tyriar/fibonacci-heap';


export class PriorityQueue<T> {
    private _heap: FibonacciHeap<number, T>;


    constructor(compareFn?) {
        this._heap = new FibonacciHeap<number, T>()
    }

    get size(): number {
        return this._heap.size()
    }

    insert(key: number, item: T) {
        this._heap.insert(key, item);
    }

    extractMin(): T | undefined {
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
export class Node<T> {
    public value: T;
    public next: Node<T> | null = null;
    public prev: Node<T> | null = null;
    public child: Node<T> | null = null;
    public parent: Node<T> | null = null;
    public degree = 0;

    constructor(value: T) {
        this.value = value;
    }

    public addSibling(value: Node<T> | T): Node<T> {
        let nextNode: Node<T>;

        if (!(value instanceof (Node))) {
            nextNode = new Node(value);
        } else {
            nextNode = value;
        }

        let currentNode: Node<T> | null = this;
        while (currentNode.next) {
            currentNode = currentNode.next;
        };

        nextNode.prev = currentNode;
        currentNode.next = nextNode;

        return nextNode
    }

    public * siblings() {
        let currentNode: null | Node<T> = this.prev;

        // hit all previous nodes
        while (currentNode) {
            yield currentNode;
            currentNode = currentNode.prev;
        }

        // handle all next nodes
        currentNode = this.next;
        while (currentNode) {
            yield currentNode;
            currentNode = currentNode.next;
        }

    }

    public * children() {
        if (this.child) {
            yield this.child;

            yield* this.child.siblings();
        }
    }

    public addChild(value: T | Node<T>): Node<T> {
        let childNode: Node<T>;

        if (!(value instanceof (Node))) {
            childNode = new Node(value);
        } else {
            childNode = value;
        }

        if (this.child) {
            childNode = this.child.addSibling(value);
        } else {
            childNode = childNode;
            this.child = childNode;
        }

        childNode.parent = this;

        return childNode
    }

    public values(): T[] {
        let items: T[] = [this.value];

        for (let item of this.siblings()) {
            items.push(item.value);
        }

        return items
    }

    get size(): number {
        let size = 1;

        for (let currentNode of this.children()) {
            size += currentNode.size
        }

        return size;
    }
}

// binomial heap
class BinomialHeap<T> {
    private root: Node<T> | null = null;
    private compareFn: CompareFn<T> = (a, b) => (a as unknown as number) - (b as unknown as number);

    constructor (compareFn?: CompareFn<T>) {
        if (compareFn) {
            this.compareFn = compareFn;
        }
    }

    insert(value: T | Node<T>): Node<T> {
        let newNode: Node<T>;
        if (value instanceof(Node)) {
            newNode = value;
        } else {
            newNode = new Node(value);
        }

        if (!this.root) {
            // not root, just add this item and return it
            this.root = newNode
            return newNode
        }

        let smallestSize = Number.MAX_SAFE_INTEGER;
        let smallestHeap;

        for (let heap of this.root.children()) {
            let currentHeapSize = heap.size;

            if (currentHeapSize < smallestSize) {
                smallestHeap = heap;
            }
        }
        if (!smallestHeap) {
            return this.root.addChild(newNode);
        }

        return smallestHeap.addChild(newNode);
    }

    extractMin(): Node<T> | null {
        let rootNode = this.root;

        if (rootNode) {
            let newMinNode;

            for (let currentNode of rootNode.children()) {
                if (!newMinNode) {
                    newMinNode = currentNode;
                } else if (this.compareFn(currentNode.value, newMinNode.value) <= 0) {
                    newMinNode = currentNode;
                }
                // sever connection to the root node because we are
                // extracting it.
                currentNode.parent = null;
            }

            if (newMinNode) {
                this.root = newMinNode;

                for (let siblingNode of newMinNode.siblings()) {
                    newMinNode.addChild(siblingNode);
                }

                // connect siblings, bypass root node;
                if (newMinNode.prev) {
                    newMinNode.prev.next = newMinNode.next;
                }
                if (newMinNode.next) {
                    newMinNode.next.prev = newMinNode.prev;
                }
            }

            // sever connections that the root node has before we return it
            rootNode.child = null;
        }
        return rootNode;
    }

    merge(heapB: BinomialHeap<T>): BinomialHeap<T> {
        if (this.root && heapB.root) {
            if (this.compareFn(this.root.value, heapB.root.value) <= 0) {
                   this.root.addChild(heapB.root);
                   return this;
            } else {
                heapB.root.addChild(this.root);
                return heapB;
            }
        }

        return this;
    }

    link(heapB: BinomialHeap<T>) {

    }

    size():number {
        if (this.root) {
            return this.root.size
        }

        return 0;
    }
}

type CompareFn<T> = (a: T, b: T) => number;
/*
export class PriorityQueue<T> {
    private heap: BinomialHeap<T>;

    constructor(items: T[] = [], compareFn?: CompareFn<T>) {
        // attach compareFn first, we need this in insertion below

        this.heap = new BinomialHeap();

        items.forEach((item) => this.insert(item));

    }

    get items(): T[] {
        return []
    }

    get size(): number {
        return this.heap.size();
    }

    extractMin(): T | null {
        let minNode = this.heap.extractMin();
        if (minNode) {
            return minNode.value
        }

        return null;

    }

    insert(item: T): Node<T> {
        return this.heap.insert(item);
    }
}
*/
