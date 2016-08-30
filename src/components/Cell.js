import React from 'react';
import { connect } from 'react-redux'
import { tryPlaceMarble } from '../actions';
import loader from '../svg/loader.svg';

const Cell = ({ cell, tryPlaceMarble, activePlayerId, lastMove, isLoading }) => {
  const canClick = !isLoading && cell.player == null;

  return (
    <div className={ getClassNames() } onClick={ canClick ? () => tryPlaceMarble(cell.id, activePlayerId) : null }>
      <data value={ `(${ cell.row },${ cell.col }) ${ cell.player ? cell.player : null }` } />
      { isLoading &&
        <img src={ loader } alt="Loading ..." />
      }
    </div>
  );

  function getClassNames() {
    const classNames = ['cell'];

    if(cell.player) {
      classNames.push(`player-${ cell.player }`);
    } else {
      classNames.push('empty');
    }

    if(lastMove != null && lastMove === cell.id) {
      classNames.push('last-move');
    }

    return classNames.join(' ');
  }
}

const mapStateToProps = (state, props) => {
    return {
      activePlayerId: state.activePlayer,
      lastMove: state.lastMove,
      isLoading: state.cellLoading != null && state.cellLoading === props.cell.id
    }
  }

export default connect(
  mapStateToProps,
  { tryPlaceMarble }
)(Cell);