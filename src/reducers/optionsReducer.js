import { combineReducers } from 'redux';
import { SET_AI_MOVE_DELAY, SET_AUTOMATIC_RESTART, SET_ANIMATIONS_ENABLED, SET_ANIMATION_DURATION  } from '../actions';

function aiMoveDelay(state = 500, action){
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

function animationsEnabled(state = true, action){
  switch(action.type) {
    case SET_ANIMATIONS_ENABLED:
      const { enabled } = action;
      return enabled;

    default: return state;
  }
}

function animationDuration(state = 500, action){
  switch(action.type) {
    case SET_ANIMATION_DURATION:
      const { duration } = action;

      if(isNaN(duration) || typeof duration !== 'number') {
        return state;
      }

      return duration;

    default: return state;
  }
}

const optionsReducer = combineReducers({
  aiMoveDelay,
  automaticRestart,
  animationsEnabled,
  animationDuration
});

export default optionsReducer;