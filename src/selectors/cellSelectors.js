import { createSelector } from 'reselect';
import { chunk } from '../helpers';
import * as Constants from '../constants';

const getCells = state => Object.keys(state).map(id => state[id]);

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
    // TODO
    return [];
  }
)

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