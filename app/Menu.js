export class Menu {
    constructor(parent, x, y, choice) {
        this.parent = parent;
        this.context = parent.context;
        this.choice = choice;
        this.position = {
            x: x,
            y: y
        };
        this.selection = 0;
        this.max = this.choice.length - 1;
        this.cursor = this.parent.spriteService.getSpriteSheet('cursor');
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
            this.parent.soundBox.playSelectionAudio();
            this.selection -= 1;
            this.render();
        } else if (keyCode === 40 && this.selection < this.max) {
            // down
            this.parent.soundBox.playSelectionAudio();
            this.selection += 1;
            this.render();
        } else if (keyCode === 88) {
            // select
            this.parent.soundBox.playValidationAudio();
            this.parent.phase(this.choice[this.selection].lien);
        }
    }

    // selectionne() {
    // }

    render() {
        this.context.fillStyle = "#fff1e8";
        // Draws the frame
        this.parent.drawFrame(this.position.x - this.texteMax / 2, this.position.y - 10, this.texteMax, 26 * this.choice.length);
        // Displays the title
        for (let i = 0; i < this.choice.length; i++) {
            this.parent.write(this.choice[i].name, this.position.x, this.position.y + 25 * i);
        }
        // on affiche la selection
        this.context.drawImage(this.cursor.image, 48, 0, 16, 16, this.position.x - this.texteMax / 2 + 8, this.position.y + 25 * (this.selection) - 4, 16, 16);
    }
}
