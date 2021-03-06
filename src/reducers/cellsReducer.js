import { PICK_CELL, ROTATE_QUADRANT, RESTART_GAME } from "../actions";
import { byId } from "../helpers";
import { BOARD_SIZE } from "../constants";
import { makeGetRotatedQuadrant } from "../selectors/cellSelectors";

let cellId = 0;

const allCells = [];
for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
        allCells.push({
            id: cellId++,
            row: row,
            col: col
        });
    }
}

export const initialState = byId(allCells);

function cells(state = initialState, action) {
    switch (action.type) {
        case PICK_CELL:
            const { cellId, color } = action;
            const cell = state[cellId];

            if (cell.player != null) {
                throw new Error(
                    `Cell (${cell.row}, ${cell.col}) is not empty!`
                );
            }

            return Object.assign({}, state, {
                [cell.id]: Object.assign({}, cell, {
                    player: action.playerId,
                    color
                })
            });

        case ROTATE_QUADRANT:
            const { row, column, clockwise } = action;

            // These are just the changed cells of the quadrant
            const rotatedQuadrant = makeGetRotatedQuadrant(
                row,
                column,
                clockwise
            )({ cells: state });

            return Object.assign({}, state, rotatedQuadrant);

        case RESTART_GAME:
            return byId(allCells);

        default:
            return state;
    }
}

export default cells;
