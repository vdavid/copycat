import {AudioService} from "./AudioService";
import {SpriteService} from "./SpriteService";
import {KeyCodes} from "./KeyCodes";
import {Level} from "./game/Level";
import {Game} from "./game/Game";
import {AppMenu} from "./menu/AppMenu";
import {ScreenTransitionRenderer} from "./ScreenTransitionRenderer";
import {StateRepository} from "./StateRepository";
import {ResourceLoader} from "./ResourceLoader";

export class App {
    constructor(rawLevels, tileSize, zoom) {
        this._zoom = zoom || 2;
        this._tileSize = tileSize;
        this._rawLevels = rawLevels;

        this._currentLevelIndex = 0;
        this._isFullScreen = false;
        this._state = App.STATE_MENU;
        // Frames per second: this.fps = 60;

        /* Initializes HTML canvas */
        this._context = createCanvas(tileSize, zoom);

        this._audioService = new AudioService(0.05);
        this._spriteService = new SpriteService(this._context);
        this._screenTransitionRenderer = new ScreenTransitionRenderer();

        this._appMenu = new AppMenu(this._context, this._rawLevels.length, StateRepository.getLastLevelIndex(5), this._spriteService, this._audioService);
        this._game = new Game(this._context, this._tileSize, Level.createFromData(this._rawLevels[0]),
            this._spriteService, this._audioService, (success, restart) => this._finishGame(success, restart));

        let resourceLoader = new ResourceLoader(this._context, this._audioService, this._spriteService, () => this._handleLoadingFinished());
        resourceLoader.loadResources();
    }

    _handleLoadingFinished() {
        document.addEventListener("keydown", event => this._handleKeyDownEvent(event.keyCode), false);
        document.addEventListener("keyup", event => this._game.handleKeyUpEvent(event.keyCode), false);

        this._appMenu.render();
    }

    /* Events */
    _handleKeyDownEvent(keyCode) {
        if (keyCode === KeyCodes.F) {
            this._toggleFullscreen();
        }

        if (this._state === App.STATE_MENU) {
            let result = this._appMenu.handleKeyDownEvent(keyCode);
            if (result.startGame) {
                if (typeof result.levelIndex === 'number') {
                    this._currentLevelIndex = result.levelIndex;
                }
                this._startGame();
            }
        } else if (this._state === App.STATE_GAME) {
            this._game.handleKeyDownEvent(keyCode);
        }
    }

    _toggleFullscreen() {
        this._isFullScreen = !this._isFullScreen;
        if (this._isFullScreen) {
            //noinspection JSUnresolvedFunction
            this._context.canvas.webkitRequestFullScreen();
            this._context.canvas.style.width = "100vmin";
            this._context.canvas.style.height = "100vmin";
        } else {
            //noinspection JSUnresolvedFunction
            document.webkitCancelFullScreen();
            this._context.canvas.style.width = this._context.canvas.width * this._zoom + "px";
            this._context.canvas.style.height = this._context.canvas.height * this._zoom + "px";
        }
    }

    _startGame() {
        this._state = App.STATE_GAME;
        this._game.level = Level.createFromData(this._rawLevels[this._currentLevelIndex]);

        this._screenTransitionRenderer.slideVertically(this._context, 800, ScreenTransitionRenderer.OPEN, () => this._game.renderTerrain())
            .then(() => this._game.start());
    }

    _finishGame(success, restart) {
        if (!restart && !success) {
            this._appMenu.activePage = AppMenu.MAIN_PAGE;
            this._state = App.STATE_MENU;
            this._appMenu.render();
        } else {
            if (success) {
                this._currentLevelIndex += 1;
                if (this.lastLevel < this._currentLevelIndex) {
                    this.lastLevel = this._currentLevelIndex;
                    localStorage.setItem("copycat", JSON.stringify(this._currentLevelIndex));
                    this._appMenu.lastUnlockedLevelIndex = this._currentLevelIndex;
                }
                this._audioService.play(AudioService.SUCCESS);
            }

            this._screenTransitionRenderer.slideVertically(this._context, 800, ScreenTransitionRenderer.CLOSE, () => {
            }).then(() => {
                if (this._currentLevelIndex < this._rawLevels.length) {
                    this._startGame();
                } else { /* Last level finished */
                    this._currentLevelIndex = 0;
                    this._appMenu.activePage = AppMenu.FINISHED_LAST_LEVEL_PAGE;
                    this._state = App.STATE_MENU;
                    this._appMenu.render();
                }
            });
        }
    }
}

function createCanvas(tileSize, zoom) {
    let canvas = document.createElement("canvas");
    canvas.width = tileSize * 16;
    canvas.height = tileSize * 16;
    canvas.style.width = canvas.width * zoom + "px";
    canvas.style.height = canvas.height * zoom + "px";
    document.body.appendChild(canvas);
    let context = canvas.getContext('2d');
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    return context;
}

App.STATE_MENU = Symbol('STATE_MENU');
App.STATE_GAME = Symbol('STATE_GAME');