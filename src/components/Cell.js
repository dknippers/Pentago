import React from 'react';
import { connect } from 'react-redux';
import { tryPickCell } from '../actions';

const Cell = ({ cell, tryPickCell, activePlayerId, lastMove, canPickCell, canRotateQuadrant, isWinningCell, isComputedByAi }) => {
  return (
    <div className={ getClassNames() } onClick={ canPickCell ? () => tryPickCell(cell.id, activePlayerId) : null }>
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

    if(lastMove != null && lastMove === cell.id) {
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

const mapStateToProps = (state, props) => {
    return {
      activePlayerId: state.activePlayer,
      lastMove: state.lastMove,
      canPickCell: !state.draw && state.canPickCell && props.cell.player == null,
      canRotateQuadrant: !state.draw && state.canRotateQuadrant,
      isWinningCell: state.ui.winningCells.some(cell => cell.id === props.cell.id),
      isComputedByAi: state.ui.computedMove && state.ui.computedMove.cellId == props.cell.id
    }
  }

export default connect(
  mapStateToProps,
  { tryPickCell }
)(Cell);