import Effect from "./Effect";
import SpriteService from "./../SpriteService";
import AudioService from "./../AudioService";
import KeyCodes from "./../KeyCodes";
import TileType from "./TileType";
import Transition from "./Transition";

export default class Player {
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

    control(pressedKeys) {
        let keyCodeToDirectionMap = {
            [KeyCodes.UP]: Player.DIRECTION_UP,
            [KeyCodes.DOWN]: Player.DIRECTION_DOWN,
            [KeyCodes.LEFT]: Player.DIRECTION_LEFT,
            [KeyCodes.RIGHT]: Player.DIRECTION_RIGHT
        };
        pressedKeys.forEach((isPressed, keyCode) => {
            if (isPressed && Object.keys(keyCodeToDirectionMap).indexOf(keyCode.toString()) > -1) {
                this._navigate(keyCodeToDirectionMap[keyCode], true);
            }
        });
    }

    _navigate(direction, isInitiatedByPlayer) {
        isInitiatedByPlayer = (typeof isInitiatedByPlayer !== 'undefined') ? isInitiatedByPlayer : true;
        if (!this._transition && (!isInitiatedByPlayer || this._canMove)) {
            this._collisionOccurred = true;
            this._targetTileAction = TileType.NO_ACTION;
            if (this._isMovementInsideBounds(direction)) {
                this._collisionOccurred = !TileType.isAccessible(this._level.getTileType(this._positionX + direction.x, this._positionY + direction.y));
                this._targetTileAction = TileType.getAction(this._level.getTileType(this._positionX + direction.x, this._positionY + direction.y));
            }


            if (!this._collisionOccurred) {
                this._transition = new Transition(
                    (this._targetTileAction === TileType.SLIDE_ACTION) ? Transition.STYLE_SLIDE : Transition.STYLE_WALK,
                    this._positionX, this._positionY, direction.x, direction.y);
                this._hasReachedAnExit = false;
                this._lastDirection = direction;
                this._positionX += direction.x;
                this._positionY += direction.y;
            }
        }
    }

    _isMovementInsideBounds(direction) {
        return this._positionX + direction.x >= 0 && this._positionX + direction.x < this._level.width
            && this._positionY + direction.y >= 0 && this._positionY + direction.y < this._level.height;
    }

    update() {
        if (this._transition && this._transition.isFinished) {
            this._transition = null;

            /* Does different stuff depending on target tile type */
            this._canMove = true;
            if ([TileType.UP_ACTION, TileType.DOWN_ACTION, TileType.LEFT_ACTION, TileType.RIGHT_ACTION].indexOf(this._targetTileAction) > -1) {
                this._audioService.play(AudioService.VALIDATION);
                this._canMove = false;
                this._navigate((this._targetTileAction === TileType.UP_ACTION) ? Player.DIRECTION_UP
                    : ((this._targetTileAction === TileType.DOWN_ACTION) ? Player.DIRECTION_DOWN
                        : ((this._targetTileAction === TileType.LEFT_ACTION) ? Player.DIRECTION_LEFT : Player.DIRECTION_RIGHT)), false);

            } else if (this._targetTileAction === TileType.SLIDE_ACTION) {
                this._navigate(this._lastDirection, false);
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

Player.DIRECTION_UP = {x: 0, y: -1};
Player.DIRECTION_DOWN = {x: 0, y: 1};
Player.DIRECTION_LEFT = {x: -1, y: 0};
Player.DIRECTION_RIGHT = {x: 1, y: 0};
