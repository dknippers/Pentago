import { createSelector } from 'reselect';
import { chunk, transpose, groupBy } from '../helpers';
import { getPlayers } from './playerSelectors';
import * as Constants from '../constants';

const getCells = state => Object.keys(state).map(id => state[id]);

export const getAvailableCells = createSelector(
  getCells,
  cells => cells.filter(cell => cell.player == null)
);

const getSortedCells = createSelector(
  getCells,
  cells => cells.sort((x,y) => {
    if(x.row > y.row) return 1;
    if(x.row < y.row) return -1;

    if(x.col > y.col) return 1;
    if(x.col < y.col) return -1;

    return 0;
  })
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

function winningCellsInLines(lines, player) {
  for(let line of lines) {
    const winningCells = winsInLine(line, player);
    if(winningCells) return winningCells;
  }
}

const makeWinsInRow = player => createSelector(
  getRows,
  rows => winningCellsInLines(rows, player)
);

const makeWinsInColumn = player => createSelector(
  getColumns,
  columns => winningCellsInLines(columns, player)
)

const makeWinsInDiagonal = player => createSelector(
  getDiagonals,
  diagonals => winningCellsInLines(diagonals, player)
)

export const makeIsWinner = player => createSelector(
  getCells,
  cells => makeWinsInRow(player)(cells) || makeWinsInColumn(player)(cells) || makeWinsInDiagonal(player)(cells)
)

function winsInLine(line, player) {
  return chunk(line, cell => cell.player === player)
    .filter(chunk => chunk[0])
    .map(chunk => chunk[1])
    .find(cells => cells.length >= Constants.AMOUNT_IN_LINE_TO_WIN)
}

const quadrantMinAndMaxRowOrCol = rowOrCol => [ rowOrCol * Constants.QUADRANT_SIZE, (rowOrCol + 1) * Constants.QUADRANT_SIZE - 1 ];

export const quadrantMinAndMaxRow = (row) => quadrantMinAndMaxRowOrCol(row);
export const quadrantMinAndMaxCol = (col) => quadrantMinAndMaxRowOrCol(col);

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

export const makeGetMetadata = players => createSelector(
  getCells,
  cells => {
    const rows = getRows(cells);
    const columns = getColumns(cells);
    const diagonals = getDiagonals(cells);

    const cellsInLine = [...rows, ...columns, ...diagonals];
    const metadata = {};

    players.forEach(player => {
      const potentials = {};
      cellsInLine.forEach(line => {
        const potentialAmountInLine = computePotentialsInLine(line, player);
        if(!potentialAmountInLine) return;

        potentialAmountInLine.forEach(group => {
          (potentials[group.length] || (potentials[group.length] = [])).push(group);
        });
      });

      metadata[player.id] = potentials;
    });

    return metadata;
  }
)

function computePotentialsInLine(line, player) {
  const maxInLine = maxAdjacentsInLine(line, player);
  // If the maximum amount is not enough to win
  // there's no potential whatsoever, line should be totally ignored.
  if(maxInLine <= Constants.AMOUNT_IN_LINE_TO_WIN) return null;

  // Chunk by empty or owned by player, drops opponents cells
  const chunks = chunk(line, cell => cell.player == null || (cell.player === player.id ? false : null));

  return chunks.reduce((groups, chunk) => {
    const [ isEmpty, cells ] = chunk;

    const firstCell = cells[0];
    const firstIdx = line.indexOf(firstCell)
    const last_cell = cells[cells.length - 1];

    const isLastAndEmpty = isEmpty && chunks.indexOf(chunk) === chunks.length - 1;

    const prevGroup = groups[groups.length - 1];

    // No previous group, add yourself and be done
    if(!prevGroup) {
      if(!isLastAndEmpty) {
        groups.push(cells)
      }
    } else {
      let prevLastCell = prevGroup[prevGroup.length - 1];
      let prevLastIdx = line.indexOf(prevLastCell);

      let distance = Math.abs(firstIdx - prevLastIdx);

      // If we are not adjacent, never mind
      if(distance > 1) {
        if(!isLastAndEmpty) {
          groups.push(cells)
        }
      } else {
        // Empty cells, first cell will try to join the previous group
        if(isEmpty) {
          // If the previous group is completely empty, just remove it (it's irrelevant)
          if(prevGroup.every(cell => cell.player == null)) {
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

            // We only add ourselves when firstCell is different from last_cell
            // If firstCell is the same as last_cell, the next group can just join
            // us in the previous group.
            // Again, do not add ourselves if we are the last group and empty
            if(firstCell !== last_cell && !isLastAndEmpty) {
              groups.push(cells);
            }
          }
        } else {
          // Player controlled cells
          // Try to join a previous player-controlled group
          // It can have most have 1 empty cell but that's fine
          if(prevGroup.some(cell => cell.player != null)) {
            prevGroup.concat(cells)
          } else {
            // Previous group is entirely empty
            // Grab their last cell and discard the rest
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

export const makeGetBoardScore = player => createSelector(

)