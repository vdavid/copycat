import {AudioService} from "./AudioService";
import {SpriteService} from "./SpriteService";
import {KeyCodes} from "./KeyCodes";
import {Level} from "./Level";
import {Game} from "./Game";
import {AppMenu} from "./AppMenu";
import {ScreenTransitionRenderer} from "./ScreenTransitionRenderer";

export class App {
    constructor(rawLevels, tileSize, zoom) {
        this.zoom = zoom || 2;
        this.tileSize = tileSize;
        this._rawLevels = rawLevels;

        this._currentLevelIndex = 0;
        this.isFullScreen = false;
        this.state = "menu";
        // Frames per second: this.fps = 60;

        /* Initializes HTML canvas */
        this._context = createCanvas(tileSize, zoom);

        /* Loads audio and image files */
        this.loadedResourceCount = 0;
        this.audioService = new AudioService(0.05);
        this.spriteService = new SpriteService(this._context);
        this._screenTransitionRenderer = new ScreenTransitionRenderer();

        this._appMenu = new AppMenu(this._context, this._rawLevels.length, this.lastLevel, this.spriteService, this.audioService);
        this._game = new Game(this._context, this.tileSize, Level.createFromData(this._rawLevels[0]),
            this.spriteService, this.audioService, (success, restart) => this.finishGame(success, restart));
        document.addEventListener("keydown", event => this._handleKeyDownEvent(event.keyCode), false);
        document.addEventListener("keyup", event => this._game.handleKeyUpEvent(event.keyCode), false);

        this.spriteService.loadResources(() => {
            this.updateProgress();
        });
        this.audioService.loadResources(() => {
            this.updateProgress();
        });

        if (!localStorage['copycat']) {
            localStorage.setItem("copycat", JSON.stringify(5)); // Default "Last level" is 5.
        }
        // Recovers last save
        this.lastLevel = JSON.parse(localStorage['copycat']);
    }

    updateProgress() {
        this.loadedResourceCount += 1;
        let totalResourceCount = SpriteService.getSupportedSpriteSheetCount() + AudioService.getSupportedSoundCount();
        if (this.loadedResourceCount === totalResourceCount) {
            this._appMenu.render();
        } else {
            this._renderLoadingScreen(this.loadedResourceCount / totalResourceCount);
        }
    }

    _renderLoadingScreen(percent) {
        this._context.fillStyle = "#000";
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
        this._context.fillStyle = "#fff";
        this._context.fillRect(0, (this._context.canvas.height / 2) - 1, percent * this._context.canvas.width, 2);
    }

    /* Events */
    _handleKeyDownEvent(keyCode) {
        if (keyCode === KeyCodes.F) {
            this.toggleFullscreen();
        }

        if (this.state === 'menu') {
            let result = this._appMenu.handleKeyDownEvent(keyCode);
            if (result.startGame) {
                if (typeof result.levelIndex === 'number') {
                    this._currentLevelIndex = result.levelIndex;
                }
                this.startGame();
            }
        } else if (this.state === 'start') {
            this._game.handleKeyDownEvent(keyCode);
        }
    }

    toggleFullscreen() {
        this.isFullScreen = !this.isFullScreen;
        if (this.isFullScreen) {
            //noinspection JSUnresolvedFunction
            this._context.canvas.webkitRequestFullScreen();
            this._context.canvas.style.width = "100vmin";
            this._context.canvas.style.height = "100vmin";
        } else {
            //noinspection JSUnresolvedFunction
            document.webkitCancelFullScreen();
            this._context.canvas.style.width = this._context.canvas.width * this.zoom + "px";
            this._context.canvas.style.height = this._context.canvas.height * this.zoom + "px";
        }
    }

    startGame() {
        this.state = 'start';
        this._game.level = new Level(this._rawLevels[this._currentLevelIndex].name,
            this._rawLevels[this._currentLevelIndex].tiles, this._rawLevels[this._currentLevelIndex].comment);

        this._screenTransitionRenderer.slideVertically(this._context, 800, ScreenTransitionRenderer.OPEN, () => this._game.renderTerrain())
            .then(() => this._game.start());
    }

    finishGame(success, restart) {
        if (!restart && !success) {
            this._appMenu.activePage = AppMenu.MAIN_PAGE;
            this.state = 'menu';
            this._appMenu.render();
        } else {
            if (success) {
                this._currentLevelIndex += 1;
                if (this.lastLevel < this._currentLevelIndex) {
                    this.lastLevel = this._currentLevelIndex;
                    localStorage.setItem("copycat", JSON.stringify(this._currentLevelIndex));
                    this._appMenu.lastUnlockedLevelIndex = this._currentLevelIndex;
                }
                this.audioService.play(AudioService.SUCCESS);
            }

            this._screenTransitionRenderer.slideVertically(this._context, 800, ScreenTransitionRenderer.CLOSE, () => {
            }).then(() => {
                if (this._currentLevelIndex < this._rawLevels.length) {
                    this.startGame();
                } else { /* Last level finished */
                    this._currentLevelIndex = 0;
                    this._appMenu.activePage = AppMenu.FINISHED_LAST_LEVEL_PAGE;
                    this.state = 'menu';
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
