import React from 'react';
import { connect } from 'react-redux';
import { tryPickCell } from '../actions';
import { getActivePlayer } from '../selectors/playerSelectors';

const Cell = ({
  cell, tryPickCell, activePlayerId, lastMove, isEnabled, canRotateQuadrant,
  isWinningCell, isComputedByAi, showLastMove, animationsEnabled, animationDuration
}) => {
  return (
    <span style={ getStyle() } className={ getClassNames() } onClick={ isEnabled ? () => tryPickCell(cell.id, activePlayerId) : null }></span>
  );

  function getClassNames() {
    const classNames = ['cell'];

    if(cell.player) {
      classNames.push(`player-${ cell.player }`);
    } else {
      classNames.push('empty');
    }

    if(showLastMove && lastMove.cellId === cell.id) {
      classNames.push('last-move');
    }

    if(isWinningCell) {
      classNames.push('winning');
    }

    if(isComputedByAi) {
      classNames.push('ai-preview');
    }

    return classNames.join(' ');
  }

  function getStyle() {
    if(animationsEnabled) {
      const animationDurationInSeconds = animationDuration / 1000;

      return {
        transition: `background-color ${ animationDurationInSeconds }s`
      }
    } else {
      return null;
    }
  }
}

export default connect(
  (state, props) => ({
      activePlayerId: state.activePlayer,
      lastMove: state.lastMove,
      isEnabled: !state.ui.showLastMove && !state.draw && state.canPickCell && props.cell.player == null && (getActivePlayer(state) && !getActivePlayer(state).isAI),
      canRotateQuadrant: !state.draw && state.canRotateQuadrant,
      isWinningCell: state.ui.winningCells.some(cell => cell.id === props.cell.id),
      isComputedByAi: state.ui.computedMove && state.ui.computedMove.cellId === props.cell.id,
      showLastMove: state.ui.showLastMove,
      animationsEnabled: state.options.animationsEnabled,
      animationDuration: state.options.animationDuration,
  }),
  { tryPickCell }
)(Cell);