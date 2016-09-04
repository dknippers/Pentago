import { combineReducers } from 'redux';
import { SELECT_QUADRANT, ROTATE_QUADRANT, PLAYER_WON, RESET_GAME, BEGIN_TURN } from '../actions';
import { COMPUTED_MOVE } from '../actions/ai';

const uiReducer = combineReducers({
  selectedQuadrant,
  winningCells,
  score,
  computedMove
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