export class TileType {
    static getTileTypeCount() {
        return Object.keys(tileTypes).length;
    }

    static getNewIdByOldId(oldId) {
        return tileTypeOldToNewIdMap[oldId];
    }

    static isAccessible(tileTypeId) {
        return tileTypes[tileTypeId].isAccessible;
    }

    static getAction(tileTypeId) {
        return tileTypes[tileTypeId].action;
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
    [TileType.WATER]: {isAccessible: false, action: TileType.NO_ACTION},
    [TileType.GRASS]: {isAccessible: true, action: TileType.NO_ACTION},
    [TileType.WALL]: {isAccessible: false, action: TileType.NO_ACTION},
    [TileType.ICE]: {isAccessible: true, action: TileType.SLIDE_ACTION},
    [TileType.EXIT]: {isAccessible: true, action: TileType.EXIT_ACTION},
    [TileType.PLAYER]: {isAccessible: true, action: TileType.NO_ACTION},
    [TileType.TRAP]: {isAccessible: true, action: TileType.TRAP_ACTION},
    [TileType.HOLE]: {isAccessible: false, action: TileType.NO_ACTION},
    [TileType.FENCE]: {isAccessible: false, action: TileType.NO_ACTION},
    [TileType.LEFT_ARROW]: {isAccessible: true, action: TileType.LEFT_ACTION},
    [TileType.UP_ARROW]: {isAccessible: true, action: TileType.UP_ACTION},
    [TileType.RIGHT_ARROW]: {isAccessible: true, action: TileType.RIGHT_ACTION},
    [TileType.DOWN_ARROW]: {isAccessible: true, action: TileType.DOWN_ACTION}
};
