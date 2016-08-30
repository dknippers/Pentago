import React from 'react';
import { connect } from 'react-redux'
import Row from './Row';
import { getRows } from '../selectors/cellSelectors';

const Board = ({ rows, players, activePlayer }) => {
  let rowId = 0;

	return (
    <div className="board">
      { rows.map(row => <Row key={ `row-${ rowId++ }` } row={ row } />) }
    </div>
	)
}

const mapStateToProps = (state) => {
  return {
    rows: getRows(state.board.cells),
    players: state.players,
    activePlayer: state.board.activePlayer,
  }
}

export default connect(
  mapStateToProps
)(Board);