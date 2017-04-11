export class SpriteService {
    constructor() {
        this.sheets = {};
    }

    loadResources(progressCallback) {
        for (let i = 0; i < resources.length; i++) {
            this._loadImage(resources[i].url)
                .then(image => {
                    this.sheets[resources[i].name] = {
                        image: image, columnCount: resources[i].columnCount, rowCount: resources[i].rowCount,
                        spriteWidth: resources[i].spriteWidth, spriteHeight: resources[i].spriteHeight
                    };
                    progressCallback();
                })
                .catch(error => {
                    console.log(error);
                    console.log('Image not loaded. Error code: ' + error.code + '. Url: ' + error.url);
                });
        }
    }

    write(context, text, centerX, centerY) {
        let alphabet = "abcdefghijklmnopqrstuvwxyz0123456789 ?!():'";

        let characterWidth = this.sheets[SpriteService.FONT].spriteWidth;
        let textLengthInPixels = text.length * characterWidth;
        for (let i = 0; i < text.length; i++) {
            this.draw(SpriteService.FONT, context, (centerX - textLengthInPixels / 2) + (i * characterWidth), centerY, alphabet.indexOf(text.charAt(i)), 0);
        }
    }

    drawFrame(context, x, y, width, height, backgroundColor) {
        context.fillStyle = backgroundColor;

        /* Draws background */
        context.fillRect(x + 1, y + 1, width - 2, height - 2);

        let spriteWidth = this.getSpriteSheet(SpriteService.FRAME).spriteWidth;
        let spriteHeight = this.getSpriteSheet(SpriteService.FRAME).spriteHeight;

        /* Top left */
        this.draw(SpriteService.FRAME, context, x, y, 0, 0);
        /* Top right */
        this.draw(SpriteService.FRAME, context, x + width - spriteWidth, y, 2, 0);
        /* Bottom left */
        this.draw(SpriteService.FRAME, context, x, y + height - spriteHeight, 0, 2);
        /* Bottom right */
        this.draw(SpriteService.FRAME, context, x + width - spriteWidth, y + height - spriteHeight, 2, 2);
        /* Top */
        this.drawStretched(SpriteService.FRAME, context, x + spriteWidth, y, width - 2 * spriteWidth, spriteHeight, 1, 0);
        /* Bottom */
        this.drawStretched(SpriteService.FRAME, context, x + spriteWidth, y + height - spriteHeight, width - 2 * spriteWidth, spriteHeight, 1, 2);
        /* Left */
        this.drawStretched(SpriteService.FRAME, context, x, y + spriteHeight, spriteWidth, height - 2 * spriteHeight, 0, 1);
        /* Right */
        this.drawStretched(SpriteService.FRAME, context, x + width - spriteWidth, y + spriteHeight, spriteWidth, height - 2 * spriteHeight, 2, 1);
    }

    draw(sprite, context, x, y, columnIndex, rowIndex) {
        this._draw(sprite, context, x, y, undefined, undefined, columnIndex, rowIndex)
    }

    drawStretched(sprite, context, x, y, width, height, columnIndex, rowIndex) {
        this._draw(sprite, context, x, y, width, height, columnIndex, rowIndex)
    }

    /**
     * @param {string} sprite ID of the sprite to draw.
     * @param {CanvasRenderingContext2D} context Rendering context to use.
     * @param {Number} x Position on the canvas to render the sprite to. (left of the sprite)
     * @param {Number} y Position on the canvas to render the sprite to. (top of the sprite)
     * @param {Number?} columnIndex Default is 0.
     * @param {Number?} rowIndex Default is 0.
     * @param {Number?} width Width to stretch the sprite to. Default is the sprite's original width (no stretching).
     * @param {Number?} height Height to stretch the sprite to. Default is the sprite's original height (no stretching).
     */
    _draw(sprite, context, x, y, width, height, columnIndex, rowIndex) {
        columnIndex = columnIndex || 0;
        rowIndex = rowIndex || 0;
        let spriteSheet = this.sheets[sprite];
        width = (typeof width !== 'undefined') ? width : spriteSheet.spriteWidth;
        height = (typeof height !== 'undefined') ? height : spriteSheet.spriteHeight;

        context.drawImage(spriteSheet.image,
            spriteSheet.spriteWidth * columnIndex, spriteSheet.spriteHeight * rowIndex, spriteSheet.spriteWidth, spriteSheet.spriteHeight,
            x, y, width, height);
    }

    getSpriteSheet(name) {
        return this.sheets[name];
    }

    static getSupportedSpriteSheetCount() {
        return resources.length;
    }

    _loadImage(url) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('load', resolve(image));
            image.addEventListener('error', reject(new Error('Failed to load image with url: ' + url)));
            image.src = url;
        });
    }

    getLockImage() {
        return this.sheets[SpriteService.LOCK].image;
    }
}

SpriteService.ARROWS = Symbol('ARROWS');
SpriteService.CURSOR_FRAME = Symbol('CURSOR_FRAME');
SpriteService.DUST = Symbol('DUST');
SpriteService.EXIT = Symbol('EXIT');
SpriteService.EXPLOSION = Symbol('EXPLOSION');
SpriteService.FONT = Symbol('FONT');
SpriteService.FRAME = Symbol('FRAME');
SpriteService.LOCK = Symbol('LOCK');
SpriteService.PLAYER = Symbol('PLAYER');
SpriteService.TILES = Symbol('TILES');
SpriteService.TITLE = Symbol('TITLE');
SpriteService.PATTERN = Symbol('PATTERN');

const resources = [
    {name: SpriteService.ARROWS, url: "./resources/images/arrows.png", columnCount: 4, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.CURSOR_FRAME, url: "./resources/images/cursor-frame.png", columnCount: 1, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {name: SpriteService.DUST, url: "./resources/images/dust.png", columnCount: 9, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {name: SpriteService.EXIT, url: "./resources/images/exit.png", columnCount: 10, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.EXPLOSION, url: "./resources/images/explosion.png", columnCount: 9, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {name: SpriteService.FONT, url: "./resources/images/font.png", columnCount: 44, rowCount: 1, spriteWidth: 6, spriteHeight: 9},
    {name: SpriteService.FRAME, url: "./resources/images/frame.png", columnCount: 1, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.LOCK, url: "./resources/images/lock.png", columnCount: 1, rowCount: 1, spriteWidth: 8, spriteHeight: 11},
    {name: SpriteService.PLAYER, url: "./resources/images/player.png", columnCount: 12, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.TILES, url: "./resources/images/tiles.png", columnCount: 16, rowCount: 5, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.TITLE, url: "./resources/images/title.png", columnCount: 1, rowCount: 1, spriteWidth: 256, spriteHeight: 149},
    {name: SpriteService.PATTERN, url: "./resources/images/pattern.png", columnCount: 2, rowCount: 2, spriteWidth: 16, spriteHeight: 16},
];

