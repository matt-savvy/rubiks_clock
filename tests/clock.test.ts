import { toNotation, Move, availableMoves, PuzzleState, PuzzleStateFlat, solvePuzzle, getAllPegStates, ClockFace, Puzzle, PegState, Peg, match, turnClock, Direction, Wheel } from '../src/clock';

describe('Puzzle', () => {
    describe('.isSolved', () => {
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

    describe('.score', () => {
        it('should be x, y, z', () => {
            let puzzle = new Puzzle([
                [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                ],
                [
                    [1, 2, 3],
                    [4, 2, 6],
                    [7, 8, 9],
                ],
            ]);
            expect(puzzle.score).toEqual({
                frontCross: 3 + 1 + 1 + 3,
                backCross: 0 + 2 + 4 + 6,
                corners: 4 + 2 + 2 + 4,
            })
        })
    })

    describe('.makeMove', () => {
        it('Ud, dd Upper should move the topLeft clockFace', () => {
            let puzzle = new Puzzle();

            const pegState: PegState = [
                Peg.Up, Peg.Down,
                Peg.Down, Peg.Down,
            ];
            const move = {
                wheel: Wheel.Upper,
                direction: Direction.Clockwise,
                pegState,
            }

            puzzle = puzzle.makeMove(move);

            expect(puzzle.puzzleState2d).toEqual([
                // front
                [
                    [ClockFace.One, ClockFace.One, ClockFace.Twelve],
                    [ClockFace.One, ClockFace.One, ClockFace.Twelve],
                    [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
                ],
                // back
                [
                    [ClockFace.Eleven, ClockFace.Twelve, ClockFace.Twelve],
                    [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
                    [ClockFace.Twelve, ClockFace.Twelve, ClockFace.Twelve],
                ]
            ])
            expect(puzzle.moves).toEqual([move]);
        })

        it('UU, UU Lower should do nothing and return same obj', () => {
            let puzzle = new Puzzle();
            let pegState = [
                Peg.Up, Peg.Up,
                Peg.Up, Peg.Up
            ] as PegState;
            let newPuzzle = puzzle.makeMove({ wheel: Wheel.Lower, direction: Direction.Clockwise, pegState });

            expect(newPuzzle).toBe(puzzle);
        })

        it('dd, dd Upper should do nothing and return same obj', () => {
            let puzzle = new Puzzle();
            let pegState: PegState = [
                Peg.Down, Peg.Down,
                Peg.Down, Peg.Down,
            ]

            let newPuzzle = puzzle.makeMove(
                { wheel: Wheel.Upper, direction: Direction.Clockwise, pegState }
            );

            expect(newPuzzle).toBe(puzzle);
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

    describe('.availableMoves', () => {
        it('should give ', () => {

            expect(availableMoves).toHaveLength(64);
        })
    })

    describe('.getNextPuzzles', () => {
        it('should return all 64 for a new puzzle', () => {
            let puzzle = new Puzzle();

            let nextPuzzles = puzzle.getNextPuzzles();

            expect(nextPuzzles).toHaveLength(64);
        })
    })

})



describe('getAffectedClocks', () => {

    it('UU, UU, Wheel.Upper', () => {
        let puzzle = new Puzzle();
        let pegState: PegState = [Peg.Up, Peg.Up, Peg.Up, Peg.Up];
        let affectedClocks = puzzle.getAffectedClocks(Wheel.Upper, pegState);

        expect(affectedClocks).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0])
    });

    it('dU, UU, Wheel.Lower', () => {
        let puzzle = new Puzzle();
        let pegState = [
            Peg.Down, Peg.Up,
            Peg.Up, Peg.Up
        ] as PegState

        let affectedClocks = puzzle.getAffectedClocks(Wheel.Lower, pegState);

        expect(affectedClocks).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, 0, 0])
    })

    it('dU, UU, Wheel.Upper', () => {
        let puzzle = new Puzzle();
        let pegState = [
            Peg.Down, Peg.Up,
            Peg.Up, Peg.Up
        ] as PegState
        let affectedClocks = puzzle.getAffectedClocks(Wheel.Upper, pegState);

        expect(affectedClocks).toEqual([0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);
    })

    it('dd, dd Wheel.Lower', () => {
        let puzzle = new Puzzle();

        let pegState = [
            Peg.Down, Peg.Down,
            Peg.Down, Peg.Down
        ] as PegState;

        let affectedClocks = puzzle.getAffectedClocks(Wheel.Lower, pegState);

        expect(affectedClocks).toEqual([1, 0, 1, 0, 0, 0, 1, 0, 1, -1, -1, -1, -1, -1])
    })

    it('Ud, Ud', () => {
        let puzzle = new Puzzle();
        let pegState = [
            Peg.Up, Peg.Down,
            Peg.Up, Peg.Down
        ] as PegState;

        let affectedClocks = puzzle.getAffectedClocks(Wheel.Upper, pegState);

        expect(affectedClocks).toEqual([1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0])
    })

})

describe('getAllPegStates', () => {
    it('should work', () => {
        expect(getAllPegStates()).toHaveLength(16)
    })
})

describe.only('solvePuzzle', () => {
    it('should work with an already solved puzzle', () => {
        let puzzle = new Puzzle();

        puzzle = solvePuzzle(puzzle);
        expect(puzzle.isSolved).toBe(true)
    })

    it('should work with an unsolved puzzle one move away', () => {
        let puzzle = new Puzzle([
            [
                [11, 11, 11],
                [11, 11, 11],
                [11, 11, 11],
            ],
            [
                [1, 12, 1],
                [12, 12, 12],
                [1, 12, 1],
            ]
        ]);

        puzzle = solvePuzzle(puzzle);

        expect(puzzle.isSolved).toBe(true);

        expect(puzzle.moves).toEqual([
            {
                wheel: Wheel.Upper,
                direction: Direction.Clockwise,
                pegState: [
                    Peg.Up, Peg.Up,
                    Peg.Up, Peg.Up,
                ]
            }
        ])
    })

    it('should work with an unsolved puzzle three moves away', () => {
        let puzzle = new Puzzle([
            [
                [2, 3, 3],
                [3, 3, 3],
                [3, 3, 3],
            ],
            [
                [10, 1, 9],
                [1, 1, 12],
                [9, 12, 9],
            ]
        ]);

        puzzle = solvePuzzle(puzzle);

        expect(puzzle.isSolved).toBe(true);

        expect(puzzle.moves).toEqual([
            {
                wheel: Wheel.Lower,
                direction: Direction.Clockwise,
                pegState: [
                    Peg.Down, Peg.Up,
                    Peg.Up, Peg.Up,
                ]
            },
            {
                wheel: Wheel.Upper,
                direction: Direction.CounterClockwise,
                pegState: [
                    Peg.Up, Peg.Up,
                    Peg.Up, Peg.Up,
                ]
            },
            {
                wheel: Wheel.Upper,
                direction: Direction.CounterClockwise,
                pegState: [
                    Peg.Up, Peg.Up,
                    Peg.Up, Peg.Up
                ]
            },
            {
                wheel: Wheel.Upper,
                direction: Direction.CounterClockwise,
                pegState: [
                    Peg.Up, Peg.Up,
                    Peg.Up, Peg.Up
                ]
            }
        ])
    })

    it('should work with an unsolved puzzle 4 moves away', () => {
        let puzzle = new Puzzle()
        let moves = getRandomMoves(4);

        moves.forEach((move) => {
            puzzle = puzzle.makeMove(move);
        })

        puzzle = solvePuzzle(puzzle);

        expect(puzzle.isSolved).toBe(true);
    })

    it.only('should work with a specified puzzle ', () => {
        // UR2+ DR3- DL3- UL1- U6+ R6+ D3- L4+ ALL0+ y2 U3+ R6+ D3+ L2+ ALL1- UR DL
        let puzzle = new Puzzle([
            [
                [2, 10, 11],
                [7, 1, 11],
                [4, 10, 10]
            ],
            [
                [10, 5, 1],
                [8, 8, 3],
                [8, 1, 2],
            ]
        ])

        puzzle = solvePuzzle(puzzle);

        expect(puzzle.isSolved).toBe(true);
        console.log(JSON.stringify(toNotation(puzzle.moves)));
    })



    it('should work with an unsolved puzzle multiple moves away', () => {
        let puzzle = new Puzzle();

        let nMoves = Math.floor(5 + Math.random() * 12);
        let moves = getRandomMoves(nMoves);
        moves.forEach((move) => {
            puzzle = puzzle.makeMove(move);
        })

        puzzle = solvePuzzle(puzzle);
        expect(puzzle.isSolved).toBe(true);
        console.log(`${puzzle.moves.length} moves to solve ${moves.length} moves`);
    })

    it('should work with a random puzzle', () => {
        let puzzleState = Array<ClockFace>(14) as PuzzleStateFlat;
        for (let i = 0; i < puzzleState.length; i += 1) {
            puzzleState[i] = Math.floor(1 + Math.random() * 12);
        }

        let puzzle = new Puzzle(puzzleState);
        puzzle = solvePuzzle(puzzle);
        expect(puzzle.isSolved).toBe(true);
    })

})

function getRandomMoves(nMoves: number): Move[] {
    let moves = new Array<Move>(nMoves);
    // randomly grab nMoves moves
    for (let i = 0; i < nMoves; i += 1) {
        let randomIndex = Math.floor(Math.random() * availableMoves.length);
        let newMove = availableMoves[randomIndex];
        moves[i] = newMove;
    }
    return moves;
}
