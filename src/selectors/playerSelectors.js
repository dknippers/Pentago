import { createSelector } from 'reselect';

export const getPlayers = state => Object.keys(state).map(id => state[id]);

export const makeGetCurrentPlayer = activePlayer => createSelector(
  getPlayers,
  players => players.find(player => player.id === activePlayer)
);

export const makeGetNextPlayer = activePlayer => createSelector(
  getPlayers,
  players => players.find(player => player.id !== activePlayer)
);