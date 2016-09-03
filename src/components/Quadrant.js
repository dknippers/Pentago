import React from 'react';
import { connect } from 'react-redux';
import Cell from '../components/Cell';
import { rotateQuadrant, selectQuadrant } from '../actions';
import clockwise from '../svg/clockwise.svg';
import counterClockwise from '../svg/counter-clockwise.svg';
import Isvg from 'react-inlinesvg';
import { makeArrow } from './Arrow';

const Quadrant = ({ quadrant, canRotateQuadrant, isSelected, row, column, rotateQuadrant, selectQuadrant }) => {
  return (
    <div className={ getClassNames() } onClick={ onClick }>
      { quadrant.map((row, i) =>
        <div className="quadrant-row" key={ `quadrant-row-${i}` }>
          { row.map(cell => <Cell key={ `cell-${ cell.id }` } cell={ cell } /> ) }
        </div>
      )}

      <Isvg wrapper={ makeArrow(row, column, true, rotateQuadrant) } src={ clockwise } />
      <Isvg wrapper={ makeArrow(row, column, false, rotateQuadrant) } src={ counterClockwise } />
    </div>
  )

  function onClick(e) {
    if(!canRotateQuadrant) return;

    e.stopPropagation();
    selectQuadrant(row, column);
  }

  function getClassNames() {
    const classNames = ['quadrant'];

    if(isSelected) {
      classNames.push('selected');
    }

    return classNames.join(' ');
  }
}

const connectState = (state, props) => ({
  canRotateQuadrant: !state.draw && state.canRotateQuadrant,
  isSelected: state.ui.selectedQuadrant.row === props.row && state.ui.selectedQuadrant.column === props.column,
});

const connectDispatch = {
  rotateQuadrant,
  selectQuadrant
};

export default connect(connectState, connectDispatch)(Quadrant);