import React from 'react';
import { connect } from 'react-redux';
import { getPlayers } from '../selectors/playerSelectors';

const Score = ({ score, players, fieneMode }) => {
  if(fieneMode) return null;

  return (
    <div className="score">
      <h2>Score</h2>
      <h3>{ players[0].name } { score[players[0].id] || 0 } - { score[players[1].id] || 0 } { players[1].name }</h3>
    </div>
  );
}

export default connect(
  state => ({
    players: getPlayers(state),
    score: state.ui.score,
    fieneMode: state.options.fieneMode
  })
)(Score);