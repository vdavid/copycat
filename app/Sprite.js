export class Sprite {
    constructor(world, parent, sprite) {
        this.context = world.context;
        this.spriteSheet = sprite;
        this.tileSize = world.tileSize;
        this.width = Math.round(this.spriteSheet.img.width / this.spriteSheet.spriteCount);
        this.height = this.spriteSheet.img.height / this.spriteSheet.rowCount;
        this.position = {
            x: parent.position.x * this.tileSize,
            y: parent.position.y * this.tileSize
        };
        this.length = this.spriteSheet.spriteCount;
        this.frame = 0;
        this.tileSize = world.tileSize;
        this.selectLigne = 0;
        this.animation = true;
        this.allure = 0.2;
    }

    dessiner() {
        this.context.drawImage(this.spriteSheet.img, Math.floor(this.frame) * this.width, this.selectLigne, this.width, this.height, this.position.x, this.position.y, this.width, this.height);
    }

    animer() {
        if (this.animation) {
            this.frame += this.allure;
            if (this.frame >= this.length) {
                this.frame = 0;
            }
        }
    }

    render() {
        this.animer();
        this.dessiner();
    }
}
