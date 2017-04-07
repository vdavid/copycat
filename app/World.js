import {Menu} from './Menu';
import {Entity} from './Entity';
import {ArrayChunker} from './ArrayChunker';

export class World {
    constructor(settings, levels) {
        // settings
        this.alphabet = "abcdefghijklmnopqrstuvwxyz0123456789 ?!():'";
        this.size = settings.size;
        this.buttons = [];
        this.zoom = settings.zoom || 2;
        this.remplissage = false;
        this.state = "menu";
        // fps
        this.fps = 60;
        // ressources
        this.prop = {
            compte: 0,
            imageCount: settings.stockImages.length + settings.stockSon.length
        };
        this.resources = {};
        // volume
        this.volumePrincipal = 0.05;
        // Chargement + lancement
        this.creerContexte();
        if (this.prop !== 0) {
            this.traitement(settings.stockImages, settings.stockSon, settings.clefs);
        }
        // levels
        this.levels = levels;
        this.niveauActuel = 0;
        // on recupere la derniere sauvegarde
        if (localStorage.copycat) {
            console.info('mémoire récupérée');
            this.niveauMax = JSON.parse(localStorage.copycat);
        } else {
            // s'il n'y a rien on genere une mémoire
            localStorage.setItem("copycat", JSON.stringify(5));
            this.niveauMax = JSON.parse(localStorage.copycat);
        }
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
                this.world.boite(10, 10, this.world.L - 20, 200 - 20);
                this.world.ecrire("select level", this.world.L / 2, 25);
                for (let i = 0; i < this.count; i++) {
                    let numero = i + 1;
                    if (i > this.world.niveauMax - 1) {
                        this.context.globalAlpha = 0.6;
                        this.world.context.drawImage(this.world.resources.lock.img, (32 + Math.floor(i % 7) * 32) - this.world.resources.lock.img.width / 2, (64 + Math.floor(i / 7) * 32) + 10);
                    }
                    this.world.ecrire(numero.toString(), 32 + Math.floor(i % 7) * 32, 64 + Math.floor(i / 7) * 32);
                    this.context.globalAlpha = 1;
                }
                this.world.context.drawImage(this.world.resources.cursor.img, 0, 16, 32, 32, 16 + Math.floor(this.selection % 7) * 32, 51 + Math.floor(this.selection / 7) * 32, 32, 32);
            },
            change: function (keyCode) {
                if (keyCode === 38 && this.selection - 6 > 0) {
                    // haut
                    this.world.sounds.selection.url.play();
                    this.selection -= 7;
                    this.render();
                }
                if (keyCode === 40 && this.selection + 7 < this.world.niveauMax) {
                    // bas
                    this.world.sounds.selection.url.play();
                    this.selection += 7;
                    this.render();
                }
                if (keyCode === 37 && this.selection > 0) {
                    // gauche
                    this.world.sounds.selection.url.play();
                    this.selection -= 1;
                    this.render();
                }
                if (keyCode === 39 && this.selection + 1 < this.world.niveauMax) {
                    // droit
                    this.world.sounds.selection.url.play();
                    this.selection += 1;
                    this.render();
                }
            }
        };
        //transition
        this.transition = {
            duration: 800,
        };
        this.effets = [];
    }

    creerContexte() {
        this.toile = document.createElement("canvas");
        this.context = this.toile.getContext('2d');
        this.L = this.toile.width = 16 * 16;
        this.H = this.toile.height = 16 * 16;
        this.limite = {
            x: this.L,
            y: this.H
        };
        this.toile.style.width = this.L * this.zoom + "px";
        this.toile.style.height = this.H * this.zoom + "px";
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;
        document.body.appendChild(this.toile);
        console.log('%c World créé ', 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');
    }

    /*
     _____ _                                               _
     / ____| |                                             | |
     | |    | |__   __ _ _ __ __ _  ___ _ __ ___   ___ _ __ | |_
     | |    | '_ \ / _` | '__/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
     | |____| | | | (_| | | | (_| |  __/ | | | | |  __/ | | | |_
     \_____|_| |_|\__,_|_|  \__, |\___|_| |_| |_|\___|_| |_|\__|
     __/ |
     |___/
     */
    chargement() {
        this.prop.compte += 1;
        if (this.prop.compte === this.prop.imageCount) {
            console.log('%c les ressources sont chargées ' + this.prop.imageCount + " / " + this.prop.imageCount, 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');
            // menu
            let bouttons = [{
                name: "start game",
                lien: "start"
            }, {
                name: "levels",
                lien: "levels"
            }, {
                name: "how to play",
                lien: "regles"
            }, {
                name: "about",
                lien: "info"
            },];
            this.menu = new Menu(this, this.L / 2, 110, bouttons);
            // Fin de chargement
            this.phase("menu");
            document.addEventListener("keydown", event => this.touchePresse(event), false);
            document.addEventListener("keyup", event => this.toucheLache(event), false);
        } else {
            // écran de chargement
            this.context.fillStyle = "#000";
            this.context.fillRect(0, 0, this.L, this.H);
            this.context.fillStyle = "#fff";
            this.context.fillRect(0, (this.H / 2) - 1, (this.prop.compte * this.L) / this.prop.imageCount, 2);
        }
    }

    chargerImages(url) {
        let img = new Image();
        let self = this;
        img.onload = function () {
            self.chargement();
        };
        img.src = url;
        return img;
    }

    chargerSon(url) {
        let audio = new Audio(url);
        audio.addEventListener('canplaythrough', this.chargement(), false);
        audio.volume = this.volumePrincipal;
        return audio;
    }

    traitement(stockImages, stockSon, clefs) {
        // traitement images
        let IM = {};
        for (let i = 0; i < stockImages.length; i++) {
            let sujet = stockImages[i];
            let name = sujet.name;
            sujet.img = this.chargerImages(stockImages[i].img);
            IM[name] = stockImages[i];
        }
        this.resources = IM;
        // traitement images
        let IS = {};
        for (let i = 0; i < stockSon.length; i++) {
            let sujet = stockSon[i];
            let name = sujet.name;
            sujet.url = this.chargerSon(stockSon[i].url);
            IS[name] = stockSon[i];
        }
        this.sounds = IS;
        //  traitement clefs
        this.nettoyer = new Array(clefs.length).fill(false);
        let CM = {};
        for (let i = 0; i < clefs.length; i++) {
            let sujet = clefs[i];
            let name = sujet.id;
            if (sujet.type === "sprite") {
                sujet.frame = 0;
                sujet.sprite = this.resources[sujet.apparence];
                sujet.memoireBoucle = false;
                sujet.peutAnimer = true;
                sujet.boucle = true;
            }
            CM[name] = clefs[i];
        }
        this.clefs = CM;
    }

    /*
     ______      __                                 _
     |  ____|    /_/                                | |
     | |____   _____ _ __   ___ _ __ ___   ___ _ __ | |_
     |  __\ \ / / _ \ '_ \ / _ \ '_ ` _ \ / _ \ '_ \| __|
     | |___\ V /  __/ | | |  __/ | | | | |  __/ | | | |_
     |______\_/ \___|_| |_|\___|_| |_| |_|\___|_| |_|\__|


     */
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
                    this.sounds.validation.url.play();
                    this.phase("menu")
                }
                if (this.buttons[82] && this.animation) {
                    this.sounds.validation.url.play();
                    cancelAnimationFrame(this.animation);
                    this.animation = null;
                    this.arret = true;
                    this.outro();
                }
                break;
            case "fin":
                if (this.buttons[67]) {
                    this.sounds.validation.url.play();
                    this.phase("menu")
                }
                break;
            case "regles":
                if (this.buttons[67]) {
                    this.sounds.validation.url.play();
                    this.phase("menu")
                }
                break;
            case "info":
                if (this.buttons[67]) {
                    this.sounds.validation.url.play();
                    this.phase("menu")
                }
                break;
            case "levels":
                this.menuLevels.change(event.keyCode);
                if (this.buttons[67]) {
                    this.sounds.validation.url.play();
                    this.phase("menu")
                }
                if (this.buttons[88]) {
                    this.niveauActuel = this.menuLevels.selection;
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
            this.toile.webkitRequestFullScreen();
            this.remplissage = true;
            this.toile.style.width = "100vmin";
            this.toile.style.height = "100vmin";
        } else {
            document.webkitCancelFullScreen();
            this.remplissage = false;
            this.toile.style.width = this.L * this.zoom + "px";
            this.toile.style.height = this.H * this.zoom + "px";
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
    chercheClef(recherche) {
        let blockRecherche = [];
        for (let j = 0; j < this.terrain.dimension.y; j++) {
            for (let i = 0; i < this.terrain.dimension.x; i++) {
                let id = this.terrain.geometrie[j][i];
                if (this.clefs[id].name === recherche) {
                    let info = {
                        pos: {
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
        if (x > -1 && x < this.terrain.dimension.x && y > -1 && y < this.terrain.dimension.y) {
            return this.clefs[this.terrain.geometrie[y][x]];
        } else {
            return false;
        }
    }

    ecrire(texte, x, y) {
        let largeur = 6,
            hauteur = 9;
        let centre = (texte.length * largeur) / 2;
        for (let i = 0; i < texte.length; i++) {
            let index = this.alphabet.indexOf(texte.charAt(i)),
                clipX = largeur * index,
                posX = (x - centre) + (i * largeur);
            this.context.drawImage(this.resources.pixelFont.img, clipX, 0, largeur, hauteur, posX, y, largeur, hauteur);
        }
    }

    boite(x, y, l, h) {
        this.context.fillStyle = "#fff1e8";
        // dessiner le fond
        this.context.fillRect(x + 1, y + 1, l - 2, h - 2);
        // dessiner les bords
        //haut Gauche
        this.context.drawImage(this.resources.cursor.img, 32, 16, 16, 16, x, y, 16, 16);
        //haut Droit
        this.context.drawImage(this.resources.cursor.img, 32 + 8, 16, 16, 16, x + l - 16, y, 16, 16);
        //bas Gauche
        this.context.drawImage(this.resources.cursor.img, 32, 16 + 8, 16, 16, x, y + h - 16, 16, 16);
        //bas Gauche
        this.context.drawImage(this.resources.cursor.img, 32 + 8, 16 + 8, 16, 16, x + l - 16, y + h - 16, 16, 16);
        // haut
        this.context.drawImage(this.resources.cursor.img, 32 + 4, 16, 16, 16, x + 16, y, l - 32, 16);
        // bas
        this.context.drawImage(this.resources.cursor.img, 32 + 4, 16 + 8, 16, 16, x + 16, y + h - 16, l - 32, 16);
        // gauche
        this.context.drawImage(this.resources.cursor.img, 32, 16 + 4, 16, 16, x, y + 16, 16, h - 32);
        // droit
        this.context.drawImage(this.resources.cursor.img, 32 + 8, 16 + 4, 16, 16, x + l - 16, y + 16, 16, h - 32);
    }

    bitMasking() {
        //let tuileBitMask = [];
        let compte = 0;
        this.terrain.apparence = [];
        for (let j = 0; j < this.terrain.dimension.y; j++) {
            for (let i = 0; i < this.terrain.dimension.x; i++) {
                let id = this.terrain.geometrie[j][i];
                // haut gauche droit bas
                let voisine = [0, 0, 0, 0];
                compte += 1;
                if (j - 1 > -1) {
                    if (id === this.terrain.geometrie[j - 1][i]) {
                        //haut
                        voisine[0] = 1;
                    }
                } else {
                    voisine[0] = 1;
                }
                if (i - 1 > -1) {
                    if (id === this.terrain.geometrie[j][i - 1]) {
                        // gauche
                        voisine[1] = 1;
                    }
                } else {
                    voisine[1] = 1;
                }
                if (i + 1 < this.terrain.dimension.x) {
                    if (id === this.terrain.geometrie[j][i + 1]) {
                        // droite
                        voisine[2] = 1;
                    }
                } else {
                    voisine[2] = 1;
                }
                if (j + 1 < this.terrain.dimension.y) {
                    if (id === this.terrain.geometrie[j + 1][i]) {
                        //bas
                        voisine[3] = 1;
                    }
                } else {
                    voisine[3] = 1;
                }
                //noinspection PointlessArithmeticExpressionJS
                id = 1 * voisine[0] + 2 * voisine[1] + 4 * voisine[2] + 8 * voisine[3];
                this.terrain.apparence.push(id);
            }
        }
        this.terrain.apparence = ArrayChunker.chunkArray(this.terrain.apparence, this.terrain.dimension.x);
    }

    renderTerrain() {
        let sourceY;
        let sourceX;
        for (let j = 0; j < this.terrain.dimension.y; j++) {
            for (let i = 0; i < this.terrain.dimension.x; i++) {
                let id = this.terrain.geometrie[j][i];
                if (this.clefs[id].apparence === "auto") {
                    sourceX = Math.floor(this.terrain.apparence[j][i]) * this.size;
                    sourceY = Math.floor(this.terrain.apparence[j][i]) * this.size;
                    this.context.drawImage(this.resources.feuille.img, sourceX, this.clefs[id].ligne * this.size, this.size, this.size, i * this.size, j * this.size, this.size, this.size);
                } else if (this.clefs[id].type === "sprite") {
                    if (!this.clefs[id].memoireBoucle) {
                        if (this.clefs[id].peutAnimer) {
                            this.clefs[id].frame += this.clefs[id].allure;
                        }
                        if (this.clefs[id].frame >= this.clefs[id].sprite.sep) {
                            if (!this.clefs[id].boucle) {
                                this.clefs[id].peutAnimer = false;
                            }
                            this.clefs[id].frame = 0;
                        }
                        this.clefs[id].memoireBoucle = true;
                        // on sait quel id est déjà passé :^)
                        this.nettoyer[id] = true;
                    }
                    this.context.drawImage(this.clefs[id].sprite.img, Math.floor(this.clefs[id].frame) * this.size, 0, this.size, this.size, i * this.size, j * this.size, this.size, this.size);
                } else {
                    sourceX = Math.floor(this.clefs[id].apparence % 16) * this.size;
                    sourceY = Math.floor(this.clefs[id].apparence / 16) * this.size;
                    this.context.drawImage(this.resources.feuille.img, sourceX, sourceY, this.size, this.size, i * this.size, j * this.size, this.size, this.size);
                }
            }
        }
        for (let i = 0; i < this.nettoyer.length; i++) {
            if (this.nettoyer[i]) {
                this.clefs[i].memoireBoucle = false;
            }
        }
        if (this.levels[this.niveauActuel].indice) {
            this.boite(0, this.H - 32, this.L, 32);
            this.ecrire(this.levels[this.niveauActuel].indice, this.L / 2, this.H - 20);
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
    initialiserMap() {
        this.terrain = {};
        this.arret = false;
        this.terrain.geometrie = JSON.parse(JSON.stringify(this.levels[this.niveauActuel].geometrie));
        this.terrain.dimension = {
            x: this.terrain.geometrie[0].length,
            y: this.terrain.geometrie.length
        };
        this.terrain.apparence = [];
        this.bitMasking();
    }

    initPlayer() {
        this.effets = [];
        this.cat = [];
        let posCat = this.chercheClef("player");
        for (let i = 0; i < posCat.length; i++) {
            this.cat.push(new Entity(this, posCat[i].pos.x, posCat[i].pos.y, this.resources.playerSprite));
        }
    }

    render() {
        let i;
        this.renderTerrain();
        for (i = 0; i < this.cat.length; i++) {
            this.cat[i].render();
        }
        for (i = this.effets.length - 1; i >= 0; i--) {
            this.effets[i].render();
        }
        // afficher indice
    }

    boucle() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.L, this.H);
        this.render();
        if (!this.arret) {
            this.animation = requestAnimationFrame(() => this.boucle());
        }
    }

    outro() {

        cancelAnimationFrame(this.animation);
        this.animation = null;
        this.arret = true;

        this.context.fillStyle = "black";
        let x = 0;
        let cibleX = this.H / 2;
        let departX = 0;
        let world = this;
        this.transition.time = new Date();
        boucle();

        function boucle() {
            let time = new Date() - world.transition.time;
            if (time < world.transition.duration) {
                world.context.fillRect(0, 0, world.L, x);
                world.context.fillRect(0, world.H, world.L, x * -1);
                x = Math.easeInOutQuart(time, departX, cibleX - departX, world.transition.duration);
                requestAnimationFrame(boucle);
            } else {
                if (world.niveauActuel < world.levels.length) {
                    world.phase("start");
                    cancelAnimationFrame(boucle);
                } else {
                    // fin du jeu
                    world.arret = true;
                    world.phase("fin");
                    world.niveauActuel = 0;
                }
            }
        }
    }

    intro() {
        this.initialiserMap();
        let x = this.H / 2;
        let cibleX = 0;
        let departX = this.H / 2;
        let world = this;
        this.transition.time = new Date();
        boucle();

        function boucle() {
            let time = new Date() - world.transition.time;
            if (time < world.transition.duration) {
                world.renderTerrain();
                world.context.fillStyle = "black";
                world.context.fillRect(0, 0, world.L, x);
                world.context.fillRect(0, world.H, world.L, x * -1);
                x = Math.easeInOutQuart(time, departX, cibleX - departX, world.transition.duration);
                requestAnimationFrame(boucle);
            } else {

                world.initPlayer();

                world.boucle();
                cancelAnimationFrame(boucle);
            }
        }
    }

    phase(phase) {
        this.state = phase;
        cancelAnimationFrame(this.animation);
        this.animation = null;
        this.context.fillStyle = "#fff1e8";
        this.context.fillRect(0, 0, this.L, this.H);
        switch (phase) {
            case "menu":
                // affiche le menu du jeu

                let pat = this.context.createPattern(this.resources.pattern.img, "repeat");
                this.context.fillStyle = pat;
                this.context.fillRect(0, 0, this.L, this.H);

                this.context.drawImage(this.resources.titre.img, 0, 0);
                this.menu.render();
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.H - 35, this.L, 18);
                this.ecrire("arrow keys to select 'x' to confirm", this.L / 2, this.H - 30);
                break;
            case "start":
                this.intro();
                break;
            case "fin":
                // affiche le tableau de mort du joueur
                this.ecrire("thanks for playing :) !", this.L / 2, 15);
                this.ecrire("if you have something to tell me about", this.L / 2, 40);
                this.ecrire("this pen please do so", this.L / 2, 55);
                this.ecrire("in the comment section.", this.L / 2, 70);
                this.ecrire("any feedback is appreciated", this.L / 2, 85);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.H - 35, this.L, 18);
                this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
                break;
            case "regles":
                // affiche les regles
                this.ecrire("game control : ", this.L / 2, 15);
                this.ecrire("arrow keys to move", this.L / 2, 60);
                this.ecrire("'f' to toggle fullscreen", this.L / 2, 80);
                this.ecrire("'r' if you're stuck", this.L / 2, 100);
                this.ecrire("'e' to exit the game", this.L / 2, 120);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.H - 35, this.L, 18);
                this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
                break;
            case "info":
                // Affiche les infos
                this.ecrire("about : ", this.L / 2, 15);
                this.ecrire("made with html5 canvas", this.L / 2, 40);
                this.ecrire("by gtibo on codepen", this.L / 2, 55);
                this.ecrire("credits:", this.L / 2, 80);
                this.ecrire("sound effect : noiseforfun.com", this.L / 2, 100);
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.H - 35, this.L, 18);
                this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
                break;
            case "levels":
                // Afficher menu levels
                this.menuLevels.render();
                this.context.fillStyle = "#83769c";
                this.context.fillRect(0, this.H - 35, this.L, 28);
                this.ecrire("arrow keys to select 'x' to confirm", this.L / 2, this.H - 30);
                this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 20);
                break;
            default:
                console.log("aucune action reconnue");
        }
    }

    action(action) {
        switch (action) {
            case "suivant":
                let tab = [];
                for (let i = 0; i < this.cat.length; i++) {
                    tab.push(this.cat[i].validation);
                }
                let confirmation = tab.every(function (vrai) {
                    return vrai === true;
                });
                if (confirmation) {
                    this.niveauActuel += 1;
                    if (this.niveauMax < this.niveauActuel) {
                        this.niveauMax = this.niveauActuel;
                        localStorage.setItem("copycat", JSON.stringify(this.niveauActuel));
                    }
                    this.outro();
                    this.sounds.bravo.url.play();
                }

                break;
            case "autre":
                break;
            default:
                console.log("aucune action reconnue");
        }
    }
}