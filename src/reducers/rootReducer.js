import { combineReducers } from 'redux';
import cellsReducer from './cellsReducer';
import playersReducer from './playersReducer';
import uiReducer from './uiReducer';
import { getAvailableCells } from '../selectors/cellSelectors';
import { PICK_CELL, ROTATE_QUADRANT, SHOW_ERROR, HIDE_ERROR, BEGIN_TURN, PLAYER_WON, DRAW, RESET_GAME } from '../actions';

function activePlayer(state = 1, action) {
  switch(action.type) {
    case ROTATE_QUADRANT:
      return (state % 2) + 1;

    case RESET_GAME:
      return 1;

    default: return state;
  }
}

function lastMove(state = null, action) {
  switch(action.type) {
    case PICK_CELL:
      return action.cellId;

    case(RESET_GAME):
      return null;

    default: return state;
  }
}

function winner(state = null, action) {
  switch(action.type) {
    case PLAYER_WON:
      return action.player;

    case RESET_GAME:
      return null;

    default: return state;
  }
}

function draw(state = false, action) {
  switch(action.type) {
    case PLAYER_WON:
    case DRAW:
      return true;

    case RESET_GAME:
      return false;

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
    case(RESET_GAME):
      return false;

    default: return state;
  }
}

function canRotateQuadrant(state = false, action) {
  switch(action.type) {
    case(ROTATE_QUADRANT):
    case(RESET_GAME):
      return false;

    case(PICK_CELL):
      return true;

    default: return state;
  }
}

const rootReducer = combineReducers({
  cells: cellsReducer,
  players: playersReducer,
  ui: uiReducer,
  activePlayer,
  lastMove,
  winner,
  draw,
  error,
  canPickCell,
  canRotateQuadrant
});

export default rootReducer;