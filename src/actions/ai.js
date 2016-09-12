import { tryPickCell, rotateQuadrant } from './index';
import {
  getQuadrants, getAvailableCells, makeGetRotatedQuadrant, getMetadata, getBoardScoreByPlayer
} from '../selectors/cellSelectors';
import { getActivePlayer, getNextPlayer } from '../selectors/playerSelectors';
import { chunk, maxElement, shuffle } from '../helpers';
import * as Constants from '../constants';

const boards = [
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
    if(state.gameOver) return { cellId: null, rotation: null };

    currentPlayer = getActivePlayer(state);
    nextPlayer = getNextPlayer(state);

    initBoards(getState);

    let moveData = null;
    for(let moveFunction of optimalMovesInOrder) {
      // console.log(`${currentPlayer.name}: Trying ${moveFunction.name}`);
      moveData = moveFunction(getState);
      if(moveData != null) {
        // console.log(`${currentPlayer.name}: Picked ${moveFunction.name}`);
        break;
      }
    }

    // Shows the move on the board (without actually doing the move)
    if(showMove) {
      dispatch(computedMove(moveData));
    }

    return moveData;
  }
}

export const COMPUTED_MOVE = 'COMPUTED_MOVE';
export function computedMove(move) {
  return {
    type: COMPUTED_MOVE,
    move: move
  };
}

export const HIDE_COMPUTED_MOVE = 'HIDE_COMPUTED_MOVE';
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
    const { cellId, rotation } = state.ui.computedMove || computeMove(false)(dispatch, getState);

    if(cellId != null) {
      const gameOver = dispatch(tryPickCell(cellId, currentPlayer.id));

      if(!gameOver && rotation != null) {
        const { row, column, clockwise } = rotation;

        // Rotation (only if we haven't won by placing the cell)
        dispatch(rotateQuadrant(row, column, clockwise));
      }
    }
  }
}

// Build the 9 different boards (non-rotation and 8 rotations)
// and compute their metadata
function initBoards(getState) {
  boards.length = 0;

  // The current, non-rotated board
  boards.push(initBoard(getState));

  // All rotations of a single quadrant
  for(let row = 0; row < Constants.NUM_QUADRANTS; row++) {
    for(let column = 0; column < Constants.NUM_QUADRANTS; column++) {
      for(let clockwise of [true, false]) {
        const rotation = { row, column, clockwise };
        boards.push(initBoard(getState, rotation));
      }
    }
  }
}

function initBoard(getState, rotation) {
  const state = getState();

  let cells;

  if(rotation) {
    const rotatedCells = makeGetRotatedQuadrant(rotation.row, rotation.column, rotation.clockwise)(state);
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
    rotation,
  };
}

const optimalMovesInOrder = [
  winningMove,
  preventWinningMove,

  makeLine4,
  preventLineInQuadrant,

  lineInQuadrant,
  preventMakeLine4,

  makeLine3,

  inCenter,
  adjacentToSelf,
  randomCell
];

function getBoard(rotation) {
  const { row, column, clockwise } = rotation;

  return boards.find(board =>
    board.rotation === rotation || (
      board.rotation != null &&
      board.rotation.row === row &&
      board.rotation.column === column &&
      board.rotation.clockwise === clockwise
    ));
}

function makeLine(getState, { player = currentPlayer, min = 3, requiresFullQuadrant = false } = {}) {
  let optimal = {
    score: null,
    cellId: null,
    rotation: null
  }

  for(let board of boards) {
    let rotation = board.rotation;

    // Only look at rotations
    if(!rotation) continue;

    let meta = board.metadata[player.id];

    if(requiresFullQuadrant) {
      // Filter out any potential cells that
      // do not at least fill a quadrant
      const keys = Object.keys(meta);
      const newMeta = {};

      for(let key of keys) {
        const potentials = meta[key];

        for(let group of potentials) {
          const emptyCell = group.find(cell => cell.player == null);

          const qSize = Constants.QUADRANT_SIZE;
          const cellsByQuadrant = chunk(group, cell => `${Math.floor(cell.row / qSize)}${Math.floor(cell.col / qSize)}`).map(chunk => chunk[1]);
          // Empty cell completed a quadrant if the group it is part of is the length of a quadrant
          const groupOfEmptyCell = cellsByQuadrant.find(cells => cells.indexOf(emptyCell) > -1);
          const completesQuadrant = groupOfEmptyCell && groupOfEmptyCell.length === Constants.QUADRANT_SIZE;

          // Fills a quadrant? Then we include it
          if(completesQuadrant) {
            (newMeta[key] || (newMeta[key] = [])).push(group)
          }
        }
      }

      meta = newMeta;
    }

    const key = maxElement(Object.keys(meta).filter(key => key >= min));
    let cell = null;
    let cells = null;
    if(key) {
      // Introduce a bit of randomness
      const metaCopy = shuffle(meta[key]);

      cells = maxElement(metaCopy, group => {
        const emptyCell = group.find(cell => cell.player == null);
        if(!emptyCell) return null;

        // State with current rotated cells
        // and possibly the given cell
        const state = Object.assign({}, getState(), {
          cells: Object.assign({}, board.cells, {
            [emptyCell.id]: Object.assign({}, board.cells[emptyCell.id], { player: player.id })
          })
        });

        const score = getBoardScoreByPlayer(state);

        return score[player.id];
      });

      cell = cells && cells.find(cell => cell.player == null);
    }

    if(cell) {
      // State with current rotated cells
      // and possibly the given cell
      const state = Object.assign({}, getState(), {
        cells: Object.assign({}, board.cells, {
          [cell.id]: Object.assign({}, board.cells[cell.id], { player: player.id })
        })
      });

      const score = getBoardScoreByPlayer(state)[player.id];

      if(requiresFullQuadrant && cells && cells.length === Constants.QUADRANT_SIZE) {
        rotation = optimalRotation(getState, cell);
      }

      if(optimal.score == null || score > optimal.score || (score === optimal.score && Math.random() > 0.5)) {
        optimal = {
          cellId: cell.id,
          score,
          rotation
        }
      }
    }
  }

  if(optimal.cellId) {
    return {
      cellId: optimal.cellId,
      rotation: optimal.rotation
    }
  }
}

function winningMove(getState, { player = currentPlayer } = {}) {
  return makeLine(getState, { min: Constants.AMOUNT_IN_LINE_TO_WIN, player });
}

function preventWinningMove(getState) {
  return preventWithOptimalRotation(winningMove, getState);
}

function makeLine4(getState, { player = currentPlayer } = {}) {
  return makeLine(getState, { min: 4, player });
}

function preventMakeLine4(getState) {
  return preventWithOptimalRotation(makeLine4, getState);
}

function preventWithOptimalRotation(func, getState, options) {
  const move = func(getState, Object.assign({}, options, { player: nextPlayer }));
  if(!move) return null;

  const { cellId, } = move;

  return {
    cellId,
    rotation: optimalRotation(getState, cellId)
  }
}

function lineInQuadrant(getState, { player = currentPlayer } = {}) {
  return makeLine3(getState, { player, requiresFullQuadrant: true });
}

function preventLineInQuadrant(getState) {
  return preventWithOptimalRotation(lineInQuadrant, getState);
}

function makeLine3(getState, { player = currentPlayer, requiresFullQuadrant = false } = {}) {
  return makeLine(getState, { min: 3, player, requiresFullQuadrant });
}

function inCenter(getState, player = currentPlayer.id) {
  const rotation = optimalRotation(getState);

  const board = getBoard(rotation)
  const quadrants = getQuadrants({ cells: board.cells });

  // Pick any of the quadrant centers of that board,
  // preferably horizontally or vertically from
  // on of the other centers that we already have
  // rather than diagonally.
  // rotateBoard(row, column, clockwise);

  // The center is simply the middle cell of each quadrant
  // This assumes the quadrant size is an odd number (obviously)
  // otherwise there is no center :-)
  const centers = quadrants.map(q => q[Math.floor(q.length / 2)][Math.floor(q.length / 2)]);

  const playerCenters = centers.filter(center => player != null && center.player === player);
  const availableCenters = centers.filter(center => center.player == null);

  if(availableCenters.length > 0) {
    // Prefer a center that is horizontally or vertically
    // from one of the centers you already have, I believe it provides
    // more options than diagonal centers due to more rotations towards
    // each other (4 vs 2)
    const cells = availableCenters.filter(c => playerCenters.length === 0 || playerCenters.some(cc => c.row === cc.row || c.col === cc.col))

    // Pick a random one from the good cells
    let cell = cells[Math.floor(Math.random() * cells.length)];

    // If no horizontal / vertical center is available, just choose one
    cell = cell || availableCenters[Math.floor(Math.random() * availableCenters.length)];

    return {
      cellId: cell.id,
      rotation
    }
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
  if(cells.length === 0) return;
  const cell = cells[Math.floor(Math.random() * cells.length)];

  return {
    cellId: cell.id,
    rotation
  }
}

function moveWithOptimalRotation(getState, moveFunction) {
  return Object.assign({}, moveFunction(getState), {
    rotation: optimalRotation(getState)
  });
}

function optimalRotation(getState, cellId = null) {
  let optimal = {
    score: null,
    rotation: null
  }

  for(const board of boards) {
    const rotation = board.rotation;

    if(!rotation) continue;

    // State with current rotated cells
    // and possibly the given cell
    const state = Object.assign({}, getState(), {
      cells: Object.assign({}, board.cells, cellId == null ? null : {
        [cellId]: Object.assign({}, board.cells[cellId], { player: currentPlayer.id })
      })
    });

    const score = getBoardScoreByPlayer(state)[currentPlayer.id];

    if(optimal.score == null || score > optimal.score || (score === optimal.score && Math.random() > 0.5)) {
      optimal = {
        score,
        rotation
      }
    }
  }

  if(optimal.rotation) {
    return optimal.rotation;
  }
}

function computeMetadata(getState) {
  return getMetadata(getState());
}