import { combineReducers } from 'redux';
import {
  SELECT_QUADRANT, ROTATE_QUADRANT, ANIMATE_QUADRANT, PLAYER_WON, BEGIN_TURN,
  SHOW_LAST_MOVE, HIDE_PREVIOUS_MOVE, RESTART_GAME, TOGGLE_OPTIONS, WINNING_CELLS
} from '../actions';
import { COMPUTED_MOVE, HIDE_COMPUTED_MOVE } from '../actions/ai';

function selectedQuadrant(state = {}, action) {
  switch(action.type) {
    case(SELECT_QUADRANT):
      const { row, column } = action;
      return Object.assign({}, { row, column });

    case ROTATE_QUADRANT:
    case RESTART_GAME:
      return {};

    default: return state;
  }
}

function winningCells(state = [], action) {
  switch(action.type) {
    case(WINNING_CELLS):
      return action.cells;

    case RESTART_GAME:
      return [];

    default: return state;
  }
}

function score(state = {}, action) {
  switch(action.type) {
    case PLAYER_WON:
      return Object.assign({}, state, {
        [action.player]: (state[action.player] || 0) + 1
      });

    default: return state;
  }
}

function computedMove(state = null, action){
  switch(action.type) {
    case COMPUTED_MOVE:
      return action.move;

    case HIDE_COMPUTED_MOVE:
      return null;

    case BEGIN_TURN:
      return null;

    default: return state;
  }
}

function showLastMove(state = false, action){
  switch(action.type) {
    case SHOW_LAST_MOVE:
      return true;

    case HIDE_PREVIOUS_MOVE:
      return false;

    default: return state;
  }
}

function showOptions(state = true, action){
  switch(action.type) {
    case TOGGLE_OPTIONS:
      return !state;

    default: return state;
  }
}

function quadrantAnimation(state = null, action) {
  switch(action.type) {
    case ANIMATE_QUADRANT:
      const { row, column, clockwise } = action;
      return { row, column, clockwise };

    case ROTATE_QUADRANT:
    case RESTART_GAME:
      return null;

    default: return state;
  }
}

const uiReducer = combineReducers({
  selectedQuadrant,
  winningCells,
  score,
  computedMove,
  showLastMove,
  showOptions,
  quadrantAnimation,
});

export default uiReducer;