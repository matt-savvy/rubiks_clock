import { ClockFace, Puzzle, Peg, PegValue, match, turnClock, Direction, Wheel } from '../src/clock';

describe('Puzzle', () => {
    describe('.isSolved', ()=> {
        it('should return true when solved', () => {
            const puzzle = new Puzzle();
            expect(puzzle.isSolved).toBe(true);
        });

        it('should return false when not solved', () => {
            let puzzle = new Puzzle();
            puzzle = puzzle.scramble()
            expect(puzzle.isSolved).toBe(false);
        });
    });

    describe('setPegs', () => {
        it('should be different pegState', () => {
            let puzzle = new Puzzle();
            let pegToFlip: Peg = [0, 1];
            const [row, col] = pegToFlip;
            expect(puzzle.pegState[row][col]).toBe(PegValue.Up);

            puzzle = puzzle.setPegs([ pegToFlip ]);

            expect(puzzle.pegState[row][col]).toBe(PegValue.Down);
        });
    });

    describe('.makeMove', () => {
        it('topLeft should move the topLeft clockFace', () => {
            let puzzle = new Puzzle();
            const defualtPuzzleState = puzzle.puzzleState;

            puzzle = puzzle.makeMove({ wheel: Wheel.TopLeft, direction: Direction.Clockwise});

            expect(puzzle.puzzleState).toEqual([
                // front
                [
                    [ClockFace.One, ClockFace.One, ClockFace.Twelve],
                    [ClockFace.One, ClockFace.Twelve, ClockFace.Twelve],
                    [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
                ],
                // back
                [
                    [ClockFace.Eleven, ClockFace.Twelve, ClockFace.Twelve],
                    [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
                    [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
                ]
            ])
        })
    })
})

describe('match', () => {
    it('should match', () => {
        const puzzleA = new Puzzle();
        const puzzleB = new Puzzle();
        expect(match(puzzleA.puzzleState, puzzleB.puzzleState)).toBe(true);
    })

    it('should not match', () => {
        const puzzleA = new Puzzle();
        let puzzleB = new Puzzle().scramble();
        expect(match(puzzleA.puzzleState, puzzleB.puzzleState)).toBe(false);
    })
})

describe('incrementClockFace', () => {
    it('should take Twelve and return One', () => {
        let newFace = turnClock(ClockFace.Twelve);
        expect(newFace).toBe(ClockFace.One);
    })

    it('should take One and return Two', () => {
        let newFace = turnClock(ClockFace.One);
        expect(newFace).toBe(ClockFace.Two);
    })

    //counterClockwise
    it('should take Two and return One', () => {
        let newFace = turnClock(ClockFace.Two, Direction.CounterClockwise);
        expect(newFace).toBe(ClockFace.One);
    })

    //counterClockwise
    it('should take One and return Twelve', () => {
        let newFace = turnClock(ClockFace.One, Direction.CounterClockwise);
        expect(newFace).toBe(ClockFace.Twelve);
    })
})
