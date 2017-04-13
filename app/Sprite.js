export class Sprite {
    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {Number} positionXInPixels
     * @param {Number} positionYInPixels
     * @param {Symbol} spriteId
     * @param {SpriteService} spriteService
     */
    constructor(context, positionXInPixels, positionYInPixels, spriteId, spriteService) {
        this._context = context;
        this._spriteId = spriteId;
        this._spriteService = spriteService;
        this.positionXInPixels = positionXInPixels;
        this.positionYInPixels = positionYInPixels;
        this._length = this._spriteService.getSpriteSheet(spriteId).columnCount;
        this._frame = 0;
    }
    
    render() {
        this._frame += 0.2;
        if (this._frame >= this._length) {
            this._frame = 0;
        }

        this._spriteService.draw(this._spriteId, this._context,
            this.positionXInPixels, this.positionYInPixels,
            Math.floor(this._frame), 0);
    }
}
