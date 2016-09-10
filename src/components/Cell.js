import React from 'react';
import { connect } from 'react-redux';
import { tryPickCell } from '../actions';

const Cell = ({ cell, tryPickCell, activePlayerId, lastMove, isEnabled, canRotateQuadrant, isWinningCell, isComputedByAi, showLastMove }) => {
  return (
    <div className={ getClassNames() } onClick={ isEnabled ? () => tryPickCell(cell.id, activePlayerId) : null }>
      <data value={ `(${ cell.row },${ cell.col }) ${ cell.player ? cell.player : '' }` } />
    </div>
  );

  function getClassNames() {
    const classNames = ['cell'];

    if(cell.player) {
      classNames.push(`player-${ cell.player }`);
    } else {
      classNames.push('empty');
      classNames.push(`player-${ activePlayerId }`);
    }

    if(showLastMove && lastMove.cellId === cell.id) {
      classNames.push('last-move');
    }

    if(isWinningCell) {
      classNames.push('winning');
    }

    if(isComputedByAi) {
      classNames.push('computed');
    }

    return classNames.join(' ');
  }
}

export default connect(
  (state, props) => ({
      activePlayerId: state.activePlayer,
      lastMove: state.lastMove,
      isEnabled: !state.ui.showLastMove && !state.draw && state.canPickCell && props.cell.player == null && (state.activePlayer == 0 || !state.players[state.activePlayer].isAI),
      canRotateQuadrant: !state.draw && state.canRotateQuadrant,
      isWinningCell: state.ui.winningCells.some(cell => cell.id === props.cell.id),
      isComputedByAi: state.ui.computedMove && state.ui.computedMove.cellId === props.cell.id,
      showLastMove: state.ui.showLastMove
  }),
  { tryPickCell }
)(Cell);