import React from 'react';
import { connect } from 'react-redux';
import Cell from '../components/Cell';
import { rotateQuadrant, selectQuadrant } from '../actions';
import clockwise from '../svg/clockwise.svg';
import counterClockwise from '../svg/counter-clockwise.svg';
import Isvg from 'react-inlinesvg';
import { makeArrow } from './Arrow';

const Quadrant = ({ quadrant, canRotateQuadrant, hasSelectedQuadrant, isSelected, row, column, rotateQuadrant, selectQuadrant, aiRotation, activePlayerId, lastRotation, showLastMove }) => {
  return (
    <div className={ getClassNames() } onClick={ onClick }>
      { quadrant.map((row, i) => row.map(cell => <Cell key={ `cell-${ cell.id }` } cell={ cell } /> ) )}

      <div className="arrows">
        <Isvg wrapper={ makeArrow.apply(null, getArrowParams(true)) } src={ clockwise } />
        <Isvg wrapper={ makeArrow.apply(null, getArrowParams(false)) } src={ counterClockwise } />
      </div>
    </div>
  )

  function onClick(e) {
    if(!canRotateQuadrant) return;

    e.stopPropagation();
    selectQuadrant(row, column);
  }

  function getArrowParams(clockwise) {
    return [row, column, clockwise, rotateQuadrant, aiRotation, activePlayerId, lastRotation, showLastMove];
  }

  function getClassNames() {
    const classNames = ['quadrant'];

    if(isSelected) {
      classNames.push('selected');
    }

    if(hasSelectedQuadrant && !isSelected) {
      classNames.push('not-selected');
    }

    if(showLastMove && lastRotation != null && lastRotation.row === row && lastRotation.column === column) {
      classNames.push('show-last-move');
    }

    if(aiRotation && aiRotation.row === row && aiRotation.column === column) {
      classNames.push('ai-preview');
    }

    return classNames.join(' ');
  }
}

export default connect(
  (state, props) => ({
    canRotateQuadrant: !state.gameOver && state.canRotateQuadrant,
    hasSelectedQuadrant: state.ui.selectedQuadrant.row != null,
    isSelected: state.ui.selectedQuadrant.row === props.row && state.ui.selectedQuadrant.column === props.column,
    aiRotation: state.ui.computedMove && state.ui.computedMove.rotation,
    activePlayerId: state.activePlayer,
    lastRotation: state.lastMove.rotation,
    showLastMove: state.ui.showLastMove
  }),
  { rotateQuadrant, selectQuadrant }
)(Quadrant);