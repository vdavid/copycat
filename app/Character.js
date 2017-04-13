import {Effect} from "./Effect";
import {Sprite} from "./Sprite";
import {SpriteService} from "./SpriteService";
import {AudioService} from "./AudioService";
import {KeyCodes} from "./KeyCodes";

const DIRECTION_UP = Symbol('DIRECTION_UP');
const DIRECTION_DOWN = Symbol('DIRECTION_DOWN');
const DIRECTION_LEFT = Symbol('DIRECTION_LEFT');
const DIRECTION_RIGHT = Symbol('DIRECTION_RIGHT');

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
        this._target = {
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
        this.reachedAnExit = false;
        this.audioService.play(AudioService.APPEARANCE);
        this.world.effects.push(new Effect(this.world, this._currentLocation.x, this._currentLocation.y, this.spriteService.getSpriteSheet(SpriteService.EXPLOSION)));
    }

    control() {
        if (!this._transition.state && this._canMove) {
            if (this.world.buttons[KeyCodes.UP]) {
                this.navigate(DIRECTION_UP);
            }
            if (this.world.buttons[KeyCodes.RIGHT]) {
                this.navigate(DIRECTION_RIGHT);
            }
            if (this.world.buttons[KeyCodes.LEFT]) {
                this.navigate(DIRECTION_LEFT);
            }
            if (this.world.buttons[KeyCodes.DOWN]) {
                this.navigate(DIRECTION_DOWN);
            }
        }
    }

    navigate(direction) {
        if (!this._transition.state) {
            let deltaX = (direction === DIRECTION_LEFT) ? -1 : ((direction === DIRECTION_RIGHT) ? 1 : 0);
            let deltaY = (direction === DIRECTION_UP) ? -1 : ((direction === DIRECTION_DOWN) ? 1 : 0);

            this._targetTile = this.world.infoClef(this._position.x + deltaX, this._position.y + deltaY);
            if (!this._targetTile.collision) {
                if (this._targetTile.action === "slide") {
                    this._transition.style = "slide";
                    this._transition.duration = 80;
                } else {
                    this._transition.style = "walk";
                    this._transition.duration = 200;
                }
                this._collision = false;
                this.reachedAnExit = false;
                this._transition.state = true;
                this.lastDirection = direction;
                this._transition.time = new Date();
                this._position.x += deltaX;
                this._position.y += deltaY;
                this._target.x = this._position.x * this._tileSize;
                this._target.y = this._position.y * this._tileSize;
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
                    this.spriteSheet.position.x = Math.easeInOutQuart(time, this._currentLocation.x, this._target.x - this._currentLocation.x, this._transition.duration);
                    this.spriteSheet.position.y = Math.easeInOutQuart(time, this._currentLocation.y, this._target.y - this._currentLocation.y, this._transition.duration);
                } else {
                    this.spriteSheet.position.x = Math.linearTween(time, this._currentLocation.x, this._target.x - this._currentLocation.x, this._transition.duration);
                    this.spriteSheet.position.y = Math.linearTween(time, this._currentLocation.y, this._target.y - this._currentLocation.y, this._transition.duration);
                }
            } else {
                this._transition.state = false;
                this.spriteSheet.position.x = this._target.x;
                this.spriteSheet.position.y = this._target.y;
                this._currentLocation.x = this._target.x;
                this._currentLocation.y = this._target.y;
                // Does different stuff depending on target tile type
                switch (this._targetTile.action) {
                    case "slide":
                        this.navigate(this.lastDirection);
                        this._canMove = this._collision;
                        break;
                    case "left":
                        this.audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this.navigate(DIRECTION_LEFT);
                        break;
                    case "up":
                        this.audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this.navigate(DIRECTION_UP);
                        break;
                    case "down":
                        this.audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this.navigate(DIRECTION_DOWN);
                        break;
                    case "right":
                        this.audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this.navigate(DIRECTION_RIGHT);
                        break;
                    case "trap":
                        this.audioService.play(AudioService.MOVEMENT);
                        this.world.effects.push(new Effect(this.world, this._position.x * this._tileSize, this._position.y * this._tileSize, this.spriteService.getSpriteSheet(SpriteService.DUST)));
                        this.world.board.cells[this._position.y][this._position.x] = 7;
                        this._canMove = true;
                        break;
                    case "nextLevel":
                        this.reachedAnExit = true;
                        this._canMove = true;
                        this.world.checkLevelCompletion();
                        break;
                    default:
                        this.audioService.play(AudioService.MOVEMENT);
                        this._canMove = true;
                        this.reachedAnExit = false;
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
