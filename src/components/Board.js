import React from 'react';
import { connect } from 'react-redux'
import Quadrant from './Quadrant';
import { getRows, getQuadrants2D } from '../selectors/cellSelectors';

const Board = ({ quadrants, rows, players, disableCells, enableQuadrants, showLastMove }) => {
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
      rows: getRows(state),
      quadrants: getQuadrants2D(state),
      players: state.players,
      disableCells: state.gameOver || !state.canPickCell || (state.activePlayer > 0 && state.players[state.activePlayer].isAI),
      enableQuadrants: !state.gameOver && state.canRotateQuadrant,
      showLastMove: state.ui.showLastMove
  })
)(Board);