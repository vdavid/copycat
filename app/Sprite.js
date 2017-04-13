export class Sprite {
    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {Number} tileSize
     * @param {Number} positionX
     * @param {Number} positionY
     * @param {Symbol} spriteId
     * @param {SpriteService} spriteService
     */
    constructor(context, tileSize, positionX, positionY, spriteId, spriteService) {
        this.context = context;
        this.spriteId = spriteId;
        this.spriteService = spriteService;
        this.positionXInPixels = positionX * tileSize;
        this.positionYInPixels = positionY * tileSize;
        this.length = this.spriteService.getSpriteSheet(spriteId).columnCount;
        this.frame = 0;
        this.selectLigne = 0;
        this.animation = true;
        this.allure = 0.2;
    }

    draw() {
        this.spriteService.draw(this.spriteId, this.context, this.positionXInPixels, this.positionYInPixels, Math.floor(this.frame), 0);
    }

    animate() {
        if (this.animation) {
            this.frame += this.allure;
            if (this.frame >= this.length) {
                this.frame = 0;
            }
        }
    }

    render() {
        this.animate();
        this.draw();
    }
}
