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