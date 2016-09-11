import { byId } from '../helpers';
import { SET_PLAYER_NAME, SET_PLAYER_AI } from '../actions';

const allPlayers = [
  { id: 1, name: 'Red', isAI: true },
  { id: 2, name: 'Blue', isAI: false }
];

export const initialState = byId(allPlayers);

export default (state = initialState, action) => {
  switch(action.type) {
    case SET_PLAYER_NAME: {
      const { playerId, name } = action;

      return Object.assign({}, state, {
        [playerId] : Object.assign({}, state[playerId], {
          name: name
        })
      });
    }

    case SET_PLAYER_AI: {
      const { playerId, isAI } = action;

      return Object.assign({}, state, {
        [playerId] : Object.assign({}, state[playerId], {
          isAI: isAI
        })
      });
    }

    default: return state;
  }
}