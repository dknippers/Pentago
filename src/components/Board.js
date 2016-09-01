import React from 'react';
import { connect } from 'react-redux'
import Row from './Row';
import Quadrant from './Quadrant';
import { getRows, getQuadrants2D } from '../selectors/cellSelectors';
import * as Constants from '../constants';

const Board = ({ quadrants, rows, players, activePlayer }) => {
	return (
    <div className="board">
      { /* rows.map(row => <Row key={ `row-${ rowId++ }` } row={ row } />) */ }

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
    rows: getRows(state.board.cells),
    quadrants: getQuadrants2D(state.board.cells),
    players: state.players,
    activePlayer: state.board.activePlayer,
  }
}

export default connect(
  mapStateToProps
)(Board);