export class Effect {
    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {Array} effects
     * @param {Number} x
     * @param {Number} y
     * @param {Symbol} spriteId
     * @param {SpriteService} spriteService
     */
    constructor(context, effects, x, y, spriteId, spriteService) {
        let spriteSheet = spriteService.getSpriteSheet(spriteId);

        this.context = context;
        this.effects = effects;
        this.spriteId = spriteId;
        this.spriteService = spriteService;
        this.width = Math.round(spriteSheet.image.width / spriteSheet.columnCount);
        this.position = {
            x: x,
            y: y
        };
        this.length = spriteSheet.columnCount;
        this.frame = 0;
        this.selectLigne = 0;
        this.animation = true;
        this.allure = 0.4;
    }

    render() {
        if (this.animation) {
            this.frame += this.allure;
            if (this.frame >= this.length) {
                this.effects.splice(this.effects.indexOf(this), 1);
            }
        }
        this.spriteService.draw(this.spriteId, this.context, this.position.x - this.width / 4, this.position.y - this.width / 4, Math.floor(this.frame) * this.width, 0);
        // this.context.drawImage(this.spriteSheet.image, Math.floor(this.frame) * this.width, this.selectLigne, this.width, this.height, this.position.x - this.width / 4, this.position.y - this.width / 4, this.width, this.height);
    }
}
