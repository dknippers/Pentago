import React from 'react';
import { connect } from 'react-redux';
import { getPlayers } from '../selectors/playerSelectors';
import { setPlayerName, setPlayerAI, toggleOptions, setAIMoveDelay, setAutomaticRestart } from '../actions';

const Options = ({
  players, isVisible, aiMoveDelay, automaticRestart,
  setPlayerName, setPlayerAI, toggleOptions, setAIMoveDelay, setAutomaticRestart
}) => {
  const player1 = players.find(player => player.id === 1);
  const player2 = players.find(player => player.id === 2);

  return (
    <div className={ getClassNames() }>
      <h2>Options</h2>

      <div className="option-columns">
        <div className="option-column">
          <label htmlFor="player-1-name">Player 1 name</label>
          <label htmlFor="player-1-ai">Controlled by AI</label>

          <label htmlFor="player-2-name">Player 2 name</label>
          <label htmlFor="player-2-ai">Controlled by AI</label>

          <label htmlFor="aiMoveDelay">AI move delay (ms)</label>
          <label htmlFor="automaticRestart">Autorestart game</label>
        </div>
        <div className="option-column">
          <input type="text" value={ player1.name } id="player-1-name" onChange={ e => setPlayerName(player1.id, e.target.value) } />
          <input type="checkbox" id="player-1-ai" checked={ player1.isAI } onChange={ e => setPlayerAI(player1.id, e.target.checked) } />

          <input type="text" value={ player2.name } id="player-2-name" onChange={ e => setPlayerName(player2.id, e.target.value) } />
          <input type="checkbox" id="player-2-ai" checked={ player2.isAI } onChange={ e => setPlayerAI(player2.id, e.target.checked) } />

          <input type="text" id="aiMoveDelay" defaultValue={ aiMoveDelay } onBlur={ e => setAIMoveDelay(parseInt(e.target.value, 10)) } />
          <input type="checkbox" id="automaticRestart" value={ automaticRestart } onChange={ e => setAutomaticRestart(e.target.checked) } />
        </div>
      </div>

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
    isVisible: state.ui.showOptions,
    aiMoveDelay: state.options.aiMoveDelay,
    automaticRestart: state.options.automaticRestart
  }),
  { setPlayerName, setPlayerAI, toggleOptions, setAIMoveDelay, setAutomaticRestart }
)(Options);