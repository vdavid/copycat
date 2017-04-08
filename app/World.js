import {Menu} from "./Menu";
import {Character} from "./Character";
import {ArrayChunker} from "./ArrayChunker";
import {SoundBox} from "./SoundBox";

export class World {
    constructor(settings, levels) {
        // settings
        this.alphabet = "abcdefghijklmnopqrstuvwxyz0123456789 ?!():'";
        this.tileSize = settings.tileSize;
        this.buttons = [];
        this.zoom = settings.zoom || 2;
        this.remplissage = false;
        this.state = "menu";
        // Frames per second
        this.fps = 60;
        // resources
        this.loadedResourceCount = 0;
        this.soundBox = new SoundBox(0.05, () => { this.updateProgress(); });
        this.totalResourceCount = settings.spriteSheets.length + SoundBox.getSupportedSoundCount();
        this.resources = {};
        // Initialization + loading
        this.createContext();
        this.loadResources(settings.spriteSheets, settings.keys);
        // levels
        this.levels = levels;
        this.currentLevel = 0;


        if (!localStorage['copycat']) {
            localStorage.setItem("copycat", JSON.stringify(5)); // Default "Last level" is 5.
        }
        // Recovers last save
        this.lastLevel = JSON.parse(localStorage['copycat']);
        this.cat = [];
        // Menu levels
        let self = this;
        this.menuLevels = {
            world: self,
            context: self.context,
            count: self.levels.length,
            selection: 0,
            render: function () {
                this.context.fillStyle = "#fff1e8";
                this.world.drawFrame(10, 10, this.world.width - 20, 200 - 20);
                this.world.write("select level", this.world.width / 2, 25);
                for (let i = 0; i < this.count; i++) {
                    if (i > this.world.lastLevel - 1) {
                        this.context.globalAlpha = 0.6;
                        this.world.context.drawImage(this.world.resources['lock'].img, (32 + Math.floor(i % 7) * 32) - this.world.resources['lock'].img.width / 2, (64 + Math.floor(i / 7) * 32) + 10);
                    }
                    this.world.write((i + 1).toString(), 32 + Math.floor(i % 7) * 32, 64 + Math.floor(i / 7) * 32);
                    this.context.globalAlpha = 1;
                }
                this.world.context.drawImage(this.world.resources.cursor.img, 0, 16, 32, 32, 16 + Math.floor(this.selection % 7) * 32, 51 + Math.floor(this.selection / 7) * 32, 32, 32);
            },
            change: function (keyCode) {
                if (keyCode === 38 && this.selection - 6 > 0) {
                    // up
                    this.world.soundBox.playSelectionAudio();
                    this.selection -= 7;
                    this.render();
                }
                if (keyCode === 40 && this.selection + 7 < this.world.lastLevel) {
                    // down
                    this.world.soundBox.playSelectionAudio();
                    this.selection += 7;
                    this.render();
                }
                if (keyCode === 37 && this.selection > 0) {
                    // left
                    this.world.soundBox.playSelectionAudio();
                    this.selection -= 1;
                    this.render();
                }
                if (keyCode === 39 && this.selection + 1 < this.world.lastLevel) {
                    // right
                    this.world.soundBox.playSelectionAudio();
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

    createContext() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width = 16 * 16;
        this.height = this.canvas.height = 16 * 16;
        this.canvas.style.width = this.width * this.zoom + "px";
        this.canvas.style.height = this.height * this.zoom + "px";
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;
        document.body.appendChild(this.canvas);
        console.log('%c World created ', 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');
    }

    updateProgress() {
        this.loadedResourceCount += 1;
        console.log('loaded');
        if (this.loadedResourceCount === this.totalResourceCount) {
            console.log('%c resources are loaded ' + this.loadedResourceCount + " of " + this.totalResourceCount, 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');
            // menu
            let buttons = [{
                name: "start game",
                lien: "start"
            }, {
                name: "levels",
                lien: "levels"
            }, {
                name: "how to play",
                lien: "rules"
            }, {
                name: "about",
                lien: "info"
            },];
            this.menu = new Menu(this, this.width / 2, 110, buttons);
            // End of initialization
            this.phase("menu");
            document.addEventListener("keydown", event => this.touchePresse(event), false);
            document.addEventListener("keyup", event => this.toucheLache(event), false);
        } else {
            // Loading screen
            this.context.fillStyle = "#000";
            this.context.fillRect(0, 0, this.width, this.height);
            this.context.fillStyle = "#fff";
            this.context.fillRect(0, (this.height / 2) - 1, (this.loadedResourceCount * this.width) / this.totalResourceCount, 2);
        }
    }

    loadImage(url) {
        let img = new Image();
        let self = this;
        img.onload = function () {
            self.updateProgress();
        };
        img.src = url;
        return img;
    }

    loadResources(spriteSheets, keys) {
        // traitement images
        let images = {};
        for (let i = 0; i < spriteSheets.length; i++) {
            spriteSheets[i].img = this.loadImage(spriteSheets[i].url);
            images[spriteSheets[i].name] = spriteSheets[i];
        }
        this.resources = images;

        //  Key processing
        this.nettoyer = new Array(keys.length).fill(false);
        let CM = {};
        for (let i = 0; i < keys.length; i++) {
            let name = keys[i].id;
            if (keys[i].type === "sprite") {
                keys[i].frame = 0;
                keys[i].spriteSheet = this.resources[keys[i].apparence];
                keys[i].memoireBoucle = false;
                keys[i].canAnimate = true;
                keys[i].isAnimated = true;
            }
            CM[name] = keys[i];
        }
        this.keys = CM;
    }

    /* Events */
    touchePresse(event) {
        this.buttons[event.keyCode] = true;
        if (this.buttons[70]) {
            this.activeRemplissage();
        }
        switch (this.state) {
            case "menu":
                this.menu.change(event.keyCode);
                break;
            case "start":
                if (this.buttons[69] && this.animation) {
                    this.soundBox.playValidationAudio();
                    this.phase("menu")
                }
                if (this.buttons[82] && this.animation) {
                    this.soundBox.playValidationAudio();
                    cancelAnimationFrame(this.animation);
                    this.animation = null;
                    this.isStopped = true;
                    this.outro();
                }
                break;
            case "fin":
                if (this.buttons[67]) {
                    this.soundBox.playValidationAudio();
                    this.phase("menu")
                }
                break;
            case "rules":
                if (this.buttons[67]) {
                    this.soundBox.playValidationAudio();
                    this.phase("menu")
                }
                break;
            case "info":
                if (this.buttons[67]) {
                    this.soundBox.playValidationAudio();
                    this.phase("menu")
                }
                break;
            case "levels":
                this.menuLevels.change(event.keyCode);
                if (this.buttons[67]) {
                    this.soundBox.playValidationAudio();
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

    toucheLache(event) {
        this.buttons[event.keyCode] = false;
    }

    activeRemplissage() {
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
    findKey(keyToFind) {
        let blockRecherche = [];
        for (let j = 0; j < this.board.size.height; j++) {
            for (let i = 0; i < this.board.size.width; i++) {
                let id = this.board.cells[j][i];
                if (this.keys[id].name === keyToFind) {
                    let info = {
                        position: {
                            x: i,
                            y: j
                        }
                    };
                    blockRecherche.push(info);
                }
            }
        }
        return blockRecherche;
    }

    infoClef(x, y) {
        if (x > -1 && x < this.board.size.width && y > -1 && y < this.board.size.height) {
            return this.keys[this.board.cells[y][x]];
        } else {
            return false;
        }
    }

    write(text, x, y) {
        let width = 6;
        let height = 9;
        let centre = (text.length * width) / 2;
        for (let i = 0; i < text.length; i++) {
            let index = this.alphabet.indexOf(text.charAt(i)),
                clipX = width * index,
                posX = (x - centre) + (i * width);
            this.context.drawImage(this.resources['pixelFont'].img, clipX, 0, width, height, posX, y, width, height);
        }
    }

    drawFrame(x, y, width, height) {
        this.context.fillStyle = "#fff1e8";
        // Draws background
        this.context.fillRect(x + 1, y + 1, width - 2, height - 2);

        // Draws edges

        /* Top left */
        this.context.drawImage(this.resources.cursor.img, 32, 16, 16, 16, x, y, 16, 16);
        /* Top right */
        this.context.drawImage(this.resources.cursor.img, 32 + 8, 16, 16, 16, x + width - 16, y, 16, 16);
        /* Bottom left */
        this.context.drawImage(this.resources.cursor.img, 32, 16 + 8, 16, 16, x, y + height - 16, 16, 16);
        /* Bottom right */
        this.context.drawImage(this.resources.cursor.img, 32 + 8, 16 + 8, 16, 16, x + width - 16, y + height - 16, 16, 16);
        /* Top */
        this.context.drawImage(this.resources.cursor.img, 32 + 4, 16, 16, 16, x + 16, y, width - 32, 16);
        /* Bottom */
        this.context.drawImage(this.resources.cursor.img, 32 + 4, 16 + 8, 16, 16, x + 16, y + height - 16, width - 32, 16);
        /* Left */
        this.context.drawImage(this.resources.cursor.img, 32, 16 + 4, 16, 16, x, y + 16, 16, height - 32);
        /* Right */
        this.context.drawImage(this.resources.cursor.img, 32 + 8, 16 + 4, 16, 16, x + width - 16, y + 16, 16, height - 32);
    }

    bitMasking() {
        this.board.apparence = [];
        for (let j = 0; j < this.board.size.height; j++) {
            for (let i = 0; i < this.board.size.width; i++) {
                let id = this.board.cells[j][i];
                // up left right down
                let neighbor = [0, 0, 0, 0];
                if (j - 1 > -1) {
                    if (id === this.board.cells[j - 1][i]) {
                        neighbor[0] = 1; //up
                    }
                } else {
                    neighbor[0] = 1;
                }
                if (i - 1 > -1) {
                    if (id === this.board.cells[j][i - 1]) {
                        neighbor[1] = 1; // left
                    }
                } else {
                    neighbor[1] = 1;
                }
                if (i + 1 < this.board.size.width) {
                    if (id === this.board.cells[j][i + 1]) {
                        neighbor[2] = 1; // right
                    }
                } else {
                    neighbor[2] = 1;
                }
                if (j + 1 < this.board.size.height) {
                    if (id === this.board.cells[j + 1][i]) {
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
        this.board.apparence = ArrayChunker.chunkArray(this.board.apparence, this.board.size.width);
    }

    renderTerrain() {
        let sourceX;
        let sourceY;
        for (let j = 0; j < this.board.size.height; j++) {
            for (let i = 0; i < this.board.size.width; i++) {
                let id = this.board.cells[j][i];
                if (this.keys[id].apparence === "auto") {
                    sourceX = Math.floor(this.board.apparence[j][i]) * this.tileSize;
                    sourceY = Math.floor(this.board.apparence[j][i]) * this.tileSize;
                    this.context.drawImage(this.resources['tiles'].img,
                        sourceX, this.keys[id].rowIndex * this.tileSize, this.tileSize, this.tileSize,
                        i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);
                } else if (this.keys[id].type === "sprite") {
                    if (!this.keys[id].memoireBoucle) {
                        if (this.keys[id].canAnimate) {
                            this.keys[id].frame += this.keys[id].allure;
                        }
                        if (this.keys[id].frame >= this.keys[id].spriteSheet.spriteCount) {
                            if (!this.keys[id].isAnimated) {
                                this.keys[id].canAnimate = false;
                            }
                            this.keys[id].frame = 0;
                        }
                        this.keys[id].memoireBoucle = true;
                        // on sait quel id est déjà passé :^)
                        this.nettoyer[id] = true;
                    }
                    this.context.drawImage(this.keys[id].spriteSheet.img, Math.floor(this.keys[id].frame) * this.tileSize, 0, this.tileSize, this.tileSize, i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);
                } else {
                    sourceX = Math.floor(this.keys[id].apparence % 16) * this.tileSize;
                    sourceY = Math.floor(this.keys[id].apparence / 16) * this.tileSize;
                    this.context.drawImage(this.resources['tiles'].img, sourceX, sourceY, this.tileSize, this.tileSize, i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
        for (let i = 0; i < this.nettoyer.length; i++) {
            if (this.nettoyer[i]) {
                this.keys[i].memoireBoucle = false;
            }
        }
        if (this.levels[this.currentLevel].comment) {
            this.drawFrame(0, this.height - 32, this.width, 32);
            this.write(this.levels[this.currentLevel].comment, this.width / 2, this.height - 20);
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
        this.board.cells = JSON.parse(JSON.stringify(this.levels[this.currentLevel].cells));
        this.board.size = {
            width: this.board.cells[0].length,
            height: this.board.cells.length
        };
        this.board.apparence = [];
        this.bitMasking();
    }

    initPlayer() {
        this.effects = [];
        this.cat = [];
        let posCat = this.findKey("player");
        for (let i = 0; i < posCat.length; i++) {
            this.cat.push(new Character(this, posCat[i].position.x, posCat[i].position.y, this.resources['playerSprite']));
        }
    }

    render() {
        let i;
        this.renderTerrain();
        for (i = 0; i < this.cat.length; i++) {
            this.cat[i].render();
        }
        for (i = this.effects.length - 1; i >= 0; i--) {
            this.effects[i].render();
        }
        // afficher comment
    }

    animate() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.width, this.height);
        this.render();
        if (!this.isStopped) {
            this.animation = requestAnimationFrame(() => this.animate());
        }
    }

    outro() {

        cancelAnimationFrame(this.animation);
        this.animation = null;
        this.isStopped = true;

        this.context.fillStyle = "black";
        let x = 0;
        let targetX = this.height / 2;
        let currentX = 0;
        let world = this;
        this.transition.time = new Date();
        animate();

        function animate() {
            let time = new Date() - world.transition.time;
            if (time < world.transition.duration) {
                world.context.fillRect(0, 0, world.width, x);
                world.context.fillRect(0, world.height, world.width, x * -1);
                x = Math.easeInOutQuart(time, currentX, targetX - currentX, world.transition.duration);
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
        let x = this.height / 2;
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
                world.context.fillRect(0, 0, world.width, x);
                world.context.fillRect(0, world.height, world.width, x * -1);
                x = Math.easeInOutQuart(time, currentX, targetX - currentX, world.transition.duration);
                requestAnimationFrame(animate);
            } else {

                world.initPlayer();

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
                let pattern = this.context.createPattern(this.resources['pattern'].img, "repeat");
                this.context.fillStyle = pattern;
                this.context.fillRect(0, 0, this.width, this.height);

                this.context.drawImage(this.resources['title'].img, 0, 0);
                this.menu.render();
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 18);
                this.write("arrow keys to select 'x' to confirm", this.width / 2, this.height - 30);
                break;
            case "start":
                this.intro();
                break;
            case "fin": // Displays the player's death chart
                this.write("thanks for playing :) !", this.width / 2, 15);
                this.write("if you have something to tell me about", this.width / 2, 40);
                this.write("this pen please do so", this.width / 2, 55);
                this.write("in the comment section.", this.width / 2, 70);
                this.write("any feedback is appreciated", this.width / 2, 85);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 18);
                this.write("press 'c' to return to menu", this.width / 2, this.height - 30);
                break;
            case "rules": // Displays rules
                this.write("game control: ", this.width / 2, 15);
                this.write("arrow keys to move", this.width / 2, 60);
                this.write("'f' to toggle fullscreen", this.width / 2, 80);
                this.write("'r' if you're stuck", this.width / 2, 100);
                this.write("'e' to exit the game", this.width / 2, 120);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 18);
                this.write("press 'c' to return to menu", this.width / 2, this.height - 30);
                break;
            case "info": // Displays infos
                this.write("about: ", this.width / 2, 15);
                this.write("made with html5 canvas", this.width / 2, 40);
                this.write("by gtibo on codepen", this.width / 2, 55);
                this.write("credits:", this.width / 2, 80);
                this.write("sound effects: noiseforfun.com", this.width / 2, 100);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 18);
                this.write("press 'c' to return to menu", this.width / 2, this.height - 30);
                break;
            case "levels": // Displays menu levels
                this.menuLevels.render();
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.height - 35, this.width, 28);
                this.write("arrow keys to select 'x' to confirm", this.width / 2, this.height - 30);
                this.write("press 'c' to return to menu", this.width / 2, this.height - 20);
                break;
            default:
                console.log("aucune action reconnue");
        }
    }

    action(action) {
        switch (action) {
            case "nextLevel":
                let tab = [];
                for (let i = 0; i < this.cat.length; i++) {
                    tab.push(this.cat[i].validation);
                }
                let confirmation = tab.every(function (vrai) {
                    return vrai === true;
                });
                if (confirmation) {
                    this.currentLevel += 1;
                    if (this.lastLevel < this.currentLevel) {
                        this.lastLevel = this.currentLevel;
                        localStorage.setItem("copycat", JSON.stringify(this.currentLevel));
                    }
                    this.outro();
                    this.soundBox.playSuccessAudio();
                }

                break;
            case "other":
                break;
            default:
                console.log("Invalid action");
        }
    }
}