export class Sprite {
    constructor(world, positionX, positionY, spriteSheet) {
        this.context = world.context;
        this.spriteSheet = spriteSheet;
        this.tileSize = world.tileSize;
        this.width = Math.round(this.spriteSheet.image.width / this.spriteSheet.columnCount);
        this.height = this.spriteSheet.image.height / this.spriteSheet.rowCount;
        this.position = {
            x: positionX * this.tileSize,
            y: positionY * this.tileSize
        };
        this.length = this.spriteSheet.columnCount;
        this.frame = 0;
        this.tileSize = world.tileSize;
        this.selectLigne = 0;
        this.animation = true;
        this.allure = 0.2;
    }

    draw() {
        this.context.drawImage(this.spriteSheet.image, Math.floor(this.frame) * this.width, this.selectLigne, this.width, this.height, this.position.x, this.position.y, this.width, this.height);
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
