export class SpriteService {
    constructor() {
        this._sheets = {};
    }

    loadResources(progressCallback) {
        for (let i = 0; i < resources.length; i++) {
            loadImage(resources[i].url)
                .then(image => {
                    this._sheets[resources[i].id] = {
                        image: image,
                        columnCount: resources[i].columnCount,
                        rowCount: resources[i].rowCount,
                        spriteWidth: resources[i].spriteWidth,
                        spriteHeight: resources[i].spriteHeight
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

        let characterWidth = this._sheets[SpriteService.FONT].spriteWidth;
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

    draw(spriteId, context, x, y, columnIndex, rowIndex) {
        draw(this._sheets[spriteId], context, x, y, undefined, undefined, columnIndex, rowIndex)
    }

    drawStretched(spriteId, context, x, y, width, height, columnIndex, rowIndex) {
        draw(this._sheets[spriteId], context, x, y, width, height, columnIndex, rowIndex)
    }

    getSpriteSheet(spriteId) {
        return this._sheets[spriteId];
    }

    static getSupportedSpriteSheetCount() {
        return resources.length;
    }


    getLockImage() {
        return this._sheets[SpriteService.LOCK].image;
    }
}

/* Defines constants */
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

/* Defines resources */
const resources = [
    {id: SpriteService.ARROWS, url: "./resources/images/arrows.png", columnCount: 4, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {id: SpriteService.CURSOR_FRAME, url: "./resources/images/cursor-frame.png", columnCount: 1, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {id: SpriteService.DUST, url: "./resources/images/dust.png", columnCount: 9, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {id: SpriteService.EXIT, url: "./resources/images/exit.png", columnCount: 10, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {id: SpriteService.EXPLOSION, url: "./resources/images/explosion.png", columnCount: 9, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {id: SpriteService.FONT, url: "./resources/images/font.png", columnCount: 44, rowCount: 1, spriteWidth: 6, spriteHeight: 9},
    {id: SpriteService.FRAME, url: "./resources/images/frame.png", columnCount: 1, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {id: SpriteService.LOCK, url: "./resources/images/lock.png", columnCount: 1, rowCount: 1, spriteWidth: 8, spriteHeight: 11},
    {id: SpriteService.PLAYER, url: "./resources/images/player.png", columnCount: 12, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {id: SpriteService.TILES, url: "./resources/images/tiles.png", columnCount: 16, rowCount: 5, spriteWidth: 16, spriteHeight: 16},
    {id: SpriteService.TITLE, url: "./resources/images/title.png", columnCount: 1, rowCount: 1, spriteWidth: 256, spriteHeight: 149},
    {id: SpriteService.PATTERN, url: "./resources/images/pattern.png", columnCount: 2, rowCount: 2, spriteWidth: 16, spriteHeight: 16},
];

/* Private static methods follow */

function loadImage(url) {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.addEventListener('load', resolve(image));
        image.addEventListener('error', reject(new Error('Failed to load image with url: ' + url)));
        image.src = url;
    });
}

/**
 * @param {Object} spriteSheet Sprite to draw.
 * @param {CanvasRenderingContext2D} context Rendering context to use.
 * @param {number} x Position on the canvas to render the sprite to. (left of the sprite)
 * @param {number} y Position on the canvas to render the sprite to. (top of the sprite)
 * @param {number|undefined} [width] Width to stretch the sprite to. Default is the sprite's original width (no stretching).
 * @param {number|undefined} [height] Height to stretch the sprite to. Default is the sprite's original height (no stretching).
 * @param {number} [columnIndex=0]
 * @param {number} [rowIndex=0]
 */
function draw(spriteSheet, context, x, y, width, height, columnIndex, rowIndex) {
    columnIndex = columnIndex || 0;
    rowIndex = rowIndex || 0;
    width = (typeof width === 'number') ? width : spriteSheet.spriteWidth;
    height = (typeof height === 'number') ? height : spriteSheet.spriteHeight;

    context.drawImage(spriteSheet.image,
        spriteSheet.spriteWidth * columnIndex, spriteSheet.spriteHeight * rowIndex, spriteSheet.spriteWidth, spriteSheet.spriteHeight,
        x, y, width, height);
}