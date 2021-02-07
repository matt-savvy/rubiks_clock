import { Puzzle, PegValue, Peg, match } from '../src/clock';

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

    describe('setPeg', () => {
        it('should be different pegState', () => {
            let puzzle = new Puzzle();
            expect(puzzle.pegState[Peg.TopLeft]).toBe(PegValue.Up);

            puzzle = puzzle.setPeg(Peg.TopLeft);

            expect(puzzle.pegState[Peg.TopLeft]).toBe(PegValue.Down);
        });
    });

    describe('.makeMove', () => {

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
