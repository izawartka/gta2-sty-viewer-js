import {DataChunk} from './datachunk.js';

export class STY {
    constructor(binaryData) {
        this.data = {};

        this.header = String.fromCharCode.apply(String, new Uint8Array(binaryData, 0, 4));
        this.fileVersion = new Uint16Array(binaryData, 4, 1)[0];

        if(!this.isFileCorrect()) return;

        let i = 6;
        while(i < binaryData.byteLength) {
            
            let header = binaryData.slice(i, i+8);
            let name = String.fromCharCode.apply(String, new Uint8Array(header, 0, 4));
            let size = new Uint32Array(header, 4, 1)[0];
            let chunk = binaryData.slice(i+8, i+8+size);
            this.data[name] = new DataChunk(name, chunk);
            i+=size+8;
        }
    }

    isFileCorrect() {
        if(this.header != 'GBST') {
            console.warn(`Incorrect STY header: ${this.header}`);
            return false;
        }
        if(this.fileVersion != 700) {
            console.warn(`Incorrect STY version: ${this.fileVersion}`);
            return false;
        }
        return true;
    }

    getVPaletteID(baseName, objID) {
        let palOffset = this.data['PALB'].paletteBases[baseName];
        if(palOffset == undefined) {
            console.warn(`Incorrect palette base name: ${baseName}`);
            return 0;
        }
        return palOffset+objID;
    }

    getPPaletteID(baseName, objID) {
        let virtID = this.getVPaletteID(baseName, objID);
        let palID = this.data['PALX'].virtualPalettes[virtID];
        return palID;
    }

    getPPalette(paletteID) {
        return this.data['PPAL'].pages[~~(paletteID/64)][paletteID%64];
    }

    getTile(pageID, tileIDinPage) {
        return this.data['TILE'].pages[pageID][tileIDinPage];
    }

    getTileByID(tileID) { 
        return this.data['TILE'].pages[~~(tileID/64)][tileID%64];
    }

    getAllTilesArray() {
        let tiles = [];
        this.data['TILE'].pages.forEach(page => {
            tiles.push(...page);
        })
        return tiles;
    }

    getAllPPalettesArray() {
        let palettes = [];
        this.data['PPAL'].pages.forEach(page => {
            palettes.push(...page);
        })
        return palettes;
    }

    getSpritesCount() {
        return this.data['SPRX'].spriteIndexes.length;
    }

    getTilePagesArray() {
        return this.data['TILE'].pages;
    }

    getPPalettePagesCount() {
        return this.data['PPAL'].pages.length
    }

    getSpriteIndex(id) {
        return JSON.parse(JSON.stringify(this.data['SPRX'].spriteIndexes[id]));
    }

    getSpritePixelPos(ptr) {
        let page = ~~(ptr / (256*256));
        let ptrPage = ptr%(256*256);
        let x = ptrPage % 256;
        let y = ~~(ptrPage / 256);
        return { page, x, y, absX: page * 256 + x};
    }

    getSpritePixel(page, x, y) {
        let ptr = y * 256 + x;
        return this.data['SPRG'].pages[page][ptr];
    }

    getSpriteIDByPos(x, y) {
        for(let s = 0; s < this.getSpritesCount(); s++) {
            let index = this.data['SPRX'].spriteIndexes[s];
            let pos = this.getSpritePixelPos(index.ptr);
            if(x < pos.absX) continue;
            if(y < pos.y) continue;
            if(~~(x / 256) != pos.page) continue;
            
            if(x > pos.absX + index.size[0]) continue;
            if(y > pos.y + index.size[1]) continue;

            return s
        }

        return -1;
    }

    getMaterialName(tileID) {
        const materialNames = [
            'GRASS_DIRT',
            'ROAD_SPECIAL',
            'WATER',
            'ELECTRIFIED',
            'ELECTRIFIED_PLATFORM',
            'WOOD',
            'METAL',
            'METAL_WALL',
            'GRASS_DIRT_WALL',
            'INFER'
        ];

        let materialID = this.data['SPEC'].materials[tileID];
        if(materialID == undefined) return '';
        return materialNames[materialID];
    }

    getSpriteType(spriteID) {
        let typeid = 0;
        while (Object.values(this.data['SPRB'].spriteBases)[typeid] <= spriteID) {
            typeid++;
        }

        return Object.keys(this.data['SPRB'].spriteBases)[typeid-1];
    }

    getSpriteBase(type) {
        return this.data['SPRB'].spriteBases[type];
    }

    getAllSpriteBases() {
        return this.data['SPRB'].spriteBases;
    }

    getAllCarsInfo() {
        return this.data['CARI'].carsInfo;
    }

    getCarInfo(id) {
        return this.data['CARI'].carsInfo[id];
    }

    getCarSpriteID(carID) {
        let spriteID = this.data['CARI'].carsInfo[carID].spriteID;
        let spriteBase = this.data['SPRB'].spriteBases['car'];
        return spriteID + spriteBase;
    }

    getCarRecycled(carID) {
        return this.data['RECY'].recyclingInfo.includes(carID);
    }
}