import { createSelector } from 'reselect';
import { chunk, transpose, groupBy, maxElement } from '../helpers';
import { getPlayers } from './playerSelectors';
import * as Constants from '../constants';

// The input for all other selectors, make sure this *only* yields
// a new object when the relevant state has actually changed
const initCells = state => state.cells;

const getCells = createSelector(
  initCells,
  cellsById => Object.keys(cellsById).map(id => cellsById[id])
)

export const getCell = (state, id) => state.cells[id];

export const getAvailableCells = createSelector(
  getCells,
  cells => cells.filter(cell => cell.player == null)
);

const getSortedCells = createSelector(
  getCells,
  cells => {
    return cells.sort((x,y) => {
      if(x.row > y.row) return 1;
      if(x.row < y.row) return -1;

      if(x.col > y.col) return 1;
      if(x.col < y.col) return -1;

      return 0;
    })
  }
);

export const getRows = createSelector(
  getSortedCells,
  cells => cells.reduce((rows, cell) => (rows[cell.row] || (rows[cell.row] = [])).push(cell) && rows, [])
);

export const getColumns = createSelector(
  getSortedCells,
  cells => cells.reduce((columns, cell) => (columns[cell.col] || (columns[cell.col] = [])).push(cell) && columns, [])
);

export const getDiagonals = createSelector(
  getSortedCells,
  cells => {
    const topLeftToBottomRight = groupBy(cells, cell => cell.row - cell.col);
    const bottomLeftToTopRight = groupBy(cells, cell => cell.row + cell.col);

    return [
      topLeftToBottomRight,
      bottomLeftToTopRight
    ].reduce((diagonals, collectionOfDiagonals) => {
      for(let key of Object.keys(collectionOfDiagonals)) {
        const diagonal = collectionOfDiagonals[key];
        diagonals.push(diagonal);
      }
      return diagonals;
    }, []);
  }
)

function findWinningCellsInLines(lines, player) {
  if(!player) return false;

  for(let line of lines) {
    const winningCells = winsInLine(line, player);
    if(winningCells) return winningCells;
  }
}

export const getWinningCellsByPlayer = createSelector(
  getRows,
  getColumns,
  getDiagonals,
  getPlayers,
  (rows, columns, diagonals, players) => {
    const winningCellsByPlayer = {};

    const lines = [...rows, ...columns, ...diagonals];

    for(let player of players) {
      winningCellsByPlayer[player.id] = findWinningCellsInLines(lines, player.id);
    }

    return winningCellsByPlayer;
  }
)

function winsInLine(line, player) {
  return chunk(line, cell => cell.player === player)
    .filter(chunk => chunk[0])
    .map(chunk => chunk[1])
    .find(cells => cells.length >= Constants.AMOUNT_IN_LINE_TO_WIN)
}

const quadrantMinAndMaxRowOrCol = rowOrCol => [ rowOrCol * Constants.QUADRANT_SIZE, (rowOrCol + 1) * Constants.QUADRANT_SIZE - 1 ];

const quadrantMinAndMaxRow = (row) => quadrantMinAndMaxRowOrCol(row);
const quadrantMinAndMaxCol = (col) => quadrantMinAndMaxRowOrCol(col);

function getQuadrant(row, col, cells) {
    const [ minRow, maxRow ] = quadrantMinAndMaxRow(row);
    const [ minCol, maxCol ] = quadrantMinAndMaxCol(col);

    const cellsOfQuadrant = cells.filter(cell => cell.row >= minRow && cell.row <= maxRow && cell.col >= minCol && cell.col <= maxCol);

    return chunk(cellsOfQuadrant, cell => cell.row).map(chunk => chunk[1]);
}

export const makeGetQuadrant = (row, col) => createSelector(
  getSortedCells,
  cells => getQuadrant(row, col, cells)
);

// Returns the quadrants in an Array
export const getQuadrants = createSelector(
  getSortedCells,
  cells => {
    const quadrants = [];

    for(let r = 0; r < Constants.NUM_QUADRANTS; r++) {
      for(let c = 0; c < Constants.NUM_QUADRANTS; c++) {
        quadrants.push(getQuadrant(r, c, cells));
      }
    }

    return quadrants;
  }
)

// Returns the quadrants in a 2D Array (i.e., in rows and columns)
export const getQuadrants2D = createSelector(
  getSortedCells,
  cells => {
    const quadrants = [];

    for(let r = 0; r < Constants.NUM_QUADRANTS; r++) {
      const row = [];

      for(let c = 0; c < Constants.NUM_QUADRANTS; c++) {
        row.push(getQuadrant(r, c, cells));
      }

      quadrants.push(row);
    }

    return quadrants;
  }
)

function rotateClockwise(quadrant) {
  return transpose(quadrant.reverse());
}

function rotateCounterclockwise(quadrant) {
  return transpose(quadrant.map(row => row.reverse()));
}

function rotate(quadrant, turnClockwise) {
  return (turnClockwise ? rotateClockwise : rotateCounterclockwise)(quadrant);
}

// Returns copied cells, does not actually modify the cells of this state
export const makeGetRotatedQuadrant = (row, column, clockwise) => createSelector(
  makeGetQuadrant(row, column),
  quadrant => {
    // Apply rotation
    const rotated = rotate(quadrant, clockwise);

    const [ minRow, ] = quadrantMinAndMaxRow(row);
    const [ minCol, ] = quadrantMinAndMaxCol(column);

    // Return a flat object of cell id => cell,
    // where we have updated .row and .col of each cell
    // accordingly to its new position in the quadrant
    // which is currently only represented by the index
    const cells = {};

    for(let irow = 0; irow < rotated.length; irow++) {
      const row = rotated[irow];
      for(let icol = 0; icol < row.length; icol++) {
        const cell = rotated[irow][icol];

        cells[cell.id] = Object.assign({}, cell, {
          row: irow + minRow,
          col: icol + minCol
        });
      }
    }

    return cells;
  }
);

export const getMetadata = createSelector(
  getPlayers,
  getRows,
  getColumns,
  getDiagonals,
  (players, rows, columns, diagonals) => {
    const cellsInLine = [...rows, ...columns, ...diagonals];
    const metadata = {};

    for(let player of players) {
      const potentials = {};

      for(let line of cellsInLine) {
        const potentialAmountInLine = computePotentialsInLine(line, player);
        if(!potentialAmountInLine || potentialAmountInLine.length === 0) continue;

        for(let group of potentialAmountInLine) {
          (potentials[group.length] || (potentials[group.length] = [])).push(group);
        }
      }

      metadata[player.id] = potentials;
    }

    return metadata;
  }
)

function computePotentialsInLine(line, player) {
  const maxInLine = maxAdjacentsInLine(line, player);
  // If the maximum amount is not enough to win
  // there's no potential whatsoever, line should be totally ignored.
  if(maxInLine < Constants.AMOUNT_IN_LINE_TO_WIN) return null;

  // Chunk by empty or owned by player, drops opponents cells
  const chunks = chunk(line, cell => cell.player == null || (cell.player === player.id ? false : null));

  return chunks.reduce((groups, chunk) => {
    const [ isEmpty, cells ] = chunk;

    // TODO: Fix this can occur at all (bug in chunk method when last element becomes null)
    if(!cells) return groups;

    const firstCell = cells[0];
    const firstIdx = line.indexOf(firstCell)
    const lastCell = cells[cells.length - 1];

    const isLastAndEmpty = isEmpty && chunks.indexOf(chunk) === chunks.length - 1;

    const prevGroup = groups[groups.length - 1];

    // No previous group, add yourself and be done
    if(!prevGroup) {
      if(!isLastAndEmpty) {
        groups.push(cells)
      }
    } else {
      const prevGroupIsEmpty = prevGroup.every(cell => cell.player == null);
      let prevLastCell = prevGroup[prevGroup.length - 1];
      let prevLastIdx = line.indexOf(prevLastCell);

      let distance = Math.abs(firstIdx - prevLastIdx);

      // If we are not adjacent, we can't join them
      if(distance > 1) {
        // However, make sure to remove the previous group
        // if it was completely empty
        if(prevGroupIsEmpty) {
          groups.pop();
        }

        // And add ourself so other cells can join up later
        if(!isLastAndEmpty) {
          groups.push(cells)
        }
      } else {
        // Empty cells, first cell will try to join the previous group
        if(isEmpty) {
          // If the previous group is completely empty, remove it (it's irrelevant)
          if(prevGroupIsEmpty) {
            groups.pop();

            // Add ourselves, but not if we are the last empty group
            if(!isLastAndEmpty) {
              groups.push(cells);
            }
          } else {
            // This group belongs to the player, we join it with our first cell,
            // _only if_ it does not have an empty cell yet
            if(!prevGroup.some(cell => cell.player == null)) {
              // Cool, let's join them
              prevGroup.push(firstCell)
            } else {
              // It already has merged with some other empty cell
              // We instead duplicate it and create a new group
              // First we drop all cells upto the empty cell and then the empty cell itself
              const emptyIdx = prevGroup.findIndex(cell => cell.player == null);
              groups.push([ ...prevGroup.slice(emptyIdx + 1), firstCell]);
            }

            // We only add ourselves when firstCell is different from lastCell
            // If firstCell is the same as lastCell, the next group can just join
            // us in the previous group.
            // Again, do not add ourselves if we are the last group and empty
            if(firstCell !== lastCell && !isLastAndEmpty) {
              groups.push(cells);
            }
          }
        } else {
          // Player controlled cells
          // Try to join a previous player-controlled group
          // It can have most have 1 empty cell but that's fine
          if(prevGroup.some(cell => cell.player != null)) {
            for(let cell of cells) {
              prevGroup.push(cell);
            }
          } else {
            // Previous group is entirely empty
            // Grab their last cell and put it in a new group,
            // remove the empty group
            groups.pop();
            groups.push([ prevLastCell, ...cells]);
          }
        }
      }
    }

    return groups;
  }, []);
}

function maxAdjacentsInLine(line, player) {
  // Chunk line into Arrays containing adjacent spots
  // that are empty or belong to player
  const chunks = chunk(line, cell => cell.player != null && cell.player !== player.id ? null : true);
  return chunks.map(chunk => chunk[1]).reduce((max, chunk) => chunk && chunk.length > max ? chunk.length : max, 0);
}

function scoreForPlayer(metadata, player) {
  const scoreSystem = {
    '2': 1,
    '3': 10,
    '4': 25,
    '5': 1000,
    '6': 10000,

    fillQuadrantMultiplier: 4
  };

  const score = {
    points: 0,
    wins: false
  };

  const keys = Object.keys(metadata[player.id]);
  for(let n of keys) {
    let base = scoreSystem[n];

    const chunkedCells = metadata[player.id][n];

    for(let group of chunkedCells) {
      let multiplier = 1;

      const emptyCell = group.find(cell => cell.player == null);

      // No emptyCell means it's not a potential of n, but it already IS n,
      // the line is simply not longer. So increase our base accordingly.
      if(!emptyCell) {
        base = scoreSystem[n + 1];
      } else {
        const qSize = Constants.QUADRANT_SIZE;
        const cellsByQuadrant = chunk(group, cell => `${Math.floor(cell.row / qSize)}${Math.floor(cell.col / qSize)}`).map(chunk => chunk[1]);

        // Empty cell completed a quadrant if the group it is part of is the length of a quadrant
        const groupOfEmptyCell = cellsByQuadrant.find(cells => cells.indexOf(emptyCell) > -1);
        const completesQuadrant = groupOfEmptyCell.length === Constants.QUADRANT_SIZE;

        if(completesQuadrant) {
          multiplier = scoreSystem.fillQuadrantMultiplier;
        }
      }

      score.points = score.points + base * multiplier;
    }
  }

  return score;
}

export const getBoardScoreByPlayer = createSelector(
  getMetadata,
  getPlayers,
  (metadata, players) => {
    //console.log(`getBoardScoreByPlayer`);
    const playerScores = {};

    for(let player of players) {
      playerScores[player.id] = scoreForPlayer(metadata, player);
    }

    // This is a 2 player game
    const playerOne = players[0];
    const playerTwo = players[1];

    const playerOnePoints = playerScores[playerOne.id].points;
    const playerTwoPoints = playerScores[playerTwo.id].points;

    return {
      [playerOne.id]: playerOnePoints - playerTwoPoints,
      [playerTwo.id]: playerTwoPoints - playerOnePoints,
    }
  }
)