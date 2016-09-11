import { combineReducers } from 'redux';
import cellsReducer from './cellsReducer';
import playersReducer from './playersReducer';
import uiReducer from './uiReducer';
import optionsReducer from './optionsReducer';
import {
  PICK_CELL, ROTATE_QUADRANT, SHOW_ERROR, HIDE_ERROR, BEGIN_TURN, PLAYER_WON, DRAW, RESET_GAME,
  UPDATE_SCORES
} from '../actions';

const rootReducer = combineReducers({
  cells: cellsReducer,
  players: playersReducer,
  ui: uiReducer,
  options: optionsReducer,
  activePlayer,
  lastMove,
  winner,
  gameOver,
  error,
  canPickCell,
  canRotateQuadrant,
  scores
});

export default rootReducer;

function activePlayer(state = 1, action) {
  switch(action.type) {
    case ROTATE_QUADRANT:
      return (state % 2) + 1;

    case RESET_GAME:
      return 1;

    default: return state;
  }
}

function lastMove(state = {}, action) {
  switch(action.type) {
    case PICK_CELL:
      // Erase rotation of previous player
      return { cellId: action.cellId };

    case ROTATE_QUADRANT:
      const { row, column, clockwise } = action;

      // Add rotation to current player
      return Object.assign({}, state, { rotation: { row, column, clockwise } });

    case(RESET_GAME):
      return {};

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

function gameOver(state = false, action) {
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

function scores(state = {}, action) {
  switch(action.type) {
    case(UPDATE_SCORES):
      return action.scores;

    case(RESET_GAME):
      return {};

    default: return state;
  }
}