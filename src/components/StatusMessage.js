import React from 'react';
import { connect } from 'react-redux';
import { getActivePlayer, getPlayer } from '../selectors/playerSelectors';

const StatusMessage = ({ gameStarted, gameOver, activePlayer, winner }) => {
  // If the game has not started yet, display the game title
  if(!gameStarted) {
    return <h1>Pentago</h1>;
  }


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
    gameStarted: state.gameStarted,
    gameOver: state.gameOver,
    activePlayer: getActivePlayer(state),
    winner: getPlayer(state.winner)(state)
  })
)(StatusMessage);