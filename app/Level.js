import {TileType} from "./TileType";

export class Level {
    constructor(name, rawTileTypes, comment) {
        this._name = name;
        this._tiles = getTiles(rawTileTypes);
        this._spriteIndexes = getSpriteIndexes(rawTileTypes);
        this._comment = comment;
    }

    get width() {
        return this._tiles.length;
    }

    get height() {
        return this._tiles[0].length;
    }

    get comment() {
        return this._comment;
    }

    getTileType(x, y) {
        return this._tiles[y][x];
    }

    setTileType(x, y, tileTypeId) {
        this._tiles[y][x] = tileTypeId;
    }

    getSpriteIndex(x, y) {
        return this._spriteIndexes[y][x];
    }

    /**
     * @param {string} tileType
     * @returns {Object[]}
     */
    findAllTilesOfType(tileType) {
        let foundTileCoordinates = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.height; x++) {
                if (this.getTileType(x, y) === tileType) {
                    foundTileCoordinates.push({x: x, y: y});
                }
            }
        }
        return foundTileCoordinates;
    }
}

function getTiles(rawTileTypes) {
    const rawTileTypeToTileTypeMap = {
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

    let tileTypes = [];
    for (let y = 0; y < rawTileTypes.length; y++) {
        tileTypes[y] = [];
        for (let x = 0; x < rawTileTypes[y].length; x++) {
            tileTypes[y][x] = rawTileTypeToTileTypeMap[rawTileTypes[y][x]];
        }
    }

    return tileTypes;
}

function getSpriteIndexes(rawTileTypes) {
    let spriteIndexes = [];
    for (let y = 0; y < rawTileTypes.length; y++) {
        spriteIndexes[y] = [];
        for (let x = 0; x < rawTileTypes[y].length; x++) {
            let rawTileType = rawTileTypes[y][x];
            let neighbor = {
                'up': (y - 1 < 0) || (rawTileTypes[y - 1][x] === rawTileType) ? 1 : 0,
                'left': (x - 1 < 0) || (rawTileTypes[y][x - 1] === rawTileType) ? 1 : 0,
                'right': (x + 1 >= rawTileTypes[y].length) || (rawTileTypes[y][x + 1] === rawTileType) ? 1 : 0,
                'down': (y + 1 >= rawTileTypes.length) || (rawTileTypes[y + 1][x] === rawTileType) ? 1 : 0
            };
            spriteIndexes[y][x] = 1 * neighbor['up'] + 2 * neighbor['left'] + 4 * neighbor['right'] + 8 * neighbor['down'];
        }
    }
    return spriteIndexes;
}