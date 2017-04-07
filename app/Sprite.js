export class Sprite {
    constructor(world, parent, sprite) {
        this.context = world.context;
        this.sprite = sprite;
        this.size = world.size;
        this.l = Math.round(this.sprite.img.width / this.sprite.sep);
        this.h = this.sprite.img.height / this.sprite.ligne;
        this.pos = {
            x: parent.pos.x * this.size,
            y: parent.pos.y * this.size
        };
        this.length = this.sprite.sep;
        this.frame = 0;
        this.size = world.size;
        this.selectLigne = 0;
        this.animation = true;
        this.allure = 0.2;
    }

    dessiner() {
        this.context.drawImage(this.sprite.img, Math.floor(this.frame) * this.l, this.selectLigne, this.l, this.h, this.pos.x, this.pos.y, this.l, this.h);
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
