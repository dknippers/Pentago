import { computeAndDoMove } from "./ai";
import { getActivePlayerId } from "../selectors/playerSelectors";

export const SET_PLAYER_NAME = "SET_PLAYER_NAME";
export function setPlayerName(playerId, name) {
    return {
        type: SET_PLAYER_NAME,
        playerId,
        name
    };
}

export const SET_PLAYER_AI = "SET_PLAYER_AI";
export function setPlayerAI(playerId, isAI) {
    return (dispatch, getState) => {
        dispatch({
            type: SET_PLAYER_AI,
            playerId,
            isAI
        });

        // If we just made a player an AI and
        // it is the active player, execute a move!
        if (isAI && getActivePlayerId(getState()) === playerId) {
            dispatch(computeAndDoMove());
        }
    };
}

export const TOGGLE_OPTIONS = "TOGGLE_OPTIONS";
export function toggleOptions() {
    return {
        type: TOGGLE_OPTIONS
    };
}

export const SET_AI_MOVE_DELAY = "SET_AI_MOVE_DELAY";
export function setAIMoveDelay(timeout) {
    return {
        type: SET_AI_MOVE_DELAY,
        timeout
    };
}

export const SET_AUTOMATIC_RESTART = "SET_AUTOMATIC_RESTART";
export function setAutomaticRestart(enabled) {
    return {
        type: SET_AUTOMATIC_RESTART,
        enabled
    };
}

export const SET_ANIMATIONS_ENABLED = "SET_ANIMATIONS_ENABLED";
export function setAnimationsEnabled(enabled) {
    return {
        type: SET_ANIMATIONS_ENABLED,
        enabled
    };
}

export const SET_ANIMATION_DURATION = "SET_ANIMATION_DURATION";
export function setAnimationDuration(duration) {
    return {
        type: SET_ANIMATION_DURATION,
        duration
    };
}

export const SET_SHOW_LOAD_SAVE_BUTTONS = "SET_SHOW_LOAD_SAVE_BUTTONS";
export function setShowLoadSaveButtons(show) {
    return {
        type: SET_SHOW_LOAD_SAVE_BUTTONS,
        show
    };
}

export const SET_FIENE_MODE = "SET_FIENE_MODE";
export function setFieneMode(on) {
    return {
        type: SET_FIENE_MODE,
        on: !!on
    };
}
