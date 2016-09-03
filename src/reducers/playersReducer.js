const allPlayers = [
  { id: 1, name: 'Red', isAI: true },
  { id: 2, name: 'Blue', isAI: true }
];

const playersById = allPlayers.reduce((byId, player) => (byId[player.id] = player) && byId, {});

// Nothing to reduce right now
export default (state = playersById, action) => state