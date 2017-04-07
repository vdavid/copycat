export class Menu {
    constructor(parent, x, y, choice) {
        this.parent = parent;
        this.context = parent.context;
        this.choice = choice;
        this.pos = {
            x: x,
            y: y
        };
        this.isActive = false;
        this.selection = 0;
        this.max = this.choice.length - 1;
        this.cursor = this.parent.resources.cursor;
        this.buttons = [];
        let values = [];
        for (let i = 0; i < this.choice.length; i++) {
            values.push(this.choice[i].name.length);
        }
        this.texteMax = Math.max(...values) * 6 + 60;
    }

    change(keyCode) {
        if (keyCode === 38 && this.selection > 0) {
            // up
            this.parent.sounds.selection.url.play();
            this.selection -= 1;
            this.render();
        } else if (keyCode === 40 && this.selection < this.max) {
            // down
            this.parent.sounds.selection.url.play();
            this.selection += 1;
            this.render();
        } else if (keyCode === 88) {
            // select
            this.parent.sounds.validation.url.play();
            this.isActive = false;
            this.parent.phase(this.choice[this.selection].lien);
        }
    }

    // selectionne() {
    // }

    render() {
        this.context.fillStyle = "#fff1e8";
        // dessiner le cadre
        this.parent.boite(this.pos.x - this.texteMax / 2, this.pos.y - 10, this.texteMax, 26 * this.choice.length);
        // on affiche le titre
        for (let i = 0; i < this.choice.length; i++) {
            this.parent.ecrire(this.choice[i].name, this.pos.x, this.pos.y + 25 * i);
        }
        // on affiche la selection
        this.context.drawImage(this.cursor.img, 48, 0, 16, 16, this.pos.x - this.texteMax / 2 + 8, this.pos.y + 25 * (this.selection) - 4, 16, 16);
    }
}
