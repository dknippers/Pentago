import { computeMove } from './ai';

export const TRY_PLACE_MARBLE = 'TRY_PLACE_MARBLE';
export function tryPlaceMarble(cellId, playerId) {
  return (dispatch, getState) => {
    // dispatch({ type: TRY_PLACE_MARBLE, cellId, playerId });

    const state = getState();
    const cell = state.board.cells[cellId];

    const errorMessage = validateMove(cell, cellId, playerId);

    if(errorMessage) {
      return dispatch(showError(errorMessage));
    }

    // All good
    dispatch(placeMarble(cellId, playerId));

    dispatch(rotateQuadrant(Math.floor(Math.random() * 2), Math.floor(Math.random() * 2), Math.random() > 0.5));

    // After this, begin next turn
    dispatch(beginTurn());
  }
}

export const PLACE_MARBLE = 'PLACE_MARBLE';
export function placeMarble(cellId, playerId) {
  return {
    type: PLACE_MARBLE,
    cellId,
    playerId
  }
};

export const ROTATE_QUADRANT = 'ROTATE_QUADRANT';
export function rotateQuadrant(row, column, clockwise) {
  return {
    type: ROTATE_QUADRANT,
    row,
    column,
    clockwise
  }
}

function validateMove(cell, cellId, playerId) {
  let errorMessage = null;

  if(!cell) {
    errorMessage = `Cell #${ cell.id } does not exist!`;
  } else if(cell.player != null) {
    errorMessage = `Cell (${ cell.row }, ${ cell.col }) is not empty!`
  }

  return errorMessage;
}

export const SHOW_ERROR = 'SHOW_ERROR';
export function showError(error) {
  return {
    type: SHOW_ERROR,
    error
  }
};

export const HIDE_ERROR = 'HIDE_ERROR';
export function hideError() {
  return {
    type: HIDE_ERROR
  }
};

export const BEGIN_TURN = 'BEGIN_TURN';
export function beginTurn() {
  return (dispatch, getState) => {
    //dispatch({ type: BEGIN_TURN });

    const state = getState();
    const player = state.players[state.activePlayer];

    if(!player || !player.isAI) return;

    // AI => compute its move
    dispatch(computeMove(dispatch, getState));
  }
}