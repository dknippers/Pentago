import { combineReducers } from 'redux'
import boardReducer from './boardReducer'
import playersReducer from './playersReducer'

import { PLACE_MARBLE, SHOW_ERROR, HIDE_ERROR } from '../actions';

function activePlayer(state = 1, action) {
  switch(action.type) {
    case PLACE_MARBLE:
      return (state % 2) + 1;

    default: return state;
  }
}

function lastMove(state = null, action) {
  switch(action.type) {
    case PLACE_MARBLE:
      return action.cellId;

    default: return state;
  }
}

function winner(state = null, action) {
  switch(action.type) {
    case PLACE_MARBLE:
      return state;

    default: return state;
  }
}

function error(state = null, action) {
  switch(action.type) {
    case SHOW_ERROR:
      return action.error;

    case HIDE_ERROR:
    case PLACE_MARBLE:
      return null;

    default: return state;
  }
}

function cellLoading(state = null, action) {
  switch(action.type) {
    case(SHOW_ERROR):
    case(PLACE_MARBLE):
      return null;

    default: return state;
  }
}

const rootReducer = combineReducers({
  board: boardReducer,
  players: playersReducer,
  activePlayer,
  lastMove,
  winner,
  error,
  cellLoading
});

export default rootReducer;