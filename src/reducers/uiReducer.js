import { combineReducers } from 'redux';
import { SELECT_QUADRANT, ROTATE_QUADRANT } from '../actions';

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

const uiReducer = combineReducers({
  selectedQuadrant
});

export default uiReducer;