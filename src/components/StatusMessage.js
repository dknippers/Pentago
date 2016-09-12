import React from 'react';
import { connect } from 'react-redux';
import { getActivePlayer, getPlayer } from '../selectors/playerSelectors';

const StatusMessage = ({ gameOver, activePlayer, winner }) => {
  // Game has not ended, but no active player (yet)
  if(!gameOver && activePlayer == null) return null;

  if(!gameOver) {
    return <h2>{ `Player: ${ activePlayer.name }` }</h2>
  } else {
    if(winner) {
      return <h2>{ `${ winner.name } wins!` }</h2>
    } else {
      return <h2>It's a draw</h2>
    }
  }
}

export default connect(
  state => ({
    gameOver: state.gameOver,
    activePlayer: getActivePlayer(state),
    winner: getPlayer(state.winner)(state)
  })
)(StatusMessage);