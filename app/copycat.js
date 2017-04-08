import {World} from "./World";
import {levels} from "./data/levels";
//noinspection ES6UnusedImports
import css from "./copycat.css";

/* Utilities */
window.addEventListener("keydown", function (e) {
    // space and arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
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
    spriteSheets: [
        {url: "./resources/images/font.png", name: "pixelFont"},
        {url: "./resources/images/cursor.png", name: "cursor"},
        {url: "./resources/images/title.png", name: "title"},
        {url: "./resources/images/player.png", name: "playerSprite", spriteCount: 12, rowCount: 1},
        {url: "./resources/images/explosion.png", name: "explosion", spriteCount: 9, rowCount: 1},
        {url: "./resources/images/tiles.png", name: "tiles"},
        {url: "./resources/images/exit.png", name: "exit", spriteCount: 10},
        {url: "./resources/images/dust.png", name: "dust", spriteCount: 9, rowCount: 1},
        {url: "./resources/images/pattern.png", name: "pattern"},
        {url: "./resources/images/lock.png", name: "lock"}
    ],
    sounds: [
        {url: "./resources/sounds/NFF-select-04.wav", name: "movement"},
        {url: "./resources/sounds/NFF-select.wav", name: "selection"},
        {url: "./resources/sounds/NFF-bravo.wav", name: "bravo"},
        {url: "./resources/sounds/NFF-click-switch.wav", name: "validation"},
        {url: "./resources/sounds/NFF-bubble-input.wav", name: "appearance"},
        {url: "./resources/sounds/NFF-moving-block.wav", name: "landslide"},
    ],
    keys: [
        {type: "tile", name: "water", id: 0, collision: true, apparence: "auto", rowIndex: 3},
        {type: "tile", name: "grass", id: 1, collision: false, apparence: 1},
        {type: "tile", name: "wall", id: 2, collision: true, apparence: "auto", rowIndex: 1},
        {type: "tile", name: "ice", action: "slide", id: 3, collision: false, apparence: "auto", rowIndex: 2},
        {type: "sprite", name: "nextLevel", id: 4, collision: false, action: "nextLevel", apparence: "exit", rowIndex: 2, allure: 0.3},
        {type: "tile", name: "player", id: 5, collision: false, apparence: 5},
        {type: "tile", name: "trap", action: "trap", id: 6, collision: false, apparence: 6},
        {type: "tile", name: "hole", id: 7, collision: true, apparence: 7},
        {type: "tile", name: "fence", id: 8, collision: true, apparence: "auto", rowIndex: 4},
        {type: "tile", name: "leftArrow", action: "left", id: 9, collision: false, apparence: 9},
        {type: "tile", name: "upArrow", action: "up", id: 10, collision: false, apparence: 10},
        {type: "tile", name: "rightArrow", action: "right", id: 11, collision: false, apparence: 11},
        {type: "tile", name: "downArrow", action: "down", id: 12, collision: false, apparence: 12}
    ],

};

new World(settings, levels);