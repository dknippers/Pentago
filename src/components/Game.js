import React from 'react';
import { connect } from 'react-redux';
import Board from './Board';
import Controls from './Controls';
import { getPlayers } from '../selectors/playerSelectors';
import { computeMove, computeAndDoMove } from '../actions/ai';

const Game = ({ activePlayer, winner, gameOver, error, players, score, boardScores, computeMove, computeAndDoMove }) => {
  return (
    <div className={ getClassNames() }>
      <div className="column-center">
        { !gameOver && activePlayer != null && <h2>{ `Player: ${ activePlayer.name }` }</h2> }
        { gameOver && winner && <h2>{ `${ winner.name } wins!` }</h2> }
        { gameOver && !winner && <h2>It's a draw</h2> }

        <Board />
        <Controls />
        <h2>Score</h2>
        <h3>{ players[0].name } { score[players[0].id] || 0 } - { score[players[1].id] || 0 } { players[1].name }</h3>

        {
          //<h2>Board value</h2>
          //<h3>{ players[0].name } { boardScores[players[0].id] || 0 } |  { players[1].name } { boardScores[players[1].id] || 0 }</h3>
        }

        { error &&
          <div className="error">{ error }</div>
        }
      </div>
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
    activePlayer: state.activePlayer > 0 ? state.players[state.activePlayer] : null,
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