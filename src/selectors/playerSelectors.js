import { createSelector } from 'reselect';

export const getPlayersById = state => state.players;
export const getActivePlayerId = state => state.activePlayer;
export const getNextPlayerId = state => (state.activePlayer % 2) + 1;

export const getPlayers = createSelector(
  getPlayersById,
  playersById => Object.keys(playersById).map(id => playersById[id])
)

export const getPlayer = playerId => createSelector(
  getPlayersById,
  playersById => playersById[playerId]
);

export const getActivePlayer = createSelector(
  getPlayersById,
  getActivePlayerId,
  (playersById, activePlayerId) => playersById[activePlayerId]
);

export const getNextPlayer = createSelector(
  getPlayersById,
  getNextPlayerId,
  (playersById, nextPlayerId) => playersById[nextPlayerId]
);