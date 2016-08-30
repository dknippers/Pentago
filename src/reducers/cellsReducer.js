import { PLACE_MARBLE, ROTATE_QUADRANT } from '../actions';
import { byId, transpose } from '../helpers';
import { makeGetQuadrant, quadrantMinAndMaxRow, quadrantMinAndMaxCol } from '../selectors/cellSelectors';

let cellId = 0;

const allCells = [];
for(let row = 0; row < 6; row++) {
	for(let col = 0; col < 6; col++) {
		allCells.push({
			id: cellId++,
			row: row,
			col: col
		});
	}
}

function rotateClockwise(quadrant) {
  return transpose(quadrant.reverse());
}

function rotateCounterclockwise(quadrant) {
  return transpose(quadrant.map(row => row.reverse()));
}

function rotate(quadrant, turnClockwise) {
  return (turnClockwise ? rotateClockwise : rotateCounterclockwise)(quadrant);
}

function cells(state = byId(allCells), action) {
	switch(action.type) {
    case PLACE_MARBLE:
      let cell = state[action.cellId];

      if(cell.player != null) {
        throw new Error(`Cell (${cell.row}, ${cell.col}) is not empty!`);
      }

      return Object.assign({}, state, {
        [action.cellId]: Object.assign({}, state[action.cellId], {
          player: action.playerId
        })
      });

    case ROTATE_QUADRANT:
      const { row, column, clockwise } = action;
      const quadrant = makeGetQuadrant(row, column)(state);

      // Apply rotation
      const rotated = rotate(quadrant, clockwise);

       // Update row and column of the cells inside
       // in a copy of the, of course
      const [ minRow, ] = quadrantMinAndMaxRow(row);
      const [ minCol, ] = quadrantMinAndMaxCol(column);

      const newState = Object.assign({}, state);

      for(let irow = 0; irow < rotated.length; irow++) {
        const row = rotated[irow];
        for(let icol = 0; icol < row.length; icol++) {
          const cell = rotated[irow][icol];

          // Manipulate the new state
          newState[cell.id] = Object.assign({}, newState[cell.id], {
            row: irow + minRow,
            col: icol + minCol
          });
        }
      }

      return newState;

		default: return state;
	}
}

export default cells;