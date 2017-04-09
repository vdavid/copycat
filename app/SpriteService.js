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

    draw(sprite, context, x, y, columnIndex, rowIndex) {
        columnIndex = columnIndex || 0;
        rowIndex = rowIndex || 0;

        let spriteSheet = this.sheets[sprite];
        context.drawImage(spriteSheet.image,
            spriteSheet.spriteWidth * columnIndex, spriteSheet.spriteHeight * rowIndex,
            spriteSheet.spriteWidth, spriteSheet.spriteHeight,
            x, y, spriteSheet.spriteWidth, spriteSheet.spriteHeight
            );
    }

    write(context, text, centerX, centerY) {
        let alphabet = "abcdefghijklmnopqrstuvwxyz0123456789 ?!():'";

        let characterWidth = this.sheets['pixelFont'].spriteWidth;
        let textLengthInPixels = text.length * characterWidth;
        for (let i = 0; i < text.length; i++) {
            this.draw('pixelFont', context, (centerX - textLengthInPixels / 2) + (i * characterWidth), centerY, alphabet.indexOf(text.charAt(i)), 0);
        }
    }
}

SpriteService.LOCK_SPRITE = Symbol('LOCK');
SpriteService.DUST = Symbol('DUST');

const resources = [
    {name: "pixelFont", url: "./resources/images/font.png", columnCount: 44, rowCount: 1, spriteWidth: 6, spriteHeight: 9},
    {name: "cursor", url: "./resources/images/cursor.png", columnCount: 6, rowCount: 2, spriteWidth: 16, spriteHeight: 16},
    {name: "title", url: "./resources/images/title.png", columnCount: 1, rowCount: 1, spriteWidth: 256, spriteHeight: 149},
    {name: "playerSprite", url: "./resources/images/player.png", columnCount: 12, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {name: "explosion", url: "./resources/images/explosion.png", columnCount: 9, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {name: "tiles", url: "./resources/images/tiles.png", columnCount: 16, rowCount: 5, spriteWidth: 16, spriteHeight: 16},
    {name: "exit", url: "./resources/images/exit.png", columnCount: 10, rowCount: 1, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.DUST, url: "./resources/images/dust.png", columnCount: 9, rowCount: 1, spriteWidth: 32, spriteHeight: 32},
    {name: "pattern", url: "./resources/images/pattern.png", columnCount: 2, rowCount: 2, spriteWidth: 16, spriteHeight: 16},
    {name: SpriteService.LOCK_SPRITE, url: "./resources/images/lock.png", columnCount: 1, rowCount: 1, spriteWidth: 8, spriteHeight: 11}
];

