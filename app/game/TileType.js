export default class TileType {
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

TileType.WATER = 'WATER';
TileType.GRASS = 'GRASS';
TileType.WALL = 'WALL';
TileType.ICE = 'ICE';
TileType.EXIT = 'EXIT';
TileType.START = 'START';
TileType.TRAP = 'TRAP';
TileType.HOLE = 'HOLE';
TileType.FENCE = 'FENCE';
TileType.LEFT_ARROW = 'LEFT_ARROW';
TileType.UP_ARROW = 'UP_ARROW';
TileType.RIGHT_ARROW = 'RIGHT_ARROW';
TileType.DOWN_ARROW = 'DOWN_ARROW';

const tileTypes = {
    [TileType.WATER]: {isAccessible: false, action: TileType.NO_ACTION},
    [TileType.GRASS]: {isAccessible: true, action: TileType.NO_ACTION},
    [TileType.WALL]: {isAccessible: false, action: TileType.NO_ACTION},
    [TileType.ICE]: {isAccessible: true, action: TileType.SLIDE_ACTION},
    [TileType.EXIT]: {isAccessible: true, action: TileType.EXIT_ACTION},
    [TileType.START]: {isAccessible: true, action: TileType.NO_ACTION},
    [TileType.TRAP]: {isAccessible: true, action: TileType.TRAP_ACTION},
    [TileType.HOLE]: {isAccessible: false, action: TileType.NO_ACTION},
    [TileType.FENCE]: {isAccessible: false, action: TileType.NO_ACTION},
    [TileType.LEFT_ARROW]: {isAccessible: true, action: TileType.LEFT_ACTION},
    [TileType.UP_ARROW]: {isAccessible: true, action: TileType.UP_ACTION},
    [TileType.RIGHT_ARROW]: {isAccessible: true, action: TileType.RIGHT_ACTION},
    [TileType.DOWN_ARROW]: {isAccessible: true, action: TileType.DOWN_ACTION}
};
