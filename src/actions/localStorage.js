export const SAVE_TO_STORAGE = "SAVE_TO_STORAGE";
export function saveToStorage() {
    return (dispatch, getState) => {
        dispatch({ type: SAVE_TO_STORAGE });
        window.localStorage.state = JSON.stringify(getState());
    };
}

export const LOAD_FROM_STORAGE = "LOAD_FROM_STORAGE";
export function loadFromStorage() {
    return {
        type: LOAD_FROM_STORAGE
    };
}

export const CLEAR_STORAGE = "CLEAR_STORAGE";
export function clearStorage() {
    return (dispatch, getState) => {
        dispatch({ type: CLEAR_STORAGE });
        window.localStorage.removeItem("state");
    };
}
