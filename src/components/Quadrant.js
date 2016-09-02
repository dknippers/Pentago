import React from 'react';
import { connect } from 'react-redux';
import Cell from '../components/Cell';
import { rotateQuadrant, selectQuadrant } from '../actions';
import clockwise from '../svg/clockwise.svg';
import counterClockwise from '../svg/counter-clockwise.svg';

const Quadrant = ({ quadrant, canRotateQuadrant, isSelected, row, column, rotateQuadrant, selectQuadrant }) => {
  return (
    <div className={ getClassNames() } onClick={ canRotateQuadrant ? () => selectQuadrant(row, column) : null }>
      { quadrant.map((row, i) =>
        <div className="quadrant-row" key={ `quadrant-row-${i}` }>
          { row.map(cell => <Cell key={ `cell-${ cell.id }` } cell={ cell } /> ) }
        </div>
      )}

      <svg className="arrow clockwise" onClick={ rotate.bind(null, row, column, true) }>
        <use xlinkHref={ `${clockwise}#Arrow` } style={ { fill: 'white' } }></use>
      </svg>

      <svg className="arrow counter-clockwise" onClick={ rotate.bind(null, row, column, false) }>
        <use xlinkHref={ `${counterClockwise}#Arrow` } style={ { fill: 'white' } }></use>
      </svg>
    </div>
  )

  function rotate(row, column, clockwise, e) {
    e.stopPropagation();
    rotateQuadrant(row, column, clockwise);
  }

  function getClassNames() {
    const classNames = ['quadrant'];

    if(canRotateQuadrant) {
      classNames.push('on');
    }

    if(isSelected) {
      classNames.push('selected');
    }

    return classNames.join(' ');
  }
}

const mapStateToProps = (state, props) => {
  return {
    canRotateQuadrant: !state.draw && state.canRotateQuadrant,
    isSelected: state.ui.selectedQuadrant.row === props.row && state.ui.selectedQuadrant.column === props.column
  }
}

export default connect(
  mapStateToProps,
  { rotateQuadrant, selectQuadrant }
)(Quadrant);