import React from 'react';
import { connect } from 'react-redux';
import { getPlayers } from '../selectors/playerSelectors';
import { setPlayerName, setPlayerAI, toggleOptions } from '../actions';

const OptionsWindow = ({ players, isVisible, setPlayerName, setPlayerAI, toggleOptions }) => {
  return (
    <div className={ getClassNames() }>
      <h1>Options</h1>

      { players.map((player, idx) =>
        <div key={ player.id }>
          <h4>Player { idx + 1 }</h4>
          <label>Name <input type="text" value={ player.name } onChange={ e => setPlayerName(player.id, e.target.value) } /></label>
          <br/>
          <label>AI <input type="checkbox" checked={ player.isAI } onChange={ e => setPlayerAI(player.id, e.target.checked) } /></label>
        </div>
      )}

      { isVisible && <button type="button" className="btn" onClick={ toggleOptions }>Close</button> }
    </div>
  )

  function getClassNames() {
    const classNames = ['options'];

    if(isVisible) {
      classNames.push('visible');
    }

    return classNames.join(' ');
  }
}

export default connect(
  state => ({
    players: getPlayers(state),
    isVisible: state.ui.showOptions
  }),
  { setPlayerName, setPlayerAI, toggleOptions }
)(OptionsWindow);