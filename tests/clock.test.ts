import { availableMoves, prioritizePuzzles, PuzzleState, solvePuzzle, getAllPegStates, ClockFace, Puzzle, Peg, PegState, PegValue, match, turnClock, Direction, Wheel } from '../src/clock';

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

    describe('pegState', () => {
        it('should not mutate', () => {
            let puzzle = new Puzzle();
            puzzle.pegState[0][0] = PegValue.Down;
            // should be unchanged
            expect(puzzle.pegState).toEqual([
                [PegValue.Up, PegValue.Up],
                [PegValue.Up, PegValue.Up],
            ])
        })
    })
    describe('.setPegs', () => {
        it('should be dd, dd', () => {
            let puzzle = new Puzzle();
            let newPegState: PegState = [
                [PegValue.Down, PegValue.Down],
                [PegValue.Down, PegValue.Down],
            ]
            puzzle = puzzle.setPegs(newPegState);
            expect(puzzle.pegState).toEqual(newPegState)
        })

        it('should be dU, Ud', () => {
            let puzzle = new Puzzle();
            let newPegState: PegState = [
                [PegValue.Down, PegValue.Up],
                [PegValue.Up, PegValue.Down],
            ]
            puzzle = puzzle.setPegs(newPegState);
            expect(puzzle.pegState).toEqual(newPegState)
        })

        it('should be Ud, Ud', () => {
            let puzzle = new Puzzle();
            let newPegState: PegState = [
                [PegValue.Up, PegValue.Down],
                [PegValue.Up, PegValue.Down],
            ]
            puzzle = puzzle.setPegs(newPegState);
            expect(puzzle.pegState).toEqual(newPegState)
        })

    });

    describe('.makeMove', () => {
        it('Ud, dd Upper should move the topLeft clockFace', () => {
            let puzzle = new Puzzle();

            const pegState: PegState = [
                [PegValue.Up, PegValue.Down],
                [PegValue.Down, PegValue.Down],
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
                [PegValue.Up, PegValue.Up],
                [PegValue.Up,PegValue.Up]
            ] as PegState;
            let newPuzzle = puzzle.makeMove({ wheel: Wheel.Lower, direction: Direction.Clockwise, pegState });

            expect(newPuzzle).toBe(puzzle);
        })

        it('dd, dd Upper should do nothing and return same obj', () => {
            let puzzle = new Puzzle();
            let pegState: PegState = [
                [PegValue.Down, PegValue.Down],
                [PegValue.Down, PegValue.Down],
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

        let affectedClocks = puzzle.getAffectedClocks(Wheel.Upper);

        expect(affectedClocks).toEqual([1, 1, 1, 1, 1, 1, 1, 1 , 1, 0, 0, 0, 0, 0])
    });

    it('dU, UU, Wheel.Lower', () => {
        let puzzle = new Puzzle();
        puzzle = puzzle.setPegs([
            [PegValue.Down, PegValue.Up],
            [PegValue.Up, PegValue.Up]
        ] as PegState)

        let affectedClocks = puzzle.getAffectedClocks(Wheel.Lower);

        expect(affectedClocks).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, 0, 0])
    })

    it('dU, UU, Wheel.Upper', () => {
        let puzzle = new Puzzle();
        puzzle = puzzle.setPegs([
                [PegValue.Down, PegValue.Up],
                [PegValue.Up, PegValue.Up]
            ] as PegState)
        let affectedClocks = puzzle.getAffectedClocks(Wheel.Upper);

        expect(affectedClocks).toEqual([0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);
    })

    it('dd, dd Wheel.Lower', () => {
        let puzzle = new Puzzle();

        puzzle = puzzle.setPegs([
            [PegValue.Down, PegValue.Down],
            [PegValue.Down, PegValue.Down]
        ] as PegState);

        let affectedClocks = puzzle.getAffectedClocks(Wheel.Lower);

        expect(affectedClocks).toEqual([1, 0, 1, 0, 0, 0, 1, 0, 1, -1, -1, -1, -1, -1])
    })

    it('Ud, Ud', () => {
        let puzzle = new Puzzle();
        puzzle = puzzle.setPegs([
            [PegValue.Up, PegValue.Down],
            [PegValue.Up, PegValue.Down]
        ] as PegState)

        let affectedClocks = puzzle.getAffectedClocks(Wheel.Upper);

        expect(affectedClocks).toEqual([1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0 ,0, 0])
    })
})

describe('getAllPegStates', () => {
    it('should work', () => {
        expect(getAllPegStates()).toHaveLength(16)
    })
})

describe('solvePuzzle', () => {
    it('should work', () => {
        let puzzle = new Puzzle();

        // puzzle = solvePuzzle(puzzle);
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
                    [ PegValue.Up, PegValue.Up ],
                    [ PegValue.Up, PegValue.Up ]
                ]
            }
        ])
    })

    it.only('should work with an unsolved puzzle three moves away', () => {
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
                    [ PegValue.Down, PegValue.Up ],
                    [ PegValue.Up, PegValue.Up ]
                ]
            },
            {
                wheel: Wheel.Upper,
                direction: Direction.CounterClockwise,
                pegState: [
                    [ PegValue.Up, PegValue.Up ],
                    [ PegValue.Up, PegValue.Up ]
                ]
            },
            {
                wheel: Wheel.Upper,
                direction: Direction.CounterClockwise,
                pegState: [
                    [ PegValue.Up, PegValue.Up ],
                    [ PegValue.Up, PegValue.Up ]
                ]
            },
            {
                wheel: Wheel.Upper,
                direction: Direction.CounterClockwise,
                pegState: [
                    [ PegValue.Up, PegValue.Up ],
                    [ PegValue.Up, PegValue.Up ]
                ]
            }
        ])
    })

    it('should work with an unsolved puzzle multiple moves away', () => {

        let puzzle = new Puzzle([
            [
                [8, 9, 9],
                [9, 9, 9],
                [9, 9, 9],
            ],
            [
                [4, 12, 3],
                [1, 12, 11],
                [3, 11, 3],
            ]
        ]);

        puzzle = solvePuzzle(puzzle);
        expect(puzzle.isSolved).toBe(true);

        expect(puzzle.moves).toEqual([
            {
                wheel: Wheel.Upper,
                direction: Direction.Clockwise,
                pegState: [
                    [ PegValue.Up, PegValue.Up ],
                    [ PegValue.Up, PegValue.Up ]
                ]
            },
            {
                wheel: Wheel.Upper,
                direction: Direction.Clockwise,
                pegState: [
                    [ PegValue.Up, PegValue.Up ],
                    [ PegValue.Up, PegValue.Up ]
                ]
            },
            {
                wheel: Wheel.Upper,
                direction: Direction.Clockwise,
                pegState: [
                    [ PegValue.Up, PegValue.Up ],
                    [ PegValue.Up, PegValue.Up ]
                ]
            },
        ])
    })

})

describe('prioritizeSolutions', () => {
    let puzzleSimilar = new Puzzle([
        [
            [3, 3, 3],
            [3, 3, 3],
            [3, 3, 3],
        ],
        [
            [9, 12, 9],
            [12, 12, 12],
            [9, 12, 9],
        ]
    ]);
    let puzzleDifferent = new Puzzle([
        [
            [2, 12, 4],
            [8, 11, 3],
            [12, 11, 5],
        ],
        [
            [10, 12, 8],
            [9, 9, 9],
            [7, 9, 12],
        ]
    ]);

    it('should work', () => {
        let puzzles = [puzzleDifferent, puzzleSimilar];
        expect(prioritizePuzzles(puzzles)).toEqual([puzzleSimilar, puzzleDifferent]);
    })
})
