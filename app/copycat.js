import App from "./App";
import {rawLevels} from "./data/rawLevels";
import KeyCodes from "./KeyCodes";
//noinspection ES6UnusedImports,JSUnresolvedVariable
import css from "./copycat.css";

/* Utilities */
window.addEventListener("keydown", function (e) {
    // space and arrow keys
    if ([KeyCodes.SPACE, KeyCodes.LEFT, KeyCodes.UP, KeyCodes.RIGHT, KeyCodes.DOWN].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

new App(rawLevels, 16, 2);