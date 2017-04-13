import {TileType} from "./TileType";
import {SpriteService} from "./SpriteService";

export class TileRenderer {
    static isAnimated(tileTypeId) {
        return (tileTypeId in animatedTiles);
    }

    static getSpeedOfAnimatedTile(tileTypeId) {
        return animatedTiles[tileTypeId].speed;
    }

    static getRowIndex(tileTypeId) {
        return staticTiles[tileTypeId].rowIndex;
    }

    static getSpriteIdOfAnimatedTile(tileTypeId) {
        return animatedTiles[tileTypeId].spriteId;
    }

    static getColumnIndex(tileTypeId) {
        return staticTiles[tileTypeId].columnIndex;
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