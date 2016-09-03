import { createSelector } from 'reselect';

const initPlayers = state => state.players;

export const getPlayers = createSelector(
  initPlayers,
  playersById => Object.keys(playersById).map(id => playersById[id])
)

export const makeGetCurrentPlayer = activePlayer => createSelector(
  getPlayers,
  players => players.find(player => player.id === activePlayer)
);

export const makeGetNextPlayer = activePlayer => createSelector(
  getPlayers,
  players => players.find(player => player.id !== activePlayer)
);