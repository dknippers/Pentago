import { tryPlaceMarble, rotateQuadrant } from './index';
import { getRows, getColumns, getDiagonals } from '../selectors/cellSelectors';
import { chunk } from '../helpers';
import * as Constants from '../constants';

// Metadata for last received state board
let metadata = {};

export function computeMove() {
  return (dispatch, getState) => {
    const state = getState();
    const activePlayer = state.activePlayer;

    computeMetadata(state);
    console.log(JSON.stringify(metadata, null, 2));

    let empty = false;
    let cellId = -1;
    while(!empty || cellId < 0) {
      cellId = Math.floor(Math.random() * 36);
      empty = state.board.cells[cellId].player == null;
    }

    // Cell
    dispatch(tryPlaceMarble(cellId, activePlayer));

    // Rotation
    // dispatch(rotateQuadrant(0, 0, true));
  }
}

function computeMetadata(state) {
  const cells = state.board.cells;

  const rows = getRows(cells);
  const columns = getColumns(cells);
  const diagonals = [];

  const cellsInLine = [...rows, ...columns, ...diagonals];

  const players = Object.keys(state.players).map(id => state.players[id]);

  metadata = {};

  players.forEach(player => {
    let potentials = {};
    cellsInLine.forEach(line => {
      let potentialAmountInLine = computePotentialsInLine(line, player);
      if(!potentialAmountInLine) return;

      potentialAmountInLine.forEach(group => {
        (potentials[group.length] || (potentials[group.length] = [])).push(group);
      });
    });

    metadata[player.id] = potentials;
  });
}

function computePotentialsInLine(line, player) {
  const maxInLine = maxAdjacentsInLine(line, player);
  // If the maximum amount is not enough to win
  // there's no potential whatsoever, line should be totally ignored.
  if(maxInLine <= Constants.AMOUNT_IN_LINE_TO_WIN) return null;

  // Chunk by empty or owned by player, drops opponents cells
  const chunks = chunk(line, cell => cell.player == null || (cell.player === player.id ? false : null));

  return chunks.reduce((groups, chunk) => {
    const [ isEmpty, cells ] = chunk;

    const firstCell = cells[0];
    const firstIdx = line.indexOf(firstCell)
    const last_cell = cells[cells.length - 1];

    const isLastAndEmpty = isEmpty && chunks.indexOf(chunk) === chunks.length - 1;

    const prevGroup = groups[groups.length - 1];

    // No previous group, add yourself and be done
    if(!prevGroup) {
      if(!isLastAndEmpty) {
        groups.push(cells)
      }
    } else {
      let prevLastCell = prevGroup[prevGroup.length - 1];
      let prevLastIdx = line.indexOf(prevLastCell);

      let distance = Math.abs(firstIdx - prevLastIdx);

      // If we are not adjacent, never mind
      if(distance > 1) {
        if(!isLastAndEmpty) {
          groups.push(cells)
        }
      } else {
        // Empty cells, first cell will try to join the previous group
        if(isEmpty) {
          // If the previous group is completely empty, just remove it (it's irrelevant)
          if(prevGroup.every(cell => cell.player == null)) {
            groups.pop();

            // Add ourselves, but not if we are the last empty group
            if(!isLastAndEmpty) {
              groups.push(cells);
            }
          } else {
            // This group belongs to the player, we join it with our first cell,
            // _only if_ it does not have an empty cell yet
            if(!prevGroup.some(cell => cell.player == null)) {
              // Cool, let's join them
              prevGroup.push(firstCell)
            } else {
              // It already has merged with some other empty cell
              // We instead duplicate it and create a new group
              // First we drop all cells upto the empty cell and then the empty cell itself
              const emptyIdx = prevGroup.findIndex(cell => cell.player == null);
              groups.push([ ...prevGroup.slice(emptyIdx + 1), firstCell]);
            }

            // We only add ourselves when firstCell is different from last_cell
            // If firstCell is the same as last_cell, the next group can just join
            // us in the previous group.
            // Again, do not add ourselves if we are the last group and empty
            if(firstCell !== last_cell && !isLastAndEmpty) {
              groups.push(cells);
            }
          }
        } else {
          // Player controlled cells
          // Try to join a previous player-controlled group
          // It can have most have 1 empty cell but that's fine
          if(prevGroup.some(cell => cell.player != null)) {
            prevGroup.concat(cells)
          } else {
            // Previous group is entirely empty
            // Grab their last cell and discard the rest
            groups.pop();
            groups.push([ prevLastCell, ...cells]);
          }
        }
      }
    }

    return groups;
  }, []);
}

function maxAdjacentsInLine(line, player) {
  // Chunk line into Arrays containing adjacent spots
  // that are empty or belong to player
  const chunks = chunk(line, cell => cell.player != null && cell.player !== player.id ? null : true);
  return chunks.map(chunk => chunk[1]).reduce((max, chunk) => chunk && chunk.length > max ? chunk.length : max, 0);
}