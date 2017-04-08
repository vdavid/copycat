import {Effect} from "./Effect";
import {Sprite} from "./Sprite";

export class Entity {
    constructor(world, x, y, sprite) {
        this.world = world;
        this.limite = world.limite;
        this.context = world.context;
        this.position = {
            x: x,
            y: y
        };
        this.tileSize = world.tileSize;
        this.target = {
            x: this.position.x * this.tileSize,
            y: this.position.y * this.tileSize,
        };
        this.currentLocation = {
            x: this.position.x * this.tileSize,
            y: this.position.y * this.tileSize,
        };
        this.spriteSheet = new Sprite(this.world, this, sprite);
        this.transition = {
            state: false,
            time: null,
            duration: 200,
            style: "walk"
        };
        this.lastDirection = "none";
        this.canMove = true;
        this.collision = false;
        this.validation = false;
        this.world.sounds.appearance.url.play();
        this.world.effects.push(new Effect(this.world, this.currentLocation.x, this.currentLocation.y, this.world.resources.explosion));
    }

    control() {
        if (!this.transition.state && this.canMove) {
            if (this.world.buttons[38]) {
                this.diriger("up");
            }
            if (this.world.buttons[39]) {
                this.diriger("right");
            }
            if (this.world.buttons[37]) {
                this.diriger("left");
            }
            if (this.world.buttons[40]) {
                this.diriger("down");
            }
        }
    }

    diriger(direction) {
        let movement = {};
        switch (direction) {
            case "left":
                movement = {x: this.position.x - 1, y: this.position.y};
                break;
            case "right":
                movement = {x: this.position.x + 1, y: this.position.y};
                break;
            case "down":
                movement = {x: this.position.x, y: this.position.y + 1};
                break;
            case "up":
                movement = {x: this.position.x, y: this.position.y - 1};
                break;
        }
        this.move(movement, direction);
    }

    move(coordinates, direction) {
        if (!this.transition.state) {
            this.targetTile = this.world.infoClef(coordinates.x, coordinates.y);
            if (!this.targetTile.collision) {
                if (this.targetTile.action === "ice") {
                    this.transition.style = "ice";
                    this.transition.duration = 80;
                } else {
                    this.transition.style = "walk";
                    this.transition.duration = 200;
                }
                this.collision = false;
                this.validation = false;
                this.transition.state = true;
                this.lastDirection = direction;
                this.transition.time = new Date();
                this.position.x = coordinates.x;
                this.position.y = coordinates.y;
                this.target.x = this.position.x * this.tileSize;
                this.target.y = this.position.y * this.tileSize;
            } else {
                this.collision = true;
            }
        }
    }

    translation() {
        if (this.transition.state) {
            let time = new Date() - this.transition.time;
            if (time < this.transition.duration) {
                if (this.transition.style === "walk") {
                    this.spriteSheet.position.x = Math.easeInOutQuart(time, this.currentLocation.x, this.target.x - this.currentLocation.x, this.transition.duration);
                    this.spriteSheet.position.y = Math.easeInOutQuart(time, this.currentLocation.y, this.target.y - this.currentLocation.y, this.transition.duration);
                } else {
                    this.spriteSheet.position.x = Math.linearTween(time, this.currentLocation.x, this.target.x - this.currentLocation.x, this.transition.duration);
                    this.spriteSheet.position.y = Math.linearTween(time, this.currentLocation.y, this.target.y - this.currentLocation.y, this.transition.duration);
                }
            } else {
                this.transition.state = false;
                this.spriteSheet.position.x = this.target.x;
                this.spriteSheet.position.y = this.target.y;
                this.currentLocation.x = this.target.x;
                this.currentLocation.y = this.target.y;
                // en fonction du type de sol
                switch (this.targetTile.action) {
                    case "ice":
                        this.diriger(this.lastDirection);
                        this.canMove = this.collision;
                        break;
                    case "left":
                        this.world.sounds.validation.url.play();
                        this.canMove = false;
                        this.diriger("left");
                        break;
                    case "haut":
                        this.world.sounds.validation.url.play();
                        this.canMove = false;
                        this.diriger("up");
                        break;
                    case "bas":
                        this.world.sounds.validation.url.play();
                        this.canMove = false;
                        this.diriger("down");
                        break;
                    case "right":
                        this.world.sounds.validation.url.play();
                        this.canMove = false;
                        this.diriger("right");
                        break;
                    case "trap":
                        this.world.sounds.landslide.url.play();
                        this.world.effects.push(new Effect(this.world, this.position.x * this.tileSize, this.position.y * this.tileSize, this.world.resources['dust']));
                        this.world.terrain.geometry[this.position.y][this.position.x] = 7;
                        this.canMove = true;
                        break;
                    case "suivant":
                        this.validation = true;
                        this.canMove = true;
                        this.world.action("suivant");
                        break;
                    default:
                        this.world.sounds.movement.url.play();
                        this.canMove = true;
                        this.validation = false;
                    // sol normal
                }
            }
        }
    }

    render() {
        this.spriteSheet.render();
        this.translation();
        this.control();
    }
}
