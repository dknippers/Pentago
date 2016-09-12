import React from 'react';
import { connect } from 'react-redux'
import Quadrant from './Quadrant';
import { getQuadrants2D } from '../selectors/cellSelectors';
import { getActivePlayer } from '../selectors/playerSelectors';

const Board = ({ quadrants, disableCells, enableQuadrants, showLastMove }) => {
	return (
    <div className={ getClassNames() }>
       { quadrants.map((quadrantRow, i) =>
          quadrantRow.map((quadrant, j) =>
            <Quadrant key={ `quadrant-${ i }-${ j }` } row={ i } column={ j } quadrant={ quadrant } />
          )
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

    if(showLastMove) {
      classNames.push('show-last-move');
      classNames.push('disable-cells');
    }

    return classNames.join(' ');
  }
}

export default connect(
  state => ({
      quadrants: getQuadrants2D(state),
      disableCells: state.gameOver || !state.canPickCell || getActivePlayer(state).isAI,
      enableQuadrants: !state.gameOver && state.canRotateQuadrant,
      showLastMove: state.ui.showLastMove
  })
)(Board);