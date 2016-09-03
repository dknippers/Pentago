import { tryPickCell, rotateQuadrant } from './index';
import {
  getRows, getColumns, getDiagonals, getQuadrants, getAvailableCells,
  makeGetRotatedQuadrant, getMetadata, getBoardScoreByPlayer
} from '../selectors/cellSelectors';
import { getPlayers, makeGetCurrentPlayer, makeGetNextPlayer } from '../selectors/playerSelectors';
import { chunk, maxElement } from '../helpers';
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
let getBoardScore;

export function computeMove() {
  return (dispatch, getState) => {
    const state = getState();

    currentPlayer = makeGetCurrentPlayer(state.activePlayer)(state);
    nextPlayer = makeGetNextPlayer(state.activePlayer)(state);

    initBoards(getState);

    let moveData = null;
    for(let moveFunction of optimalMovesInOrder) {
      console.log(`Trying ${moveFunction.name}`);
      moveData = moveFunction(getState);
      if(moveData != null) break;
    }
    const { cell, rotation } = moveData;

    if(cell != null) {
      const gameOver = dispatch(tryPickCell(cell, currentPlayer.id));

      return;

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
  inCenter,
  makeLine,
  randomAvailableCell
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

function makeLine(getState, player = currentPlayer, min = 2, requiresFullQuadrant = false) {
  let optimal = {
    score: null,
    cell: null,
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

      const numQuadrants = Constants.NUM_QUADRANTS;

      for(let key of keys) {
        const potentials = meta[key];

        for(let group of potentials) {
          const emptyCell = group.find(cell => cell.player == null);
          const cells = maxElement(chunk(group, cell => cell.row % numQuadrants + cell.col % numQuadrants).map(chunk => chunk[1]), cells => cells.length);

          // Fills a quadrant? Then we include it
          if(cells.length >= Constants.QUADRANT_SIZE && cells.indexOf(emptyCell) > -1) {
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
      cells = maxElement(meta[key], group => {
        const emptyCell = group.find(cell => cell.player == null);

        const state = getState();
        const newState = Object.assign({}, state, {
          cells: Object.assign({}, state.cells, {
            [emptyCell.id]: Object.assign({}, state.cells[emptyCell.id], {
              player: player.id
            })
          })
        });

        return getBoardScoreByPlayer(newState);
      });

      cell = cells.find(cell => cell.player == null);
    }

    if(cell) {
      const state = getState();
      const newState = Object.assign({}, state, {
        cells: Object.assign({}, state.cells, {
          [cell.id]: Object.assign({}, state.cells[cell.id], {
            player: player.id
          })
        })
      });
      const score = getBoardScoreByPlayer(newState);

      // TODO
      // if(requiresFullQuadrant && cells && cells.length === Constants.QUADRANT_SIZE) {
      //   rotation = optimalRotation(cell);
      // }

      if(optimal.score == null || score > optimal.score || (score === optimal.score && Math.random() > 0.5)) {
        optimal = {
          cell: cell.id,
          score,
          rotation
        }
      }
    }
  }

  if(optimal.cell) {
    return {
      cell: optimal.cell,
      rotation: optimal.rotation
    }
  }
}

function inCenter(getState, player = currentPlayer.id) {
  const rotation = optimalRotation();

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
      cell: cell.id,
      rotation: rotation
    }
  }

  // None available
  return null;
}

function randomAvailableCell() {
  return moveWithOptimalRotation(randomCell);
}

function randomCell() {
  const rotation = optimalRotation();
  const board = getBoard(rotation);
  const cells = getAvailableCells({ cells: board.cells });
  if(cells.length === 0) return;
  const cell = cells[Math.floor(Math.random() * cells.length)];

  return {
    cell: cell.id,
    rotation: rotation
  }
}

function moveWithOptimalRotation(moveFunction) {
  return Object.assign({}, moveFunction(), {
    rotation: optimalRotation()
  });
}

function optimalRotation() {
  return {
    row: Math.floor(Math.random() * 2),
    column: Math.floor(Math.random() * 2),
    clockwise: Math.random() > 0.5
  }
}

function computeMetadata(getState) {
  return getMetadata(getState());
}