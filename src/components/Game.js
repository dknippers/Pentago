import React from 'react';
import { connect } from 'react-redux';
import Board from '../components/Board';
import { getPlayers } from '../selectors/playerSelectors';

const Game = ({ activePlayer, winner, gameOver, error, players, score, boardScores }) => {
  return (
    <div className={ getClassNames() }>
      { activePlayer && !gameOver &&
        <h2>{ `Player: ${ activePlayer.name }` }</h2>
      }

      { gameOver && <h2>Game over</h2> }
      { winner && <h3>{ `${ winner.name } wins!` }</h3> }
      { !winner && gameOver && <h3>It's a draw</h3> }

      { /* TODO: score etc */ }

      <Board />

      <h2>Board value</h2>
      <h3>{ players[0].name } { boardScores[players[0].id] || 0 } |  { players[1].name } { boardScores[players[1].id] || 0 }</h3>

      <h2>Score</h2>
      <h3>{ players[0].name } { score[players[0].id] || 0 } - { score[players[1].id] || 0 } { players[1].name }</h3>

      { error &&
        <div className="error">{ error }</div>
      }
    </div>
  );

  function getClassNames() {
    const classNames = ['game'];

    if(gameOver) {
      classNames.push('game-over');
    }

    return classNames.join(' ');
  }
}

const mapStateToProps = (state) => {
  return {
    activePlayer: state.players[state.activePlayer],
    winner: state.players[state.winner],
    gameOver: state.gameOver,
    error: state.error,
    players: getPlayers(state),
    score: state.ui.score,
    boardScores: state.scores
  }
}

export default connect(
  mapStateToProps
)(Game);