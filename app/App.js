import {AudioService} from "./AudioService";
import {SpriteService} from "./SpriteService";
import {KeyCodes} from "./KeyCodes";
import {Level} from "./Level";
import {Game} from "./Game";
import {AppMenu} from "./AppMenu";

export class App {
    constructor(rawLevels, tileSize, zoom) {
        // settings
        this.zoom = zoom || 2;

        this.buttons = [];
        this.isFullScreen = false;
        // Frames per second
        //this.fps = 60;
        this.tileSize = tileSize;

        /* Initializes HTML canvas */
        this._context = createCanvas(tileSize, zoom);

        /* Loads audio and image files */
        this.loadedResourceCount = 0;
        this.audioService = new AudioService(0.05);
        this.spriteService = new SpriteService(this._context);

        this.spriteService.loadResources(() => {
            this.updateProgress();
        });
        this.audioService.loadResources(() => {
            this.updateProgress();
        });

        this.state = "menu";

        // levels
        this._rawLevels = rawLevels;
        this._currentLevelIndex = 0;

        if (!localStorage['copycat']) {
            localStorage.setItem("copycat", JSON.stringify(5)); // Default "Last level" is 5.
        }
        // Recovers last save
        this.lastLevel = JSON.parse(localStorage['copycat']);
        //transition
        this.transition = {
            duration: 800,
        };
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
        } else if(this.state === 'start') {
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

    /*
     ______           _
     |  ____|         (_)
     | |__   _ __      _  ___ _   _
     |  __| | '_ \    | |/ _ \ | | |
     | |____| | | |   | |  __/ |_| |
     |______|_| |_|   | |\___|\__,_|
     _/ |
     |__/
     */

    startGame() {
        this._game.level = new Level(this._rawLevels[this._currentLevelIndex].name,
            this._rawLevels[this._currentLevelIndex].tiles, this._rawLevels[this._currentLevelIndex].comment);
        let height = this._context.canvas.height / 2;
        let targetX = 0;
        let currentX = this._context.canvas.height / 2;
        let app = this;
        this.transition.time = new Date();
        animate();

        function animate() {
            let time = new Date() - app.transition.time;
            if (time < app.transition.duration) {
                app._game.renderTerrain();
                app._context.fillStyle = "black";
                app._context.fillRect(0, 0, app._context.canvas.width, height);
                app._context.fillRect(0, app._context.canvas.height, app._context.canvas.width, height * -1);
                height = easeInOutQuart(time, currentX, targetX - currentX, app.transition.duration);
                requestAnimationFrame(animate);
            } else {
                app._game.start();
            }
        }
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

        let height = 0;
        let targetX = this._context.canvas.height / 2;
        let currentX = 0;
        this.transition.time = new Date();
        let app = this;
        animate();

        function animate() {
            let time = new Date() - app.transition.time;
            if (time < app.transition.duration) {
                app._context.fillStyle = "black";
                app._context.fillRect(0, 0, app._context.canvas.width, height);
                app._context.fillRect(0, app._context.canvas.height, app._context.canvas.width, height * -1);
                height = easeInOutQuart(time, currentX, targetX - currentX, app.transition.duration);
                requestAnimationFrame(animate);
            } else {
                if (app._currentLevelIndex < app._rawLevels.length) {
                    app.state = 'start';
                    app.startGame();
                } else {
                    // fin du jeu
                    app._currentLevelIndex = 0;
                    app._appMenu.activePage = AppMenu.FINISHED_LAST_LEVEL_PAGE;
                    app.state = 'menu';
                    app._appMenu.render();
                }
            }
        }
    }
}

function easeInOutQuart(elapsedTime, startValue, changeAmount, transitionDuration) {
    elapsedTime /= transitionDuration / 2;
    if (elapsedTime < 1) return changeAmount / 2 * elapsedTime * elapsedTime * elapsedTime * elapsedTime + startValue;
    elapsedTime -= 2;
    return -changeAmount / 2 * (elapsedTime * elapsedTime * elapsedTime * elapsedTime - 2) + startValue;
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
