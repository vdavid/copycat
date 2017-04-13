import {Effect} from "./Effect";
import {SpriteService} from "./SpriteService";
import {AudioService} from "./AudioService";
import {KeyCodes} from "./KeyCodes";
import {TileType} from "./TileType";

const DIRECTION_UP = Symbol('DIRECTION_UP');
const DIRECTION_DOWN = Symbol('DIRECTION_DOWN');
const DIRECTION_LEFT = Symbol('DIRECTION_LEFT');
const DIRECTION_RIGHT = Symbol('DIRECTION_RIGHT');

const TRANSITION_STYLE_WALK = Symbol('TRANSITION_STYLE_WALK');
const TRANSITION_STYLE_SLIDE = Symbol('TRANSITION_STYLE_SLIDE');

export class Player {
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
        this._world = world;
        this._context = world.context;
        this._buttons = world.buttons;
        this._level = world.level;
        this._effects = world.effects;

        this._spriteService = spriteService;
        this._audioService = audioService;
        this._positionX = x;
        this._positionY = y;

        this._tileSizeInPixels = tileSizeInPixels;
        this._currentXInPixels = this._positionX * tileSizeInPixels;
        this._currentYInPixels = this._positionY * tileSizeInPixels;
        this._spriteId = spriteId;
        this._spriteColumnCount = this._spriteService.getSpriteSheet(spriteId).columnCount;
        this._animationFrame = 0;

        this._transition = {
            isOn: false,
            time: null,
            durationInMilliseconds: 200,
            style: "walk"
        };
        this._lastDirection = "none";
        this._canMove = true;
        this._collisionOccurred = false;
        this._hasReachedAnExit = false;
        this._audioService.play(AudioService.APPEARANCE);
        this._effects.push(new Effect(this._context, this._effects, this._currentXInPixels, this._currentYInPixels, SpriteService.EXPLOSION, this._spriteService));
    }

    get hasReachedAnExit() {
        return this._hasReachedAnExit;
    }

    control() {
        if (!this._transition.isOn && this._canMove) {
            if (this._buttons[KeyCodes.UP]) {
                this._navigate(DIRECTION_UP);
            }
            if (this._buttons[KeyCodes.RIGHT]) {
                this._navigate(DIRECTION_RIGHT);
            }
            if (this._buttons[KeyCodes.LEFT]) {
                this._navigate(DIRECTION_LEFT);
            }
            if (this._buttons[KeyCodes.DOWN]) {
                this._navigate(DIRECTION_DOWN);
            }
        }
    }

    _navigate(direction) {
        if (!this._transition.isOn) {
            let deltaX = (direction === DIRECTION_LEFT) ? -1 : ((direction === DIRECTION_RIGHT) ? 1 : 0);
            let deltaY = (direction === DIRECTION_UP) ? -1 : ((direction === DIRECTION_DOWN) ? 1 : 0);

            let isTargetTileAccessible;
            if (this._positionX + deltaX >= 0
                && this._positionX + deltaX < this._level.width
                && this._positionY + deltaY >= 0
                && this._positionY + deltaY < this._level.height) {
                isTargetTileAccessible = TileType.isAccessible(this._level.getTileType(this._positionX + deltaX, this._positionY + deltaY));
                this._targetTileAction = TileType.getAction(this._level.getTileType(this._positionX + deltaX, this._positionY + deltaY));
            } else {
                isTargetTileAccessible = false;
                this._targetTileAction = TileType.NO_ACTION;
            }

            this._collisionOccurred = !isTargetTileAccessible;

            if (isTargetTileAccessible) {
                if (this._targetTileAction === TileType.SLIDE_ACTION) {
                    this._transition.style = TRANSITION_STYLE_SLIDE;
                    this._transition.durationInMilliseconds = 80;
                } else {
                    this._transition.style = TRANSITION_STYLE_WALK;
                    this._transition.durationInMilliseconds = 200;
                }
                this._hasReachedAnExit = false;
                this._transition.isOn = true;
                this._lastDirection = direction;
                this._transition.startDateTime = new Date();
                this._positionX += deltaX;
                this._positionY += deltaY;
            }
        }
    }

    transition() {
        if (this._transition.isOn && (new Date() - this._transition.startDateTime >= this._transition.durationInMilliseconds)) {
            this._transition.isOn = false;
            this._currentXInPixels = this._positionX * this._tileSizeInPixels;
            this._currentYInPixels = this._positionY * this._tileSizeInPixels;

            /* Does different stuff depending on target tile type */
            this._canMove = true;
            if ([TileType.UP_ACTION, TileType.DOWN_ACTION, TileType.LEFT_ACTION, TileType.RIGHT_ACTION].indexOf(this._targetTileAction) > -1) {
                this._audioService.play(AudioService.VALIDATION);
                this._canMove = false;
                this._navigate((this._targetTileAction === TileType.UP_ACTION) ? DIRECTION_UP
                    : ((this._targetTileAction === TileType.DOWN_ACTION) ? DIRECTION_DOWN
                        : ((this._targetTileAction === TileType.LEFT_ACTION) ? DIRECTION_LEFT : DIRECTION_RIGHT)));

            } else if(this._targetTileAction === TileType.SLIDE_ACTION) {
                this._navigate(this._lastDirection);
                this._canMove = this._collisionOccurred;

            } else if(this._targetTileAction === TileType.TRAP_ACTION) {
                this._audioService.play(AudioService.LANDSLIDE);
                this._effects.push(new Effect(this._context, this._effects, this._positionX * this._tileSizeInPixels, this._positionY * this._tileSizeInPixels, SpriteService.DUST, this._spriteService));
                this._level.setTileType(this._positionX, this._positionY, TileType.HOLE);

            } else if(this._targetTileAction === TileType.EXIT_ACTION) {
                this._hasReachedAnExit = true;
                this._world.checkLevelCompletion();

            } else {
                this._audioService.play(AudioService.MOVEMENT);
                this._hasReachedAnExit = false;
            }
        }
    }

    render() {
        this._animationFrame += 0.2;
        if (this._animationFrame >= this._spriteColumnCount) {
            this._animationFrame = 0;
        }

        let elapsedTime = new Date() - this._transition.startDateTime;
        let positionXInPixels = this._currentXInPixels;
        let positionYInPixels = this._currentYInPixels;
        if (this._transition.isOn) {
            if (this._transition.style === TRANSITION_STYLE_WALK) {
                positionXInPixels = easeInOutQuart(elapsedTime, this._currentXInPixels, this._positionX * this._tileSizeInPixels - this._currentXInPixels, this._transition.durationInMilliseconds);
                positionYInPixels = easeInOutQuart(elapsedTime, this._currentYInPixels, this._positionY * this._tileSizeInPixels - this._currentYInPixels, this._transition.durationInMilliseconds);
            } else {
                positionXInPixels = linearTween(elapsedTime, this._currentXInPixels, this._positionX * this._tileSizeInPixels - this._currentXInPixels, this._transition.durationInMilliseconds);
                positionYInPixels = linearTween(elapsedTime, this._currentYInPixels, this._positionY * this._tileSizeInPixels - this._currentYInPixels, this._transition.durationInMilliseconds);
            }
        }
        this._spriteService.draw(this._spriteId, this._context, positionXInPixels, positionYInPixels, Math.floor(this._animationFrame), 0);
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