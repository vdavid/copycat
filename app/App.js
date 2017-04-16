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

        this.buttons = [];
        this.isFullScreen = false;
        // Frames per second: this.fps = 60;

        /* Initializes HTML canvas */
        this._context = createCanvas(tileSize, zoom);

        /* Loads audio and image files */
        this.loadedResourceCount = 0;
        this.audioService = new AudioService(0.05);
        this.spriteService = new SpriteService(this._context);
        this._screenTransitionRenderer = new ScreenTransitionRenderer();

        this.spriteService.loadResources(() => {
            this.updateProgress();
        });
        this.audioService.loadResources(() => {
            this.updateProgress();
        });

        this.state = "menu";

        this._currentLevelIndex = 0;

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
            this._appMenu = new AppMenu(this._context, this.buttons, this._rawLevels.length, this.lastLevel, this.spriteService, this.audioService);

            let defaultLevel = new Level(this._rawLevels[this._currentLevelIndex].name,
                this._rawLevels[this._currentLevelIndex].tiles, this._rawLevels[this._currentLevelIndex].comment);
            this._game = new Game(this._context, this.tileSize, defaultLevel, this.spriteService, this.audioService,
                (success, restart) => this.finishGame(success, restart));

            // End of initialization
            this.state = 'menu';
            document.addEventListener("keydown", event => this._handleKeyDownEvent(event.keyCode), false);
            document.addEventListener("keyup", event => this._game.handleKeyUpEvent(event.keyCode), false);
            this._appMenu.render();
        } else {
            // Loading screen
            this._context.fillStyle = "#000";
            this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
            this._context.fillStyle = "#fff";
            this._context.fillRect(0, (this._context.canvas.height / 2) - 1, (this.loadedResourceCount * this._context.canvas.width) / totalResourceCount, 2);
        }
    }

    /* Events */
    _handleKeyDownEvent(keyCode) {
        if (this.buttons[KeyCodes.F]) {
            this.toggleFullscreen();
        }

        if (this.state === 'menu') {
            let result = this._appMenu.handleKeyDownEvent(keyCode);
            if (result.startGame) {
                this.state = 'start';
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
        if (!this.isFullScreen) {
            //noinspection JSUnresolvedFunction
            this._context.canvas.webkitRequestFullScreen();
            this.isFullScreen = true;
            this._context.canvas.style.width = "100vmin";
            this._context.canvas.style.height = "100vmin";
        } else {
            //noinspection JSUnresolvedFunction
            document.webkitCancelFullScreen();
            this.isFullScreen = false;
            this._context.canvas.style.width = this._context.canvas.width * this.zoom + "px";
            this._context.canvas.style.height = this._context.canvas.height * this.zoom + "px";
        }
    }

    startGame() {
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
            return;
        }

        if (success) {
            this._currentLevelIndex += 1;
            if (this.lastLevel < this._currentLevelIndex) {
                this.lastLevel = this._currentLevelIndex;
                localStorage.setItem("copycat", JSON.stringify(this._currentLevelIndex));
                this._appMenu.lastUnlockedLevelIndex = this._currentLevelIndex;
            }
            this.audioService.play(AudioService.SUCCESS);
        }

        this._screenTransitionRenderer.slideVertically(this._context, 800, ScreenTransitionRenderer.CLOSE, () => {}).then(() => {
            if (this._currentLevelIndex < this._rawLevels.length) {
                this.state = 'start';
                this.startGame();
            } else {
                // fin du jeu
                this._currentLevelIndex = 0;
                this._appMenu.activePage = AppMenu.FINISHED_LAST_LEVEL_PAGE;
                this.state = 'menu';
                this._appMenu.render();
            }
        });
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
