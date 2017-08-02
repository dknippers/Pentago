import {
    getAvailableCells,
    getWinningCellsByPlayer,
    getBoardScoreByPlayer,
    getCell,
    getQuadrantRowAndColumn
} from "../selectors/cellSelectors";
import { getPlayers, getActivePlayer } from "../selectors/playerSelectors";
import { computeAndDoMove } from "./ai";

export const TRY_PICK_CELL = "TRY_PICK_CELL";
// Returns: true/false if it's game over after picking the cell (due to win or draw)
export function tryPickCell(cellId, playerId) {
    return (dispatch, getState) => {
        const errorMessage = validateMove(getState, cellId, playerId);

        if (errorMessage) {
            return dispatch(showError(errorMessage));
        }

        // Cell
        // The color is only shown in Fiene Mode
        dispatch(pickCell(cellId, playerId, getState().ui.cellColor));

        // Fiene Mode => we are not picking the quadrant to rotate anymore,
        // instead we simply rotate the quadrant of the cell in a random direction
        if (getState().options.fieneMode) {
            const { row, column } = getQuadrantRowAndColumn(getState(), cellId);
            dispatch(animateQuadrant(row, column, cellId % 2 === 0));
        }

        // Score
        const scores = getBoardScoreByPlayer(getState());
        dispatch(updateScores(scores));

        return checkWinner(dispatch, getState);
    };
}

export const PICK_CELL = "PICK_CELL";
export function pickCell(cellId, playerId, color) {
    return {
        type: PICK_CELL,
        cellId,
        playerId,
        color
    };
}

function checkWinner(dispatch, getState) {
    const state = getState();
    let isDraw = false;

    // In Fiene Mode, no one can ever win
    if (!state.options.fieneMode) {
        const players = getPlayers(state);

        const winningCellsByPlayer = getWinningCellsByPlayer(state);

        const winners = []; // Will hold objects of { player: <player>, winningCells: <winningCells> }
        for (let player of players) {
            const winningCells = winningCellsByPlayer[player.id];

            if (winningCells) {
                winners.push({
                    player,
                    winningCells
                });
            }
        }

        // Do we have winning cells?
        if (winners.length > 0) {
            const winningCells = winners.reduce(
                (cells, winner) => cells.concat(winner.winningCells),
                []
            );
            dispatch(setWinningCells(winningCells));
        }

        // Do we have a single winner?
        if (winners.length === 1) {
            const { player } = winners[0];

            dispatch(playerWon(player.id));

            // Reset, if specified
            if (state.options.automaticRestart) {
                setTimeout(() => dispatch(restartGame()), 500);
            }

            return true;
        }

        // If both players won it's a draw
        isDraw = winners.length === players.length;
    }

    // Also a draw => full board
    // We only check this when necessary
    if (!isDraw) {
        const availableCells = getAvailableCells(state);
        isDraw = availableCells.length === 0;
    }

    if (isDraw) {
        dispatch(draw());

        // Reset, if specified
        if (state.options.automaticRestart) {
            setTimeout(() => dispatch(restartGame()), 500);
        }

        return true;
    }

    // Otherwise, no winner or draw
    return false;
}

export const DRAW = "DRAW";
export function draw() {
    return {
        type: DRAW
    };
}

export const PLAYER_WON = "PLAYER_WON";
export function playerWon(player) {
    return {
        type: PLAYER_WON,
        player
    };
}

export const WINNING_CELLS = "WINNING_CELLS";
export function setWinningCells(cells) {
    return {
        type: WINNING_CELLS,
        cells
    };
}

export const RESTART_GAME = "RESTART_GAME";
export function restartGame() {
    return (dispatch, state) => {
        dispatch({ type: RESTART_GAME });
        dispatch(beginTurn());
    };
}

export const SELECT_QUADRANT = "SELECT_QUADRANT";
export function selectQuadrant(row, column) {
    return {
        type: SELECT_QUADRANT,
        row,
        column
    };
}

export const ANIMATE_QUADRANT = "ANIMATE_QUADRANT";
export function animateQuadrant(row, column, clockwise) {
    return (dispatch, getState) => {
        const state = getState();

        // If animations are not enabled, fall back to immediate rotation
        if (!state.options.animationsEnabled) {
            dispatch(rotateQuadrant(row, column, clockwise));
            return;
        }

        // Animation
        dispatch({
            type: ANIMATE_QUADRANT,
            row,
            column,
            clockwise
        });

        // Actually rotate
        const animationDuration = getState().options.animationDuration;
        setTimeout(
            () => dispatch(rotateQuadrant(row, column, clockwise)),
            animationDuration
        );
    };
}

export const ROTATE_QUADRANT = "ROTATE_QUADRANT";
// Returns: true/false if it's game over after rotation
export function rotateQuadrant(row, column, clockwise) {
    return (dispatch, getState) => {
        dispatch(rotateQuadrantAction(row, column, clockwise));

        // Scores
        const scores = getBoardScoreByPlayer(getState());
        dispatch(updateScores(scores));

        const winningRotation = checkWinner(dispatch, getState);

        if (!winningRotation) {
            dispatch(beginTurn());
        }

        return winningRotation;
    };
}

function rotateQuadrantAction(row, column, clockwise) {
    return {
        type: ROTATE_QUADRANT,
        row,
        column,
        clockwise
    };
}

function validateMove(getState, cellId, playerId) {
    let errorMessage = null;

    const state = getState();
    const cell = getCell(getState(), cellId);

    if (state.gameOver) {
        errorMessage = `The game has ended`;
    } else if (!cell) {
        errorMessage = `Cell #${cell.id} does not exist!`;
    } else if (cell.player != null) {
        errorMessage = `Cell (${cell.row}, ${cell.col}) is not empty!`;
    }

    return errorMessage;
}

export const SHOW_ERROR = "SHOW_ERROR";
export function showError(error) {
    return {
        type: SHOW_ERROR,
        error
    };
}

export const HIDE_ERROR = "HIDE_ERROR";
export function hideError() {
    return {
        type: HIDE_ERROR
    };
}

export const BEGIN_TURN = "BEGIN_TURN";
export function beginTurn() {
    return (dispatch, getState) => {
        dispatch({ type: BEGIN_TURN });

        const state = getState();
        const player = getActivePlayer(state);

        if (!player || !player.isAI) return;

        // AI => compute its move and do it with a delay
        const timeout = state.options.aiMoveDelay;
        setTimeout(
            () => dispatch(computeAndDoMove(dispatch, getState)),
            timeout
        );
    };
}

export const UPDATE_SCORES = "UPDATE_SCORES";
export function updateScores(scores) {
    return {
        type: UPDATE_SCORES,
        scores
    };
}

export const SHOW_LAST_MOVE = "SHOW_LAST_MOVE";
export function showLastMove() {
    return {
        type: SHOW_LAST_MOVE
    };
}

export const HIDE_LAST_MOVE = "HIDE_LAST_MOVE";
export function hideLastMove() {
    return {
        type: HIDE_LAST_MOVE
    };
}
