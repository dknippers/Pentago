import "./polyfills";
import React from "react";
import ReactDOM from "react-dom";
import Pentago from "./components/Pentago";
import { Provider } from "react-redux";
import buildStore from "./store/buildStore";
import "./css/index.css";
import registerServiceWorker from "./registerServiceWorker";

const store = buildStore();

ReactDOM.render(
    <Provider store={store}>
        <Pentago />
    </Provider>,
    document.getElementById("root")
);

// This only works on secure origins (i.e., not http://)
// registerServiceWorker();
