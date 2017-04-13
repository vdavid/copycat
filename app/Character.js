import {Effect} from "./Effect";
import {Sprite} from "./Sprite";
import {SpriteService} from "./SpriteService";
import {AudioService} from "./AudioService";
import {KeyCodes} from "./KeyCodes";
import {TileType} from './TileType';

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
     * @param {Number} tileSizeInPixels
     * @param {SpriteService} spriteService
     * @param {AudioService} audioService
     */
    constructor(world, x, y, spriteId, tileSizeInPixels, spriteService, audioService) {
        this.world = world;
        this.context = world.context;
        this.buttons = world.buttons;
        this._level = world.level;
        this._effects = world.effects;

        this._spriteService = spriteService;
        this._audioService = audioService;
        this._positionX = x;
        this._positionY = y;

        this._tileSizeInPixels = tileSizeInPixels;
        this._currentXInPixels = this._positionX * tileSizeInPixels;
        this._currentYInPixels = this._positionY * tileSizeInPixels;
        this._targetXInPixels = this._currentXInPixels;
        this._targetYInPixels = this._currentYInPixels;

        this._sprite = new Sprite(this.context, this._positionX * tileSizeInPixels, this._positionY * tileSizeInPixels, spriteId, spriteService);
        this._transition = {
            isOn: false,
            time: null,
            durationInMilliseconds: 200,
            style: "walk"
        };
        this._lastDirection = "none";
        this._canMove = true;
        this._collision = false;
        this._hasReachedAnExit = false;
        this._audioService.play(AudioService.APPEARANCE);
        this._effects.push(new Effect(this.context, this._effects, this._currentXInPixels, this._currentYInPixels, SpriteService.EXPLOSION, this._spriteService));
    }
    
    get hasReachedAnExit() {
        return this._hasReachedAnExit;
    }

    _control() {
        if (!this._transition.isOn && this._canMove) {
            if (this.buttons[KeyCodes.UP]) {
                this._navigate(DIRECTION_UP);
            }
            if (this.buttons[KeyCodes.RIGHT]) {
                this._navigate(DIRECTION_RIGHT);
            }
            if (this.buttons[KeyCodes.LEFT]) {
                this._navigate(DIRECTION_LEFT);
            }
            if (this.buttons[KeyCodes.DOWN]) {
                this._navigate(DIRECTION_DOWN);
            }
        }
    }

    _navigate(direction) {
        if (!this._transition.isOn) {
            let deltaX = (direction === DIRECTION_LEFT) ? -1 : ((direction === DIRECTION_RIGHT) ? 1 : 0);
            let deltaY = (direction === DIRECTION_UP) ? -1 : ((direction === DIRECTION_DOWN) ? 1 : 0);

            if (this._positionX + deltaX >= 0
                && this._positionX + deltaX < this._level.width
                && this._positionY + deltaY >= 0
                && this._positionY + deltaY < this._level.height) {
                this._isTargetTileAccessible = TileType.isAccessible(this._level.getTileType(this._positionX + deltaX, this._positionY + deltaY));
                this._targetTileAction = TileType.getAction(this._level.getTileType(this._positionX + deltaX, this._positionY + deltaY));
            } else {
                this._isTargetTileAccessible = false;
                this._targetTileAction = TileType.NO_ACTION;
            }

            if (this._isTargetTileAccessible) {
                if (this._targetTileAction === TileType.SLIDE_ACTION) {
                    this._transition.style = TRANSITION_STYLE_SLIDE;
                    this._transition.durationInMilliseconds = 80;
                } else {
                    this._transition.style = TRANSITION_STYLE_WALK;
                    this._transition.durationInMilliseconds = 200;
                }
                this._collision = false;
                this._hasReachedAnExit = false;
                this._transition.isOn = true;
                this._lastDirection = direction;
                this._transition.startDateTime = new Date();
                this._positionX += deltaX;
                this._positionY += deltaY;
                this._targetXInPixels = this._positionX * this._tileSizeInPixels;
                this._targetYInPixels = this._positionY * this._tileSizeInPixels;
            } else {
                this._collision = true;
            }
        }
    }

    transition() {
        if (this._transition.isOn) {
            let elapsedTime = new Date() - this._transition.startDateTime;
            if (elapsedTime < this._transition.durationInMilliseconds) {
                if (this._transition.style === TRANSITION_STYLE_WALK) {
                    this._sprite.positionXInPixels = easeInOutQuart(elapsedTime, this._currentXInPixels, this._targetXInPixels - this._currentXInPixels, this._transition.durationInMilliseconds);
                    this._sprite.positionYInPixels = easeInOutQuart(elapsedTime, this._currentYInPixels, this._targetYInPixels - this._currentYInPixels, this._transition.durationInMilliseconds);
                } else {
                    this._sprite.positionXInPixels = linearTween(elapsedTime, this._currentXInPixels, this._targetXInPixels - this._currentXInPixels, this._transition.durationInMilliseconds);
                    this._sprite.positionYInPixels = linearTween(elapsedTime, this._currentYInPixels, this._targetYInPixels - this._currentYInPixels, this._transition.durationInMilliseconds);
                }
            } else {
                this._transition.isOn = false;
                this._sprite.positionXInPixels = this._targetXInPixels;
                this._sprite.positionYInPixels = this._targetYInPixels;
                this._currentXInPixels = this._targetXInPixels;
                this._currentYInPixels = this._targetYInPixels;
                // Does different stuff depending on target tile type
                switch (this._targetTileAction) {
                    case TileType.SLIDE_ACTION:
                        this._navigate(this._lastDirection);
                        this._canMove = this._collision;
                        break;
                    case TileType.LEFT_ACTION:
                        this._audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this._navigate(DIRECTION_LEFT);
                        break;
                    case TileType.UP_ACTION:
                        this._audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this._navigate(DIRECTION_UP);
                        break;
                    case TileType.DOWN_ACTION:
                        this._audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this._navigate(DIRECTION_DOWN);
                        break;
                    case TileType.RIGHT_ACTION:
                        this._audioService.play(AudioService.VALIDATION);
                        this._canMove = false;
                        this._navigate(DIRECTION_RIGHT);
                        break;
                    case TileType.TRAP_ACTION:
                        this._audioService.play(AudioService.LANDSLIDE);
                        this._effects.push(new Effect(this.context, this._effects, this._positionX * this._tileSizeInPixels, this._positionY * this._tileSizeInPixels, SpriteService.DUST, this._spriteService));
                        this._level.setTileType(this._positionX, this._positionY, TileType.HOLE);
                        this._canMove = true;
                        break;
                    case TileType.EXIT_ACTION:
                        this._hasReachedAnExit = true;
                        this._canMove = true;
                        this.world.checkLevelCompletion();
                        break;
                    default:
                        this._audioService.play(AudioService.MOVEMENT);
                        this._canMove = true;
                        this._hasReachedAnExit = false;
                    // sol normal
                }
            }
        }
    }

    render() {
        this._sprite.render();
        this.transition();
        this._control();
    }
}

function linearTween(elapsedTime, startValue, amount, transitionDuration) {
    return amount * elapsedTime / transitionDuration + startValue;
}

function easeInOutQuart(elapsedTime, startValue, changeAmount, transitionDuration) {
    elapsedTime /= transitionDuration / 2;
    if (elapsedTime < 1) return changeAmount / 2 * elapsedTime * elapsedTime * elapsedTime * elapsedTime + startValue;
    elapsedTime -= 2;
    return -changeAmount / 2 * (elapsedTime * elapsedTime * elapsedTime * elapsedTime - 2) + startValue;
}