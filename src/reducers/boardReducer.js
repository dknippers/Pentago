import { combineReducers } from 'redux';
import cells from './cellsReducer';

const boardReducer = combineReducers({
	cells
});

export default boardReducer;