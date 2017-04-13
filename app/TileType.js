import {SpriteService} from "./SpriteService";

export class TileType {
    static getTileTypeCount() {
        return Object.keys(tileTypes).length;
    }

    static getNewIdByOldId(oldId) {
        return tileTypeOldToNewIdMap[oldId];
    }

    static isAnimated(tileTypeId) {
        return tileTypes[tileTypeId].isAnimated;
    }

    static getRowIndex(tileTypeId) {
        return tileTypes[tileTypeId].rowIndex;
    }

    static isAccessible(tileTypeId) {
        return tileTypes[tileTypeId].isAccessible;
    }

    static getAction(tileTypeId) {
        return tileTypes[tileTypeId].action;
    }

    // static getSpeedOfAnimatedTile(tileTypeId) {
    //     return tileTypes[tileTypeId].speed;
    // }

    static getTile(tileTypeId) {
        return tileTypes[tileTypeId].tile;
    }
}

TileType.NO_ACTION = Symbol('NO_ACTION');
TileType.UP_ACTION = Symbol('UP_ACTION');
TileType.DOWN_ACTION = Symbol('DOWN_ACTION');
TileType.LEFT_ACTION = Symbol('LEFT_ACTION');
TileType.RIGHT_ACTION = Symbol('RIGHT_ACTION');
TileType.SLIDE_ACTION = Symbol('SLIDE_ACTION');
TileType.TRAP_ACTION = Symbol('TRAP_ACTION');
TileType.EXIT_ACTION = Symbol('EXIT_ACTION');

TileType.WATER = Symbol('WATER');
TileType.GRASS = Symbol('GRASS');
TileType.WALL = Symbol('WALL');
TileType.ICE = Symbol('ICE');
TileType.EXIT = Symbol('EXIT');
TileType.PLAYER = Symbol('PLAYER');
TileType.TRAP = Symbol('TRAP');
TileType.HOLE = Symbol('HOLE');
TileType.FENCE = Symbol('FENCE');
TileType.LEFT_ARROW = Symbol('LEFT_ARROW');
TileType.UP_ARROW = Symbol('UP_ARROW');
TileType.RIGHT_ARROW = Symbol('RIGHT_ARROW');
TileType.DOWN_ARROW = Symbol('DOWN_ARROW');

const tileTypeOldToNewIdMap = {
    0: TileType.WATER,
    1: TileType.GRASS,
    2: TileType.WALL,
    3: TileType.ICE,
    4: TileType.EXIT,
    5: TileType.PLAYER,
    6: TileType.TRAP,
    7: TileType.HOLE,
    8: TileType.FENCE,
    9: TileType.LEFT_ARROW,
    10: TileType.UP_ARROW,
    11: TileType.RIGHT_ARROW,
    12: TileType.DOWN_ARROW
};

const tileTypes = {
    [TileType.WATER]: {id: 0, isAccessible: false, isAnimated: false, tile: "auto", action: TileType.NO_ACTION, rowIndex: 3},
    [TileType.GRASS]: {id: 1, isAccessible: true, isAnimated: false, tile: 1, action: TileType.NO_ACTION, rowIndex: 0},
    [TileType.WALL]: {id: 2, isAccessible: false, isAnimated: false, tile: "auto", action: TileType.NO_ACTION, rowIndex: 1},
    [TileType.ICE]: {id: 3, isAccessible: true, isAnimated: false, tile: "auto", action: TileType.SLIDE_ACTION, rowIndex: 2},
    [TileType.EXIT]: {id: 4, isAccessible: true, isAnimated: true, tile: SpriteService.EXIT, speed: 0.3, action: TileType.EXIT_ACTION, rowIndex: 0},
    [TileType.PLAYER]: {id: 5, isAccessible: true, isAnimated: false, tile: 5, action: TileType.NO_ACTION, rowIndex: 0},
    [TileType.TRAP]: {id: 6, isAccessible: true, isAnimated: false, tile: 6, action: TileType.TRAP_ACTION, rowIndex: 0},
    [TileType.HOLE]: {id: 7, isAccessible: false, isAnimated: false, tile: 7, action: TileType.NO_ACTION, rowIndex: 0},
    [TileType.FENCE]: {id: 8, isAccessible: false, isAnimated: false, tile: "auto", action: TileType.NO_ACTION, rowIndex: 4},
    [TileType.LEFT_ARROW]: {id: 9, isAccessible: true, isAnimated: false, tile: 9, action: TileType.LEFT_ACTION, rowIndex: 0},
    [TileType.UP_ARROW]: {id: 10, isAccessible: true, isAnimated: false, tile: 10, action: TileType.UP_ACTION, rowIndex: 0},
    [TileType.RIGHT_ARROW]: {id: 11, isAccessible: true, isAnimated: false, tile: 11, action: TileType.RIGHT_ACTION, rowIndex: 0},
    [TileType.DOWN_ARROW]: {id: 12, isAccessible: true, isAnimated: false, tile: 12, action: TileType.DOWN_ACTION, rowIndex: 0}
};
