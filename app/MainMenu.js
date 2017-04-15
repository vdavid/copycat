import {KeyCodes} from "./KeyCodes";
import {AudioService} from "./AudioService";
import {SpriteService} from "./SpriteService";

export class MainMenu {
    constructor(context, centerX, centerY, menuItems, audioService, spriteService) {
        this._context = context;
        this._menuItems = menuItems;
        this._centerX = centerX;
        this._centerY = centerY;
        this._selection = 0;
        this._spriteService = spriteService;
        this._audioService = audioService;
        this._longestMenuItemName = Math.max(...(menuItems.map(menuItem => menuItem.name.length)));
    }

    handleKeyDownEvent(keyCode) {
        if (keyCode === KeyCodes.UP && this._selection > 0) {
            this._audioService.play(AudioService.SELECTION);
            this._selection -= 1;
            this.render();
        } else if (keyCode === KeyCodes.DOWN && this._selection < this._menuItems.length - 1) {
            this._audioService.play(AudioService.SELECTION);
            this._selection += 1;
            this.render();
        } else if (keyCode === KeyCodes.X) { /* Select */
            this._audioService.play(AudioService.VALIDATION);
            return {action: this._menuItems[this._selection].link};
        }
        return {action: false};
    }

    render() {
        /* Calculates width */
        let width = this._longestMenuItemName * 6 + 60;

        /* Displays the frame */
        this._spriteService.drawFrame(this._centerX - width / 2, this._centerY - 10, width, 26 * this._menuItems.length, "#fff1e8");

        /* Displays menu items */
        for (let i = 0; i < this._menuItems.length; i++) {
            this._spriteService.write(this._menuItems[i].name, this._centerX, this._centerY + 25 * i);
        }
        /* Displays selector arrow */
        this._spriteService.draw(SpriteService.ARROWS, this._centerX - width / 2 + 8, this._centerY + 25 * (this._selection) - 4, 3, 0);

        /* Displays help text */
        this._context.fillStyle = "#83769c";
        this._context.fillRect(0, this._context.canvas.height - 35, this._context.canvas.width, 18);
        this._spriteService.write("arrow keys to select 'x' to confirm", this._context.canvas.width / 2, this._context.canvas.height - 30);
    }
}
