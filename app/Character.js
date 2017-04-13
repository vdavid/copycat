import {Effect} from "./Effect";
import {Sprite} from "./Sprite";
import {SpriteService} from "./SpriteService";
import {AudioService} from "./AudioService";
import {KeyCodes} from "./KeyCodes";

export class Character {
    /**
     *
     * @param world
     * @param x
     * @param y
     * @param spriteSheet
     * @param {SpriteService} spriteService
     * @param {AudioService} audioService
     */
    constructor(world, x, y, spriteSheet, spriteService, audioService) {
        this.world = world;
        this.spriteService = spriteService;
        this.audioService = audioService;
        this._position = {
            x: x,
            y: y
        };
        this._tileSize = world.tileSize;
        this.target = {
            x: this._position.x * this._tileSize,
            y: this._position.y * this._tileSize,
        };
        this._currentLocation = {
            x: this._position.x * this._tileSize,
            y: this._position.y * this._tileSize,
        };
        this.spriteSheet = new Sprite(this.world, this._position.x, this._position.y, spriteSheet);
        this._transition = {
            state: false,
            time: null,
            duration: 200,
            style: "walk"
        };
        this.lastDirection = "none";
        this._canMove = true;
        this._collision = false;
        this.validation = false;
        this.audioService.play(AudioService.APPEARANCE);
        this.world.effects.push(new Effect(this.world, this._currentLocation.x, this._currentLocation.y, this.spriteService.getSpriteSheet(SpriteService.EXPLOSION)));
    }

    control() {
        if (!this._transition.state && this._canMove) {
            if (this.world.buttons[KeyCodes.UP]) {
                this.navigate("up");
            }
            if (this.world.buttons[KeyCodes.RIGHT]) {
                this.navigate("right");
            }
            if (this.world.buttons[KeyCodes.LEFT]) {
                this.navigate("left");
            }
            if (this.world.buttons[KeyCodes.DOWN]) {
                this.navigate("down");
            }
        }
    }

    navigate(direction) {
        let movement = {};
        switch (direction) {
            case "left":
                movement = {x: this._position.x - 1, y: this._position.y};
                break;
            case "right":
                movement = {x: this._position.x + 1, y: this._position.y};
                break;
            case "down":
                movement = {x: this._position.x, y: this._position.y + 1};
                break;
            case "up":
                movement = {x: this._position.x, y: this._position.y - 1};
                break;
        }
        this.move(movement, direction);
    }

    move(coordinates, direction) {
        if (!this._transition.state) {
            this.targetTile = this.world.infoClef(coordinates.x, coordinates.y);
            if (!this.targetTile.collision) {
                if (this.targetTile.action === "slide") {
                    this._transition.style = "slide";
                    this._transition.duration = 80;
                } else {
                    this._transition.style = "walk";
                    this._transition.duration = 200;
                }
                this._collision = false;
                this.validation = false;
                this._transition.state = true;
                this.lastDirection = direction;
                this._transition.time = new Date();
                this._position.x = coordinates.x;
                this._position.y = coordinates.y;
                this.target.x = this._position.x * this._tileSize;
                this.target.y = this._position.y * this._tileSize;
            } else {
                this._collision = true;
            }
        }
    }

    translation() {
        if (this._transition.state) {
            let time = new Date() - this._transition.time;
            if (time < this._transition.duration) {
                if (this._transition.style === "walk") {
                    this.spriteSheet.position.x = Math.easeInOutQuart(time, this._currentLocation.x, this.target.x - this._currentLocation.x, this._transition.duration);
                    this.spriteSheet.position.y = Math.easeInOutQuart(time, this._currentLocation.y, this.target.y - this._currentLocation.y, this._transition.duration);
                } else {
                    this.spriteSheet.position.x = Math.linearTween(time, this._currentLocation.x, this.target.x - this._currentLocation.x, this._transition.duration);
                    this.spriteSheet.position.y = Math.linearTween(time, this._currentLocation.y, this.target.y - this._currentLocation.y, this._transition.duration);
                }
            } else {
                this._transition.state = false;
                this.spriteSheet.position.x = this.target.x;
                this.spriteSheet.position.y = this.target.y;
                this._currentLocation.x = this.target.x;
                this._currentLocation.y = this.target.y;
                // Does different stuff depending on target tile type
                switch (this.targetTile.action) {
                    case "slide":
                        this.navigate(this.lastDirection);
                        this._canMove = this._collision;
                        break;
                    case "left":
                        this.audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this.navigate("left");
                        break;
                    case "up":
                        this.audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this.navigate("up");
                        break;
                    case "down":
                        this.audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this.navigate("down");
                        break;
                    case "right":
                        this.audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this.navigate("right");
                        break;
                    case "trap":
                        this.audioService.play(AudioService.MOVEMENT);
                        this.world.effects.push(new Effect(this.world, this._position.x * this._tileSize, this._position.y * this._tileSize, this.spriteService.getSpriteSheet(SpriteService.DUST)));
                        this.world.board.cells[this._position.y][this._position.x] = 7;
                        this._canMove = true;
                        break;
                    case "nextLevel":
                        this.validation = true;
                        this._canMove = true;
                        this.world.action("nextLevel");
                        break;
                    default:
                        this.audioService.play(AudioService.MOVEMENT);
                        this._canMove = true;
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
