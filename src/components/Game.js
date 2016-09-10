import React from 'react';
import { connect } from 'react-redux';
import Board from './Board';
import Controls from './Controls';
import ErrorMessage from './ErrorMessage';
import Score from './Score';
import { getPlayers } from '../selectors/playerSelectors';
import { computeMove, computeAndDoMove } from '../actions/ai';

const Game = ({ activePlayer, winner, gameOver, players, score, boardScores, computeMove, computeAndDoMove }) => {
  return (
    <div className={ getClassNames() }>
      <div className="column-center">
        { !gameOver && activePlayer != null && <h2>{ `Player: ${ activePlayer.name }` }</h2> }
        { gameOver && winner && <h2>{ `${ winner.name } wins!` }</h2> }
        { gameOver && !winner && <h2>It's a draw</h2> }

        <Board />
        <Score />
        <Controls />
        <ErrorMessage />
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

export default connect(
  state => ({
    activePlayer: state.activePlayer > 0 ? state.players[state.activePlayer] : null,
    winner: state.players[state.winner],
    gameOver: state.gameOver,
    players: getPlayers(state),
    score: state.ui.score,
    boardScores: state.scores
  })
)(Game);