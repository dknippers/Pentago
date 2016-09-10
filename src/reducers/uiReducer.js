import { combineReducers } from 'redux';
import {
  SELECT_QUADRANT, ROTATE_QUADRANT, PLAYER_WON, BEGIN_TURN,
  SHOW_LAST_MOVE, HIDE_PREVIOUS_MOVE, RESET_GAME
} from '../actions';
import { COMPUTED_MOVE } from '../actions/ai';

const uiReducer = combineReducers({
  selectedQuadrant,
  winningCells,
  score,
  computedMove,
  showLastMove
});

export default uiReducer;

function selectedQuadrant(state = {}, action) {
  switch(action.type) {
    case(SELECT_QUADRANT):
      const { row, column } = action;
      return Object.assign({}, { row, column });

    case(ROTATE_QUADRANT):
      return {};

    default: return state;
  }
}

function winningCells(state = [], action) {
  switch(action.type) {
    case(PLAYER_WON):
      return action.cells;

    case RESET_GAME:
      return [];

    default: return state;
  }
}

function score(state = {}, action) {
  switch(action.type) {
    case(PLAYER_WON):
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