import {Menu} from "./Menu";
import {Player} from "./Player";
import {AudioService} from "./AudioService";
import {SpriteService} from "./SpriteService";
import {KeyCodes} from "./KeyCodes";
import {TileRenderer} from "./TileRenderer";
import {Level} from "./Level";
import {TileType} from "./TileType";

export class App {
    constructor(levels, tileSize, zoom) {
        // settings
        this.zoom = zoom || 2;

        this.buttons = [];
        this.remplissage = false;
        // Frames per second
        //this.fps = 60;
        this.width = tileSize * 16;
        this.height = tileSize * 16;

        /* Initializes HTML canvas */
        this.canvas = document.createElement("canvas");
        this.canvas.width = tileSize * 16;
        this.canvas.height = tileSize * 16;
        this.canvas.style.width = this.width * this.zoom + "px";
        this.canvas.style.height = this.height * this.zoom + "px";
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;

        /* Loads audio and image files */
        this.loadedResourceCount = 0;
        this.audioService = new AudioService(0.05);
        this.spriteService = new SpriteService();
        this.tileRenderer = new TileRenderer(this.context, tileSize, this.spriteService);
        this.totalResourceCount = SpriteService.getSupportedSpriteSheetCount() + AudioService.getSupportedSoundCount();
        this.spriteService.loadResources(() => {
            this.updateProgress();
        });
        this.audioService.loadResources(() => {
            this.updateProgress();
        });

        this.state = "menu";

        // levels
        this.levels = levels;
        this.currentLevel = 0;


        if (!localStorage['copycat']) {
            localStorage.setItem("copycat", JSON.stringify(5)); // Default "Last level" is 5.
        }
        // Recovers last save
        this.lastLevel = JSON.parse(localStorage['copycat']);
        this.players = [];
        // Menu levels
        let self = this;
        this.levelsMenu = {
            world: self,
            context: self.context,
            count: self.levels.length,
            selection: 0,
            render: function () {
                this.context.fillStyle = "#fff1e8";
                this.world.spriteService.drawFrame(this.world.context, 10, 10, this.world.width - 20, 200 - 20, "#fff1e8");
                this.world.spriteService.write(this.world.context, "select level", this.world.width / 2, 25);
                for (let i = 0; i < this.count; i++) {
                    if (i > this.world.lastLevel - 1) {
                        this.context.globalAlpha = 0.6;

                        this.world.spriteService.draw(SpriteService.LOCK, this.world.context,
                            (32 + Math.floor(i % 7) * 32) - this.world.spriteService.getLockImage().width / 2,
                            (64 + Math.floor(i / 7) * 32) + 10);
                    }
                    this.world.spriteService.write(this.world.context, (i + 1).toString(), 32 + Math.floor(i % 7) * 32, 64 + Math.floor(i / 7) * 32);
                    this.context.globalAlpha = 1;
                }
                this.world.spriteService.draw(SpriteService.CURSOR_FRAME, this.world.context, 16 + Math.floor(this.selection % 7) * 32, 51 + Math.floor(this.selection / 7) * 32);
            },
            change: function (keyCode) {
                if (keyCode === KeyCodes.UP && this.selection - 6 > 0) {
                    this.world.audioService.play(AudioService.SELECTION);
                    this.selection -= 7;
                    this.render();
                }
                if (keyCode === KeyCodes.DOWN && this.selection + 7 < this.world.lastLevel) {
                    this.world.audioService.play(AudioService.SELECTION);
                    this.selection += 7;
                    this.render();
                }
                if (keyCode === KeyCodes.LEFT && this.selection > 0) {
                    this.world.audioService.play(AudioService.SELECTION);
                    this.selection -= 1;
                    this.render();
                }
                if (keyCode === KeyCodes.RIGHT && this.selection + 1 < this.world.lastLevel) {
                    this.world.audioService.play(AudioService.SELECTION);
                    this.selection += 1;
                    this.render();
                }
            }
        };
        //transition
        this.transition = {
            duration: 800,
        };
        this.effects = [];
    }

    updateProgress() {
        this.loadedResourceCount += 1;
        if (this.loadedResourceCount === this.totalResourceCount) {
            console.log('%c resources are loaded ' + this.loadedResourceCount + " of " + this.totalResourceCount, 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');

            // menu
            let menuItems = [{
                name: "start game",
                link: "start"
            }, {
                name: "levels",
                link: "levels"
            }, {
                name: "how to play",
                link: "rules"
            }, {
                name: "about",
                link: "info"
            },];
            this.menu = new Menu(this, this.context, this.width / 2, 110, menuItems);
            // End of initialization
            this.phase("menu");
            document.addEventListener("keydown", event => this.handleKeyDown(event.keyCode), false);
            document.addEventListener("keyup", event => {
                this.buttons[event.keyCode] = false;
            }, false);
        } else {
            // Loading screen
            this.context.fillStyle = "#000";
            this.context.fillRect(0, 0, this.width, this.height);
            this.context.fillStyle = "#fff";
            this.context.fillRect(0, (this.height / 2) - 1, (this.loadedResourceCount * this.width) / this.totalResourceCount, 2);
        }
    }

    /* Events */
    handleKeyDown(keyCode) {
        this.buttons[keyCode] = true;
        if (this.buttons[KeyCodes.F]) {
            this.toggleFullscreen();
        } else if (this.buttons[KeyCodes.C] && (['fin', 'rules', 'info', 'levels'].indexOf(this.state) >= 0)) {
            this.audioService.play(AudioService.VALIDATION);
            this.phase("menu")
        } else if (this.state === 'menu') {
            this.menu.change(keyCode);
        } else if (this.state === 'levels') {
            this.levelsMenu.change(keyCode);
            if (this.buttons[KeyCodes.X]) {
                this.currentLevel = this.levelsMenu.selection;
                this.phase("start")
            }
        } else if (this.state === 'start') {
            if (this.buttons[KeyCodes.E] && this.animation) {
                this.audioService.play(AudioService.VALIDATION);
                this.phase("menu")
            }
            if (this.buttons[KeyCodes.R] && this.animation) {
                this.audioService.play(AudioService.VALIDATION);
                cancelAnimationFrame(this.animation);
                this.animation = null;
                this.isStopped = true;
                this.finishGame();
            }
        }
    }

    toggleFullscreen() {
        if (!this.remplissage) {
            //noinspection JSUnresolvedFunction
            this.canvas.webkitRequestFullScreen();
            this.remplissage = true;
            this.canvas.style.width = "100vmin";
            this.canvas.style.height = "100vmin";
        } else {
            //noinspection JSUnresolvedFunction
            document.webkitCancelFullScreen();
            this.remplissage = false;
            this.canvas.style.width = this.width * this.zoom + "px";
            this.canvas.style.height = this.height * this.zoom + "px";
        }
    }

    renderTerrain() {
        this.tileRenderer.renderMap(this.level);

        if (this.levels[this.currentLevel].comment) {
            this.spriteService.drawFrame(this.context, 0, this.height - 32, this.width, 32, "#fff1e8");
            this.spriteService.write(this.context, this.levels[this.currentLevel].comment, this.width / 2, this.height - 20);
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
    initializeMap() {
        this.isStopped = false;
        this.level = new Level(this.levels[this.currentLevel].name, this.levels[this.currentLevel].tiles, this.levels[this.currentLevel].comment);
    }

    animate() {
        /* Clears screen */
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.width, this.height);

        /* Renders game screen */
        this.renderTerrain();

        /* Renders player(s) */
        this.players.forEach(player => {
            player.render();
            player.transition();
            player.control();
        });

        /* Renders effects */
        this.effects.forEach(effect => {
            effect.render();
        });

        /* Queues next frame until stopped */
        if (!this.isStopped) {
            this.animation = requestAnimationFrame(() => this.animate());
        }
    }

    startGame() {
        this.initializeMap();
        let height = this.height / 2;
        let targetX = 0;
        let currentX = this.height / 2;
        let world = this;
        this.transition.time = new Date();
        animate();

        function animate() {
            let time = new Date() - world.transition.time;
            if (time < world.transition.duration) {
                world.renderTerrain();
                world.context.fillStyle = "black";
                world.context.fillRect(0, 0, world.width, height);
                world.context.fillRect(0, world.height, world.width, height * -1);
                height = easeInOutQuart(time, currentX, targetX - currentX, world.transition.duration);
                requestAnimationFrame(animate);
            } else {
                world.effects = [];
                world.players = [];
                let playerStartPositions = world.level.findAllTilesOfType(TileType.START);
                for (let i = 0; i < playerStartPositions.length; i++) {
                    world.players.push(new Player(world, playerStartPositions[i].x, playerStartPositions[i].y, SpriteService.PLAYER,
                        world.tileRenderer.tileSizeInPixels, world.spriteService, world.audioService));
                }

                world.animate();
                cancelAnimationFrame(animate);
            }
        }
    }

    finishGame() {
        cancelAnimationFrame(this.animation);
        this.animation = null;
        this.isStopped = true;

        this.context.fillStyle = "black";
        let height = 0;
        let targetX = this.height / 2;
        let currentX = 0;
        let world = this;
        this.transition.time = new Date();
        animate();

        function animate() {
            let time = new Date() - world.transition.time;
            if (time < world.transition.duration) {
                world.context.fillRect(0, 0, world.width, height);
                world.context.fillRect(0, world.height, world.width, height * -1);
                height = easeInOutQuart(time, currentX, targetX - currentX, world.transition.duration);
                requestAnimationFrame(animate);
            } else {
                if (world.currentLevel < world.levels.length) {
                    world.phase("start");
                    cancelAnimationFrame(animate);
                } else {
                    // fin du jeu
                    world.isStopped = true;
                    world.phase("fin");
                    world.currentLevel = 0;
                }
            }
        }
    }

    phase(phase) {
        this.state = phase;
        cancelAnimationFrame(this.animation);
        this.animation = null;
        this.context.fillStyle = "#fff1e8";
        this.context.fillRect(0, 0, this.width, this.height);
        switch (phase) {
            case "menu": // Displays game menu
                let pattern = this.context.createPattern(this.spriteService.getSpriteSheet(SpriteService.PATTERN).image, "repeat");
                this.context.fillStyle = pattern;
                this.context.fillRect(0, 0, this.width, this.height);

                this.context.drawImage(this.spriteService.getSpriteSheet(SpriteService.TITLE).image, 0, 0);
                this.menu.render();
                break;
            case "start":
                this.startGame();
                break;
            case "fin": // Displays the player's death chart
                this.spriteService.write(this.context, "thanks for playing :) !", this.width / 2, 15);
                this.spriteService.write(this.context, "if you have something to tell me about", this.width / 2, 40);
                this.spriteService.write(this.context, "this pen please do so", this.width / 2, 55);
                this.spriteService.write(this.context, "in the comment section.", this.width / 2, 70);
                this.spriteService.write(this.context, "any feedback is appreciated", this.width / 2, 85);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 18);
                this.spriteService.write(this.context, "press 'c' to return to menu", this.width / 2, this.height - 30);
                break;
            case "rules": // Displays rules
                this.spriteService.write(this.context, "game control: ", this.width / 2, 15);
                this.spriteService.write(this.context, "arrow keys to move", this.width / 2, 60);
                this.spriteService.write(this.context, "'f' to toggle fullscreen", this.width / 2, 80);
                this.spriteService.write(this.context, "'r' if you're stuck", this.width / 2, 100);
                this.spriteService.write(this.context, "'e' to exit the game", this.width / 2, 120);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 18);
                this.spriteService.write(this.context, "press 'c' to return to menu", this.width / 2, this.height - 30);
                break;
            case "info": // Displays infos
                this.spriteService.write(this.context, "about: ", this.width / 2, 15);
                this.spriteService.write(this.context, "made with html5 canvas", this.width / 2, 40);
                this.spriteService.write(this.context, "by gtibo on codepen", this.width / 2, 55);
                this.spriteService.write(this.context, "credits:", this.width / 2, 80);
                this.spriteService.write(this.context, "sound effects: noiseforfun.com", this.width / 2, 100);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 18);
                this.spriteService.write(this.context, "press 'c' to return to menu", this.width / 2, this.height - 30);
                break;
            case "levels": // Displays menu levels
                this.levelsMenu.render();
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 28);
                this.spriteService.write(this.context, "arrow keys to select 'x' to confirm", this.width / 2, this.height - 30);
                this.spriteService.write(this.context, "press 'c' to return to menu", this.width / 2, this.height - 20);
                break;
            default:
                console.log("aucune action reconnue");
        }
    }

    checkLevelCompletion() {
        if (this.players.every(player => {
                return player.hasReachedAnExit;
            })) {
            this.currentLevel += 1;
            if (this.lastLevel < this.currentLevel) {
                this.lastLevel = this.currentLevel;
                localStorage.setItem("copycat", JSON.stringify(this.currentLevel));
            }
            this.finishGame();
            this.audioService.play(AudioService.SUCCESS);
        }
    }
}

function easeInOutQuart(elapsedTime, startValue, changeAmount, transitionDuration) {
    elapsedTime /= transitionDuration / 2;
    if (elapsedTime < 1) return changeAmount / 2 * elapsedTime * elapsedTime * elapsedTime * elapsedTime + startValue;
    elapsedTime -= 2;
    return -changeAmount / 2 * (elapsedTime * elapsedTime * elapsedTime * elapsedTime - 2) + startValue;
}