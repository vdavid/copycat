export class Effect {
    constructor(world, x, y, sprite) {
        this.world = world;
        this.context = world.context;
        this.sprite = sprite;
        this.size = world.size;
        this.l = Math.round(this.sprite.img.width / this.sprite.sep);
        this.h = this.sprite.img.height / this.sprite.ligne;
        this.pos = {
            x: x,
            y: y
        };
        this.length = this.sprite.sep;
        this.frame = 0;
        this.size = world.size;
        this.selectLigne = 0;
        this.animation = true;
        this.allure = 0.4;
    }

    render() {
        if (this.animation) {
            this.frame += this.allure;
            if (this.frame >= this.length) {
                this.world.effets.splice(this.world.effets.indexOf(this), 1);
            }
        }
        this.context.drawImage(this.sprite.img, Math.floor(this.frame) * this.l, this.selectLigne, this.l, this.h, this.pos.x - this.l / 4, this.pos.y - this.l / 4, this.l, this.h);
    }
}
