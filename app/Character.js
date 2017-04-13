import {Effect} from "./Effect";
import {Sprite} from "./Sprite";
import {SpriteService} from "./SpriteService";
import {AudioService} from "./AudioService";
import {KeyCodes} from "./KeyCodes";

const DIRECTION_UP = Symbol('DIRECTION_UP');
const DIRECTION_DOWN = Symbol('DIRECTION_DOWN');
const DIRECTION_LEFT = Symbol('DIRECTION_LEFT');
const DIRECTION_RIGHT = Symbol('DIRECTION_RIGHT');

const TRANSITION_STYLE_WALK = Symbol('TRANSITION_STYLE_WALK');
const TRANSITION_STYLE_SLIDE = Symbol('TRANSITION_STYLE_SLIDE');

export class Character {
    /**
     *
     * @param world
     * @param x
     * @param y
     * @param {Symbol} spriteId
     * @param {SpriteService} spriteService
     * @param {AudioService} audioService
     */
    constructor(world, x, y, spriteId, spriteService, audioService) {
        this.world = world;
        this.context = world.context;
        this.buttons = world.buttons;
        this.board = world.board;
        this.effects = world.effects;
        this.keys = world.keys;
        let tileSize = world.tileSize;

        this.spriteService = spriteService;
        this.audioService = audioService;
        this._positionX = x;
        this._positionY = y;

        this._tileSize = tileSize;
        this._currentXInPixels = this._positionX * this._tileSize;
        this._currentYInPixels = this._positionY * this._tileSize;
        this._targetXInPixels = this._currentXInPixels;
        this._targetYInPixels = this._currentYInPixels;

        this.sprite = new Sprite(this.context, tileSize, this._positionX, this._positionY, spriteId, spriteService);
        this._transition = {
            isOn: false,
            time: null,
            durationInMilliseconds: 200,
            style: "walk"
        };
        this.lastDirection = "none";
        this._canMove = true;
        this._collision = false;
        this.reachedAnExit = false;
        this.audioService.play(AudioService.APPEARANCE);
        this.effects.push(new Effect(this.context, this.effects, this._currentXInPixels, this._currentYInPixels, SpriteService.EXPLOSION, this.world.spriteService));
    }

    control() {
        if (!this._transition.isOn && this._canMove) {
            if (this.buttons[KeyCodes.UP]) {
                this.navigate(DIRECTION_UP);
            }
            if (this.buttons[KeyCodes.RIGHT]) {
                this.navigate(DIRECTION_RIGHT);
            }
            if (this.buttons[KeyCodes.LEFT]) {
                this.navigate(DIRECTION_LEFT);
            }
            if (this.buttons[KeyCodes.DOWN]) {
                this.navigate(DIRECTION_DOWN);
            }
        }
    }

    navigate(direction) {
        if (!this._transition.isOn) {
            let deltaX = (direction === DIRECTION_LEFT) ? -1 : ((direction === DIRECTION_RIGHT) ? 1 : 0);
            let deltaY = (direction === DIRECTION_UP) ? -1 : ((direction === DIRECTION_DOWN) ? 1 : 0);

            if (this._positionX + deltaX > -1
                && this._positionX + deltaX < this.board.size.width
                && this._positionY + deltaY > -1
                && this._positionY + deltaY < this.board.size.height) {
                this._targetTile = this.keys[this.board.tiles[this._positionY + deltaY][this._positionX + deltaX]];
            } else {
                this._targetTile = false;
            }

            if (!this._targetTile.collision) {
                if (this._targetTile.action === "slide") {
                    this._transition.style = TRANSITION_STYLE_SLIDE;
                    this._transition.durationInMilliseconds = 80;
                } else {
                    this._transition.style = TRANSITION_STYLE_WALK;
                    this._transition.durationInMilliseconds = 200;
                }
                this._collision = false;
                this.reachedAnExit = false;
                this._transition.isOn = true;
                this.lastDirection = direction;
                this._transition.startDateTime = new Date();
                this._positionX += deltaX;
                this._positionY += deltaY;
                this._targetXInPixels = this._positionX * this._tileSize;
                this._targetYInPixels = this._positionY * this._tileSize;
            } else {
                this._collision = true;
            }
        }
    }

    translation() {
        if (this._transition.isOn) {
            let elapsedTime = new Date() - this._transition.startDateTime;
            if (elapsedTime < this._transition.durationInMilliseconds) {
                if (this._transition.style === TRANSITION_STYLE_WALK) {
                    this.sprite.positionXInPixels = Math.easeInOutQuart(elapsedTime, this._currentXInPixels, this._targetXInPixels - this._currentXInPixels, this._transition.durationInMilliseconds);
                    this.sprite.positionYInPixels = Math.easeInOutQuart(elapsedTime, this._currentYInPixels, this._targetYInPixels - this._currentYInPixels, this._transition.durationInMilliseconds);
                } else {
                    this.sprite.positionXInPixels = Math.linearTween(elapsedTime, this._currentXInPixels, this._targetXInPixels - this._currentXInPixels, this._transition.durationInMilliseconds);
                    this.sprite.positionYInPixels = Math.linearTween(elapsedTime, this._currentYInPixels, this._targetYInPixels - this._currentYInPixels, this._transition.durationInMilliseconds);
                }
            } else {
                this._transition.isOn = false;
                this.sprite.positionXInPixels = this._targetXInPixels;
                this.sprite.positionYInPixels = this._targetYInPixels;
                this._currentXInPixels = this._targetXInPixels;
                this._currentYInPixels = this._targetYInPixels;
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
                        this.effects.push(new Effect(this.context, this.effects, this._positionX * this._tileSize, this._positionY * this._tileSize, SpriteService.DUST, this.spriteService));
                        this.board.tiles[this._positionY][this._positionX] = 7;
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
        this.sprite.render();
        this.translation();
        this.control();
    }
}
