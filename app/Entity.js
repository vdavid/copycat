import {Effect} from './Effect';
import {Sprite} from './Sprite';

export class Entity {
    constructor(world, x, y, sprite) {
        this.world = world;
        this.limite = world.limite;
        this.context = world.context;
        this.pos = {
            x: x,
            y: y
        };
        this.size = world.size;
        this.cible = {
            x: this.pos.x * this.size,
            y: this.pos.y * this.size,
        };
        this.depart = {
            x: this.pos.x * this.size,
            y: this.pos.y * this.size,
        };
        this.sprite = new Sprite(this.world, this, sprite);
        this.transition = {
            state: false,
            time: null,
            duration: 200,
            style: "marche"
        };
        this.derniereDirection = "none";
        this.peutBouger = true;
        this.collision = false;
        this.validation = false;
        this.world.sounds.appearance.url.play();
        this.world.effets.push(new Effect(this.world, this.depart.x, this.depart.y, this.world.resources.explosion));
    }

    controles() {
        if (!this.transition.state && this.peutBouger) {
            if (this.world.buttons[38]) {
                this.diriger("haut");
            }
            if (this.world.buttons[39]) {
                this.diriger("droite");
            }
            if (this.world.buttons[37]) {
                this.diriger("gauche");
            }
            if (this.world.buttons[40]) {
                this.diriger("bas");
            }
        }
    }

    diriger(direction) {
        let mouvement = {};
        switch (direction) {
            case "gauche":
                mouvement = {
                    x: this.pos.x - 1,
                    y: this.pos.y
                };
                break;
            case "droite":
                mouvement = {
                    x: this.pos.x + 1,
                    y: this.pos.y
                };
                break;
            case "bas":
                mouvement = {
                    x: this.pos.x,
                    y: this.pos.y + 1
                };
                break;
            case "haut":
                mouvement = {
                    x: this.pos.x,
                    y: this.pos.y - 1
                };
                break;
        }
        this.deplacer(mouvement, direction);
    }

    deplacer(coordonne, direction) {
        if (!this.transition.state) {
            this.tuileCible = this.world.infoClef(coordonne.x, coordonne.y);
            if (!this.tuileCible.collision) {
                if (this.tuileCible.action === "glace") {
                    this.transition.style = "glace";
                    this.transition.duration = 80;
                } else {
                    this.transition.style = "marche";
                    this.transition.duration = 200;
                }
                this.collision = false;
                this.validation = false;
                this.transition.state = true;
                this.derniereDirection = direction;
                this.transition.time = new Date();
                this.pos.x = coordonne.x;
                this.pos.y = coordonne.y;
                this.cible.x = this.pos.x * this.size;
                this.cible.y = this.pos.y * this.size;
            } else {
                this.collision = true;
            }
        }
    }

    translation() {
        if (this.transition.state) {
            let time = new Date() - this.transition.time;
            if (time < this.transition.duration) {
                if (this.transition.style === "marche") {
                    this.sprite.pos.x = Math.easeInOutQuart(time, this.depart.x, this.cible.x - this.depart.x, this.transition.duration);
                    this.sprite.pos.y = Math.easeInOutQuart(time, this.depart.y, this.cible.y - this.depart.y, this.transition.duration);
                } else {
                    this.sprite.pos.x = Math.linearTween(time, this.depart.x, this.cible.x - this.depart.x, this.transition.duration);
                    this.sprite.pos.y = Math.linearTween(time, this.depart.y, this.cible.y - this.depart.y, this.transition.duration);
                }
            } else {
                this.transition.state = false;
                this.sprite.pos.x = this.cible.x;
                this.sprite.pos.y = this.cible.y;
                this.depart.x = this.cible.x;
                this.depart.y = this.cible.y;
                // en fonction du type de sol
                switch (this.tuileCible.action) {
                    case "glace":
                        this.diriger(this.derniereDirection);
                        this.peutBouger = this.collision;
                        break;
                    case "gauche":
                        this.world.sounds.validation.url.play();
                        this.peutBouger = false;
                        this.diriger("gauche");
                        break;
                    case "haut":
                        this.world.sounds.validation.url.play();
                        this.peutBouger = false;
                        this.diriger("haut");
                        break;
                    case "bas":
                        this.world.sounds.validation.url.play();
                        this.peutBouger = false;
                        this.diriger("bas");
                        break;
                    case "droite":
                        this.world.sounds.validation.url.play();
                        this.peutBouger = false;
                        this.diriger("droite");
                        break;
                    case "piege":
                        this.world.sounds.eboulement.url.play();
                        this.world.effets.push(new Effect(this.world, this.pos.x * this.size, this.pos.y * this.size, this.world.resources.poussiere));
                        this.world.terrain.geometrie[this.pos.y][this.pos.x] = 7;
                        this.peutBouger = true;
                        break;
                    case "suivant":
                        this.validation = true;
                        this.peutBouger = true;
                        this.world.action("suivant");
                        break;
                    default:
                        this.world.sounds.mouvement.url.play();
                        this.peutBouger = true;
                        this.validation = false;
                    // sol normal
                }
            }
        }
    }

    render() {
        this.sprite.render();
        this.translation();
        this.controles();
    }
}
