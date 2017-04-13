import {App} from "./App";
import {levels} from "./data/levels";
import {KeyCodes} from "./KeyCodes";
//noinspection ES6UnusedImports,JSUnresolvedVariable
import css from "./copycat.css";

/* Utilities */
window.addEventListener("keydown", function (e) {
    // space and arrow keys
    if ([KeyCodes.SPACE, KeyCodes.LEFT, KeyCodes.UP, KeyCodes.RIGHT, KeyCodes.DOWN].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

new App(levels, 16, 2);