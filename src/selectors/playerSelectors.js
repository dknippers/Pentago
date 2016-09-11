import { createSelector } from 'reselect';

const initPlayers = state => state.players;
const getActivePlayerId = state => state.activePlayer;

export const getPlayers = createSelector(
  initPlayers,
  playersById => Object.keys(playersById).map(id => playersById[id])
)

export const getCurrentPlayer = createSelector(
  getPlayers,
  getActivePlayerId,
  (players, activePlayerId) => players.find(player => player.id === activePlayerId)
);

export const getNextPlayer = createSelector(
  getPlayers,
  getActivePlayerId,
  (players, activePlayerId) => players.find(player => player.id !== activePlayerId)
);