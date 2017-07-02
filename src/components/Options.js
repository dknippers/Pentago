import React from "react";
import { connect } from "react-redux";
import { getPlayers } from "../selectors/playerSelectors";
import {
    setPlayerName,
    setPlayerAI,
    toggleOptions,
    setAIMoveDelay,
    setAutomaticRestart,
    beginTurn,
    setAnimationsEnabled,
    setAnimationDuration,
    setShowLoadSaveButtons,
    setFieneMode
} from "../actions";

const Options = ({
    gameStarted,
    players,
    isVisible,
    aiMoveDelay,
    automaticRestart,
    animationsEnabled,
    animationDuration,
    fieneMode,
    setPlayerName,
    setPlayerAI,
    toggleOptions,
    setAIMoveDelay,
    setAutomaticRestart,
    setAnimationsEnabled,
    setAnimationDuration,
    beginTurn,
    setShowLoadSaveButtons,
    showLoadSaveButtons,
    setFieneMode
}) => {
    const player1 = players.find(player => player.id === 1);
    const player2 = players.find(player => player.id === 2);

    return (
        <div className={getClassNames()}>
            <h2>Options</h2>

            <div className="option-columns">
                <div className="option-column">
                    <label htmlFor="player-1-name">Player 1 name</label>
                    <label htmlFor="player-1-ai">Controlled by AI</label>

                    <label htmlFor="player-2-name">Player 2 name</label>
                    <label htmlFor="player-2-ai">Controlled by AI</label>

                    <label htmlFor="aiMoveDelay">AI move delay (ms)</label>

                    <label htmlFor="animationsEnabled">
                        Animations enabled
                    </label>
                    <label htmlFor="animationDuration">
                        Animation duration (ms)
                    </label>

                    <label htmlFor="automaticRestart">Autorestart game</label>
                    <label htmlFor="fieneMode">Fiene Mode</label>

                    <label htmlFor="showLoadSaveButtons">
                        Show load and save buttons
                    </label>
                </div>
                <div className="option-column">
                    <input
                        type="text"
                        value={player1.name}
                        id="player-1-name"
                        onChange={e =>
                            setPlayerName(player1.id, e.target.value)}
                    />
                    <input
                        type="checkbox"
                        id="player-1-ai"
                        checked={player1.isAI}
                        onChange={e =>
                            setPlayerAI(player1.id, e.target.checked)}
                    />

                    <input
                        type="text"
                        value={player2.name}
                        id="player-2-name"
                        onChange={e =>
                            setPlayerName(player2.id, e.target.value)}
                    />
                    <input
                        type="checkbox"
                        id="player-2-ai"
                        checked={player2.isAI}
                        onChange={e =>
                            setPlayerAI(player2.id, e.target.checked)}
                    />

                    <input
                        type="text"
                        id="aiMoveDelay"
                        defaultValue={aiMoveDelay}
                        onBlur={e =>
                            setAIMoveDelay(parseInt(e.target.value, 10))}
                    />

                    <input
                        type="checkbox"
                        id="animationsEnabled"
                        checked={animationsEnabled}
                        onChange={e => setAnimationsEnabled(e.target.checked)}
                    />
                    <input
                        type="text"
                        id="animationDuration"
                        defaultValue={animationDuration}
                        onBlur={e =>
                            setAnimationDuration(parseInt(e.target.value, 10))}
                    />

                    <input
                        type="checkbox"
                        id="automaticRestart"
                        checked={automaticRestart}
                        onChange={e => setAutomaticRestart(e.target.checked)}
                    />
                    <input
                        type="checkbox"
                        id="fieneMode"
                        checked={fieneMode}
                        onChange={e => setFieneMode(e.target.checked)}
                    />

                    <input
                        type="checkbox"
                        id="showLoadSaveButtons"
                        checked={showLoadSaveButtons}
                        onChange={e => setShowLoadSaveButtons(e.target.checked)}
                    />
                </div>
            </div>

            {isVisible && gameStarted
                ? <button type="button" className="btn" onClick={toggleOptions}>
                      Close
                  </button>
                : <button type="button" className="btn" onClick={startGame}>
                      Start game
                  </button>}
        </div>
    );

    function getClassNames() {
        const classNames = ["options"];

        if (isVisible) {
            classNames.push("visible");
        }

        return classNames.join(" ");
    }

    function startGame() {
        toggleOptions();
        beginTurn();
    }
};

export default connect(
    state => ({
        gameStarted: state.gameStarted,
        players: getPlayers(state),
        isVisible: state.ui.showOptions,
        aiMoveDelay: state.options.aiMoveDelay,
        automaticRestart: state.options.automaticRestart,
        animationsEnabled: state.options.animationsEnabled,
        animationDuration: state.options.animationDuration,
        showLoadSaveButtons: state.options.showLoadSaveButtons,
        fieneMode: state.options.fieneMode
    }),
    {
        setPlayerName,
        setPlayerAI,
        toggleOptions,
        setAIMoveDelay,
        setAutomaticRestart,
        setAnimationsEnabled,
        setAnimationDuration,
        beginTurn,
        setShowLoadSaveButtons,
        setFieneMode
    }
)(Options);
