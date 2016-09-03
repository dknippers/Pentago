import React from 'react';
import { connect } from 'react-redux'
import Quadrant from './Quadrant';
import { getRows, getQuadrants2D } from '../selectors/cellSelectors';

const Board = ({ quadrants, rows, players, disableCells, enableQuadrants }) => {
	return (
    <div className={ getClassNames() }>
      { quadrants.map((quadrantRow, i) =>
        <div key={ `quadrant-row-${i}` } className="quadrants-row">
          { quadrantRow.map((quadrant, j) => <Quadrant key={ `quadrant-${ j }` } row={ i } column={ j } quadrant={ quadrant } />) }
        </div>
      )}
    </div>
	);

  function getClassNames() {
    const classNames = ['board'];

    if(disableCells) {
      classNames.push('disable-cells');
    }

    if(enableQuadrants) {
      classNames.push('enable-quadrants');
    }

    return classNames.join(' ');
  }
}

export default connect(
  (state) => {
    return {
      rows: getRows(state.cells),
      quadrants: getQuadrants2D(state.cells),
      players: state.players,
      disableCells: state.gameOver || !state.canPickCell,
      enableQuadrants: !state.gameOver && state.canRotateQuadrant
    }
  }
)(Board);