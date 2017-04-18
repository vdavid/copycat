import SpriteService from "./SpriteService";
import AudioService from "./AudioService";

export default class ResourceLoader {
    constructor(context, audioService, spriteService, callbackWhenFinished) {
        this._context = context;
        this._audioService = audioService;
        this._spriteService = spriteService;
        this._callbackWhenFinished = callbackWhenFinished;
        this.loadedResourceCount = 0;
    }

    loadResources() {
        this._spriteService.loadResources(() => this._updateProgress());
        this._audioService.loadResources(() => this._updateProgress());
    }

    _updateProgress() {
        this.loadedResourceCount += 1;
        let totalResourceCount = SpriteService.getSupportedSpriteSheetCount() + AudioService.getSupportedSoundCount();
        if (this.loadedResourceCount === totalResourceCount) {
            this._callbackWhenFinished();
        } else {
            this._renderLoadingScreen(this.loadedResourceCount / totalResourceCount);
        }
    }

    _renderLoadingScreen(percent) {
        this._context.fillStyle = "#000";
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
        this._context.fillStyle = "#fff";
        this._context.fillRect(0, (this._context.canvas.height / 2) - 1, percent * this._context.canvas.width, 2);
    }
}