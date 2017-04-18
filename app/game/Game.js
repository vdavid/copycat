import AudioService from "./../AudioService";
import SpriteService from "./../SpriteService";
import KeyCodes from "./../KeyCodes";
import TileRenderer from "./TileRenderer";
import TileType from "./TileType";
import Player from "./Player";
import GameLoop from './GameLoop';

/**
 * @member {Effect[]} Game#_effects
 * @member {Player[]} Game#_players
 */
export default class Game {
    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {Number} tileSize
     * @param {Level} level
     * @param {SpriteService} spriteService
     * @param {AudioService} audioService
     * @param {function} finishGameCallback
     */
    constructor(context, tileSize, level, spriteService, audioService, finishGameCallback) {
        this._context = context;
        this._spriteService = spriteService;
        this._audioService = audioService;
        this._finishGameCallback = finishGameCallback;
        this._tileRenderer = new TileRenderer(tileSize, spriteService);
        this._effects = [];
        this._pressedKeys = [];
        this._gameLoop = new GameLoop()
            .setBeginFunction(() => this._players.forEach(player => player.control(this._pressedKeys)))
            .setUpdateFunction(() => this._players.forEach(player => player.update()))
            .setDrawFunction(() => this._render());
        this.level = level;
    }

    handleKeyDownEvent(keyCode) {
        if(this._gameLoop.isRunning()) {
            if (keyCode === KeyCodes.E) { /* Returns to main menu */
                this._audioService.play(AudioService.VALIDATION);
                this._gameLoop.stop();
                this._finishGameCallback(false, false);
            }
            if (keyCode === KeyCodes.R) { /* Restarts same level */
                this._audioService.play(AudioService.VALIDATION);
                this._gameLoop.stop();
                this._finishGameCallback(false, true);
            }
            this._pressedKeys[keyCode] = true;
        }
    }

    handleKeyUpEvent(keyCode) {
        this._pressedKeys[keyCode] = false;
    }

    /**
     * @param {Level} level
     */
    set level(level) {
        this._level = level;
    }

    renderTerrain() {
        this._tileRenderer.renderMap(this._level);

        if (this._level.comment) {
            this._spriteService.drawFrame(0, this._context.canvas.height - 32, this._context.canvas.width, 32, "#fff1e8");
            this._spriteService.write(this._level.comment, this._context.canvas.width / 2, this._context.canvas.height - 20);
        }

    }

    start() {
        this._players = [];
        let playerStartPositions = this._level.findAllTilesOfType(TileType.START);
        for (let i = 0; i < playerStartPositions.length; i++) {
            this._players.push(new Player(this._level, this._effects,
                playerStartPositions[i].x, playerStartPositions[i].y, SpriteService.PLAYER,
                this._tileRenderer.tileSizeInPixels, this._spriteService, this._audioService, () => {
                    this._checkLevelCompletion();
                }));
        }

        this._pressedKeys = [];
        this._isRunning = true;
        this._gameLoop.start();
    }

    _render() {
        /* Clears screen */
        this._context.fillStyle = "black";
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);

        /* Renders game screen */
        this.renderTerrain();

        /* Renders player(s) */
        this._players.forEach(player => {
            player.render();
        });

        /* Renders effects */
        this._effects.forEach(effect => {
            effect.render();
        });
    }

    _checkLevelCompletion() {
        if (this._players.every(player => {
                return player.hasReachedAnExit;
            })) {
            this._gameLoop.stop();
            this._finishGameCallback(true, false);
        }
    }
}