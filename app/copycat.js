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

Math.linearTween = function (currentTime, start, amount, duration) {
    return amount * currentTime / duration + start;
};

Math.easeInOutQuart = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
};

let settings = {
    tileSize: 16,
    zoom: 2,
};

new App(settings, levels);