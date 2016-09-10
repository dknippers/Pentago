import { byId } from '../helpers';

const allPlayers = [
  { id: 1, name: 'Red', isAI: true },
  { id: 2, name: 'Blue', isAI: false }
];

export const initialState = byId(allPlayers);

// Nothing to reduce right now
export default (state = initialState, action) => state