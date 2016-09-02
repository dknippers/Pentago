import React from 'react';
import { connect } from 'react-redux';
import { tryPickCell } from '../actions';
import * as Constants from '../constants';

const Cell = ({ cell, tryPickCell, activePlayerId, lastMove, canPickCell, canRotateQuadrant, isWinningCell }) => {
  return (
    <div className={ getClassNames() } onClick={ canPickCell ? () => tryPickCell(cell.id, activePlayerId) : null }>
      <data value={ `(${ cell.row },${ cell.col }) ${ cell.player ? cell.player : '' }` } />
    </div>
  );

  // First row/column of quadrant (but not of board)
  function isFirstRowOrColOfQuadrant(rc) {
    // return rc % Constants.QUADRANT_SIZE === 0;
    return rc !== 0 && rc % Constants.QUADRANT_SIZE === 0;
  }

  // Last row/column of quadrant (but not last of board)
  function isLastRowOrColOfQuadrant(rc) {
    // return (rc + 1) % Constants.QUADRANT_SIZE === 0;
    return (rc + 1) % Constants.QUADRANT_SIZE === 0 && rc + 1 !== Constants.BOARD_SIZE;
  }

  function isFirstRowOfQuadrant(row) {
    return isFirstRowOrColOfQuadrant(row);
  }

  function isFirstColumnOfQuadrant(col) {
    return isFirstRowOrColOfQuadrant(col);
  }

  function isLastRowOfQuadrant(row) {
    return isLastRowOrColOfQuadrant(row);
  }

  function isLastColumnOfQuadrant(col) {
    return isLastRowOrColOfQuadrant(col);
  }

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

    if(isFirstColumnOfQuadrant(cell.col)) {
      classNames.push('quadrant-border-left');
    }

    if(isLastColumnOfQuadrant(cell.col)) {
      classNames.push('quadrant-border-right');
    }

    if(isFirstRowOfQuadrant(cell.row)) {
      classNames.push('quadrant-border-top');
    }

    if(isLastRowOfQuadrant(cell.row)) {
      classNames.push('quadrant-border-bottom');
    }

    if(!canPickCell) {
      classNames.push('off');
    }

    if(isWinningCell) {
      classNames.push('winning');
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
      isWinningCell: state.ui.winningCells.some(cell => cell.id === props.cell.id)
    }
  }

export default connect(
  mapStateToProps,
  { tryPickCell }
)(Cell);