import React from 'react';
import { connect } from 'react-redux'
import Quadrant from './Quadrant';
import { getRows, getQuadrants2D } from '../selectors/cellSelectors';

const Board = ({ quadrants, rows, players }) => {
	return (
    <div className="board">
      { quadrants.map((quadrantRow, i) =>
        <div key={ `quadrant-row-${i}` } className="quadrants-row">
          { quadrantRow.map((quadrant, j) => <Quadrant key={ `quadrant-${ j }` } row={ i } column={ j } quadrant={ quadrant } />) }
        </div>
      )}
    </div>
	)
}

const mapStateToProps = (state) => {
  return {
    rows: getRows(state.cells),
    quadrants: getQuadrants2D(state.cells),
    players: state.players
  }
}

export default connect(
  mapStateToProps
)(Board);