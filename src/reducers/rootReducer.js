import { combineReducers } from 'redux'
import boardReducer from './boardReducer'
import playersReducer from './playersReducer'
import uiReducer from './uiReducer'

import { PICK_CELL, ROTATE_QUADRANT, SHOW_ERROR, HIDE_ERROR, BEGIN_TURN } from '../actions';

function activePlayer(state = 1, action) {
  switch(action.type) {
    case ROTATE_QUADRANT:
      return (state % 2) + 1;

    default: return state;
  }
}

function lastMove(state = null, action) {
  switch(action.type) {
    case PICK_CELL:
      return action.cellId;

    default: return state;
  }
}

function winner(state = null, action) {
  switch(action.type) {
    case PICK_CELL:
      return state;

    default: return state;
  }
}

function error(state = null, action) {
  switch(action.type) {
    case SHOW_ERROR:
      return action.error;

    case HIDE_ERROR:
    case PICK_CELL:
      return null;

    default: return state;
  }
}

function canPickCell(state = false, action) {
  switch(action.type) {
    case(BEGIN_TURN):
      return true;

    case(PICK_CELL):
      return false;

    default: return state;
  }
}

function canRotateQuadrant(state = false, action) {
  switch(action.type) {
    case(ROTATE_QUADRANT):
      return false;

    case(PICK_CELL):
      return true;

    default: return state;
  }
}

const rootReducer = combineReducers({
  board: boardReducer,
  players: playersReducer,
  ui: uiReducer,
  activePlayer,
  lastMove,
  winner,
  error,
  canPickCell,
  canRotateQuadrant,
});

export default rootReducer;