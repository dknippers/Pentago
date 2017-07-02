import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import DevTools from "../components/DevTools";
import rootReducer from "../reducers/rootReducer";

export default initialState =>
    createStore(
        rootReducer,
        initialState,
        compose(applyMiddleware(thunk), DevTools.instrument())
    );
