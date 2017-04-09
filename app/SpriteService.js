export class SpriteService {
    constructor() {
        this.sheets = {};
    }

    loadResources(progressCallback) {
        for (let i = 0; i < resources.length; i++) {
            this._loadImage(resources[i].url)
                .then(image => {
                    this.sheets[resources[i].name] = {image: image, columnCount: resources[i].columnCount, rowCount: resources[i].rowCount};
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

    draw(sprite, context, x, y, width, height) {
        if (typeof width === 'undefined') {
            context.drawImage(this.sheets[sprite].image, x, y);
        } else{
            context.drawImage(this.sheets[sprite].image, x, y, width, height);
        }
    }
}

SpriteService.LOCK_SPRITE = Symbol('LOCK');
SpriteService.DUST = Symbol('DUST');

const resources = [
    {name: "pixelFont", url: "./resources/images/font.png", columnCount: 44, rowCount: 1},
    {name: "cursor", url: "./resources/images/cursor.png", columnCount: 6, rowCount: 2},
    {name: "title", url: "./resources/images/title.png", columnCount: 1, rowCount: 1},
    {name: "playerSprite", url: "./resources/images/player.png", columnCount: 12, rowCount: 1},
    {name: "explosion", url: "./resources/images/explosion.png", columnCount: 9, rowCount: 1},
    {name: "tiles", url: "./resources/images/tiles.png", columnCount: 16, rowCount: 5},
    {name: "exit", url: "./resources/images/exit.png", columnCount: 10, rowCount: 1},
    {name: SpriteService.DUST, url: "./resources/images/dust.png", columnCount: 9, rowCount: 1},
    {name: "pattern", url: "./resources/images/pattern.png", columnCount: 1, rowCount: 1},
    {name: SpriteService.LOCK_SPRITE, url: "./resources/images/lock.png", columnCount: 1, rowCount: 1}
];

