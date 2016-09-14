import { getAvailableCells, getWinningCellsByPlayer, getBoardScoreByPlayer, getCell } from '../selectors/cellSelectors';
import { getPlayers, getActivePlayerId, getActivePlayer } from '../selectors/playerSelectors';
import { computeAndDoMove } from './ai';

export const TRY_PICK_CELL = 'TRY_PICK_CELL';
// Returns: true/false if it's game over after picking the cell (due to win or draw)
export function tryPickCell(cellId, playerId) {
  return (dispatch, getState) => {
    const errorMessage = validateMove(getState, cellId, playerId);

    if(errorMessage) {
      return dispatch(showError(errorMessage));
    }

    // Cell
    dispatch(pickCell(cellId, playerId));

    // Score
    const scores = getBoardScoreByPlayer(getState());
    dispatch(updateScores(scores));

    return checkWinner(dispatch, getState);
  }
}

export const PICK_CELL = 'PICK_CELL';
export function pickCell(cellId, playerId) {
  return {
    type: PICK_CELL,
    cellId,
    playerId
  }
};

function checkWinner(dispatch, getState) {
  const state = getState();
  const players = getPlayers(state);
  const winningCellsByPlayer = getWinningCellsByPlayer(state);

  const winners = []; // Will hold objects of { player: <player>, winningCells: <winningCells> }
  for(let player of players) {
    const winningCells = winningCellsByPlayer[player.id];

    if(winningCells) {
      winners.push({
        player,
        winningCells
      });
    }
  }

  // Do we have a single winner?
  if(winners.length === 1) {
    const { player, winningCells } = winners[0];

    dispatch(playerWon(player.id, winningCells));

    // Reset, if specified
    if(state.options.automaticRestart) {
      setTimeout(() => dispatch(restartGame()), 500);
    }

    return true;
  }

  // If both players won it's a draw
  let isDraw = winners.length === players.length;

  // Also a draw => full board
  // We only check this when necessary
  if(!isDraw) {
    const availableCells = getAvailableCells(state);
    isDraw = availableCells.length === 0;
  }

  if(isDraw) {
    dispatch(draw());

    // Reset, if specified
    if(state.options.automaticRestart) {
      setTimeout(() => dispatch(restartGame()), 500);
    }

    return true;
  }

  // Otherwise, no winner or draw
  return false;
}

export const DRAW = 'DRAW';
export function draw() {
  return {
    type: DRAW
  };
}

export const PLAYER_WON = 'PLAYER_WON'
export function playerWon(player, cells) {
  return {
    type: PLAYER_WON,
    player,
    cells
  }
}

export const RESTART_GAME = 'RESTART_GAME';
export function restartGame() {
  return (dispatch, state) => {
    dispatch({ type: RESTART_GAME });
    dispatch(beginTurn());
  }
}

export const SELECT_QUADRANT = 'SELECT_QUADRANT';
export function selectQuadrant(row, column) {
  return {
    type: SELECT_QUADRANT,
    row,
    column
  }
};

export const ROTATE_QUADRANT = 'ROTATE_QUADRANT';
// Returns: true/false if it's game over after rotation
export function rotateQuadrant(row, column, clockwise) {
  return (dispatch, getState) => {
    dispatch(rotateQuadrantAction(row, column, clockwise));

    // Scores
    const scores = getBoardScoreByPlayer(getState());
    dispatch(updateScores(scores));

    const winningRotation = checkWinner(dispatch, getState, true);

    if(!winningRotation) {
      dispatch(beginTurn());
    }

    return winningRotation;
  }
}

function rotateQuadrantAction(row, column, clockwise) {
  return {
    type: ROTATE_QUADRANT,
    row,
    column,
    clockwise
  }
}

function validateMove(getState, cellId, playerId) {
  let errorMessage = null;

  const state = getState();
  const cell = getCell(getState(), cellId);

  if(state.gameOver) {
    errorMessage = `The game has ended`;
  } else if(!cell) {
    errorMessage = `Cell #${ cell.id } does not exist!`;
  } else if(cell.player != null) {
    errorMessage = `Cell (${ cell.row }, ${ cell.col }) is not empty!`
  }

  return errorMessage;
}

export const SHOW_ERROR = 'SHOW_ERROR';
export function showError(error) {
  return {
    type: SHOW_ERROR,
    error
  }
};

export const HIDE_ERROR = 'HIDE_ERROR';
export function hideError() {
  return {
    type: HIDE_ERROR
  }
};

export const BEGIN_TURN = 'BEGIN_TURN';
export function beginTurn() {
  return (dispatch, getState) => {
    dispatch({ type: BEGIN_TURN });

    const state = getState();
    const player = getActivePlayer(state);

    if(!player || !player.isAI) return;

    // AI => compute its move and do it
    // With a delay after the first 4 moves

    const availableCells = getAvailableCells(getState());
    const timeout = availableCells.length <= 32 ? state.options.aiMoveDelay : 0;
    setTimeout(() => dispatch(computeAndDoMove(dispatch, getState)), timeout);
  }
}

export const UPDATE_SCORES = 'UPDATE_SCORES';
export function updateScores(scores) {
  return {
    type: UPDATE_SCORES,
    scores
  }
}

export const SHOW_LAST_MOVE = 'SHOW_LAST_MOVE';
export function showLastMove() {
  return {
    type: SHOW_LAST_MOVE
  }
}

export const HIDE_PREVIOUS_MOVE = 'HIDE_PREVIOUS_MOVE';
export function hideLastMove() {
  return {
    type: HIDE_PREVIOUS_MOVE
  }
}

export const SET_PLAYER_NAME = 'SET_PLAYER_NAME';
export function setPlayerName(playerId, name) {
  return {
    type: SET_PLAYER_NAME,
    playerId,
    name
  }
}

export const SET_PLAYER_AI = 'SET_PLAYER_AI';
export function setPlayerAI(playerId, isAI) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_PLAYER_AI,
      playerId,
      isAI
    });

    // If we just made a player an AI and
    // it is the active player, execute a move!
    if(isAI && getActivePlayerId(getState()) === playerId) {
      dispatch(computeAndDoMove());
    }
  };
}

export const TOGGLE_OPTIONS = 'TOGGLE_OPTIONS';
export function toggleOptions() {
  return {
    type: TOGGLE_OPTIONS
  }
}

export const SET_AI_MOVE_DELAY = 'SET_AI_MOVE_DELAY';
export function setAIMoveDelay(timeout) {
  return {
    type: SET_AI_MOVE_DELAY,
    timeout
  }
}

export const SET_AUTOMATIC_RESTART = 'SET_AUTOMATIC_RESTART';
export function setAutomaticRestart(enabled) {
  return {
    type: SET_AUTOMATIC_RESTART,
    enabled
  }
}