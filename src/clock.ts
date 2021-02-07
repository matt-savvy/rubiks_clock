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
    Up,
    Down,
}

export enum Direction {
    Clockwise,
    CounterClockwise
}

type PuzzleState = [
    // front, L - R, top to Bottom
    [
        [ClockFace, ClockFace, ClockFace],
        [ClockFace, ClockFace, ClockFace],
        [ClockFace, ClockFace, ClockFace],
    ],
    // back - R to L, top to Bottom
    // note, back is R to left as if it's transparent
    [
        [ClockFace, ClockFace, ClockFace],
        [ClockFace, ClockFace, ClockFace],
        [ClockFace, ClockFace, ClockFace],
    ]
]

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

type PegState = [
    [PegValue, PegValue],
    [PegValue, PegValue],
]

const defaultPegState: PegState = [
    [PegValue.Up, PegValue.Up],
    [PegValue.Up, PegValue.Up],
]

export enum Wheel {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
}

// TODO, replace [number, number, number] with a set type
function getClockFaceFromWheel(wheel: Wheel): [number, number, number] {
    switch (wheel) {
        case (Wheel.TopLeft): return [0, 0, 0]
        case (Wheel.TopRight): return [0, 0, 2]
        case (Wheel.BottomLeft): return [0, 2, 0]
        case (Wheel.BottomRight): return [0, 2, 2]
    }
}

// TODO, replace [number, number, number] with a set type
function getPegFromWheel(wheel: Wheel): [number, number] {
    switch (wheel) {
        case (Wheel.TopLeft): return [0, 0]
        case (Wheel.TopRight): return [0, 2]
        case (Wheel.BottomLeft): return [2, 0]
        case (Wheel.BottomRight): return [2, 2]
    }
}

/**
 * Return true if the two states are the same
 * @param stateA
 * @param stateB
 */
export function match(stateA: PuzzleState, stateB: PuzzleState): Boolean {
    let valuesA = stateA.flat().flat();
    let valuesB = stateB.flat().flat();

    for (let i = 0; i < valuesA.length; i += 1) {
        if (valuesA[i] !== valuesB[i]) {
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
    direction: Direction
}

function copyPuzzleState(puzzleState: PuzzleState): PuzzleState {
    return puzzleState.map((side) => {
        return side.map((row) => [...row]);
    }) as PuzzleState;
}

function copyPegState(pegState: PegState): PegState {
    return pegState.map((rows) => {
        return rows.map((peg) => peg)
    }) as PegState;
}

export type Peg = [0 | 1, 0 | 1]


export class Puzzle {
    private _puzzleState: PuzzleState;
    private _pegState: PegState;
    private _seenStates: PuzzleState[] = []

    constructor(
        puzzleState: PuzzleState = solvedState,
        pegState: PegState = defaultPegState,
        seenStates: PuzzleState[] = []
    ) {
        this._puzzleState = copyPuzzleState(puzzleState);
        this._pegState = copyPegState(pegState);
        this._seenStates = [...seenStates];
    }


    public get puzzleState(): PuzzleState {
        return copyPuzzleState(this._puzzleState);
    }

    public get pegState(): PegState {
        return copyPegState(this._pegState);
    }

    //
    public scramble() {
        let scrambledState = this.puzzleState;
        scrambledState[0][0][0] = ClockFace.One;

        return new Puzzle(scrambledState, this.pegState, this._seenStates);
    }

    public setPegs(pegs: Peg[]) {
        let pegState = this.pegState;
        pegs.forEach(([row, col]) => {
            const value = pegState[row][col];
            pegState[row][col] = togglePeg(value);
        })

        return new Puzzle(this.puzzleState, pegState, this._seenStates);
    }

    public get isSolved(): Boolean {
        let puzzleStateFlat = this.puzzleState.flat().flat();

        for (let i = 0; i < puzzleStateFlat.length; i += 1) {
            let face = puzzleStateFlat[i];
            if (face !== ClockFace.Twelve) {
                return false;
            }
        }

        return true;
    }

    /* public getAvailableMoves() {
        return all possible moves we can make,
        eg [ [Wheel.TopLeft, Direction.Clockwise], [Wheel.TopLeft, Direction.CounterClockwise]]
    }
    */

    /*
    private moveTree() {
        // where are we now?
        // if we aren't solved
        // - for all possible peg combos
        //   - get available moves
        //   - for all available moves
        //       - add them underneath us on the tree
        //

    }
    */

    // private _solution []

    public makeMove({ wheel, direction }: Move): Puzzle {

        const center = 1;
        const middle = 1;

        let updatedSeenStates = [...this._seenStates, this._puzzleState];

        let newPuzzleState = this.puzzleState;
        const [face, row, col] = getClockFaceFromWheel(wheel);

        newPuzzleState[face][row][col] = turnClock(newPuzzleState[face][row][col]);
        // rotate the matching backFace
        newPuzzleState[flip(face)][row][col] = turnClock(newPuzzleState[flip(face)][row][col], Direction.CounterClockwise);;

        const [pegRow, pegCol] = getPegFromWheel(wheel);
        if (this.pegState[pegRow][pegCol] === PegValue.Up) {
            // also rotate the center clock on that row
            newPuzzleState[face][row][center] = turnClock(newPuzzleState[face][row][center]);

            // also rotate the middle clock on that ccol
            newPuzzleState[face][middle][col] = turnClock(newPuzzleState[face][middle][col]);
        } else {
            // also rotate the BACK center clock on that row
            newPuzzleState[flip(face)][row][center] = turnClock(newPuzzleState[flip(face)][row][center], Direction.CounterClockwise);
            // also rotate the BACK middle clock on that col
            newPuzzleState[flip(face)][middle][col] = turnClock(newPuzzleState[flip(face)][middle][col], Direction.CounterClockwise);
        }

        return new Puzzle(
            newPuzzleState,
            this.pegState,
            updatedSeenStates,
        )
    }

}
export type coords = [number, number, number]
function getBackCoords([ face, row, col ]: coords): coords {
    return [flip(face), row, col];
}

function flip(face: number): number {
    return face === 0 ? 1 : 0;
}


function togglePeg(value: PegValue): PegValue {
    return (value === PegValue.Up) ? PegValue.Down : PegValue.Up;
}

// start with whatever wheel you turned
   // is the matching peg Up?
     // yes? add the center, matching col and matching row
     // no? add
   // is the same row peg Up?
     //
