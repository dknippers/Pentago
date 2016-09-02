import { combineReducers } from 'redux';
import { SELECT_QUADRANT, ROTATE_QUADRANT, PLAYER_WON } from '../actions';

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

const uiReducer = combineReducers({
  selectedQuadrant,
  winningCells,
  score,
});

export default uiReducer;