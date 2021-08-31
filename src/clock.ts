import { PriorityQueue } from "./priority";

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

export enum Peg {
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

/*
-- rolling priority queue and seenStates together
  -- e.g we maybe will end up evaluating a state that we've seen before, but the Puzzle we're looking at got there with less
  moves than the Puzzle with the same seenState we already have in our set
  -- is this possible?

-- end game tables
  - calculate all the positions that are 1, 2, 3, and maybe even 4 moves away from being solved, precalculate all of them
  - the same way we check "is puzzle solved?" we can also check "is the state in the solved states list?"

---
  - put moves together so that maybe four turns in the same direction could just be written UUUd, U+4


    - fibonacci queue that includes the set of puzzles so the solvePuzzle mechanism doesn't need to determine
    if it or a symmetrical state has seen before?

    -

    - figure a way to get a single score instead of needing a compare function
      - 0 on the front, 6 on the back might be very different than 3, 3, might not
      - maybe back cross distance gets doubled



--- react front end



  */


//

// symmetrical states?
  // we could theoertically halve the search space if this is applicable
  // get the puzzle state that represents the same clock but as if we started on the back face
  // might need a way to transpose moves from a symmetrical state,
      // reversing something L-R means that the pins that were up and down will switch
      // same with up and down
      // same with front / back / and wheels



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
    Peg, Peg,
    Peg, Peg,
]

const defaultPegState: PegState = [Peg.Up, Peg.Up, Peg.Up, Peg.Up]

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
    pegState: PegState
    wheel: Wheel,
    direction: Direction,
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
    return [...pegState]
}

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

interface Score {
    frontCross: number,
    backCross: number,
    corners: number
}

export class Puzzle {
    private _puzzleState: PuzzleStateFlat;
    private _moves: Move[] = [];
    private _score: Score;
    private _newScore: number;

    constructor(
        puzzleState: PuzzleStateFlat | PuzzleState = solvedStateFlat,
        moves: Move[] = [],
    ) {
        if (isPuzzleState(puzzleState)) {
            this._puzzleState = flatten2dPuzzleState(puzzleState);
        } else {
            this._puzzleState = copyPuzzleStateFlat(puzzleState);
        }

        if (moves.length) {
            this._moves = [...moves];
        }

        this._score = this.calculateScore();
        this._newScore = this.calculateNewScore();
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
                [backBottomLeft, backBottomCenter, backBottomRight],
            ]
        ]
    }
    public get puzzleStateString(): string {
        return this._puzzleState.toString()
    }

    public get score(): number {
        return this._newScore + this.moves.length;
    }

    private calculateNewScore(): number {
        let score = 0;

        const frontEdges = [topCenter, middleLeft, middleRight, bottomCenter];
        const centerFace = this._puzzleState[center];
        let frontCrossScore = 0;
        frontEdges.forEach((stateIndex) => {
            let face = this._puzzleState[stateIndex];
            let distance = Math.abs(centerFace - face);
            frontCrossScore += distance;
        });

        const backEdges = [backTopCenter, backMiddleLeft, backMiddleRight, backBottomCenter];
        const backCenterFace = this._puzzleState[backCenter];
        let backCrossScore = 0;
        backEdges.forEach((stateIndex) => {
            let face = this._puzzleState[stateIndex];
            let distance = Math.abs(backCenterFace - face);
            backCrossScore += distance;
        });

        const corners = [topLeft, topRight, bottomLeft, bottomRight];
        let cornerScore = 0;
        corners.forEach((stateIndex) => {
            let face = this._puzzleState[stateIndex];
            let distance = Math.abs(centerFace - face);
            cornerScore += distance;
        });

        let crosses = [frontCrossScore, backBottomCenter].sort()
        score += crosses[0];
        score += crosses[1] * 1.5; // weight the second cross score by 1.5
        score += cornerScore * 2; // weight the corners by 2

        return score
    }

    private calculateScore(): Score {
        let score: Score = {
            frontCross: 0,
            backCross: 0,
            corners: 0
        }

        const frontEdges = [topCenter, middleLeft, middleRight, bottomCenter];
        const centerFace = this._puzzleState[center];

        frontEdges.forEach((stateIndex) => {
            let face = this._puzzleState[stateIndex];
            let distance = Math.abs(centerFace - face);
            score.frontCross += distance;
        });

        const backEdges = [backTopCenter, backMiddleLeft, backMiddleRight, backBottomCenter];
        const backCenterFace = this._puzzleState[backCenter];

        backEdges.forEach((stateIndex) => {
            let face = this._puzzleState[stateIndex];
            let distance = Math.abs(backCenterFace - face);
            score.backCross += distance;
        });

        const corners = [topLeft, topRight, bottomLeft, bottomRight];

        corners.forEach((stateIndex) => {
            let face = this._puzzleState[stateIndex];
            let distance = Math.abs(centerFace - face);
            score.corners += distance;
        });

        return score
    }

    public get moves(): Move[] {
        return [...this._moves];
    }

    // TODO
    public scramble() {
        let scrambledState = this.puzzleState;
        scrambledState[0] = ClockFace.One;

        return new Puzzle(scrambledState);
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

    public getAffectedClocks(wheel: Wheel, pegState: PegState): ClockStateFlat<number> {
        let pegValue: Peg;

        const [pegTopLeft, pegTopRight, pegBottomLeft, pegBottomRight] = pegState;

        if (wheel === Wheel.Upper) {
            pegValue = Peg.Up;
        } else {
            pegValue = Peg.Down;
        }

        let affectedClocks = new Array<number>(14) as ClockStateFlat<number>;
        affectedClocks.fill(0);

        if (pegTopLeft === pegValue) {
            affectedClocks[topLeft] = 1;

            if (pegValue === Peg.Up) {
                affectedClocks[topCenter] = 1;
                affectedClocks[middleLeft] = 1;
                affectedClocks[center] = 1;
            } else {
                affectedClocks[backTopCenter] = -1;
                affectedClocks[backMiddleLeft] = -1;
                affectedClocks[backCenter] = -1;
            }
        }

        if (pegTopRight === pegValue) {
            affectedClocks[topRight] = 1;

            if (pegValue === Peg.Up) {
                affectedClocks[topCenter] = 1;
                affectedClocks[middleRight] = 1;
                affectedClocks[center] = 1;
            } else {
                affectedClocks[backTopCenter] = -1;
                affectedClocks[backCenter] = -1;
                affectedClocks[backMiddleRight] = -1;
            }

        }


        if (pegBottomLeft === pegValue) {
            affectedClocks[bottomLeft] = 1;

            if (pegValue === Peg.Up) {
                affectedClocks[middleLeft] = 1;
                affectedClocks[center] = 1;
                affectedClocks[bottomCenter] = 1;
            } else {
                affectedClocks[backCenter] = -1;
                affectedClocks[backMiddleLeft] = -1;
                affectedClocks[backBottomCenter] = -1;
            }
        }


        if (pegBottomRight === pegValue) {
            affectedClocks[bottomRight] = 1;

            if (pegValue === Peg.Up) {
                affectedClocks[center] = 1;
                affectedClocks[middleRight] = 1;
                affectedClocks[bottomCenter] = 1;
            } else {
                affectedClocks[backCenter] = -1;
                affectedClocks[backMiddleRight] = -1;
                affectedClocks[backBottomCenter] = -1;
            }

        }

        return affectedClocks
    }

    public makeMove(move: Move): Puzzle {
        const { wheel, direction, pegState } = move;

        const [pegTopLeft, pegTopRight, pegBottomLeft, pegBottomRight] = pegState;

        // do nothing for impossible puzzle moves
        // Lower turn when all sides are Up
        if (
            (pegTopLeft === Peg.Up) &&
            (pegTopRight === Peg.Up) &&
            (pegBottomLeft === Peg.Up) &&
            (pegBottomRight === Peg.Up) &&
            (wheel === Wheel.Lower)
        ) {
            return this;
        } else if (
            (pegTopLeft === Peg.Down) &&
            (pegTopRight === Peg.Down) &&
            (pegBottomLeft === Peg.Down) &&
            (pegBottomRight === Peg.Down) &&
            (wheel === Wheel.Upper)
        ) {
            // Upper turn when all sides are Down
            return this;
        }

        let updatedMoves = [...this.moves, move];

        let affectedClocks = this.getAffectedClocks(wheel, pegState);

        let newPuzzleState = this.puzzleState.map((face, index) => {
            if (affectedClocks[index] !== 0) {
                let directionToTurn = direction * affectedClocks[index];
                return turnClock(face, directionToTurn);
            }
            return face;
        }) as PuzzleStateFlat;

        return new Puzzle(
            newPuzzleState,
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
                    pegState,
                    wheel,
                    direction,
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

    const pegValues = [Peg.Up, Peg.Down];
    let pegState = [[Peg.Up, null], [Peg.Up, null]]
    let pegIndexes = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
    ]

    // TODO clean this up
    pegValues.forEach((pegValueTopLeft) => {
        pegValues.forEach((pegValueTopRight) => {
            pegValues.forEach((pegValueBottomLeft) => {
                pegValues.forEach((pegValueBottomRight) => {
                    let pegState = [
                        pegValueTopLeft, pegValueTopRight,
                        pegValueBottomLeft, pegValueBottomRight,
                    ] as PegState;

                    allPegStates.push(pegState);
                });
            });
        });
    });

    return allPegStates;
}

function getMinMax(score: Score): [number, number] {
    const min = Math.min(score.frontCross, score.backCross);
    const max = Math.max(score.frontCross, score.backCross);
    return [min, max];
}

function nodeCompareFn(a, b) {
    return a.value.score - b.value.score
    // return comparePuzzles(a.value, b.value);
}

/*
export function comparePuzzles(a: Puzzle, b: Puzzle): number {
    const [minCrossA, maxCrossA] = getMinMax(a.score);
    const [minCrossB, maxCrossB] = getMinMax(b.score);

    if (minCrossA !== minCrossB) {
        return minCrossA - minCrossB;
    }

    if (maxCrossA !== maxCrossB) {
        return maxCrossA - maxCrossB;
    }

    if (a.score.corners !== b.score.corners) {
        return a.score.corners - b.score.corners;
    }

    return a.moves.length - b.moves.length;
}
*/


function isUnseenPuzzle(puzzle: Puzzle, seenStates: Set<string>): boolean {
    return seenStates.has(puzzle.puzzleStateString) === false;
}

export function solvePuzzle(puzzle: Puzzle): Puzzle {
    if (puzzle.isSolved) {
        return puzzle;
    }

    let puzzleQueue = new PriorityQueue<Puzzle>();
    let seenStates = new Set<string>();
    puzzleQueue.insert(puzzle.score, puzzle);
    let currentPuzzle;

    let counter = 0; // TODO remove

    while (puzzleQueue.size) {
        currentPuzzle = puzzleQueue.extractMin() as Puzzle;

        seenStates.add(currentPuzzle.puzzleStateString);

        if (counter < 2 ** 18) {
            counter += 1;
            let nextPuzzles = currentPuzzle.getNextPuzzles();
            // use for and not forEach here so we can immediately if we hit a solve
            for (let i = 0; i < nextPuzzles.length; i += 1) {
                let nextPuzzle = nextPuzzles[i];

                if (nextPuzzle.isSolved) {
                    // we're done here
                    console.log(`solved after looking at ${counter} positions`);
                    return nextPuzzle;
                };

                if (isUnseenPuzzle(nextPuzzle, seenStates)) {
                    counter += 1;

                    puzzleQueue.insert(nextPuzzle.score, nextPuzzle);
                }
            }
        }
    }

    console.log('could not solved, counter', counter );

    return currentPuzzle;
}

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

// used to get the back value for corners
function getBackValue(value: ClockFace): ClockFace {
    if (value === ClockFace.Twelve) {
        return value;
    }

    return 12 - value;
}


export function pegStateToNotation(pegState: PegState): string {
    return ''
}


function getMoveCounter(moves: Move[]): Map<string, number> {
    let moveCounter = new Map<string, number>();

    moves.forEach((move) => {
        let moveString = JSON.stringify(move);
        let count = moveCounter.get(moveString) || 0;

        moveCounter.set(moveString, count + 1);
    });
    return moveCounter
}

export function reverseMoves(moves: Move[]): Move[] {
    return moves.map((move) => {
        let reversedMove = JSON.parse(JSON.stringify(move)) as Move;
        reversedMove.direction *= -1
        return reversedMove
    })
}

type NotationMove = string

export function toNotation(moves: Move[]): NotationMove[] {

    let moveCounter = getMoveCounter(moves);
    let notationMoves: NotationMove[] = [];

    moveCounter.forEach((count, move)  => {
        const { pegState, wheel, direction } = JSON.parse(move) as Move;
        let turnNotation = `${count}${(direction === Direction.Clockwise ? '+' : '-')}`;

        let wheelNotation = wheel === Wheel.Upper ? 'U' : 'D';
        let [topLeft, topRight, bottomLeft, bottomRight] = pegState.map((peg) => peg === Peg.Up ? 'U' : 'd');
        let pegStateSplit = [[topLeft, topRight].join(''), [bottomLeft, bottomRight].join('')];

        let notationMove = [pegStateSplit, wheelNotation, turnNotation].join(' ');

        notationMoves.push(notationMove);
    });

    return notationMoves;

}
