enum ClockFace {
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

interface PuzzleState {
    topLeft: ClockFace,
    top: ClockFace,
    topRight: ClockFace,
    middleLeft: ClockFace,
    center: ClockFace,
    middleRight: ClockFace,
    bottomLeft: ClockFace,
    bottom: ClockFace,
    bottomRight: ClockFace,
    // back side
    backTop: ClockFace,
    backMiddleLeft: ClockFace,
    backCenter: ClockFace,
    backMiddleRight: ClockFace,
    backBottom: ClockFace,
}

const solvedState: PuzzleState = {
    topLeft: ClockFace.Twelve,
    top: ClockFace.Twelve,
    topRight: ClockFace.Twelve,
    middleLeft: ClockFace.Twelve,
    center: ClockFace.Twelve,
    middleRight: ClockFace.Twelve,
    bottomLeft: ClockFace.Twelve,
    bottom: ClockFace.Twelve,
    bottomRight: ClockFace.Twelve,
    // back side
    backTop: ClockFace.Twelve,
    backMiddleLeft: ClockFace.Twelve,
    backCenter: ClockFace.Twelve,
    backMiddleRight: ClockFace.Twelve,
    backBottom: ClockFace.Twelve,
}

export enum Peg {
    TopLeft = 'topLeft',
    TopRight = 'topRight',
    BottomLeft = 'bottomLeft',
    BottomRight = 'bottomRight',
}

export type PegState = Record<Peg, PegValue>;

const defaultPegState = {
    topLeft: PegValue.Up,
    topRight: PegValue.Up,
    bottomLeft: PegValue.Up,
    bottomRight: PegValue.Up
}

/**
 * Return true if the two states are the same
 * @param stateA
 * @param stateB
 */
export function match(stateA: PuzzleState, stateB: PuzzleState): Boolean {
    const valuesA = Object.values(stateA);
    const valuesB = Object.values(stateB);

    for (let i = 0; i < valuesA.length; i += 1) {
        if (valuesA[i] !== valuesB[i]) {
            return false;
        }
    }

    return true;
}



export class Puzzle {
    private _puzzleState: PuzzleState;
    private _pegState: PegState;
    private _seenStates: PuzzleState[] = []

    constructor(
        puzzleState: PuzzleState = solvedState,
        pegState: PegState = defaultPegState,
        seenStates: PuzzleState[] = []
    ) {
        this._puzzleState = { ...puzzleState};
        this._pegState = { ...pegState};
        this._seenStates = [...seenStates];
    }

    public get puzzleState() {
        return {...this._puzzleState }
    }

    public get pegState() {
        return {...this._pegState }
    }

    //
    public scramble() {
        let scrambledState = {...this._puzzleState, topLeft: ClockFace.Eleven}
        return new Puzzle(scrambledState, this._pegState, this._seenStates);
    }

    public setPeg(peg: Peg) {
        const value = this._pegState[peg];
        const newValue: PegValue = (value === PegValue.Up) ? PegValue.Down : PegValue.Up;
        let newPegState = {...this._pegState, [peg]: newValue };
        return new Puzzle(this.puzzleState, newPegState, this._seenStates);
    }

    public get isSolved(): Boolean {
        let allFaces: ClockFace[] = Object.values(this._puzzleState);
        for (let i = 0; i < allFaces.length; i += 1) {
            let face = allFaces[i];
            if (face !== ClockFace.Twelve) {
                return false;
            }
        }

        return true;
    }

}
