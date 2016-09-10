import React from 'react';
import { connect } from 'react-redux';
import { computeMove, computeAndDoMove } from '../actions/ai';
import { showLastMove, hidePreviousMove, resetGame } from '../actions';

const Controls = ({ gameOver, showingPreviousMove, computeMove, computeAndDoMove, showLastMove, hidePreviousMove, hasPreviousMove, resetGame }) => {
  return (
    <div className="controls">
      <div className="buttons">
        { hasPreviousMove &&
          <button className="btn" type="button" onClick={ togglePreviousMove } >
            { showingPreviousMove ? `Hide previous move` : `Show previous move` }
          </button>
        }

        { gameOver &&
          <button className="btn" type="button" onClick={ () => resetGame() }>Reset game</button>
        }

        { !gameOver && <button className="btn" type="button" onClick={ () => computeMove() }>Compute AI move</button> }
        { !gameOver && <button className="btn" type="button" onClick={ () => computeAndDoMove() }>Execute AI move</button> }
      </div>
    </div>
  );

  function togglePreviousMove() {
    if(showingPreviousMove) {
      hidePreviousMove();
    } else {
      showLastMove();
    }
  }
}
export default connect(
  state => ({
    gameOver: state.gameOver,
    hasPreviousMove: state.lastMove.cellId != null,
    showingPreviousMove: state.ui.showLastMove
  }),
  { computeMove, computeAndDoMove, showLastMove, hidePreviousMove, resetGame }
)(Controls);