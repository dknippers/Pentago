import React from 'react';
import { connect } from 'react-redux';
import { computeMove, computeAndDoMove } from '../actions/ai';
import { showLastMove, hideLastMove, resetGame, toggleOptions } from '../actions';

const Controls = ({
  gameOver, hasPreviousMove, showingLastMove, showingOptions,
  computeMove, computeAndDoMove, showLastMove, hideLastMove, resetGame, toggleOptions
}) => {
  return (
    <div className="controls">
      <div className="buttons">
        { hasPreviousMove &&
          <button className="btn" type="button" onClick={ toggleLastMove } >
            { showingLastMove ? `Hide last move` : `Show last move` }
          </button>
        }

        { gameOver &&
          <button className="btn" type="button" onClick={ () => resetGame() }>Reset game</button>
        }

        { !gameOver && <button className="btn" type="button" onClick={ computeMove }>Compute AI move</button> }
        { !gameOver && <button className="btn" type="button" onClick={ computeAndDoMove }>Execute AI move</button> }

        { !showingOptions && <button className="btn" type="button" onClick={ toggleOptions }>Options</button> }
      </div>
    </div>
  );

  function toggleLastMove() {
    if(showingLastMove) {
      hideLastMove();
    } else {
      showLastMove();
    }
  }
}
export default connect(
  state => ({
    gameOver: state.gameOver,
    hasPreviousMove: state.lastMove.cellId != null,
    showingLastMove: state.ui.showLastMove,
    showingOptions: state.ui.showOptions
  }),
  { computeMove, computeAndDoMove, showLastMove, hideLastMove, resetGame, toggleOptions }
)(Controls);