import {TileType} from "./TileType";
import {SpriteService} from "./SpriteService";

export class TileRenderer {
    /**
     * @param {CanvasRenderingContext2D} context
     * @param {number} tileSizeInPixels
     * @param {SpriteService} spriteService
     */
    constructor(context, tileSizeInPixels, spriteService) {
        this._context = context;
        this._tileSizeInPixels = tileSizeInPixels;
        this._spriteService = spriteService;

        /* Initializes animations */
        this._animatedTileTypeStates = {};
        for(let tileTypeId of Object.keys(animatedTiles)) {
            this._animatedTileTypeStates[tileTypeId] = {frame: 0, spriteId: animatedTiles[tileTypeId].spriteId, isTileTypeAnimatedInThisFrame: false, canAnimate: true };
        }
    }

    renderTerrain(board) {
        for (let j = 0; j < board.tiles.length; j++) {
            for (let i = 0; i < board.tiles[j].length; i++) {
                let spriteColumnIndex = 0;
                let tileTypeId = TileType.getNewIdByOldId(board.tiles[j][i]);
                let spriteId = SpriteService.TILES;
                let spriteRowIndex;
                if (isAnimated(tileTypeId)) {
                    if (!this._animatedTileTypeStates[tileTypeId].isTileTypeAnimatedInThisFrame) {
                        if (this._animatedTileTypeStates[tileTypeId].canAnimate) {
                            this._animatedTileTypeStates[tileTypeId].frame += getSpeedOfAnimatedTile(tileTypeId);
                        }
                        if (this._animatedTileTypeStates[tileTypeId].frame >= this._spriteService.getSpriteSheet(this._animatedTileTypeStates[tileTypeId].spriteId).columnCount) {
                            this._animatedTileTypeStates[tileTypeId].frame = 0;
                        }
                        this._animatedTileTypeStates[tileTypeId].isTileTypeAnimatedInThisFrame = true;
                    }
                    spriteId = getSpriteIdOfAnimatedTile(tileTypeId);
                    spriteColumnIndex = Math.floor(this._animatedTileTypeStates[tileTypeId].frame);
                    spriteRowIndex = 0;

                } else {
                    spriteColumnIndex = (getColumnIndex(tileTypeId) === "auto")
                        ? Math.floor(board.apparence[j][i])
                        : getColumnIndex(tileTypeId);
                    spriteRowIndex = getRowIndex(tileTypeId);
                }
                this._spriteService.draw(spriteId, this._context, i * this._tileSizeInPixels, j * this._tileSizeInPixels, spriteColumnIndex, spriteRowIndex);
            }
        }
        for(let tileTypeId of Object.keys(animatedTiles)) {
            this._animatedTileTypeStates[tileTypeId].isTileTypeAnimatedInThisFrame = false;
        }
    }
}

const staticTiles = {
    [TileType.WATER]: {columnIndex: "auto", rowIndex: 3},
    [TileType.GRASS]: {columnIndex: 1, rowIndex: 0},
    [TileType.WALL]: {columnIndex: "auto", rowIndex: 1},
    [TileType.ICE]: {columnIndex: "auto", rowIndex: 2},
    [TileType.PLAYER]: {columnIndex: 5, rowIndex: 0},
    [TileType.TRAP]: {columnIndex: 6, rowIndex: 0},
    [TileType.HOLE]: {columnIndex: 7, rowIndex: 0},
    [TileType.FENCE]: {columnIndex: "auto", rowIndex: 4},
    [TileType.LEFT_ARROW]: {columnIndex: 9, rowIndex: 0},
    [TileType.UP_ARROW]: {columnIndex: 10, rowIndex: 0},
    [TileType.RIGHT_ARROW]: {columnIndex: 11, rowIndex: 0},
    [TileType.DOWN_ARROW]: {columnIndex: 12, rowIndex: 0}
};

const animatedTiles = {
    [TileType.EXIT]: {spriteId: SpriteService.EXIT, speed: 0.3, action: TileType.EXIT_ACTION},
};

function isAnimated(tileTypeId) {
    return (tileTypeId in animatedTiles);
}

function getRowIndex(tileTypeId) {
    return staticTiles[tileTypeId].rowIndex;
}

function getSpeedOfAnimatedTile(tileTypeId) {
    return animatedTiles[tileTypeId].speed;
}


function getSpriteIdOfAnimatedTile(tileTypeId) {
    return animatedTiles[tileTypeId].spriteId;
}

function getColumnIndex(tileTypeId) {
    return staticTiles[tileTypeId].columnIndex;
}
