import React from 'react';
import { connect } from 'react-redux';
import Board from './Board';
import Controls from './Controls';
import ErrorMessage from './ErrorMessage';
import StatusMessage from './StatusMessage';
import Options from './Options';
import Score from './Score';

const Game = ({ activePlayerId, gameOver, score, boardScores }) => {
  return (
    <div className={ getClassNames() }>
      <div className="column-center">
        <StatusMessage />
        <Board />
        <Score />


        <Controls />
        <ErrorMessage />
        <Options />
      </div>
    </div>
  );

  function getClassNames() {
    const classNames = ['game'];

    if(gameOver) {
      classNames.push('game-over');
    }

    if(activePlayerId) {
      classNames.push(`player-${ activePlayerId }`);
    }

    return classNames.join(' ');
  }
}

export default connect(
  state => ({
    activePlayerId: state.activePlayer,
    gameOver: state.gameOver,
    score: state.ui.score,
    boardScores: state.scores
  })
)(Game);