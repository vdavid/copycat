import {KeyCodes} from "./KeyCodes";

export class Menu {
    constructor(parent, centerX, centerY, menuItems) {
        this.parent = parent;
        this.context = parent.context;
        this.menuItems = menuItems;
        this.centerX = centerX;
        this.centerY = centerY;
        this.selection = 0;
        this.max = this.menuItems.length - 1;
        this.cursor = this.parent.spriteService.getSpriteSheet('cursor');
        this.longestMenuItemName = Math.max(...(menuItems.map(menuItem => menuItem.name.length)));
    }

    change(keyCode) {
        if (keyCode === KeyCodes.UP && this.selection > 0) {
            this.parent.audioService.playSelectionAudio();
            this.selection -= 1;
            this.render();
        } else if (keyCode === KeyCodes.DOWN && this.selection < this.max) {
            this.parent.audioService.playSelectionAudio();
            this.selection += 1;
            this.render();
        } else if (keyCode === KeyCodes.X) {
            // select
            this.parent.audioService.playValidationAudio();
            this.parent.phase(this.menuItems[this.selection].link);
        }
    }

    // selectionne() {
    // }

    render() {
        let width = this.longestMenuItemName * 6 + 60;
        this.context.fillStyle = "#fff1e8";
        // Draws the frame
        this.parent.drawFrame(this.centerX - width / 2, this.centerY - 10, width, 26 * this.menuItems.length);
        // Displays the title
        for (let i = 0; i < this.menuItems.length; i++) {
            this.parent.spriteService.write(this.parent.context, this.menuItems[i].name, this.centerX, this.centerY + 25 * i);
        }
        // on affiche la selection
        this.parent.spriteService.draw('cursor', this.context, this.centerX - width / 2 + 8, this.centerY + 25 * (this.selection) - 4, 3, 0);
//        console.log(this.context, this.cursor.image, 48, 0, 16, 16, this.centerX - width / 2 + 8, this.centerY + 25 * (this.selection) - 4, 16, 16);
        //this.context.drawImage(this.cursor.image, 48, 0, 16, 16, this.centerX - width / 2 + 8, this.centerY + 25 * (this.selection) - 4, 16, 16);
    }
}
