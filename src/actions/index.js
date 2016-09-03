import { getAvailableCells, getWinningCellsByPlayer } from '../selectors/cellSelectors';
import { getPlayers } from '../selectors/playerSelectors';
import { computeMove } from './ai';

export const TRY_PICK_CELL = 'TRY_PICK_CELL';
// Returns: true/false if it's game over after picking the cell (due to win or draw)
export function tryPickCell(cellId, playerId) {
  return (dispatch, getState) => {
    const cell = getState().cells[cellId];

    const errorMessage = validateMove(cell, cellId, playerId);

    if(errorMessage) {
      return dispatch(showError(errorMessage));
    }

    // Cell
    dispatch(pickCell(cellId, playerId));
    return checkWinner(dispatch, getState);
  }
}

export const PICK_CELL = 'PICK_CELL';
function pickCell(cellId, playerId) {
  return {
    type: PICK_CELL,
    cellId,
    playerId
  }
};

function checkWinner(dispatch, getState, checkDraw) {
  const players = getPlayers(getState());
  const winningCellsByPlayer = getWinningCellsByPlayer(getState());

  for(let player of players) {
    const winningCells = winningCellsByPlayer[player.id];

    if(winningCells) {
      dispatch(playerWon(player.id, winningCells));

      setTimeout(() => dispatch(resetGame()), 2000);

      return true;
    }
  }

  // Full board, no winner => draw
  if(checkDraw) {
    const availableCells = getAvailableCells(getState());
    if(availableCells.length === 0) {
      dispatch(draw());
      setTimeout(() => dispatch(resetGame()), 2000);
      return true;
    }
  }

  return false;
}

export const DRAW = 'DRAW';
function draw() {
  return {
    type: DRAW
  };
}

export const PLAYER_WON = 'PLAYER_WON'
function playerWon(player, cells) {
  return {
    type: PLAYER_WON,
    player,
    cells
  }
}

export const RESET_GAME = 'RESET_GAME';
export function resetGame() {
  return (dispatch, state) => {
    dispatch(resetGameAction());
    dispatch(beginTurn());
  }
}

function resetGameAction() {
  return {
    type: RESET_GAME
  };
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

function validateMove(cell, cellId, playerId) {
  let errorMessage = null;

  if(!cell) {
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
    setTimeout(() => {
      dispatch({ type: BEGIN_TURN });

      const state = getState();
      const player = state.players[state.activePlayer];

      if(!player || !player.isAI) return;

      // AI => compute its move
      dispatch(computeMove(dispatch, getState));
    }, 50);
  }
}