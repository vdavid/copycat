import {KeyCodes} from "./KeyCodes";
import {AudioService} from "./AudioService";
import {SpriteService} from "./SpriteService";

export class Menu {
    constructor(parent, context, centerX, centerY, menuItems) {
        this.parent = parent;
        this.context = context;
        this.menuItems = menuItems;
        this.centerX = centerX;
        this.centerY = centerY;
        this.selection = 0;
        this.max = this.menuItems.length - 1;
        this.longestMenuItemName = Math.max(...(menuItems.map(menuItem => menuItem.name.length)));
    }

    change(keyCode) {
        if (keyCode === KeyCodes.UP && this.selection > 0) {
            this.parent.audioService.play(AudioService.SELECTION);
            this.selection -= 1;
            this.render();
        } else if (keyCode === KeyCodes.DOWN && this.selection < this.max) {
            this.parent.audioService.play(AudioService.SELECTION);
            this.selection += 1;
            this.render();
        } else if (keyCode === KeyCodes.X) {
            // select
            this.parent.audioService.play(AudioService.VALIDATION);
            this.parent.phase(this.menuItems[this.selection].link);
        }
    }

    render() {
        let width = this.longestMenuItemName * 6 + 60;
        this.context.fillStyle = "#fff1e8";
        // Draws the frame
        this.parent.spriteService.drawFrame(this.context, this.centerX - width / 2, this.centerY - 10, width, 26 * this.menuItems.length, "#fff1e8");
        // Displays the title
        for (let i = 0; i < this.menuItems.length; i++) {
            this.parent.spriteService.write(this.context, this.menuItems[i].name, this.centerX, this.centerY + 25 * i);
        }
        // on affiche la selection
        this.parent.spriteService.draw(SpriteService.ARROWS, this.context, this.centerX - width / 2 + 8, this.centerY + 25 * (this.selection) - 4, 3, 0);

        this.context.fillStyle = "#83769c";
        this.context.fillRect(0, this.parent.height - 35, this.parent.width, 18);
        this.parent.spriteService.write(this.context, "arrow keys to select 'x' to confirm", this.parent.width / 2, this.parent.height - 30);
    }
}
