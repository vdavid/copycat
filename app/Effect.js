export class Effect {
    /**
     *
     * @param {Array} effects
     * @param {Number} positionXInPixels
     * @param {Number} positionYInPixels
     * @param {Symbol} spriteId
     * @param {SpriteService} spriteService
     */
    constructor(effects, positionXInPixels, positionYInPixels, spriteId, spriteService) {
        let spriteSheet = spriteService.getSpriteSheet(spriteId);

        this._effects = effects;
        this._spriteId = spriteId;
        this._spriteService = spriteService;
        this._spriteSize = Math.round(spriteSheet.image.width / spriteSheet.columnCount);
        this._positionXInPixels = positionXInPixels;
        this._positionYInPixels = positionYInPixels;
        this._length = spriteSheet.columnCount;
        this._frame = 0;
    }

    render() {
        this._frame += 0.4;
        if (this._frame >= this._length) {
            this._effects.splice(this._effects.indexOf(this), 1);
        }
        this._spriteService.draw(this._spriteId,
            this._positionXInPixels - this._spriteSize / 4, this._positionYInPixels - this._spriteSize / 4,
            Math.floor(this._frame), 0);
    }
}
