export enum ClockFace {
    One = 1,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Eleven,
    Twelve
}

export enum PegValue {
    Up = 1,
    Down = 0,
}

export enum Wheel {
    Upper = 1,
    Lower = 0
}

export enum Direction {
    Clockwise = 1,
    CounterClockwise = -1,
}

type ClockState<T> = [
    // front, L - R, top to bottom
    [
        [T, T, T],
        [T, T, T],
        [T, T, T],
    ],
    // back, R - L, top to bottom
    // note, back is mirrored L to R as if you are looking at it
    // with x-ray vision
    [
        [T, T, T],
        [T, T, T],
        [T, T, T],
    ]
]
type ClockStateFlat<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T]



// convert pegState to a flat list
// remove pegStates and setPegStates (for now, might want this back for a front end but doubt it. Front end can
// handle what states the pegs are in and just pass those with any Moves

type AffectedClocks = ClockState<boolean>;
export type PuzzleState = ClockState<ClockFace>;

export type PuzzleStateFlat = ClockStateFlat<ClockFace>

const solvedStateFlat: PuzzleStateFlat = [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]

const solvedState: PuzzleState = [
    // front
    [
        [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
        [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
        [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
    ],
    // back
    [
        [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
        [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
        [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
    ]
]

export type PegState = [
    [PegValue, PegValue],
    [PegValue, PegValue],
]

const defaultPegState: PegState = [
    [PegValue.Up, PegValue.Up],
    [PegValue.Up, PegValue.Up],
]

const pegTop = 0;
    const pegBottom = 1;
    const pegLeft = 0;
    const pegRight = 1;

/**
 * Return true if the two states are the same
 * @param stateA
 * @param stateB
 */
export function match(stateA: PuzzleStateFlat, stateB: PuzzleStateFlat): Boolean {
    for (let i = 0; i < stateA.length; i += 1) {
        if (stateA[i] !== stateB[i]) {
            return false;
        }
    }

    return true;
}

export function turnClock(face: ClockFace, direction: Direction = Direction.Clockwise): ClockFace {
    let value = (direction == Direction.Clockwise) ? 1 : -1;
    let newValue = (face + value) % 12;

    let faces = Object.keys(ClockFace)
        .map((key) => Number(key))
        .filter((key) => !Number.isNaN(key));
    faces = [ClockFace.Twelve, ...faces];

    return faces[newValue];
}

export type Move = {
    wheel: Wheel,
    direction: Direction,
    pegState: PegState
}
export type SolveStep = {
    puzzle: Puzzle,
    move: Move, // move to get from the last state to this state
}

function copyPuzzleState(puzzleState: PuzzleState): PuzzleState {
    return puzzleState.map((side) => {
        return side.map((row) => [...row]);
    }) as PuzzleState;
}

function copyPuzzleStateFlat(puzzleState: PuzzleStateFlat): PuzzleStateFlat {
    return [...puzzleState];
}

function copyPegState(pegState: PegState): PegState {
    return pegState.map((rows) => {
        return rows.map((peg) => peg)
    }) as PegState;
}

// row, col of the peg
export type Peg = [0 | 1, 0 | 1]

function isPuzzleState(obj: any): obj is PuzzleState {
    if (obj.length == 2) {
        if (obj[0].length === 3) {
            if (obj[0][0].length === 3) {
                return true;
            }
        }
    }
    return false
  }

function flatten2dPuzzleState(puzzleState: PuzzleState): PuzzleStateFlat {
    let flatState = puzzleState.flat().flat();
    let tempState = flatState.slice(0, 9);
    tempState = tempState.concat(flatState[10], flatState[12], flatState[13], flatState[14], flatState[16])
    return tempState as PuzzleStateFlat;
}

export class Puzzle {
    private _puzzleState: PuzzleStateFlat;
    private _pegState: PegState;

    private _moves: Move[] = [];
    public maxNumber = 0;

    constructor(
        puzzleState: PuzzleStateFlat | PuzzleState = solvedStateFlat,
        pegState: PegState = defaultPegState,
        moves: Move[] = [],
    ) {
        if (isPuzzleState(puzzleState)) {
            this._puzzleState = flatten2dPuzzleState(puzzleState);
        } else {
            this._puzzleState = copyPuzzleStateFlat(puzzleState);
        }
        this._pegState = copyPegState(pegState);

        if (moves.length) {
            this._moves = [...moves];
        }

        this.maxNumber = this.getMaxNumber();
    }

    public get puzzleState(): PuzzleStateFlat {
        return copyPuzzleStateFlat(this._puzzleState);
    }

    public get puzzleState2d(): PuzzleState {
        const [
            topLeft,
            topCenter,
            topRight,
            middleLeft,
            center,
            middleRight,
            bottomLeft,
            bottomCenter,
            bottomRight,
            backTopCenter,
            backMiddleLeft,
            backCenter,
            backMiddleRight,
            backBottomCenter
        ] = this._puzzleState;

        // used to get the back value for corners
        function getBackValue(value: ClockFace): ClockFace {
            if (value === ClockFace.Twelve) {
                return value;
            }

            return 12 - value;
        }

        const backTopLeft = getBackValue(topLeft);
        const backTopRight = getBackValue(topRight);
        const backBottomLeft = getBackValue(bottomLeft);
        const backBottomRight = getBackValue(bottomRight);
        return [
            [
                [topLeft, topCenter, topRight],
                [middleLeft, center, middleRight],
                [bottomLeft, bottomCenter, bottomRight],
            ],
            [
                [backTopLeft, backTopCenter, backTopRight],
                [backMiddleLeft, backCenter, backMiddleRight],
                [backBottomLeft, bottomCenter, backBottomRight],
            ]
        ]
    }

    public get pegState(): PegState {
        return copyPegState(this._pegState);
    }

    public get moves(): Move[] {
        return [...this._moves];
    }

    public get lastMove(): Move | null {
        if (this._moves.length) {
            return this._moves[this._moves.length - 1];
        }

        return null
    }

    // TODO
    public scramble() {
        let scrambledState = this.puzzleState;
        scrambledState[0] = ClockFace.One;

        return new Puzzle(scrambledState);
    }

    public setPegs(pegState: PegState): Puzzle {
        return new Puzzle(
            this._puzzleState,
            pegState,
        )
    }

    public get isSolved(): Boolean {
        for (let i = 0; i < this._puzzleState.length; i += 1) {
            let face = this._puzzleState[i];
            if (face !== ClockFace.Twelve) {
                return false;
            }
        }

        return true;
    }

    private getMaxNumber(): number {
        let counter: Record<number, number> = {}
        for (let i = 0; i < this.puzzleState.length; i += 1) {
            let value = this.puzzleState[i];

            if (counter[value]) {
                counter[value] = counter[value] + 1
            } else {
                counter[value] = 1;
            }
        }

        return Math.max(...Object.values(counter));
    }

    public getAffectedClocks(wheel: Wheel): ClockStateFlat<number> {
        // indexes
        const topLeft = 0;
        const topCenter = 1;
        const topRight = 2;
        const middleLeft = 3;
        const center = 4;
        const middleRight = 5;
        const bottomLeft = 6;
        const bottomCenter = 7;
        const bottomRight = 8;
        const backTopCenter = 9;
        const backMiddleLeft = 10;
        const backCenter = 11;
        const backMiddleRight = 12;
        const backBottomCenter = 13;

        let pegValue: PegValue;

        if (wheel === Wheel.Upper) {
            pegValue = PegValue.Up;
        } else {
            pegValue = PegValue.Down;
        }

        let affectedClocks = new Array<number>(14) as ClockStateFlat<number>;
        affectedClocks.fill(0);

        if (this.pegState[pegTop][pegLeft] === pegValue) {
            affectedClocks[topLeft] = 1;

            if (pegValue === PegValue.Up) {
                affectedClocks[topCenter] = 1;
                affectedClocks[middleLeft] = 1;
                affectedClocks[center] = 1;
            } else {
                affectedClocks[backTopCenter] = -1;
                affectedClocks[backMiddleLeft] = -1;
                affectedClocks[backCenter] = -1;
            }
        }

        if (this.pegState[pegTop][pegRight] === pegValue) {
            affectedClocks[topRight] = 1;

            if (pegValue === PegValue.Up) {
                affectedClocks[topCenter] = 1;
                affectedClocks[middleRight] = 1;
                affectedClocks[center] = 1;
            } else {
                affectedClocks[backTopCenter] = -1;
                affectedClocks[backCenter] = -1;
                affectedClocks[backMiddleRight] = -1;
            }

        }

        if (this.pegState[pegBottom][pegLeft] === pegValue) {
            affectedClocks[bottomLeft] = 1;

            if (pegValue === PegValue.Up) {
                affectedClocks[bottomCenter] = 1;
                affectedClocks[middleLeft] = 1;
                affectedClocks[center] = 1;
            } else {
                affectedClocks[backMiddleLeft] = -1;
                affectedClocks[backCenter] = 1;
                affectedClocks[backBottomCenter] = 1;
            }
        }

        if (this.pegState[pegBottom][pegRight] === pegValue) {
            affectedClocks[bottomRight] = 1;

            if (pegValue === PegValue.Up) {
                affectedClocks[bottomCenter] = 1;
                affectedClocks[middleRight] = 1;
                affectedClocks[center] = 1;
            } else {
                affectedClocks[backBottomCenter] = -1;
                affectedClocks[backCenter] = -1;
                affectedClocks[backMiddleRight] = -1;
            }

        }

        return affectedClocks
    }

    public makeMove(move: Move): Puzzle {
        const { wheel, direction, pegState = this.pegState } = move;
        // do nothing for impossible puzzle moves
        if (
            (pegState[pegTop][pegLeft] === PegValue.Up) &&
            (pegState[pegTop][pegRight] === PegValue.Up) &&
            (pegState[pegBottom][pegLeft] === PegValue.Up) &&
            (pegState[pegTop][pegRight] === PegValue.Up) &&
            (wheel === Wheel.Lower)
        ) {
            // Lower turn when all sides are Up
            return this;
        } else if (
            (pegState[pegTop][pegLeft] === PegValue.Down) &&
            (pegState[pegTop][pegRight] === PegValue.Down) &&
            (pegState[pegBottom][pegLeft] === PegValue.Down) &&
            (pegState[pegTop][pegRight] === PegValue.Down) &&
            (wheel === Wheel.Upper)
        ) {
            // Upper turn when all sides are Down
            return this;
        }

        let updatedMoves = [...this.moves, move];

        this._pegState = copyPegState(pegState);

        let affectedClocks = this.getAffectedClocks(wheel);

        let newPuzzleState = this.puzzleState.map((face, index) => {
            if (affectedClocks[index] !== 0) {
                let directionToTurn = direction * affectedClocks[index];
                return turnClock(face, directionToTurn);
            }
            return face;
        }) as PuzzleStateFlat;

        return new Puzzle(
            newPuzzleState,
            pegState,
            updatedMoves,
        )
    }

    /**
     * Get all possible next puzzles reachable in one turn
     */
    public getNextPuzzles(): Puzzle[] {
        let nextStates = availableMoves.map((move) => {
            return this.makeMove(move);
        });

        return nextStates;
    }

}

/**
 * Return all available moves from this position
 */
function getAvailableMoves(): Move[] {
    const wheels = [Wheel.Upper, Wheel.Lower];
    const directions = [Direction.Clockwise, Direction.CounterClockwise];
    let availableMoves: Move[] = [];

    let allPegStates = getAllPegStates();

    getAllPegStates().forEach((pegState) => {
        wheels.forEach((wheel) => {
            directions.forEach((direction) => {
                let move = {
                    wheel,
                    direction,
                    pegState,
                }

                availableMoves.push(move);
            });
        })
    });

    return availableMoves;
}

export const availableMoves = getAvailableMoves();

// gets all possible pegStates
export function getAllPegStates() {
    let allPegStates: PegState[] = [];

    const pegValues = [PegValue.Up, PegValue.Down];
    let pegState = [[PegValue.Up, null], [PegValue.Up, null]]
    let pegIndexes = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
    ]

    pegValues.forEach((pegValueTopLeft) => {
        pegValues.forEach((pegValueTopRight) => {
            pegValues.forEach((pegValueBottomLeft) => {
                pegValues.forEach((pegValueBottomRight) => {
                    let pegState = copyPegState(defaultPegState);

                    pegState[pegTop][pegLeft] = pegValueTopLeft;
                    pegState[pegTop][pegRight] = pegValueTopRight;
                    pegState[pegBottom][pegLeft] = pegValueBottomLeft;
                    pegState[pegBottom][pegRight] = pegValueBottomRight;

                    allPegStates.push(pegState);
                });
            });
        });
    });

    return allPegStates;
}

function isUnseenPuzzle(puzzle: Puzzle, seenStates: PuzzleStateFlat[]): Boolean {
    // use for loop instead of forEach loop so we can bail out early
    for (let i = 0; i < seenStates.length; i += 1) {
        let seenState = seenStates[i];
        if (match(seenState, puzzle.puzzleState)) {
            return false;
        };
    }

    return true
}

function sortBySameFaces(puzzleA: Puzzle, puzzleB: Puzzle): number {
    let maxNumberA = puzzleA.maxNumber;
    let maxNumberB = puzzleB.maxNumber

    if (maxNumberA < maxNumberB) {
        return 1
    } else if (maxNumberA > maxNumberB) {
        return -1
    }

    return 0
}

export function prioritizePuzzles(puzzles: Puzzle[]): Puzzle[] {
    // console.log('prioritizePuzzles, puzzles.length ', puzzles.length)
    return puzzles.sort(sortBySameFaces);
}

export function solvePuzzle(puzzle: Puzzle): Puzzle {
    let puzzleQueue: Puzzle[] = [puzzle]
    let seenStates: PuzzleStateFlat[] = [puzzle.puzzleState];
    let seenStateCounter = 0;
    let currentPuzzle = puzzle;
    let maxMaxNumber = 1;
    let counter = 0;

    while (puzzleQueue.length) {
        if (counter % 1000 === 0) {
            console.log(`puzzleQueue.length ${puzzleQueue.length}`);
        }

        counter += 1;
        currentPuzzle = puzzleQueue.shift() as Puzzle;

        if (currentPuzzle.isSolved) {
            // we're done here
            console.log("counter", counter);
            return currentPuzzle;
        };

        seenStates.push(currentPuzzle.puzzleState);

        if (counter < 2 ** 13) {
            let nextPuzzles = currentPuzzle.getNextPuzzles();

            nextPuzzles.forEach((nextPuzzle) => {
                if (isUnseenPuzzle(nextPuzzle, seenStates)) {
                    if (nextPuzzle.maxNumber >= maxMaxNumber) {
                        // console.log(`new maxMaxNumber of ${maxMaxNumber}`);
                        maxMaxNumber = nextPuzzle.maxNumber;
                        puzzleQueue.unshift(nextPuzzle);
                    } else {
                        puzzleQueue.push(nextPuzzle);
                    }
                } else {
                    seenStateCounter += 1;
                }
            });
        }
    }

    return currentPuzzle;
}

// start with whatever wheel you turned
   // is the matching peg Up?
     // yes? add the center, matching col and matching row
     // no? add
   // is the same row peg Up?
     //
