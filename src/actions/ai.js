import { tryPickCell, rotateQuadrant, animateQuadrant } from "./index";
import {
    getQuadrants,
    getAvailableCells,
    makeGetRotatedQuadrant,
    getMetadata,
    getBoardScoreByPlayer,
    getQuadrantId
} from "../selectors/cellSelectors";
import {
    getActivePlayer,
    getNextPlayer,
    getPlayer,
    getOtherPlayer
} from "../selectors/playerSelectors";
import { chunk, maxElement, shuffle } from "../helpers";
import * as Constants from "../constants";

let boards = [
    // {
    //   cells: [],
    //   rotation: { row: ..., column: ..., clockwise: ... },
    //   metadata: {}
    // }
];

let currentPlayer;
let nextPlayer;

export function computeMove(showMove = true) {
    return (dispatch, getState) => {
        const state = getState();

        // Game has already ended
        if (state.gameOver) return { cellId: null, rotation: null };

        currentPlayer = getActivePlayer(state);
        nextPlayer = getNextPlayer(state);

        boards = getBoards(getState);

        // It is possible we have already picked a cell,
        // if we were controlled by a human who picked one
        // and then switched to being controlled by AI
        // In that case, just pick the optimal rotation
        let moveData = null;
        if (!state.canPickCell) {
            moveData = { rotation: optimalRotation(getState) };
        } else {
            // Cell + rotation
            for (let moveFunction of optimalMovesInOrder) {
                // console.log(`${currentPlayer.name}: Trying ${moveFunction.name}`);
                moveData = moveFunction(getState);
                if (moveData != null) {
                    // console.log(`${currentPlayer.name}: Picked ${moveFunction.name}`);
                    break;
                }
            }
        }

        // Shows the move on the board (without actually doing the move)
        if (showMove) {
            dispatch(computedMove(moveData));
        }

        return moveData;
    };
}

export const COMPUTED_MOVE = "COMPUTED_MOVE";
export function computedMove(move) {
    return {
        type: COMPUTED_MOVE,
        move: move
    };
}

export const HIDE_COMPUTED_MOVE = "HIDE_COMPUTED_MOVE";
export function hideComputedMove() {
    return {
        type: HIDE_COMPUTED_MOVE
    };
}

export function computeAndDoMove() {
    return (dispatch, getState) => {
        const state = getState();

        // If we had already computed a move this turn,
        // use that instead of computing a new one again
        const { cellId, rotation } =
            state.ui.computedMove || computeMove(false)(dispatch, getState);

        let gameOver = false;

        if (cellId != null) {
            gameOver = dispatch(tryPickCell(cellId, currentPlayer.id));
        }

        // It is possible to have an AI do only a rotation
        // when we switch a player to AI after picking a cell,
        // therefore the rotation is not nested after picking the cell
        if (!gameOver && rotation != null) {
            const { row, column, clockwise } = rotation;

            // Rotation (only if we haven't won by placing the cell)
            if (state.options.animationsEnabled) {
                dispatch(animateQuadrant(row, column, clockwise));
            } else {
                dispatch(rotateQuadrant(row, column, clockwise));
            }
        }
    };
}

// Build the 9 different boards (non-rotation and 8 rotations)
// and compute their metadata
function getBoards(getState) {
    const boards = [];

    // The current, non-rotated board
    boards.push(initBoard(getState));

    // All rotations of a single quadrant
    for (let row = 0; row < Constants.NUM_QUADRANTS; row++) {
        for (let column = 0; column < Constants.NUM_QUADRANTS; column++) {
            for (let clockwise of [true, false]) {
                const rotation = { row, column, clockwise };
                boards.push(initBoard(getState, rotation));
            }
        }
    }

    return boards;
}

function initBoard(getState, rotation) {
    const state = getState();

    let cells;

    if (rotation) {
        const rotatedCells = makeGetRotatedQuadrant(
            rotation.row,
            rotation.column,
            rotation.clockwise
        )(state);
        cells = Object.assign({}, state.cells, rotatedCells);
    } else {
        cells = Object.assign({}, state.cells);
    }

    const newState = Object.assign({}, state, {
        cells: Object.assign({}, state.cells, cells)
    });

    const metadata = computeMetadata(() => newState);

    return {
        cells,
        metadata,
        rotation
    };
}

const optimalMovesInOrder = [
    winningMove,
    preventWinningMove,

    lineInQuadrant,
    preventLineInQuadrant,

    makeLine4,
    preventMakeLine4,

    // setupMultipleLinesInQuadrant,

    inCenter,
    adjacentToSelf,
    randomCell
];

function getBoard(rotation) {
    const { row, column, clockwise } = rotation;

    return boards.find(
        board =>
            board.rotation === rotation ||
            (board.rotation != null &&
                board.rotation.row === row &&
                board.rotation.column === column &&
                board.rotation.clockwise === clockwise)
    );
}

function makeLine(
    getState,
    {
        player = currentPlayer, // Search for a line with the given arguments for this player
        doAsPlayer = currentPlayer, // This player will actually do the move, and we will do it optimally for this player
        min = 3,
        requiresFullQuadrant = false,
        requiresRotation = true,
        boardsToConsider = boards,
        lookahead = true // Look ahead 1 move of rotations
    } = {}
) {
    let optimal = {
        score: null,
        cellId: null,
        rotation: null
    };

    for (let board of boardsToConsider) {
        const rotation = board.rotation;

        // Only look at rotations, if required
        if (!rotation && requiresRotation) continue;

        let meta = board.metadata[player.id];

        if (requiresFullQuadrant) {
            // Filter out any potential cells that
            // do not at least fill a quadrant
            const keys = Object.keys(meta);
            const newMeta = {};

            for (let key of keys) {
                const potentials = meta[key];

                for (let group of potentials) {
                    const emptyCell = group.find(cell => cell.player == null);

                    const qSize = Constants.QUADRANT_SIZE;
                    const cellsByQuadrant = chunk(
                        group,
                        cell =>
                            `${Math.floor(cell.row / qSize)}${Math.floor(
                                cell.col / qSize
                            )}`
                    ).map(chunk => chunk[1]);
                    // Empty cell completed a quadrant if the group it is part of is the length of a quadrant
                    const groupOfEmptyCell = cellsByQuadrant.find(
                        cells => cells.indexOf(emptyCell) > -1
                    );
                    const completesQuadrant =
                        groupOfEmptyCell &&
                        groupOfEmptyCell.length === Constants.QUADRANT_SIZE;

                    // Fills a quadrant? Then we include it
                    if (completesQuadrant) {
                        (newMeta[key] || (newMeta[key] = [])).push(group);
                    }
                }
            }

            meta = newMeta;
        }

        const key = maxElement(Object.keys(meta).filter(key => key >= min));
        let cell = null;
        let cells = null;
        if (key) {
            // Introduce a bit of randomness
            const metaCopy = shuffle(meta[key]);

            cells = maxElement(metaCopy, group => {
                const emptyCell = group.find(cell => cell.player == null);
                if (!emptyCell) return null;

                // State with current rotated cells
                // and possibly the given cell
                const state = Object.assign({}, getState(), {
                    cells: Object.assign({}, board.cells, {
                        [emptyCell.id]: Object.assign(
                            {},
                            board.cells[emptyCell.id],
                            { player: doAsPlayer.id }
                        )
                    })
                });

                const score = getBoardScoreByPlayer(state);

                return score[doAsPlayer.id].points;
            });

            cell = cells && cells.find(cell => cell.player == null);
        }

        if (cell) {
            // State with current rotated cells
            // and possibly the given cell
            const state = Object.assign({}, getState(), {
                cells: Object.assign({}, board.cells, {
                    [cell.id]: Object.assign({}, board.cells[cell.id], {
                        player: doAsPlayer.id
                    })
                })
            });

            const score = getBoardScoreByPlayer(state)[doAsPlayer.id];
            const points = score.points;
            const playerWins = score.wins;

            // if(lookahead && !playerWins && player.id === doAsPlayer.id) {
            //   const boards = getBoards(() => state);
            //   const opponentWins = winningMove(() => state, { player: getOtherPlayer(doAsPlayer.id)(state), doAsPlayer: getOtherPlayer(doAsPlayer.id)(state), boardsToConsider: boards, lookahead: false });

            //   if(opponentWins) {
            //     // Cancel plans
            //     console.log("DONT DO IT!");
            //     continue;
            //   }
            // }

            if (
                optimal.score == null ||
                points > optimal.score ||
                (points === optimal.score && Math.random() > 0.5)
            ) {
                optimal = {
                    cellId: cell.id,
                    score: points,
                    rotation
                };
            }
        }
    }

    if (optimal.cellId != null) {
        return {
            cellId: optimal.cellId,
            rotation: optimal.rotation
        };
    }
}

function winningMove(
    getState,
    { player = currentPlayer, boardsToConsider = boards, lookahead = true } = {}
) {
    return makeLine(getState, {
        min: Constants.AMOUNT_IN_LINE_TO_WIN,
        player,
        requiresRotation: false,
        boardsToConsider,
        lookahead
    });
}

function preventWinningMove(getState) {
    // First check if the opponent can win without rotating.
    // If that is the case, we have to block the winning cell
    // as rotating away can simply be undone by our opponent
    let { cellId } =
        winningMove(getState, {
            player: nextPlayer,
            doAsPlayer: currentPlayer,
            boardsToConsider: boards.filter(board => !board.rotation)
        }) || {};

    if (cellId == null) {
        return preventWithOptimalRotation(winningMove, getState);
    } else {
        // We found a winning cell to block,
        // now just find an optimal rotation
        return {
            cellId,
            rotation: optimalRotation(getState, cellId)
        };
    }
}

function makeLine4(getState, { player = currentPlayer } = {}) {
    return makeLine(getState, { min: 4, player });
}

function preventMakeLine4(getState) {
    return preventWithOptimalRotation(makeLine4, getState);
}

function preventWithOptimalRotation(func, getState, options) {
    const move = func(
        getState,
        Object.assign({}, options, { player: nextPlayer })
    );
    if (!move) return null;

    const { cellId } = move;

    return {
        cellId,
        rotation: optimalRotation(getState, cellId)
    };
}

// Will try get a setup in 1 quadrant similar to this:
// | X | X |  |
// +---+---+--+
// | X |   |  |
// +---+---+--+
// |   |   |  |
// +---+---+--+
// i.e. it can always get 3 in a line in a quadrant
// on the next turn, since there are 2 options here
function setupMultipleLinesInQuadrant(
    getState,
    { player = currentPlayer } = {}
) {
    // We do NOT have to go through all rotations
    // at first, since we are looking for a setup inside
    // a single quadrant, rotating a quadrant will not
    // have a meaningful influence

    // First attempt: brute-force it
    // This might not be to bad since there are no
    // rotations involved and we brute-force on
    // a relatively small set of the board to begin with
    // -- all potential <quadrant_size - 1> in a line
    // that are part of the same quadrant
    const board = boards[0];

    let meta = board.metadata[player.id];
    let setups = meta[Constants.QUADRANT_SIZE - 1];

    // No setups of the right size at all
    if (!setups) return null;

    // Select only those with all cells in the same quadrant
    setups = setups.filter(cells =>
        cells.every(cell => {
            const quadrant = getQuadrantId(cell);
            return cells.every(c => quadrant === getQuadrantId(c));
        })
    );

    // For each group of cells, place a marble in the empty spot
    // and check if this leads to any potential lines that fill the whole quadrant

    const optimal = { cellId: null, amount: null };

    for (let cells of setups) {
        const cell = cells.find(cell => cell.player == null);

        // State with current rotated cells
        // and possibly the given cell
        const state = Object.assign({}, getState(), {
            cells: Object.assign({}, board.cells, {
                [cell.id]: Object.assign({}, board.cells[cell.id], {
                    player: player.id
                })
            })
        });

        const newMeta = getMetadata(state)[player.id];

        // Does this move lead to potential full quadrant lines?
        if (newMeta[Constants.QUADRANT_SIZE]) {
            const fullQuadrantLines = newMeta[
                Constants.QUADRANT_SIZE
            ].filter(cells =>
                cells.every(cell => {
                    const quadrant = getQuadrantId(cell);
                    return cells.every(c => quadrant === getQuadrantId(c));
                })
            );

            if (fullQuadrantLines.length > 1) {
                if (
                    optimal.amount == null ||
                    fullQuadrantLines.length > optimal.amount
                ) {
                    optimal.cellId = cell.id;
                    optimal.amount = fullQuadrantLines.length;
                }
            }
        }
    }

    // Found a good one
    if (optimal.cellId != null) {
        return {
            cellId: optimal.cellId,
            // The rotation is irrelevant for this specific move
            // so let's make sure we do the best one :)
            rotation: optimalRotation(getState, optimal.cellId)
        };
    }

    // No luck
    return null;
}

function lineInQuadrant(getState, { player = currentPlayer } = {}) {
    return makeLine(getState, { player, requiresFullQuadrant: true });
}

function preventLineInQuadrant(getState) {
    return makeLine(getState, {
        player: nextPlayer,
        doAsPlayer: currentPlayer,
        requiresFullQuadrant: true
    });

    // return preventWithOptimalRotation(lineInQuadrant, getState);
}

function inCenter(getState, player = currentPlayer.id) {
    const rotation = optimalRotation(getState);

    const board = getBoard(rotation);
    const quadrants = getQuadrants({ cells: board.cells });

    // Pick any of the quadrant centers of that board,
    // preferably horizontally or vertically from
    // on of the other centers that we already have
    // rather than diagonally.

    // The center is simply the middle cell of each quadrant
    // This assumes the quadrant size is an odd number (obviously)
    // otherwise there is no center :-)
    const centers = quadrants.map(
        q => q[Math.floor(q.length / 2)][Math.floor(q.length / 2)]
    );

    const playerCenters = centers.filter(
        center => player != null && center.player === player
    );
    const availableCenters = centers.filter(center => center.player == null);

    if (availableCenters.length > 0) {
        // Prefer a center that is horizontally or vertically
        // from one of the centers you already have, I believe it provides
        // more options than diagonal centers due to more rotations towards
        // each other (4 vs 2)
        const cells = availableCenters.filter(
            c =>
                playerCenters.length === 0 ||
                playerCenters.some(cc => c.row === cc.row || c.col === cc.col)
        );

        // Pick a random one from the good cells
        let cell = cells[Math.floor(Math.random() * cells.length)];

        // If no horizontal / vertical center is available, just choose one
        cell =
            cell ||
            availableCenters[
                Math.floor(Math.random() * availableCenters.length)
            ];

        return {
            cellId: cell.id,
            rotation
        };
    }

    // None available
    return null;
}

function adjacentToSelf(getState) {
    return makeLine(getState, { min: 2 });
}

function randomCell(getState) {
    const rotation = optimalRotation(getState);
    const board = getBoard(rotation);
    const cells = getAvailableCells({ cells: board.cells });
    if (cells.length === 0) return;
    const cell = cells[Math.floor(Math.random() * cells.length)];

    return {
        cellId: cell.id,
        rotation
    };
}

function optimalRotation(getState, cellId = null) {
    let optimal = {
        points: null,
        rotation: null
    };

    for (const board of boards) {
        const rotation = board.rotation;

        if (!rotation) continue;

        // State with current rotated cells
        // and possibly the given cell
        const state = Object.assign({}, getState(), {
            cells: Object.assign(
                {},
                board.cells,
                cellId == null
                    ? null
                    : {
                          [cellId]: Object.assign({}, board.cells[cellId], {
                              player: currentPlayer.id
                          })
                      }
            )
        });

        const score = getBoardScoreByPlayer(state)[currentPlayer.id];
        const points = score.points;
        const playerWins = score.wins;

        if (
            optimal.points == null ||
            points > optimal.points ||
            (points === optimal.points && Math.random() > 0.5)
        ) {
            // We are about to replace our optimal rotation
            // Make sure the opponent cannot win on the next turn
            // with some move. This only applies to situations where we have are not winning ourselves, obviously
            // if(!playerWins) {
            //   const boards = getBoards(() => state);
            //   const opponentWins = winningMove(() => state, { player: nextPlayer, boardsToConsider: boards });

            //   if(opponentWins) {
            //     // Cancel plans
            //     continue;
            //   }
            // }

            // All good
            optimal = { points, rotation };
        }
    }

    if (optimal.rotation) {
        return optimal.rotation;
    } else {
        // If all rotations have been dropped because the opponent would win,
        // we are officially screwed. We would lose anyway, just return a random rotation
        const boardsWithRotation = boards.filter(
            board => board.rotation != null
        );
        return boardsWithRotation[
            Math.floor(Math.random() * boardsWithRotation.length)
        ].rotation;
    }
}

function computeMetadata(getState) {
    return getMetadata(getState());
}
