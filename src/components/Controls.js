import React from 'react';
import { connect } from 'react-redux';
import { computeMove, hideComputedMove, computeAndDoMove } from '../actions/ai';
import { showLastMove, hideLastMove, restartGame, toggleOptions } from '../actions';
import { getActivePlayer } from '../selectors/playerSelectors';

const Controls = ({
  gameOver, hasPreviousMove, showingLastMove, showingOptions, hasComputedMove, showAIButtons, disableAIButtons,
  computeMove, hideComputedMove, computeAndDoMove, showLastMove, hideLastMove, restartGame, toggleOptions
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
          <button className="btn" type="button" onClick={ () => restartGame() }>Restart game</button>
        }

        { showAIButtons &&
          (hasComputedMove
            ? <button className="btn" type="button" onClick={ hideComputedMove }>Hide AI move</button>
            : <button className="btn" type="button" disabled={ disableAIButtons } onClick={ computeMove }>Compute AI move</button>)
        }

        { showAIButtons &&
          <button className="btn" type="button" disabled={ disableAIButtons } onClick={ computeAndDoMove }>Execute AI move</button>
        }

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
    showingOptions: state.ui.showOptions,
    hasComputedMove: state.ui.computedMove != null,
    showAIButtons: !state.gameOver,
    disableAIButtons: !state.canPickCell || (getActivePlayer(state) && getActivePlayer(state).isAI),
  }),
  { computeMove, hideComputedMove, computeAndDoMove, showLastMove, hideLastMove, restartGame, toggleOptions }
)(Controls);