import { combineReducers } from 'redux';
import {
  SET_AI_MOVE_DELAY, SET_AUTOMATIC_RESTART, SET_ANIMATIONS_ENABLED,
  SET_ANIMATION_DURATION, SET_SHOW_LOAD_SAVE_BUTTONS, SET_FIENE_MODE
} from '../actions';

function aiMoveDelay(state = 500, action) {
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

function showLoadSaveButtons(state = false, action) {
  switch(action.type) {
    case SET_SHOW_LOAD_SAVE_BUTTONS:
      const { show } = action;
      return show;

    default: return state;
  }
}

function fieneMode(state = false, action) {
  switch(action.type) {
    case SET_FIENE_MODE:
      const { on } = action;
      return on;

    default: return state;
  }
}

const optionsReducer = combineReducers({
  aiMoveDelay,
  automaticRestart,
  animationsEnabled,
  animationDuration,
  showLoadSaveButtons,
  fieneMode
});

export default optionsReducer;