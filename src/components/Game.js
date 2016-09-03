import React from 'react';
import { connect } from 'react-redux';
import Board from '../components/Board';
import { getPlayers } from '../selectors/playerSelectors';

const Game = ({ activePlayer, winner, draw, error, players, score }) => {
  return (
    <div className={ getClassNames() }>
      { activePlayer && !draw &&
        <h2>{ `Player: ${ activePlayer.name }` }</h2>
      }

      { draw && <h2>Game over</h2> }
      { winner && <h3>{ `${ winner.name } wins!` }</h3> }
      { !winner && draw && <h3>It's a draw</h3> }

      { /* TODO: score etc */ }

      <Board />

      <h2>Score</h2>
      <h3>{ players[0].name } { score[players[0].id] || 0 } - { score[players[1].id] || 0 } { players[1].name }</h3>

      { error &&
        <div className="error">{ error }</div>
      }
    </div>
  );

  function getClassNames() {
    const classNames = ['game'];

    if(draw) {
      classNames.push('game-over');
    }

    return classNames.join(' ');
  }
}

const mapStateToProps = (state) => {
  return {
    activePlayer: state.players[state.activePlayer],
    winner: state.players[state.winner],
    draw: state.draw,
    error: state.error,
    players: getPlayers(state),
    score: state.ui.score
  }
}

export default connect(
  mapStateToProps
)(Game);