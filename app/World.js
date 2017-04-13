import {Menu} from "./Menu";
import {Character} from "./Character";
import {AudioService} from "./AudioService";
import {SpriteService} from "./SpriteService";
import {KeyCodes} from "./KeyCodes";
import {TileType} from './TileType';
import {TileRenderer} from './TileRenderer';

export class World {
    constructor(settings, levels) {
        // settings
        this.tileSize = settings.tileSize;
        this.buttons = [];
        this.zoom = settings.zoom || 2;
        this.remplissage = false;
        this.state = "menu";
        this.keys = settings.keys;
        // Frames per second
        //this.fps = 60;

        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext('2d');
        this.width = this.tileSize * 16;
        this.canvas.width = this.tileSize * 16;
        this.height = this.tileSize * 16;
        this.canvas.height = this.tileSize * 16;
        this.canvas.style.width = this.width * this.zoom + "px";
        this.canvas.style.height = this.height * this.zoom + "px";
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;
        document.body.appendChild(this.canvas);
        console.log('%c World created ', 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');

        // resources
        this.loadedResourceCount = 0;
        this.audioService = new AudioService(0.05);
        this.spriteService = new SpriteService();
        this.totalResourceCount = SpriteService.getSupportedSpriteSheetCount() + AudioService.getSupportedSoundCount();
        this.spriteService.loadResources(() => {
            this.updateProgress();
        });
        this.audioService.loadResources(() => {
            this.updateProgress();
        });

        // levels
        this.levels = levels;
        this.currentLevel = 0;


        if (!localStorage['copycat']) {
            localStorage.setItem("copycat", JSON.stringify(5)); // Default "Last level" is 5.
        }
        // Recovers last save
        this.lastLevel = JSON.parse(localStorage['copycat']);
        this.cats = [];
        // Menu levels
        let self = this;
        this.menuLevels = {
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

            // Initialization + loading
            this.nettoyer = new Array(TileType.getTileTypeCount()).fill(false);
            this.loadResources(this.keys);

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
            document.addEventListener("keydown", event => this.touchePresse(event), false);
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

    loadResources(keys) {
        //  Key processing
        let CM = {};
        for (let i = 0; i < keys.length; i++) {
            let name = keys[i].id;
            if (keys[i].type === "animated") {
                keys[i].frame = 0;
                keys[i].spriteSheet = this.spriteService.getSpriteSheet(keys[i].apparence);
                keys[i].memoireBoucle = false;
                keys[i].canAnimate = true;
            }
            CM[name] = keys[i];
        }
        this.keys = CM;
    }

    /* Events */
    touchePresse(event) {
        this.buttons[event.keyCode] = true;
        if (this.buttons[KeyCodes.F]) {
            this.toggleFullscreen();
        }
        switch (this.state) {
            case "menu":
                this.menu.change(event.keyCode);
                break;
            case "start":
                if (this.buttons[69] && this.animation) {
                    this.audioService.play(AudioService.VALIDATION);
                    this.phase("menu")
                }
                if (this.buttons[82] && this.animation) {
                    this.audioService.play(AudioService.VALIDATION);
                    cancelAnimationFrame(this.animation);
                    this.animation = null;
                    this.isStopped = true;
                    this.outro();
                }
                break;
            case "fin":
                if (this.buttons[67]) {
                    this.audioService.play(AudioService.VALIDATION);
                    this.phase("menu")
                }
                break;
            case "rules":
                if (this.buttons[67]) {
                    this.audioService.play(AudioService.VALIDATION);
                    this.phase("menu")
                }
                break;
            case "info":
                if (this.buttons[67]) {
                    this.audioService.play(AudioService.VALIDATION);
                    this.phase("menu")
                }
                break;
            case "levels":
                this.menuLevels.change(event.keyCode);
                if (this.buttons[67]) {
                    this.audioService.play(AudioService.VALIDATION);
                    this.phase("menu")
                }
                if (this.buttons[88]) {
                    this.currentLevel = this.menuLevels.selection;
                    this.phase("start")
                }
                break;
            default:
                console.log("aucune touche reconnue");
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

    /*
     ______               _   _
     |  ____|             | | (_)
     | |__ ___  _ __   ___| |_ _  ___  _ __  ___
     |  __/ _ \| '_ \ / __| __| |/ _ \| '_ \/ __|
     | | | (_) | | | | (__| |_| | (_) | | | \__ \
     |_|  \___/|_| |_|\___|\__|_|\___/|_| |_|___/

     */
    /**
     * @returns {Object[]}
     */
    findPlayers() {
        let playerPositions = [];
        for (let j = 0; j < this.board.size.height; j++) {
            for (let i = 0; i < this.board.size.width; i++) {
                if (TileType.getNewIdByOldId(this.board.tiles[j][i]) === TileType.PLAYER) {
                    playerPositions.push({x: i, y: j});
                }
            }
        }
        return playerPositions;
    }

    bitMasking() {
        this.board.apparence = [];
        for (let y = 0; y < this.board.size.height; y++) {
            for (let x = 0; x < this.board.size.width; x++) {
                let id = this.board.tiles[y][x];
                // up left right down
                let neighbor = [0, 0, 0, 0];
                if (y - 1 > -1) {
                    if (id === this.board.tiles[y - 1][x]) {
                        neighbor[0] = 1; //up
                    }
                } else {
                    neighbor[0] = 1;
                }
                if (x - 1 > -1) {
                    if (id === this.board.tiles[y][x - 1]) {
                        neighbor[1] = 1; // left
                    }
                } else {
                    neighbor[1] = 1;
                }
                if (x + 1 < this.board.size.width) {
                    if (id === this.board.tiles[y][x + 1]) {
                        neighbor[2] = 1; // right
                    }
                } else {
                    neighbor[2] = 1;
                }
                if (y + 1 < this.board.size.height) {
                    if (id === this.board.tiles[y + 1][x]) {
                        neighbor[3] = 1; // down
                    }
                } else {
                    neighbor[3] = 1;
                }
                //noinspection PointlessArithmeticExpressionJS
                id = 1 * neighbor[0] + 2 * neighbor[1] + 4 * neighbor[2] + 8 * neighbor[3];
                this.board.apparence.push(id);
            }
        }
        let temp = [];
        for (let i = 0; i < this.board.apparence.length; i += this.board.size.width) {
            temp.push(this.board.apparence.slice(i, i + this.board.size.width))
        }
        this.board.apparence = temp;
    }

    renderTerrain() {
        for (let j = 0; j < this.board.size.height; j++) {
            for (let i = 0; i < this.board.size.width; i++) {
                let spriteColumnIndex = 0;
                let oldId = this.board.tiles[j][i];
                let tileTypeId = TileType.getNewIdByOldId(this.board.tiles[j][i]);
                let spriteId = SpriteService.TILES;
                let spriteRowIndex;
                if (TileRenderer.isAnimated(tileTypeId)) {
                    if (!this.keys[oldId].memoireBoucle) {
                        if (this.keys[oldId].canAnimate) {
                            this.keys[oldId].frame += TileRenderer.getSpeedOfAnimatedTile(tileTypeId);
                        }
                        if (this.keys[oldId].frame >= this.keys[oldId].spriteSheet.columnCount) {
                            this.keys[oldId].frame = 0;
                        }
                        this.keys[oldId].memoireBoucle = true;
                        // on sait quel id est déjà passé :^)
                        this.nettoyer[oldId] = true;
                    }
                    spriteId = TileRenderer.getSpriteIdOfAnimatedTile(tileTypeId);
                    spriteColumnIndex = Math.floor(this.keys[oldId].frame);
                    spriteRowIndex = 0;

                } else {
                    spriteColumnIndex = (TileRenderer.getColumnIndex(tileTypeId) === "auto")
                        ? Math.floor(this.board.apparence[j][i])
                        : TileRenderer.getColumnIndex(tileTypeId);
                    spriteRowIndex = TileRenderer.getRowIndex(tileTypeId);
                }
                this.spriteService.draw(spriteId, this.context, i * this.tileSize, j * this.tileSize, spriteColumnIndex, spriteRowIndex);
            }
        }
        for (let i = 0; i < this.nettoyer.length; i++) {
            if (this.nettoyer[i]) {
                this.keys[i].memoireBoucle = false;
            }
        }
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
        this.board = {};
        this.isStopped = false;
        this.board.tiles = JSON.parse(JSON.stringify(this.levels[this.currentLevel].tiles));
        this.board.size = {
            width: this.board.tiles[0].length,
            height: this.board.tiles.length
        };
        this.board.apparence = [];
        this.bitMasking();
    }

    animate() {
        /* Clears screen */
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.width, this.height);
        this.renderTerrain();

        this.cats.forEach(cat => {
            cat.render();
        });
        this.effects.forEach(effect => {
            effect.render();
        });

        /* Displays next frame */
        if (!this.isStopped) {
            this.animation = requestAnimationFrame(() => this.animate());
        }
    }

    outro() {

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
                height = Math.easeInOutQuart(time, currentX, targetX - currentX, world.transition.duration);
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

    intro() {
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
                height = Math.easeInOutQuart(time, currentX, targetX - currentX, world.transition.duration);
                requestAnimationFrame(animate);
            } else {
                world.effects = [];
                world.cats = [];
                let positions = world.findPlayers();
                for (let i = 0; i < positions.length; i++) {
                    world.cats.push(new Character(world, positions[i].x, positions[i].y, SpriteService.PLAYER,
                        world.spriteService, world.audioService));
                }

                world.animate();
                cancelAnimationFrame(animate);
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
                this.intro();
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
                this.menuLevels.render();
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
        if (this.cats.every(cat => { return cat.reachedAnExit; })) {
            this.currentLevel += 1;
            if (this.lastLevel < this.currentLevel) {
                this.lastLevel = this.currentLevel;
                localStorage.setItem("copycat", JSON.stringify(this.currentLevel));
            }
            this.outro();
            this.audioService.play(AudioService.SUCCESS);
        }
    }
}