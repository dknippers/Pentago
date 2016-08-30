import React from 'react';
import { connect } from 'react-redux';
import Board from '../components/Board';

const Game = ({ activePlayer, winner, error }) => (
  <div className="game">
    { activePlayer &&
      <h2>{ `Player: ${ activePlayer.name }` }</h2>
    }

    { /* TODO: score etc */ }

    <Board />

    { error &&
      <div className="error">{ error }</div>
    }

    { winner &&
      <h3>{ `Player ${ winner.name } wins!` }</h3>
    }
  </div>
)

const mapStateToProps = (state) => {
  return {
    activePlayer: state.players[state.activePlayer],
    winner: state.players[state.winner],
    error: state.error
  }
}

export default connect(
  mapStateToProps
)(Game);