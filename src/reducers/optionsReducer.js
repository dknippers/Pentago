import { combineReducers } from 'redux';
import { SET_AI_MOVE_DELAY, SET_AUTOMATIC_RESTART } from '../actions';

const optionsReducer = combineReducers({
  aiMoveDelay,
  automaticRestart,
});

export default optionsReducer;

function aiMoveDelay(state = 2000, action){
  switch(action.type) {
    case SET_AI_MOVE_DELAY:
      const { timeout } = action;

      if(isNaN(timeout) || typeof timeout !== 'number') {
        return state;
      }

      return timeout;

    default: return state;
  }
}

function automaticRestart(state = false, action){
  switch(action.type) {
    case SET_AUTOMATIC_RESTART:
      const { enabled } = action;
      return enabled;

    default: return state;
  }
}