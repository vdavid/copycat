import {Effect} from "./Effect";
import {SpriteService} from "./SpriteService";
import {AudioService} from "./AudioService";
import {KeyCodes} from "./KeyCodes";
import {TileType} from "./TileType";
import {Transition} from "./Transition";

const DIRECTION_UP = Symbol('DIRECTION_UP');
const DIRECTION_DOWN = Symbol('DIRECTION_DOWN');
const DIRECTION_LEFT = Symbol('DIRECTION_LEFT');
const DIRECTION_RIGHT = Symbol('DIRECTION_RIGHT');

export class Player {
    /**
     * @param level
     * @param effects
     * @param x
     * @param y
     * @param {Symbol} spriteId
     * @param {Number} tileSizeInPixels
     * @param {SpriteService} spriteService
     * @param {AudioService} audioService
     * @param {function} levelCompletionCheckCallback
     */
    constructor(level, effects, x, y, spriteId, tileSizeInPixels, spriteService, audioService, levelCompletionCheckCallback) {
        this._level = level;
        this._effects = effects;
        this._levelCompletionCheckCallback = levelCompletionCheckCallback;

        this._spriteService = spriteService;
        this._audioService = audioService;
        this._positionX = x;
        this._positionY = y;

        this._tileSizeInPixels = tileSizeInPixels;
        this._spriteId = spriteId;
        this._spriteColumnCount = this._spriteService.getSpriteSheet(spriteId).columnCount;
        this._animationFrame = 0;

        this._transition = null;
        this._lastDirection = "none";
        this._canMove = true;
        this._collisionOccurred = false;
        this._hasReachedAnExit = false;
        this._audioService.play(AudioService.APPEARANCE);
        this._effects.push(new Effect(this._effects, this._positionX * tileSizeInPixels, this._positionY * tileSizeInPixels, SpriteService.EXPLOSION, this._spriteService));
    }

    get hasReachedAnExit() {
        return this._hasReachedAnExit;
    }

    control(buttons) {
        if (!this._transition && this._canMove) {
            if (buttons[KeyCodes.UP]) {
                this._navigate(DIRECTION_UP);
            }
            if (buttons[KeyCodes.RIGHT]) {
                this._navigate(DIRECTION_RIGHT);
            }
            if (buttons[KeyCodes.LEFT]) {
                this._navigate(DIRECTION_LEFT);
            }
            if (buttons[KeyCodes.DOWN]) {
                this._navigate(DIRECTION_DOWN);
            }
        }
    }

    _navigate(direction) {
        if (!this._transition) {
            let deltaX = (direction === DIRECTION_LEFT) ? -1 : ((direction === DIRECTION_RIGHT) ? 1 : 0);
            let deltaY = (direction === DIRECTION_UP) ? -1 : ((direction === DIRECTION_DOWN) ? 1 : 0);

            this._collisionOccurred = true;
            this._targetTileAction = TileType.NO_ACTION;
            if (this._isMovementValid(deltaX, deltaY)) {
                this._collisionOccurred = !TileType.isAccessible(this._level.getTileType(this._positionX + deltaX, this._positionY + deltaY));
                this._targetTileAction = TileType.getAction(this._level.getTileType(this._positionX + deltaX, this._positionY + deltaY));
            }


            if (!this._collisionOccurred) {
                this._transition = new Transition(
                    (this._targetTileAction === TileType.SLIDE_ACTION) ? Transition.STYLE_SLIDE : Transition.STYLE_WALK,
                    this._positionX, this._positionY, deltaX, deltaY);
                this._hasReachedAnExit = false;
                this._lastDirection = direction;
                this._positionX += deltaX;
                this._positionY += deltaY;
            }
        }
    }

    _isMovementValid(deltaX, deltaY) {
        return this._positionX + deltaX >= 0 && this._positionX + deltaX < this._level.width
            && this._positionY + deltaY >= 0 && this._positionY + deltaY < this._level.height;
    }

    update() {
        if (this._transition && this._transition.isFinished) {
            this._transition = null;

            /* Does different stuff depending on target tile type */
            this._canMove = true;
            if ([TileType.UP_ACTION, TileType.DOWN_ACTION, TileType.LEFT_ACTION, TileType.RIGHT_ACTION].indexOf(this._targetTileAction) > -1) {
                this._audioService.play(AudioService.VALIDATION);
                this._canMove = false;
                this._navigate((this._targetTileAction === TileType.UP_ACTION) ? DIRECTION_UP
                    : ((this._targetTileAction === TileType.DOWN_ACTION) ? DIRECTION_DOWN
                        : ((this._targetTileAction === TileType.LEFT_ACTION) ? DIRECTION_LEFT : DIRECTION_RIGHT)));

            } else if (this._targetTileAction === TileType.SLIDE_ACTION) {
                this._navigate(this._lastDirection);
                this._canMove = this._collisionOccurred;

            } else if (this._targetTileAction === TileType.TRAP_ACTION) {
                this._audioService.play(AudioService.LANDSLIDE);
                this._effects.push(new Effect(this._effects, this._positionX * this._tileSizeInPixels, this._positionY * this._tileSizeInPixels, SpriteService.DUST, this._spriteService));
                this._level.setTileType(this._positionX, this._positionY, TileType.HOLE);

            } else if (this._targetTileAction === TileType.EXIT_ACTION) {
                this._hasReachedAnExit = true;
                this._levelCompletionCheckCallback();

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

        this._spriteService.draw(this._spriteId,
            (this._transition ? this._transition.calculateCurrentX() : this._positionX) * this._tileSizeInPixels,
            (this._transition ? this._transition.calculateCurrentY() : this._positionY) * this._tileSizeInPixels,
            Math.floor(this._animationFrame), 0);
    }
}
