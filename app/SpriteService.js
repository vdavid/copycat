export class SpriteService {
    constructor() {
        this.sheets = {};
    }

    loadResources(progressCallback) {
        for (let i = 0; i < resources.length; i++) {
            this._loadImage(resources[i].url)
                .then(image => {
                    this.sheets[resources[i].name] = {image: image, columnCount: resources[i].columnCount, rowCount: resources[i].rowCount,
                        spriteWidth: resources[i].spriteWidth, spriteHeight: resources[i].spriteHeight};
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

        let characterWidth = this.sheets['pixelFont'].spriteWidth;
        let textLengthInPixels = text.length * characterWidth;
        for (let i = 0; i < text.length; i++) {
            this.draw('pixelFont', context, (centerX - textLengthInPixels / 2) + (i * characterWidth), centerY, alphabet.indexOf(text.charAt(i)), 0);
        }
    }

    drawFrame(context, x, y, width, height, backgroundColor) {
        context.fillStyle = backgroundColor;

        /* Draws background */
        context.fillRect(x + 1, y + 1, width - 2, height - 2);

        let spriteWidth = this.getSpriteSheet('cursors').spriteWidth;
        let spriteHeight = this.getSpriteSheet('cursors').spriteHeight;

        /* Top left */
        this.draw('cursors', context, x, y, 0, 1);
        /* Top right */
        this.draw('cursors', context, x + width - spriteWidth, y, 2, 1);
        /* Bottom left */
        this.draw('cursors', context, x, y + height - spriteHeight, 0, 3);
        /* Bottom right */
        this.draw('cursors', context, x + width - spriteWidth, y + height - spriteHeight, 2, 3);
        /* Top */
        this.draw('cursors', context, x + spriteWidth, y, 1, 1, width - 2 * spriteWidth, spriteHeight);
        /* Bottom */
        this.draw('cursors', context, x + spriteWidth, y + height - spriteHeight, 1, 3, width - 2 * spriteWidth, spriteHeight);
        /* Left */
        this.draw('cursors', context, x, y + spriteHeight, 0, 2, spriteWidth, height - 2 * spriteHeight);
        /* Right */
        this.draw('cursors', context, x + width - spriteWidth, y + spriteHeight, 2, 2, spriteWidth, height - 2 * spriteHeight);
    }

    /**
     *
     * @param {string} sprite ID of the sprite to draw.
     * @param {CanvasRenderingContext2D} context Rendering context to use.
     * @param {Number} x Position on the canvas to render the sprite to. (left of the sprite)
     * @param {Number} y Position on the canvas to render the sprite to. (top of the sprite)
     * @param {Number?} columnIndex Default is 0.
     * @param {Number?} rowIndex Default is 0.
     * @param {Number?} width Width to stretch the sprite to. Default is the sprite's original width (no stretching).
     * @param {Number?} height Height to stretch the sprite to. Default is the sprite's original height (no stretching).
     */
    draw(sprite, context, x, y, columnIndex, rowIndex, width, height) {
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
        return this.sheets[SpriteService.LOCK_SPRITE].image;
    }
}

SpriteService.LOCK_SPRITE = Symbol('LOCK');
SpriteService.DUST = Symbol('DUST');

const resources = [
    {name: "pixelFont", url: "./resources/images/font.png", columnCount: 44, rowCount: 1, spriteWidth: 6, spriteHeight: 9},
    {name: "cursors", url: "./resources/images/cursors.png", columnCount: 4, rowCount: 3, spriteWidth: 16, spriteHeight: 16},
    {name: "cursor-frame", url: "./resources/images/cursor-frame.png", columnCount: 1, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {name: "title", url: "./resources/images/title.png", columnCount: 1, rowCount: 1, spriteWidth: 256, spriteHeight: 149},
    {name: "playerSprite", url: "./resources/images/player.png", columnCount: 12, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {name: "explosion", url: "./resources/images/explosion.png", columnCount: 9, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {name: "tiles", url: "./resources/images/tiles.png", columnCount: 16, rowCount: 5, spriteWidth: 16, spriteHeight: 16},
    {name: "exit", url: "./resources/images/exit.png", columnCount: 10, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.DUST, url: "./resources/images/dust.png", columnCount: 9, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {name: "pattern", url: "./resources/images/pattern.png", columnCount: 2, rowCount: 2, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.LOCK_SPRITE, url: "./resources/images/lock.png", columnCount: 1, rowCount: 1, spriteWidth: 8, spriteHeight: 11}
];

