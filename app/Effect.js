export class Effect {
    constructor(world, x, y, spriteSheet) {
        this.world = world;
        this.context = world.context;
        this.spriteSheet = spriteSheet;
        this.tileSize = world.tileSize;
        this.width = Math.round(this.spriteSheet.img.width / this.spriteSheet.spriteCount);
        this.height = this.spriteSheet.img.height / this.spriteSheet.rowCount;
        this.position = {
            x: x,
            y: y
        };
        this.length = this.spriteSheet.spriteCount;
        this.frame = 0;
        this.tileSize = world.tileSize;
        this.selectLigne = 0;
        this.animation = true;
        this.allure = 0.4;
    }

    render() {
        if (this.animation) {
            this.frame += this.allure;
            if (this.frame >= this.length) {
                this.world.effects.splice(this.world.effects.indexOf(this), 1);
            }
        }
        this.context.drawImage(this.spriteSheet.img, Math.floor(this.frame) * this.width, this.selectLigne, this.width, this.height, this.position.x - this.width / 4, this.position.y - this.width / 4, this.width, this.height);
    }
}
