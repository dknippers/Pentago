import React from "react";
import { connect } from "react-redux";
import { computeMove, hideComputedMove, computeAndDoMove } from "../actions/ai";
import {
    showLastMove,
    hideLastMove,
    restartGame,
    toggleOptions,
    saveToStorage,
    loadFromStorage,
    clearStorage
} from "../actions";
import { activePlayerIsAI } from "../selectors/playerSelectors";

const Controls = ({
    gameOver,
    hasPreviousMove,
    showingLastMove,
    showingOptions,
    hasComputedMove,
    showAIButtons,
    hasStoredState,
    disableAIButtons,
    computeMove,
    hideComputedMove,
    computeAndDoMove,
    showLastMove,
    hideLastMove,
    restartGame,
    toggleOptions,
    saveToStorage,
    clearStorage,
    loadFromStorage,
    showLoadSaveButtons,
    fieneMode
}) => {
    if (fieneMode && !gameOver) return null;

    return (
        <div className="controls">
            <div className="buttons">
                {!fieneMode &&
                    hasPreviousMove &&
                    <button
                        className="btn"
                        type="button"
                        onClick={toggleLastMove}
                    >
                        {showingLastMove ? `Hide last move` : `Show last move`}
                    </button>}

                {!fieneMode &&
                    gameOver &&
                    <button
                        className="btn"
                        type="button"
                        onClick={() => restartGame()}
                    >
                        Restart game
                    </button>}

                {fieneMode &&
                    gameOver &&
                    <button
                        className="btn"
                        type="button"
                        onClick={() => restartGame()}
                    >
                        Nog een keer!
                    </button>}

                {!fieneMode &&
                    showAIButtons &&
                    (hasComputedMove
                        ? <button
                              className="btn"
                              type="button"
                              onClick={hideComputedMove}
                          >
                              Hide AI move
                          </button>
                        : <button
                              className="btn"
                              type="button"
                              disabled={disableAIButtons}
                              onClick={computeMove}
                          >
                              Compute AI move
                          </button>)}

                {!fieneMode &&
                    showAIButtons &&
                    <button
                        className="btn"
                        type="button"
                        disabled={disableAIButtons}
                        onClick={computeAndDoMove}
                    >
                        Execute AI move
                    </button>}

                {!fieneMode &&
                    !showingOptions &&
                    <button
                        className="btn"
                        type="button"
                        onClick={toggleOptions}
                    >
                        Options
                    </button>}

                {!fieneMode &&
                    showLoadSaveButtons &&
                    <button
                        className="btn"
                        type="button"
                        onClick={saveToStorage}
                    >
                        Save state
                    </button>}
                {!fieneMode &&
                    showLoadSaveButtons &&
                    hasStoredState &&
                    <button
                        className="btn"
                        type="button"
                        onClick={loadFromStorage}
                    >
                        Load state
                    </button>}
                {!fieneMode &&
                    showLoadSaveButtons &&
                    hasStoredState &&
                    <button
                        className="btn"
                        type="button"
                        onClick={clearStorage}
                    >
                        Clear state
                    </button>}
            </div>
        </div>
    );

    function toggleLastMove() {
        if (showingLastMove) {
            hideLastMove();
        } else {
            showLastMove();
        }
    }
};
export default connect(
    state => ({
        gameOver: state.gameOver,
        hasPreviousMove: state.lastMove.cellId != null,
        showingLastMove: state.ui.showLastMove,
        showingOptions: state.ui.showOptions,
        hasComputedMove: state.ui.computedMove != null,
        showAIButtons: !state.gameOver,
        disableAIButtons:
            !state.gameStarted ||
            state.gameOver ||
            activePlayerIsAI(state) ||
            state.ui.isAnimating,
        hasStoredState: state.hasStoredState,
        showLoadSaveButtons: state.options.showLoadSaveButtons,
        fieneMode: state.options.fieneMode
    }),
    {
        computeMove,
        hideComputedMove,
        computeAndDoMove,
        showLastMove,
        hideLastMove,
        restartGame,
        toggleOptions,
        saveToStorage,
        loadFromStorage,
        clearStorage
    }
)(Controls);
